Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var codeHighlightFromEditor = _asyncToGenerator(function* (editor, position) {
  var filePath = editor.getPath();
  var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(filePath);
  if (!hackLanguage) {
    return [];
  }
  (0, _assert2['default'])(filePath != null);

  var id = (0, _utils.getIdentifierAtPosition)(editor, position);
  if (id == null || !id.startsWith('$')) {
    return [];
  }

  return hackLanguage.highlightSource(filePath, editor.getText(), position.row + 1, position.column);
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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

var _HackLanguage = require('./HackLanguage');

var _utils = require('./utils');

var CodeHighlightProvider = (function () {
  function CodeHighlightProvider() {
    _classCallCheck(this, CodeHighlightProvider);
  }

  _createClass(CodeHighlightProvider, [{
    key: 'highlight',
    value: function highlight(editor, position) {
      return codeHighlightFromEditor(editor, position);
    }
  }]);

  return CodeHighlightProvider;
})();

exports['default'] = CodeHighlightProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvZGVIaWdobGlnaHRQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUFxQmUsdUJBQXVCLHFCQUF0QyxXQUNFLE1BQXVCLEVBQ3ZCLFFBQW9CLEVBQ1E7QUFDNUIsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLE1BQU0sWUFBWSxHQUFHLE1BQU0seUNBQXNCLFFBQVEsQ0FBQyxDQUFDO0FBQzNELE1BQUksQ0FBQyxZQUFZLEVBQUU7QUFDakIsV0FBTyxFQUFFLENBQUM7R0FDWDtBQUNELDJCQUFVLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQzs7QUFFNUIsTUFBTSxFQUFFLEdBQUcsb0NBQXdCLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNyRCxNQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3JDLFdBQU8sRUFBRSxDQUFDO0dBQ1g7O0FBRUQsU0FBTyxZQUFZLENBQUMsZUFBZSxDQUNqQyxRQUFRLEVBQ1IsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUNoQixRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsRUFDaEIsUUFBUSxDQUFDLE1BQU0sQ0FDaEIsQ0FBQztDQUNIOzs7Ozs7Ozs7Ozs7Ozs7O3NCQWhDcUIsUUFBUTs7Ozs0QkFDTSxnQkFBZ0I7O3FCQUNkLFNBQVM7O0lBRTFCLHFCQUFxQjtXQUFyQixxQkFBcUI7MEJBQXJCLHFCQUFxQjs7O2VBQXJCLHFCQUFxQjs7V0FDL0IsbUJBQUMsTUFBdUIsRUFBRSxRQUFvQixFQUE4QjtBQUNuRixhQUFPLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNsRDs7O1NBSGtCLHFCQUFxQjs7O3FCQUFyQixxQkFBcUIiLCJmaWxlIjoiQ29kZUhpZ2hsaWdodFByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtnZXRIYWNrTGFuZ3VhZ2VGb3JVcml9IGZyb20gJy4vSGFja0xhbmd1YWdlJztcbmltcG9ydCB7Z2V0SWRlbnRpZmllckF0UG9zaXRpb259IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlSGlnaGxpZ2h0UHJvdmlkZXIge1xuICBoaWdobGlnaHQoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZTxBcnJheTxhdG9tJFJhbmdlPj4ge1xuICAgIHJldHVybiBjb2RlSGlnaGxpZ2h0RnJvbUVkaXRvcihlZGl0b3IsIHBvc2l0aW9uKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBjb2RlSGlnaGxpZ2h0RnJvbUVkaXRvcihcbiAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gIHBvc2l0aW9uOiBhdG9tJFBvaW50LFxuKTogUHJvbWlzZTxBcnJheTxhdG9tJFJhbmdlPj4ge1xuICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gIGNvbnN0IGhhY2tMYW5ndWFnZSA9IGF3YWl0IGdldEhhY2tMYW5ndWFnZUZvclVyaShmaWxlUGF0aCk7XG4gIGlmICghaGFja0xhbmd1YWdlKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGludmFyaWFudChmaWxlUGF0aCAhPSBudWxsKTtcblxuICBjb25zdCBpZCA9IGdldElkZW50aWZpZXJBdFBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24pO1xuICBpZiAoaWQgPT0gbnVsbCB8fCAhaWQuc3RhcnRzV2l0aCgnJCcpKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmV0dXJuIGhhY2tMYW5ndWFnZS5oaWdobGlnaHRTb3VyY2UoXG4gICAgZmlsZVBhdGgsXG4gICAgZWRpdG9yLmdldFRleHQoKSxcbiAgICBwb3NpdGlvbi5yb3cgKyAxLFxuICAgIHBvc2l0aW9uLmNvbHVtbixcbiAgKTtcbn1cbiJdfQ==