Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _FlowServiceFactory;

function _load_FlowServiceFactory() {
  return _FlowServiceFactory = require('./FlowServiceFactory');
}

var FlowAutocompleteProvider = (function () {
  function FlowAutocompleteProvider() {
    _classCallCheck(this, FlowAutocompleteProvider);
  }

  _createDecoratedClass(FlowAutocompleteProvider, null, [{
    key: 'getSuggestions',
    decorators: [(0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('flow.autocomplete')],
    value: function getSuggestions(request) {
      var editor = request.editor;
      var prefix = request.prefix;
      var activatedManually = request.activatedManually;

      var filePath = editor.getPath();
      var contents = editor.getText();
      var cursor = editor.getLastCursor();
      var line = cursor.getBufferRow();
      var col = cursor.getBufferColumn();

      if (filePath == null) {
        return Promise.resolve(null);
      }

      var flowService = (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getFlowServiceByNuclideUri)(filePath);
      (0, (_assert || _load_assert()).default)(flowService);
      return flowService.flowGetAutocompleteSuggestions(filePath, contents, line, col, prefix,
      // Needs to be a boolean, but autocomplete-plus gives us undefined instead of false.
      Boolean(activatedManually));
    }
  }]);

  return FlowAutocompleteProvider;
})();

exports.default = FlowAutocompleteProvider;
module.exports = exports.default;