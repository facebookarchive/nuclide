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

var _libclang2;

function _libclang() {
  return _libclang2 = require('./libclang');
}

// Types longer than this will be truncated.
var MAX_LENGTH = 256;

var TypeHintHelpers = (function () {
  function TypeHintHelpers() {
    _classCallCheck(this, TypeHintHelpers);
  }

  _createDecoratedClass(TypeHintHelpers, null, [{
    key: 'typeHint',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-clang-atom.typeHint')],
    value: _asyncToGenerator(function* (editor, position) {
      var decl = yield (0, (_libclang2 || _libclang()).getDeclaration)(editor, position.row, position.column);
      if (decl == null) {
        return null;
      }
      var type = decl.type;
      var extent = decl.extent;

      if (type == null || type.trim() === '') {
        return null;
      }
      var hint = type;
      if (type.length > MAX_LENGTH) {
        hint = type.substr(0, MAX_LENGTH) + '...';
      }
      return {
        hint: hint,
        range: new (_atom2 || _atom()).Range(new (_atom2 || _atom()).Point(extent.start.line, extent.start.column), new (_atom2 || _atom()).Point(extent.end.line, extent.end.column))
      };
    })
  }]);

  return TypeHintHelpers;
})();

exports.default = TypeHintHelpers;
module.exports = exports.default;