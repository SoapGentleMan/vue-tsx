module.exports = ({file, options, env}) => ({
  parser: false,
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: ['last 20 version', '> 0.5%'],
    }),
  ],
});