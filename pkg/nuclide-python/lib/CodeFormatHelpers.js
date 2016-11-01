'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _dec, _desc, _value, _class;

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let CodeFormatHelpers = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('python.formatCode'), (_class = class CodeFormatHelpers {
  static formatEntireFile(editor, range) {
    return (0, _asyncToGenerator.default)(function* () {
      const buffer = editor.getBuffer();
      const src = editor.getPath();
      if (!src) {
        return {
          formatted: buffer.getText()
        };
      }

      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);

      if (!service) {
        throw new Error('Failed to get service for python.');
      }

      const formatted = yield service.formatCode(src, buffer.getText(), range.start.row + 1, range.end.row + 1);

      return { formatted: formatted };
    })();
  }

}, (_applyDecoratedDescriptor(_class, 'formatEntireFile', [_dec], Object.getOwnPropertyDescriptor(_class, 'formatEntireFile'), _class)), _class));
exports.default = CodeFormatHelpers;
module.exports = exports['default'];