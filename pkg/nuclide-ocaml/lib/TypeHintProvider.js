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

var _atom = require('atom');

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

// Ignore typehints that span too many lines. These tend to be super spammy.
const MAX_LINES = 10;

// Complex types can end up being super long. Truncate them.
// TODO(hansonw): we could parse these into hint trees
const MAX_LENGTH = 100;

let TypeHintProvider = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-ocaml.typeHint'), (_class = class TypeHintProvider {
  typeHint(editor, position) {
    return (0, _asyncToGenerator.default)(function* () {
      const path = editor.getPath();
      if (path == null) {
        return null;
      }
      const instance = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('MerlinService', path);
      if (instance == null) {
        return null;
      }
      yield instance.pushNewBuffer(path, editor.getText());
      const types = yield instance.enclosingType(path, position.row, position.column);
      if (types == null || types.length === 0) {
        return null;
      }
      const type = types[0];
      if (type.end.line - type.start.line > MAX_LINES) {
        return null;
      }
      let hint = type.type;
      if (hint.length > MAX_LENGTH) {
        hint = hint.substr(0, MAX_LENGTH) + '...';
      }
      return {
        hint: hint,
        range: new _atom.Range(new _atom.Point(type.start.line - 1, type.start.col), new _atom.Point(type.end.line - 1, type.end.col))
      };
    })();
  }

}, (_applyDecoratedDescriptor(_class.prototype, 'typeHint', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, 'typeHint'), _class.prototype)), _class));
exports.default = TypeHintProvider;
module.exports = exports['default'];