#!/bin/bash

npm install fuzzy-native
rm -rf node_modules/fuzzy-native/{binding.gyp,src,node_modules}
rsync -r --delete node_modules/fuzzy-native VendorLib/
rm -rf node_modules
