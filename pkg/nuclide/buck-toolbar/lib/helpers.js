'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Given path to the output of an apple_bundle Buck rule, returns the path to the corresponding
 * "*.app" directory. If the input path ends with ".app", this returns the input path as is.
 *
 * @param outputPath should be something like: "buck-out/gen/basepath/shortname.zip".
 * @return "buck-out/gen/basepath/shortname/shortname.app"
 */
function dotAppDirectoryForAppleBundleOutput(outputPath: string): string {
  if (outputPath.endsWith('.app')) {
    return outputPath;
  }
  var path = require('path');
  var suffix = '.zip';
  var shortName = path.basename(outputPath).slice(0, -(suffix.length));
  return path.join(path.dirname(outputPath), shortName, shortName + '.app');
}

module.exports = {
  dotAppDirectoryForAppleBundleOutput,
};
