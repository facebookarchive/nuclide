'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';

module.exports = {
  get BuckProject() {
    return require('./BuckProject');
  },

  isBuckFile: function(filePath: string): boolean {
    // TODO(mbolin): Buck does have an option where the user can customize the
    // name of the build file: https://github.com/facebook/buck/issues/238.
    // This function will not work for those who use that option.
    return path.basename(filePath) === 'BUCK';
  },
};
