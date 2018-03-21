import buble from 'rollup-plugin-buble';

export default {
  input: './src/index.js',
  external: ['fs', 'path'],
  plugins: [
    buble(),
  ],
};
