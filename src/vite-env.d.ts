/// <reference types="vite/client" />

// Content files are checked and turned into data by scripts/content-plugin.ts.
declare module '*.yaml' {
  const data: unknown;
  export default data;
}
