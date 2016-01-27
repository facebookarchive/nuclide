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

var _analytics = require('../../analytics');

var FlowAutocompleteProvider = (function () {
  function FlowAutocompleteProvider() {
    _classCallCheck(this, FlowAutocompleteProvider);
  }

  _createDecoratedClass(FlowAutocompleteProvider, [{
    key: 'getSuggestions',
    decorators: [(0, _analytics.trackTiming)('flow.autocomplete')],
    value: function getSuggestions(request) {
      var editor = request.editor;
      var prefix = request.prefix;
      var activatedManually = request.activatedManually;

      var file = editor.getPath();
      var contents = editor.getText();
      var cursor = editor.getLastCursor();
      var line = cursor.getBufferRow();
      var col = cursor.getBufferColumn();

      var flowService = require('../../client').getServiceByNuclideUri('FlowService', file);
      (0, _assert2['default'])(flowService);
      return flowService.flowGetAutocompleteSuggestions(file, contents, line, col, prefix,
      // Needs to be a boolean, but autocomplete-plus gives us undefined instead of false.
      !!activatedManually);
    }
  }]);

  return FlowAutocompleteProvider;
})();

module.exports = FlowAutocompleteProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dBdXRvY29tcGxldGVQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7Ozt5QkFFSixpQkFBaUI7O0lBRXJDLHdCQUF3QjtXQUF4Qix3QkFBd0I7MEJBQXhCLHdCQUF3Qjs7O3dCQUF4Qix3QkFBd0I7O2lCQUMzQiw0QkFBWSxtQkFBbUIsQ0FBQztXQUNuQix3QkFBQyxPQUFpQyxFQUFnRDtVQUN2RixNQUFNLEdBQStCLE9BQU8sQ0FBNUMsTUFBTTtVQUFFLE1BQU0sR0FBdUIsT0FBTyxDQUFwQyxNQUFNO1VBQUUsaUJBQWlCLEdBQUksT0FBTyxDQUE1QixpQkFBaUI7O0FBQ3hDLFVBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixVQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsVUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3RDLFVBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNuQyxVQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7O0FBRXJDLFVBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDeEYsK0JBQVUsV0FBVyxDQUFDLENBQUM7QUFDdkIsYUFBTyxXQUFXLENBQUMsOEJBQThCLENBQy9DLElBQUksRUFDSixRQUFRLEVBQ1IsSUFBSSxFQUNKLEdBQUcsRUFDSCxNQUFNOztBQUVOLE9BQUMsQ0FBQyxpQkFBaUIsQ0FDcEIsQ0FBQztLQUNIOzs7U0FyQkcsd0JBQXdCOzs7QUF3QjlCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsd0JBQXdCLENBQUMiLCJmaWxlIjoiRmxvd0F1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5jbGFzcyBGbG93QXV0b2NvbXBsZXRlUHJvdmlkZXIge1xuICBAdHJhY2tUaW1pbmcoJ2Zsb3cuYXV0b2NvbXBsZXRlJylcbiAgZ2V0U3VnZ2VzdGlvbnMocmVxdWVzdDogYXRvbSRBdXRvY29tcGxldGVSZXF1ZXN0KTogUHJvbWlzZTw/QXJyYXk8YXRvbSRBdXRvY29tcGxldGVTdWdnZXN0aW9uPj4ge1xuICAgIGNvbnN0IHtlZGl0b3IsIHByZWZpeCwgYWN0aXZhdGVkTWFudWFsbHl9ID0gcmVxdWVzdDtcbiAgICBjb25zdCBmaWxlID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBjb25zdCBjb250ZW50cyA9IGVkaXRvci5nZXRUZXh0KCk7XG4gICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKTtcbiAgICBjb25zdCBsaW5lID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpO1xuICAgIGNvbnN0IGNvbCA9IGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKTtcblxuICAgIGNvbnN0IGZsb3dTZXJ2aWNlID0gcmVxdWlyZSgnLi4vLi4vY2xpZW50JykuZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnRmxvd1NlcnZpY2UnLCBmaWxlKTtcbiAgICBpbnZhcmlhbnQoZmxvd1NlcnZpY2UpO1xuICAgIHJldHVybiBmbG93U2VydmljZS5mbG93R2V0QXV0b2NvbXBsZXRlU3VnZ2VzdGlvbnMoXG4gICAgICBmaWxlLFxuICAgICAgY29udGVudHMsXG4gICAgICBsaW5lLFxuICAgICAgY29sLFxuICAgICAgcHJlZml4LFxuICAgICAgLy8gTmVlZHMgdG8gYmUgYSBib29sZWFuLCBidXQgYXV0b2NvbXBsZXRlLXBsdXMgZ2l2ZXMgdXMgdW5kZWZpbmVkIGluc3RlYWQgb2YgZmFsc2UuXG4gICAgICAhIWFjdGl2YXRlZE1hbnVhbGx5LFxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGbG93QXV0b2NvbXBsZXRlUHJvdmlkZXI7XG4iXX0=