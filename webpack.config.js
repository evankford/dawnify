const outputDirectory = './dist';
const path = require('path');
const glob = require('glob');
const CopyPlugin = require('copy-webpack-plugin');
const ConcatFilesPlugin = require('webpack-concat-files-plugin');
const MergeJsonPlugin = require('merge-json-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");


var sass = require('sass');


function getSections() {
  let sectionBundles = [];
  const allSections = glob.sync(path.resolve('./src/sections/**/*/*.liquid'));
  allSections.forEach((fileName) => {
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
            return '{% javascript %}' + content + '{% endjavascript %}';
          } else if (filePath.indexOf('css') >= 0) {

            //Render scss
            if (filePath.indexOf('scss') >= 0) {
              let renderedSass = "";
              try{
                renderedSass = sass.renderSync({ file: filePath }).css.toString();
              } catch(err) {
                console.log(err);
                renderedSass = "/* Error parsing scss:" + err + '*/';
              }
              return (
                '{% stylesheet %}/* Rendered SCSS in section file */\n' + renderedSass + '{% endstylesheet %}'
              );
            } else {

              //Default css behavior
              return '{% stylesheet %}' + content + '{% endstylesheet %}';
            }
          } else {
            return content;
          }
        }
      },
    });
  });

  return sectionBundles;
}

function getEntries() {
  let componentEntries = {};

  function addEntry(name, file) {
    if (name in componentEntries) {
       componentEntries[name].push(file);
    } else {
       componentEntries[name] = [file];
    }
  }

  const allCssCModules = glob.sync(
    path.resolve('./src/styles/_modules/*/*css')
  );
  allCssCModules.forEach((file) => {
    const type = file.substring(
      file.indexOf('_modules/') + 9,
      file.lastIndexOf('/')
    );
    const name = file.substring(
      file.lastIndexOf('/') + 1,
      file.lastIndexOf('.')
    );

    addEntry(`${type}-${name}`,  file);
  });
  const allCssBaseFiles = glob.sync(
    path.resolve('./src/styles/*css')
  );
  allCssBaseFiles.forEach((file) => {
    const name = file.substring(
      file.lastIndexOf('/') + 1,
      file.lastIndexOf('.')
    );
      addEntry(name,file);
  });
  const allJsModules = glob.sync(
    path.resolve('./src/scripts/_modules/*/*.js')
  );
  allJsModules.forEach((file) => {
    const name = file.substring(
      file.lastIndexOf('/') + 1,
      file.lastIndexOf('.')
    );
     const type = file.substring(
       file.indexOf('_modules/') + 9,
       file.lastIndexOf('/')
     );
    addEntry(`${type}-${name}`, file);

  });
  const allJsFiles = glob.sync(
    path.resolve('./src/scripts/*.js')
  );
  allJsFiles.forEach((file) => {
    const name = file.substring(
      file.lastIndexOf('/') + 1,
      file.lastIndexOf('.')
    );

    addEntry(name, file);

  });

  return {
    ...componentEntries,
  };
}

module.exports = (env) => {
  return {
  mode: !env.production ? 'development' : 'production',
  // stats: !env.production ? 'errors-only' : 'detailed',
  entry: getEntries(),
  devtool: !env.production ? 'inline-source-map' : false,
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
    minimize: true,
    minimizer: [new TerserPlugin()]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: './assets/[name].css',
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
        {
          from: path.resolve('./src/config/settings_data.json'),
          to: path.resolve(outputDirectory, 'config'),
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
          files: './src/config/!(settings_)**.json',
          to: './config/settings_schema.json',
        },
      ],
      minify: false,
    }),

    new ConcatFilesPlugin({
      bundles: getSections(),
    }),
  ],
}
};
