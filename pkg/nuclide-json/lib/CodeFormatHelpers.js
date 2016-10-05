Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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

var CodeFormatHelpers = (function () {
  function CodeFormatHelpers() {
    _classCallCheck(this, CodeFormatHelpers);
  }

  _createDecoratedClass(CodeFormatHelpers, null, [{
    key: 'formatEntireFile',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('json.formatCode')],
    value: function formatEntireFile(editor, range) {
      var buffer_as_json = JSON.parse(editor.getBuffer().getText());
      var formatted = JSON.stringify(buffer_as_json, null, editor.getTabLength());
      return Promise.resolve({ formatted: formatted });
    }
  }]);

  return CodeFormatHelpers;
})();

exports.default = CodeFormatHelpers;
module.exports = exports.default;