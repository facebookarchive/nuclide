'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _fs = _interopRequireDefault(require('fs'));

var _path = _interopRequireDefault(require('path'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const styleDir = _path.default.join(__dirname, 'styles');
// eslint-disable-next-line rulesdir/prefer-nuclide-uri
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

// Requiring this module will load all stylesheets in styles/.
// The exported value can be disposed to remove the stylesheets.

const styleDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(..._fs.default.readdirSync(styleDir).filter(file => ['.less', '.css'].includes(_path.default.extname(file))).map(file => atom.themes.requireStylesheet(_path.default.join(styleDir, file))));

module.exports = styleDisposables; // eslint-disable-line rulesdir/no-commonjs