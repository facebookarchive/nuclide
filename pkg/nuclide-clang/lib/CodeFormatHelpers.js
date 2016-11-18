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

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _libclang;

function _load_libclang() {
  return _libclang = _interopRequireDefault(require('./libclang'));
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

let CodeFormatHelpers = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang-format.formatCode'), (_class = class CodeFormatHelpers {
  static formatEntireFile(editor, range) {
    return (0, _asyncToGenerator.default)(function* () {
      try {
        return yield (_libclang || _load_libclang()).default.formatCode(editor, range);
      } catch (e) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Could not run clang-format:', e);
        throw new Error('Could not run clang-format.<br>Ensure it is installed and in your $PATH.');
      }
    })();
  }
}, (_applyDecoratedDescriptor(_class, 'formatEntireFile', [_dec], Object.getOwnPropertyDescriptor(_class, 'formatEntireFile'), _class)), _class));
exports.default = CodeFormatHelpers;
module.exports = exports['default'];