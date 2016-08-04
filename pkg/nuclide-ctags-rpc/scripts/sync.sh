#!/bin/bash

npm install ctags-prebuilt
rm -rf node_modules/ctags-prebuilt/node_modules
rsync -r --delete node_modules/ctags-prebuilt VendorLib/
rm -rf node_modules
