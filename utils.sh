#!/bin/bash

set -e

# ----------- PARSE ARGUMENTS -----------
IMAGE_NAME="nextjs-frontend"
COMMAND=""
PROJECT_ID=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    build|push|deploy) COMMAND="$1" ;;
    --project_id) PROJECT_ID="$2"; shift ;;
    --image_name) IMAGE_NAME="$2"; shift ;;
    *) echo "❌ Parámetro o comando desconocido: $1"; exit 1 ;;
  esac
  shift
done

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Debes proporcionar --project_id"
  exit 1
fi

if [ -z "$COMMAND" ]; then
  echo "❌ Debes indicar el comando: build, push o deploy"
  exit 1
fi

FULL_IMAGE="gcr.io/${PROJECT_ID}/${IMAGE_NAME}"

# ----------- COMANDOS -----------

case $COMMAND in

  build)
    echo "🚀 Construyendo imagen: $FULL_IMAGE"
    docker build -t "$FULL_IMAGE" .
    ;;

  push)
    echo "📤 Subiendo imagen a Container Registry..."
    docker push "$FULL_IMAGE"
    echo "✅ Imagen subida correctamente: $FULL_IMAGE"
    ;;

  deploy)
    echo "🚀 Desplegando servicio en Cloud Run con secretos"

    gcloud run deploy "$IMAGE_NAME" \
      --image "$FULL_IMAGE" \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-secrets "NEXT_PUBLIC_FIREBASE_API_KEY=NEXT_PUBLIC_FIREBASE_API_KEY:latest, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:latest, NEXT_PUBLIC_API_BASE_URL=NEXT_PUBLIC_API_BASE_URL:latest"

    echo "✅ Servicio desplegado correctamente: $IMAGE_NAME"
    ;;

  *)
    echo "❌ Comando no reconocido: $COMMAND"
    exit 1
    ;;
esac