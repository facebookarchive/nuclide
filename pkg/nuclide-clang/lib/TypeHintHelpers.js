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

var _libclang;

function _load_libclang() {
  return _libclang = require('./libclang');
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

// Types longer than this will be truncated.
const MAX_LENGTH = 256;

let TypeHintHelpers = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-clang-atom.typeHint'), (_class = class TypeHintHelpers {
  static typeHint(editor, position) {
    return (0, _asyncToGenerator.default)(function* () {
      const decl = yield (0, (_libclang || _load_libclang()).getDeclaration)(editor, position.row, position.column);
      if (decl == null) {
        return null;
      }
      const type = decl.type,
            range = decl.extent;

      if (type == null || type.trim() === '') {
        return null;
      }
      let hint = type;
      if (type.length > MAX_LENGTH) {
        hint = type.substr(0, MAX_LENGTH) + '...';
      }
      return { hint: hint, range: range };
    })();
  }

}, (_applyDecoratedDescriptor(_class, 'typeHint', [_dec], Object.getOwnPropertyDescriptor(_class, 'typeHint'), _class)), _class));
exports.default = TypeHintHelpers;
module.exports = exports['default'];