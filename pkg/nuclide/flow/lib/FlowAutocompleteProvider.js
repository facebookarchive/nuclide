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

var _FlowServiceFactory = require('./FlowServiceFactory');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dBdXRvY29tcGxldGVQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFXc0IsUUFBUTs7Ozt5QkFFSixpQkFBaUI7O2tDQUVGLHNCQUFzQjs7SUFFekQsd0JBQXdCO1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzs7d0JBQXhCLHdCQUF3Qjs7aUJBQzNCLDRCQUFZLG1CQUFtQixDQUFDO1dBQ25CLHdCQUFDLE9BQWlDLEVBQWdEO1VBQ3ZGLE1BQU0sR0FBK0IsT0FBTyxDQUE1QyxNQUFNO1VBQUUsTUFBTSxHQUF1QixPQUFPLENBQXBDLE1BQU07VUFBRSxpQkFBaUIsR0FBSSxPQUFPLENBQTVCLGlCQUFpQjs7QUFDeEMsVUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLFVBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxVQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDdEMsVUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ25DLFVBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7QUFFckMsVUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3BCLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM5Qjs7QUFFRCxVQUFNLFdBQVcsR0FBRyxvREFBMkIsUUFBUSxDQUFDLENBQUM7QUFDekQsK0JBQVUsV0FBVyxDQUFDLENBQUM7QUFDdkIsYUFBTyxXQUFXLENBQUMsOEJBQThCLENBQy9DLFFBQVEsRUFDUixRQUFRLEVBQ1IsSUFBSSxFQUNKLEdBQUcsRUFDSCxNQUFNOztBQUVOLE9BQUMsQ0FBQyxpQkFBaUIsQ0FDcEIsQ0FBQztLQUNIOzs7U0F6Qkcsd0JBQXdCOzs7QUE0QjlCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsd0JBQXdCLENBQUMiLCJmaWxlIjoiRmxvd0F1dG9jb21wbGV0ZVByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5pbXBvcnQge2dldEZsb3dTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuL0Zsb3dTZXJ2aWNlRmFjdG9yeSc7XG5cbmNsYXNzIEZsb3dBdXRvY29tcGxldGVQcm92aWRlciB7XG4gIEB0cmFja1RpbWluZygnZmxvdy5hdXRvY29tcGxldGUnKVxuICBnZXRTdWdnZXN0aW9ucyhyZXF1ZXN0OiBhdG9tJEF1dG9jb21wbGV0ZVJlcXVlc3QpOiBQcm9taXNlPD9BcnJheTxhdG9tJEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb24+PiB7XG4gICAgY29uc3Qge2VkaXRvciwgcHJlZml4LCBhY3RpdmF0ZWRNYW51YWxseX0gPSByZXF1ZXN0O1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBjb25zdCBjb250ZW50cyA9IGVkaXRvci5nZXRUZXh0KCk7XG4gICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKTtcbiAgICBjb25zdCBsaW5lID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpO1xuICAgIGNvbnN0IGNvbCA9IGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKTtcblxuICAgIGlmIChmaWxlUGF0aCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICAgIH1cblxuICAgIGNvbnN0IGZsb3dTZXJ2aWNlID0gZ2V0Rmxvd1NlcnZpY2VCeU51Y2xpZGVVcmkoZmlsZVBhdGgpO1xuICAgIGludmFyaWFudChmbG93U2VydmljZSk7XG4gICAgcmV0dXJuIGZsb3dTZXJ2aWNlLmZsb3dHZXRBdXRvY29tcGxldGVTdWdnZXN0aW9ucyhcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgY29udGVudHMsXG4gICAgICBsaW5lLFxuICAgICAgY29sLFxuICAgICAgcHJlZml4LFxuICAgICAgLy8gTmVlZHMgdG8gYmUgYSBib29sZWFuLCBidXQgYXV0b2NvbXBsZXRlLXBsdXMgZ2l2ZXMgdXMgdW5kZWZpbmVkIGluc3RlYWQgb2YgZmFsc2UuXG4gICAgICAhIWFjdGl2YXRlZE1hbnVhbGx5LFxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGbG93QXV0b2NvbXBsZXRlUHJvdmlkZXI7XG4iXX0=