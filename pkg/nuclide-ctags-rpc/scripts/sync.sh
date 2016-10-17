#!/bin/bash

yarn add ctags-prebuilt --prod --no-lockfile
rm -rf node_modules/ctags-prebuilt/node_modules
rsync -r --delete node_modules/ctags-prebuilt VendorLib/
rm -rf node_modules
hg revert package.json
