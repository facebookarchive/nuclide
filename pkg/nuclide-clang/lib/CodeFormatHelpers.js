"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _libclang() {
  const data = _interopRequireDefault(require("./libclang"));

  _libclang = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class CodeFormatHelpers {
  static formatEntireFile(editor, range) {
    return (0, _nuclideAnalytics().trackTiming)('nuclide-clang-format.formatCode', async () => {
      try {
        return await _libclang().default.formatCode(editor, range);
      } catch (e) {
        (0, _log4js().getLogger)('nuclide-clang').error('Could not run clang-format:', e);
        throw new Error('Could not run clang-format.<br>Ensure it is installed and in your $PATH.');
      }
    });
  }

}

exports.default = CodeFormatHelpers;