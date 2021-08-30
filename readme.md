# Dawnify
by automatify

## Basic Concepts
Building and developing themes happens on a "development theme" on shopify- a transient, hidden

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

3. Run the "start"

## Deployment
