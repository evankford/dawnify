const outputDirectory = "./dist"
const path = require('path');
const glob = require('glob');
const CopyPlugin = require('copy-webpack-plugin')
const ConcatFilesPlugin = require('webpack-concat-files-plugin');
const MergeJsonPlugin = require('merge-json-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

var sass = require('sass');

const env = process.env.WEBPACK_ENV ? process.env.WEBPACK_ENV : "development";
function getSections() {
  let sectionBundles = []
  const allSections = glob.sync(path.resolve('./src/sections/**/*/*.liquid'));
  allSections.forEach(fileName=> {
    const name = fileName.match(/\/src\/sections\/(.*)\//)[1];
    const dir = fileName.substring(0, fileName.lastIndexOf('/'));
    sectionBundles.push({
      src: dir,
      dest: path.resolve(outputDirectory, `sections/${name}.liquid`),
      transforms: {
        before: async (content, filePath) => {
          if (filePath.indexOf('json') >= 0) {
            return '{% schema %}' + content + '{% endschema %}\n';
          } else if (filePath.indexOf('js') >= 0) {
            return '{% javascript %}' + content + '{% endjavascript %}'
          } else if (filePath.indexOf('css') >=0){
            if (filePath.indexOf('scss') >= 0) {
              return (
                '{% stylesheet %}' +
                sass.render({ data: content, includePaths: [dir] }) +
                '{% endstylesheet %}'
              );
            }
            else {
              return '{% stylesheet %}' + content + '{% endstylesheet %}';
            }
          } else {
            return content;
          }
        },
      },
    });
  })

  return sectionBundles;
}

function getEntries() {
  let componentEntries = {};

  const allCssComponents = glob.sync(path.resolve('./src/styles/_modules/*/*css'))
  allCssComponents.forEach(file=> {
    const type = file.substring(file.indexOf('_modules/') + 9, file.lastIndexOf('/'));
    const name = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'));
    componentEntries[`${type}-${name}`] = [file];
  })
  const allJsElements = glob.sync(path.resolve('./src/scripts/_elements/*/*.js'))
  allJsElements.forEach(file=> {
    const name = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'));
    componentEntries[`${name}`] = [file];
  })

  return {
    ...componentEntries,
    theme: ['./src/scripts/theme.js', './src/styles/theme.scss'],
    slider: ['./src/scripts/slider.js', './src/styles/slider.scss'],
    product: ['./src/scripts/product.js', './src/styles/product.scss'],
  };
}

module.exports = {
  mode: 'production',
  stats: env == 'development' ? 'errors-only' : 'detailed',
  entry: getEntries(),
  output: {
    filename: 'assets/[name].js',
    chunkFilename: 'assets/[name].js',
    // publicPath: 'dist/',
    path: path.resolve(__dirname, outputDirectory),
  },
  module: {
    rules: [
      //Scss handling
      {
        test: /.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      //This loader combines theme settings schema into one file.
      {
        test: /\.json/,
        loader: 'schema-loader',
        include: path.resolve('./src/config'),
        exclude: [
          path.resolve('./src/config/settings_data.json'), //Ignore basic json
          path.resolve('./src/config/settings_schema.json'), //Ignore schema
        ],
        options: {
          dest: path.resolve(outputDirectory, 'config'),
        },
      },
    ],
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          // cacheGroupKey here is `commons` as the key of the cacheGroup
          name(module, chunks, cacheGroupKey) {
            const moduleFileName = module
              .identifier()
              .split('/')
              .reduceRight((item) => item);
            const allChunksNames = chunks.map((item) => item.name).join('~');
            return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
          },
          chunks: 'all',
        },
      },
    },
  },

  plugins: [
    new CleanWebpackPlugin(),
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: '/assets/[name].css',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve('./src/assets'),
          to: path.resolve(outputDirectory, 'assets'),
        },
        {
          from: path.resolve('./src/layout'),
          to: path.resolve(outputDirectory, 'layout'),
        },
        {
          from: path.resolve('./src/locales'),
          to: path.resolve(outputDirectory, 'locales'),
        },
        {
          from: path.resolve('./src/snippets'),
          to: path.resolve(outputDirectory, 'snippets'),
        },
        {
          from: path.resolve('./src/templates'),
          to: path.resolve(outputDirectory, 'templates'),
        },
        {
          from: path.resolve('./src/translation.yml'),
          to: path.resolve(outputDirectory),
        },
        {
          from: path.resolve('./src/.shopifyignore'),
          to: path.resolve(outputDirectory),
        },
      ],
    }),
    new MergeJsonPlugin({
      mergeFn: (prev, current) => {
        if (prev[0]) {
          prev.push(current);
          return prev;
        }
        return [prev, current];
      },
      group: [
        {
          files: './src/config/**.json',
          to: './config/settings_schema.json',
        },
      ],
      minify: false,
    }),

    new ConcatFilesPlugin({
      bundles: getSections(),
    }),
  ],
};