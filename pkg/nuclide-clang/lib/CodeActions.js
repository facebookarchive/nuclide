"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _libclang() {
  const data = require("./libclang");

  _libclang = function () {
    return data;
  };

  return data;
}

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
class CodeActions {
  static getCodeActions(editor, range, diagnostics) {
    for (const diagnostic of diagnostics) {
      if (diagnostic.text === _constants().DEFAULT_FLAGS_WARNING || diagnostic.text === _constants().HEADER_DEFAULT_FLAGS_WARNING) {
        return Promise.resolve([{
          dispose() {},

          getTitle: () => Promise.resolve('Clean, rebuild, and save file'),

          async apply() {
            await (0, _libclang().resetForSource)(editor);
            await editor.save();
          }

        }]);
      }
    }

    return Promise.resolve([]);
  }

}

exports.default = CodeActions;