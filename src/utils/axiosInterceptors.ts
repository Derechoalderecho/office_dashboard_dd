import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { getIdToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { store } from "@/store/store";
import { logout } from "@/store/slices/authSlice";

async function getValidToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (user) {
    try {
      return await getIdToken(user, false);
    } catch (err) {
      const state = store.getState();
      return state.auth.token;
    }
  }
  const state = store.getState();
  return state.auth.token;
}

let isRefreshingToken = false;
let pendingRequests: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

export function setupAxiosInterceptors(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = await getValidToken();
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshingToken) {
          return new Promise((resolve, reject) => {
            pendingRequests.push({ resolve, reject, config: originalRequest });
          });
        }

        isRefreshingToken = true;

        try {
          const newToken = await getValidToken();
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;

            pendingRequests.forEach((req) => {
              req.config.headers = req.config.headers || {};
              (req.config.headers as any).Authorization = `Bearer ${newToken}`;
              req.resolve(axiosInstance(req.config));
            });
            pendingRequests = [];

            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // continue to logout below
        } finally {
          isRefreshingToken = false;
        }

        try {
          await store.dispatch<any>(logout());
        } catch (_) {}
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }

      return Promise.reject(error);
    }
  );
}
