import babel from 'rollup-plugin-babel';

export default {
  input: './src/index.js',
  external: ['fs', 'path'],
  plugins: [
    babel({
      babelrc: false,
      presets: [
        [
          'es2015',
          {
            modules: false,
          },
        ],
      ],
    }),
  ],
};
