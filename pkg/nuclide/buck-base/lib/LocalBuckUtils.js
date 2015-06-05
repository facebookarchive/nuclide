'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var BuckUtils = require('./BuckUtils');


class LocalBuckUtils extends BuckUtils {

  constructor() {
    super();
    this._buckProjectDirectoryForPath = {};
  }

  async getBuckProjectRoot(filePath: string): Promise<?string> {
    var directory = this._buckProjectDirectoryForPath[filePath];
    if (!directory) {
      var {findNearestFile} = require('nuclide-commons/lib/filesystem');
      var directory = await findNearestFile('.buckconfig', filePath);
      if (!directory) {
        return null;
      } else {
        this._buckProjectDirectoryForPath[filePath] = directory;
      }
    }
    return directory;
  }
}


module.exports = LocalBuckUtils;
