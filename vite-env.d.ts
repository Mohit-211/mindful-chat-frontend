/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOME_OTHER_VAR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
