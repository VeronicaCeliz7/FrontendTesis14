/// <reference types="vite/client" />

// 🆕 Declaraciones para archivos CSS
declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

// 🆕 Variables de entorno personalizadas
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_COPERNICUS_INSTANCE_ID: string;
  readonly VITE_COPERNICUS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}