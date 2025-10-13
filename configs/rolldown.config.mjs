import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/index.ts",
  output: {
    file: "dist/module.mjs",
    format: "esm",
    sourcemap: true
  },
  format: "esm",
  sourcemap: true,
  target: "es2020",
  treeshake: true,
  minify: false,
  dts: true,
  watch: {
    include: "src/**"
  }
});
