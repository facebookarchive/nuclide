#!/bin/bash

yarn add fuzzy-native --prod --no-lockfile
rm -rf node_modules/fuzzy-native/{binding.gyp,src,node_modules}
rsync -r --delete node_modules/fuzzy-native VendorLib/
rm -rf node_modules
hg revert package.json
