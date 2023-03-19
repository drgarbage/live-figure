module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            apis: './src/apis',
            assets: './src/assets',
            components: './src/components',
            constants: './src/constants',
            utils: './src/utils',
          },
        },
      ],
    ]
  };
};
