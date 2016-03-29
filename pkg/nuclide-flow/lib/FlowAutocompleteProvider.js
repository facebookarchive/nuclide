var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideAnalytics = require('../../nuclide-analytics');

var _FlowServiceFactory = require('./FlowServiceFactory');

var FlowAutocompleteProvider = (function () {
  function FlowAutocompleteProvider() {
    _classCallCheck(this, FlowAutocompleteProvider);
  }

  _createDecoratedClass(FlowAutocompleteProvider, [{
    key: 'getSuggestions',
    decorators: [(0, _nuclideAnalytics.trackTiming)('flow.autocomplete')],
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

      var flowService = (0, _FlowServiceFactory.getFlowServiceByNuclideUri)(filePath);
      (0, _assert2['default'])(flowService);
      return flowService.flowGetAutocompleteSuggestions(filePath, contents, line, col, prefix,
      // Needs to be a boolean, but autocomplete-plus gives us undefined instead of false.
      !!activatedManually);
    }
  }]);

  return FlowAutocompleteProvider;
})();

module.exports = FlowAutocompleteProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dBdXRvY29tcGxldGVQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7OztnQ0FFSix5QkFBeUI7O2tDQUVWLHNCQUFzQjs7SUFFekQsd0JBQXdCO1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzs7d0JBQXhCLHdCQUF3Qjs7aUJBQzNCLG1DQUFZLG1CQUFtQixDQUFDO1dBQ25CLHdCQUFDLE9BQWlDLEVBQWdEO1VBQ3ZGLE1BQU0sR0FBK0IsT0FBTyxDQUE1QyxNQUFNO1VBQUUsTUFBTSxHQUF1QixPQUFPLENBQXBDLE1BQU07VUFBRSxpQkFBaUIsR0FBSSxPQUFPLENBQTVCLGlCQUFpQjs7QUFDeEMsVUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLFVBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxVQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDdEMsVUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ25DLFVBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7QUFFckMsVUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3BCLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM5Qjs7QUFFRCxVQUFNLFdBQVcsR0FBRyxvREFBMkIsUUFBUSxDQUFDLENBQUM7QUFDekQsK0JBQVUsV0FBVyxDQUFDLENBQUM7QUFDdkIsYUFBTyxXQUFXLENBQUMsOEJBQThCLENBQy9DLFFBQVEsRUFDUixRQUFRLEVBQ1IsSUFBSSxFQUNKLEdBQUcsRUFDSCxNQUFNOztBQUVOLE9BQUMsQ0FBQyxpQkFBaUIsQ0FDcEIsQ0FBQztLQUNIOzs7U0F6Qkcsd0JBQXdCOzs7QUE0QjlCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsd0JBQXdCLENBQUMiLCJmaWxlIjoiRmxvd0F1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbmltcG9ydCB7Z2V0Rmxvd1NlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4vRmxvd1NlcnZpY2VGYWN0b3J5JztcblxuY2xhc3MgRmxvd0F1dG9jb21wbGV0ZVByb3ZpZGVyIHtcbiAgQHRyYWNrVGltaW5nKCdmbG93LmF1dG9jb21wbGV0ZScpXG4gIGdldFN1Z2dlc3Rpb25zKHJlcXVlc3Q6IGF0b20kQXV0b2NvbXBsZXRlUmVxdWVzdCk6IFByb21pc2U8P0FycmF5PGF0b20kQXV0b2NvbXBsZXRlU3VnZ2VzdGlvbj4+IHtcbiAgICBjb25zdCB7ZWRpdG9yLCBwcmVmaXgsIGFjdGl2YXRlZE1hbnVhbGx5fSA9IHJlcXVlc3Q7XG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IGNvbnRlbnRzID0gZWRpdG9yLmdldFRleHQoKTtcbiAgICBjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuICAgIGNvbnN0IGxpbmUgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KCk7XG4gICAgY29uc3QgY29sID0gY3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpO1xuXG4gICAgaWYgKGZpbGVQYXRoID09IG51bGwpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gICAgfVxuXG4gICAgY29uc3QgZmxvd1NlcnZpY2UgPSBnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaShmaWxlUGF0aCk7XG4gICAgaW52YXJpYW50KGZsb3dTZXJ2aWNlKTtcbiAgICByZXR1cm4gZmxvd1NlcnZpY2UuZmxvd0dldEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb250ZW50cyxcbiAgICAgIGxpbmUsXG4gICAgICBjb2wsXG4gICAgICBwcmVmaXgsXG4gICAgICAvLyBOZWVkcyB0byBiZSBhIGJvb2xlYW4sIGJ1dCBhdXRvY29tcGxldGUtcGx1cyBnaXZlcyB1cyB1bmRlZmluZWQgaW5zdGVhZCBvZiBmYWxzZS5cbiAgICAgICEhYWN0aXZhdGVkTWFudWFsbHksXG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb3dBdXRvY29tcGxldGVQcm92aWRlcjtcbiJdfQ==