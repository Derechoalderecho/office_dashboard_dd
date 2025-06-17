import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { authReducer, caseReducer, noteReducer, documentReducer } from './slices';

// Configuración condicional de storage para cliente y servidor
const storage = typeof window !== 'undefined'
  ? require('redux-persist/lib/storage').default
  : require('../utils/reduxPersistNoopStorage').default();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // Persist the authentication state, which includes the role
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    case: caseReducer,
    note: noteReducer,
    document: documentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE', 
          'auth/setUser',
          'auth/setUserRole'
        ],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 