# Especificaciones del Proyecto - Dashboard de Oficina

## Descripción General
Sistema de gestión de casos legales para una oficina de asesoría jurídica, permitiendo el seguimiento y administración de casos por diferentes roles de usuarios.

## Tecnologías Principales

### Frontend
- **Next.js 14**: Framework de React para renderizado del lado del servidor
- **TypeScript**: Tipado estático para mayor seguridad y mantenibilidad
- **Tailwind CSS**: Framework de estilos
- **Redux Toolkit**: Gestión de estado global
- **Redux Persist**: Persistencia del estado de autenticación
- **Firebase**: Autenticación y almacenamiento
- **Heroicons**: Biblioteca de iconos
- **HeroUI**: Biblioteca de componentes UI

### Backend
- **FastAPI**: Framework de Python para APIs
- **PostgreSQL**: Base de datos relacional
- **SQLAlchemy**: ORM para interacción con la base de datos

## Características Principales

### Gestión de Usuarios
- Sistema de roles: Estudiante, Docente, Monitor, Director
- Autenticación con Firebase
- Persistencia de sesión
- Control de acceso basado en roles

### Gestión de Casos
- Creación y seguimiento de casos
- Estados de casos:
  - Viabilidad
  - Pendiente
  - Revisar tutela
  - Radicar
  - Espera del juez
  - Valoración del asesor
  - No aprobado
- Transformación de estados según rol del usuario
- Historial de cambios de estado

### Documentos
- Carga y gestión de documentos
- Previsualización de tutelas
- Control de versiones
- Validación de formatos

### Notas y Comentarios
- Sistema de notas por caso
- Historial de cambios
- Notificaciones de actualizaciones

### Interfaz de Usuario
- Componentes reutilizables
- Indicadores visuales de estado
- Formularios dinámicos
- Validación en tiempo real

## Flujos de Trabajo

### Flujo de Viabilidad
1. Creación del caso
2. Revisión de viabilidad
3. Aprobación o rechazo
4. Cambio a estado "Pendiente" o "No aprobado"

### Flujo de Tutela
1. Elaboración de tutela
2. Revisión por docente/monitor
3. Aprobación o correcciones
4. Radicación
5. Seguimiento del caso

## Seguridad
- Autenticación con Firebase
- Control de acceso basado en roles
- Validación de datos en frontend y backend
- Sanitización de inputs
- Protección contra CSRF

## Optimizaciones
- Carga diferida de componentes
- Persistencia de estado de autenticación
- Caché de datos frecuentes
- Optimización de imágenes y documentos

## Estructura del Proyecto
```
src/
├── actions/                 # Acciones de Redux y llamadas a API
│   ├── citizenActions.ts    # Acciones relacionadas con ciudadanos
│   ├── caseActions.ts       # Acciones relacionadas con casos
│   ├── noteActions.ts       # Acciones relacionadas con notas
│   └── uploadDocsActions.ts # Acciones para carga de documentos
│
├── app/                     # Rutas y páginas de Next.js
│   ├── dashboard/           # Dashboard principal
│   │   ├── cases/          # Páginas relacionadas con casos
│   │   ├── citizens/       # Páginas relacionadas con ciudadanos
│   │   └── layout.tsx      # Layout del dashboard
│   ├── auth/               # Páginas de autenticación
│   └── layout.tsx          # Layout principal
│
├── components/              # Componentes reutilizables
│   ├── cases/              # Componentes específicos de casos
│   │   ├── cases-id/       # Componentes de detalle de caso
│   │   └── cases-list/     # Componentes de lista de casos
│   ├── citizens/           # Componentes específicos de ciudadanos
│   ├── forms/              # Componentes de formularios
│   │   ├── stepperForm/    # Formulario con pasos
│   │   └── common/         # Componentes de formulario comunes
│   ├── ui/                 # Componentes UI básicos
│   └── shared/             # Componentes compartidos
│
├── constants/              # Constantes y configuraciones
│   ├── usersConstants.ts   # Constantes relacionadas con usuarios
│   └── apiConstants.ts     # Constantes de API
│
├── hooks/                  # Hooks personalizados
│   ├── useAuth.ts          # Hook de autenticación
│   ├── useUserRole.ts      # Hook de rol de usuario
│   └── useToast.ts         # Hook de notificaciones
│
├── lib/                    # Configuraciones y utilidades de librerías
│   ├── firebase.ts         # Configuración de Firebase
│   └── axios.ts            # Configuración de Axios
│
├── services/               # Servicios de API
│   ├── userService.ts      # Servicios de usuario
│   ├── caseService.ts      # Servicios de casos
│   └── documentService.ts  # Servicios de documentos
│
├── store/                  # Configuración de Redux
│   ├── hooks.ts            # Hooks de Redux
│   ├── store.ts            # Configuración del store
│   └── slices/             # Slices de Redux
│       ├── authSlice.ts    # Slice de autenticación
│       ├── caseSlice.ts    # Slice de casos
│       └── noteSlice.ts    # Slice de notas
│
├── types/                  # Tipos de TypeScript
│   ├── cases.ts            # Tipos relacionados con casos
│   ├── citizens.ts         # Tipos relacionados con ciudadanos
│   └── users.ts            # Tipos relacionados con usuarios
│
└── utils/                  # Utilidades y helpers
    ├── date.ts             # Utilidades de fecha
    ├── stateTransformer.ts # Transformación de estados
    └── validation.ts       # Utilidades de validación

public/                     # Archivos estáticos
├── images/                 # Imágenes
└── documents/              # Documentos de ejemplo

tests/                     # Pruebas
├── unit/                  # Pruebas unitarias
└── integration/           # Pruebas de integración
```

## Dependencias Principales
```json
{
  "dependencies": {
    "@heroui/react": "^1.0.0",
    "firebase": "^10.0.0",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-redux": "^8.0.0",
    "redux-persist": "^6.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Requisitos del Sistema
- Node.js 18+
- Python 3.8+
- PostgreSQL 13+
- Navegador moderno (Chrome, Firefox, Safari, Edge) 