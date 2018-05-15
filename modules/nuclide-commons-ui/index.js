'use strict';var _nuclideUri;














function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../nuclide-commons/nuclideUri'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));}var _dedent;
function _load_dedent() {return _dedent = _interopRequireDefault(require('dedent'));}
var _fs = _interopRequireDefault(require('fs'));var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}

var _path = _interopRequireDefault(require('path'));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                   * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                   * All rights reserved.
                                                                                                                                                   *
                                                                                                                                                   * This source code is licensed under the BSD-style license found in the
                                                                                                                                                   * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                   * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                   *
                                                                                                                                                   * 
                                                                                                                                                   * @format
                                                                                                                                                   */ // Requiring this module will load all stylesheets in styles/.
// The exported value can be disposed to remove the stylesheets.
const ttfUri = (_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(_path.default.join(__dirname, 'styles', 'nuclicons.ttf')); // eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
const newStyle = document.createElement('style');newStyle.appendChild(document.createTextNode((_dedent || _load_dedent()).default`
    @font-face {
      font-family: 'nuclicons';
      src: url('${ttfUri}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  `));(0, (_nullthrows || _load_nullthrows()).default)(document.head).appendChild(newStyle);const styleDir = _path.default.join(__dirname, 'styles');const styleDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(..._fs.default.
readdirSync(styleDir).
filter(file => ['.less', '.css'].includes(_path.default.extname(file))).
map(file => atom.themes.requireStylesheet(_path.default.join(styleDir, file))),
() => newStyle.remove());


module.exports = styleDisposables; // eslint-disable-line nuclide-internal/no-commonjs