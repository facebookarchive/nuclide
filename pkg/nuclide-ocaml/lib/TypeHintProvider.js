Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideClient2;

function _nuclideClient() {
  return _nuclideClient2 = require('../../nuclide-client');
}

// Ignore typehints that span too many lines. These tend to be super spammy.
var MAX_LINES = 10;

// Complex types can end up being super long. Truncate them.
// TODO(hansonw): we could parse these into hint trees
var MAX_LENGTH = 100;

var TypeHintProvider = (function () {
  function TypeHintProvider() {
    _classCallCheck(this, TypeHintProvider);
  }

  _createDecoratedClass(TypeHintProvider, [{
    key: 'typeHint',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-ocaml.typeHint')],
    value: _asyncToGenerator(function* (editor, position) {
      var path = editor.getPath();
      if (path == null) {
        return null;
      }
      var instance = (0, (_nuclideClient2 || _nuclideClient()).getServiceByNuclideUri)('MerlinService', path);
      if (instance == null) {
        return null;
      }
      yield instance.pushNewBuffer(path, editor.getText());
      var types = yield instance.enclosingType(path, position.row, position.column);
      if (types == null || types.length === 0) {
        return null;
      }
      var type = types[0];
      if (type.end.line - type.start.line > MAX_LINES) {
        return null;
      }
      var hint = type.type;
      if (hint.length > MAX_LENGTH) {
        hint = hint.substr(0, MAX_LENGTH) + '...';
      }
      return {
        hint: hint,
        range: new (_atom2 || _atom()).Range(new (_atom2 || _atom()).Point(type.start.line - 1, type.start.col), new (_atom2 || _atom()).Point(type.end.line - 1, type.end.col))
      };
    })
  }]);

  return TypeHintProvider;
})();

exports.TypeHintProvider = TypeHintProvider;