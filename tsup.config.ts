import { defineConfig } from 'tsup';
import { lessLoader } from 'esbuild-plugin-less';

export default defineConfig({
  entry: {
    app: 'src/client/app.ts',
    style: 'src/client/style.less',
  },
  outDir: 'public',
  target: ['es6'],
  // @ts-expect-error it's fine.
  esbuildPlugins: [lessLoader()],
});
