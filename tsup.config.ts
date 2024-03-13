import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    client: 'src/client/index.ts',
  },
  outDir: 'public',
  target: 'es6',
});
