# Storyblok Bridge tests

This is a repository with a minimal code to test the Storyblok bridge, in both version (v1 and v2).

Documentation about the bridge v1: https://www.storyblok.com/docs/Guides/how-to-use-storyblok-latest-js-v1

Documentation about the bridge v2: https://www.storyblok.com/docs/Guides/storyblok-latest-js

## Steps

* Install the dependencies with `yarn`
* Add a `.env` file in this project
* This file should have a environment variable called `VITE_STORYBLOK_ACCESS_TOKEN`
* For this env, you should put the preview or public token from your space
* After that, you can run the `dev` script with `yarn dev`

## Space data

The space should have at least two stories with the following slugs:

* `storyblok-bridge-example`
* `storyblok-bridge-global`

In the story with `-example` slug, the root component should have the name `"BridgePage"`

In the story with `-global` slug, the root component should have the name `"BridgePage"`

These rules are necessary to make the connection work and also the realtime edition

Also, as you can see in the `.js` files, it is expected the following components in these stories:

* feature component with a name field
* teaser component with a headline field
* grid component with a columns field
* For both BridgePage and BridgePage components, it is expected a title field
