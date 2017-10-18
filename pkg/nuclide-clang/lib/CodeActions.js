'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _libclang;

function _load_libclang() {
  return _libclang = require('./libclang');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CodeActions {
  static getCodeActions(editor, range, diagnostics) {
    for (const diagnostic of diagnostics) {
      if (diagnostic.text === (_constants || _load_constants()).DEFAULT_FLAGS_WARNING) {
        return Promise.resolve([{
          dispose() {},
          getTitle: () => Promise.resolve('Clean, rebuild, and save file'),
          apply() {
            return (0, _asyncToGenerator.default)(function* () {
              yield (0, (_libclang || _load_libclang()).resetForSource)(editor);
              yield editor.save();
            })();
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
                                * 
                                * @format
                                */