module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead',
        corejs: 3,
        useBuiltIns: 'usage'
      }
    ]
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@vue/transform-vue-jsx',
    ['component', {
      libraryName: 'mint-ui',
      style: true
    }]
  ]
};
