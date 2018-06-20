'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _libclang;

function _load_libclang() {
  return _libclang = require('./libclang');
}

class CodeActions {
  static getCodeActions(editor, range, diagnostics) {
    for (const diagnostic of diagnostics) {
      if (diagnostic.text === (_constants || _load_constants()).DEFAULT_FLAGS_WARNING || diagnostic.text === (_constants || _load_constants()).HEADER_DEFAULT_FLAGS_WARNING) {
        return Promise.resolve([{
          dispose() {},
          getTitle: () => Promise.resolve('Clean, rebuild, and save file'),
          async apply() {
            await (0, (_libclang || _load_libclang()).resetForSource)(editor);
            await editor.save();
          }
        }]);
      }
    }
    return Promise.resolve([]);
  }
}
exports.default = CodeActions; /**
                                * Copyright (c) 2015-present, Facebook, Inc.
                                * All rights reserved.
                                *
                                * This source code is licensed under the license found in the LICENSE file in
                                * the root directory of this source tree.
                                *
                                *  strict-local
                                * @format
                                */