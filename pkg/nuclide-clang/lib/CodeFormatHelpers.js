Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _libclang2;

function _libclang() {
  return _libclang2 = _interopRequireDefault(require('./libclang'));
}

var CodeFormatHelpers = (function () {
  function CodeFormatHelpers() {
    _classCallCheck(this, CodeFormatHelpers);
  }

  _createDecoratedClass(CodeFormatHelpers, null, [{
    key: 'formatEntireFile',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('nuclide-clang-format.formatCode')],
    value: _asyncToGenerator(function* (editor, range) {
      try {
        return yield (_libclang2 || _libclang()).default.formatCode(editor, range);
      } catch (e) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Could not run clang-format:', e);
        throw new Error('Could not run clang-format.<br>Ensure it is installed and in your $PATH.');
      }
    })
  }]);

  return CodeFormatHelpers;
})();

exports.default = CodeFormatHelpers;
module.exports = exports.default;