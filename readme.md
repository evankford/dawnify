# Dawnify
Dawnify is a custom wrapper around Dawn, the shopify custom theme. It's main features are an improved **header** section, additional features for embedding **tour dates** and **embedded content**, video and full-size **slider backgrounds**, and more custom typography and styling controls.

## Basic Concepts
This tool simply allows for some convenient splitting and compiling of the Shopify/Dawn theme.
1. It splits up each section/***.liquid file into its components: a .json schema, .liquid markup, and optional .s?css and .js files for section-specific styles and scripts.
2. It splits up the /config/settings_schema.json file into component parts, sorted alphanumerically. This is merely for convenience at finding settings.
3. It creates a `scripts` and `styles` directory, and a `_modules` directory under each. These folders are compiled:
    - Base script and style files can be referenced in the `webpack.config.js` file to create entrypoints.
    - Files in subdirectories under the `_modules` directories will be automatically collected and compiled into the assets folder. If they are in the `_modules/base` folder, they will keep their name. If they are in another directory (e.g. `_modules/section` or `_modules/component`), these directory names will be prepended to the filename. For example: `src/styles/_modules/sections/content-slider.scss` will be compiled into `dist/assets/section-content-slider.css`.
  4. There are some opinionated changes as well (the header/footer changes, as well as some base style and script inclusions). These may be easily omitted though, as they are not integral to the build process.

## Development

1. Install the packages via your favorite manager.
````sh
  npm install
  #or
  yarn install
  #or
  pnpm install
````

2. Initialize shopify-cli for the store you're developing
````sh
  #make sure shopify-cli is installed
  shopify version
  #check that you're logged in to the right store
  shopify whoami
  #if you're not logged in
  shopify login --store=your-store.myshopify.com
  #if you're logged in, but on the wrong store
  shopify switch --store=a-different-store.myshopify.com
````

3. Run the "start" command to start developing
`````sh
pnpm start #Should compile the theme, and then upload it as a development theme to shopify
`````
## Deployment
After you're done developing, you need to push the updates as a new theme, or update an existing theme.
1. First, `pnpm pull:dev` to bring down your changes.
2. Then `pnpm push:dry` to push these changes up without compiling. You can also `pnpm update:dry` to update an existing theme. **Note, the *:dry* part will result in overwriting all templates on the existing theme**. You may need to add a theme name here in order to start the upload.
3. To upload optimized/minimized versions of all the script/style assets, finish with a `pnpm run update` and select the relevant theme. This will only overwrite the assets with their optimized versions
4. **The command `pnpm deploy` will automatically run these commands in successession, creating a theme named 'Dawnify'.**

### Additional commands

There are some other functions here.
- `pnpm pull` pulls down a theme, which is usually only usefull to pull down config and template files.
  - Subcommands are `pnpm pull:sync` , `pnpm pull:config` and `pnpm pull:templates`.
- There are matching `pnpm push` commands
  - `pnpm push:sync` , `pnpm push:config` and `pnpm push:templates` commands as well.
- You can also usefully specify a theme role to push to or pull from.
  - For instance, if you want to pull config and template files from the development theme, you can run `pnpm pull:dev:sync`.
  - To push just the templates to the live theme, you can likewise run `pnpm push:live:templates`. **Note: When pushing to live, you will need to confirm after the initial command**.

## Updating Dawn
This template will always require manually updating to the latest version of shopify/dawn. This is a time-consuming process and can easily get out of hand.

Additionally, there is no way to automate updates of existing stores that are using this theme as this theme is not offered on the Shopify Theme Store. As a result, I keep a list of active stores in the `.sites.md` file.