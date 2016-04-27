function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

module.exports = Object.defineProperties({

  isBuckFile: function isBuckFile(filePath) {
    // TODO(mbolin): Buck does have an option where the user can customize the
    // name of the build file: https://github.com/facebook/buck/issues/238.
    // This function will not work for those who use that option.
    return _path2['default'].basename(filePath) === 'BUCK';
  }
}, {
  BuckProject: {
    get: function get() {
      return require('./BuckProject');
    },
    configurable: true,
    enumerable: true
  }
});