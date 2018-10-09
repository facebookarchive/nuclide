"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _dedent() {
  const data = _interopRequireDefault(require("dedent"));

  _dedent = function () {
    return data;
  };

  return data;
}

var _fs = _interopRequireDefault(require("fs"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
const ttfUri = _nuclideUri().default.nuclideUriToUri(_path.default.join(__dirname, 'styles', 'nuclicons.ttf'));

const newStyle = document.createElement('style');
newStyle.appendChild(document.createTextNode(_dedent().default`
    @font-face {
      font-family: 'nuclicons';
      src: url('${ttfUri}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  `));
(0, _nullthrows().default)(document.head).appendChild(newStyle);

const styleDir = _path.default.join(__dirname, 'styles');

const styleDisposables = new (_UniversalDisposable().default)(..._fs.default.readdirSync(styleDir).filter(file => ['.less', '.css'].includes(_path.default.extname(file))).map(file => atom.themes.requireStylesheet(_path.default.join(styleDir, file))), () => newStyle.remove());
module.exports = styleDisposables; // eslint-disable-line nuclide-internal/no-commonjs