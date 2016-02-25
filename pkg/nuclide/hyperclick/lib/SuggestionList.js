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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var SuggestionList = (function () {
  function SuggestionList() {
    _classCallCheck(this, SuggestionList);
  }

  _createClass(SuggestionList, [{
    key: 'show',
    value: function show(textEditor, suggestion) {
      if (!textEditor || !suggestion) {
        return;
      }

      this._textEditor = textEditor;
      this._suggestion = suggestion;

      this.hide();

      var range = suggestion.range;

      (0, _assert2['default'])(range);

      var _ref = Array.isArray(range) ? range[0] : range;

      var position = _ref.start;

      this._suggestionMarker = textEditor.markBufferPosition(position);
      if (this._suggestionMarker) {
        this._overlayDecoration = textEditor.decorateMarker(this._suggestionMarker, {
          type: 'overlay',
          item: this
        });
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      // $FlowFixMe method override not working with `this`.
      atom.views.getView(this).dispose();
      if (this._suggestionMarker) {
        this._suggestionMarker.destroy();
      } else if (this._overlayDecoration) {
        this._overlayDecoration.destroy();
      }
      this._suggestionMarker = undefined;
      this._overlayDecoration = undefined;
    }
  }, {
    key: 'getTextEditor',
    value: function getTextEditor() {
      return this._textEditor;
    }
  }, {
    key: 'getSuggestion',
    value: function getSuggestion() {
      return this._suggestion;
    }
  }]);

  return SuggestionList;
})();

exports['default'] = SuggestionList;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN1Z2dlc3Rpb25MaXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFhc0IsUUFBUTs7OztJQUVULGNBQWM7V0FBZCxjQUFjOzBCQUFkLGNBQWM7OztlQUFkLGNBQWM7O1dBTTdCLGNBQUMsVUFBMkIsRUFBRSxVQUFnQyxFQUFRO0FBQ3hFLFVBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDOUIsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQzlCLFVBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDOztBQUU5QixVQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7O1VBRUwsS0FBSyxHQUFJLFVBQVUsQ0FBbkIsS0FBSzs7QUFDWiwrQkFBVSxLQUFLLENBQUMsQ0FBQzs7aUJBQ1MsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSzs7VUFBbkQsUUFBUSxRQUFmLEtBQUs7O0FBQ1osVUFBSSxDQUFDLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqRSxVQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtBQUMxQixZQUFJLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7QUFDMUUsY0FBSSxFQUFFLFNBQVM7QUFDZixjQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQztPQUNKO0tBQ0Y7OztXQUVHLGdCQUFHOztBQUVMLFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ25DLFVBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO0FBQzFCLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNsQyxNQUFNLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQ2xDLFlBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNuQztBQUNELFVBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7QUFDbkMsVUFBSSxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQztLQUNyQzs7O1dBRVkseUJBQWdCO0FBQzNCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztLQUN6Qjs7O1dBRVkseUJBQTBCO0FBQ3JDLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztLQUN6Qjs7O1NBOUNrQixjQUFjOzs7cUJBQWQsY0FBYyIsImZpbGUiOiJTdWdnZXN0aW9uTGlzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIeXBlcmNsaWNrU3VnZ2VzdGlvbn0gZnJvbSAnLi4vLi4vaHlwZXJjbGljay1pbnRlcmZhY2VzJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdWdnZXN0aW9uTGlzdCB7XG4gIF90ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3I7XG4gIF9zdWdnZXN0aW9uOiBIeXBlcmNsaWNrU3VnZ2VzdGlvbjtcbiAgX3N1Z2dlc3Rpb25NYXJrZXI6ID9hdG9tJE1hcmtlcjtcbiAgX292ZXJsYXlEZWNvcmF0aW9uOiA/YXRvbSREZWNvcmF0aW9uO1xuXG4gIHNob3codGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBzdWdnZXN0aW9uOiBIeXBlcmNsaWNrU3VnZ2VzdGlvbik6IHZvaWQge1xuICAgIGlmICghdGV4dEVkaXRvciB8fCAhc3VnZ2VzdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3RleHRFZGl0b3IgPSB0ZXh0RWRpdG9yO1xuICAgIHRoaXMuX3N1Z2dlc3Rpb24gPSBzdWdnZXN0aW9uO1xuXG4gICAgdGhpcy5oaWRlKCk7XG5cbiAgICBjb25zdCB7cmFuZ2V9ID0gc3VnZ2VzdGlvbjtcbiAgICBpbnZhcmlhbnQocmFuZ2UpO1xuICAgIGNvbnN0IHtzdGFydDogcG9zaXRpb259ID0gQXJyYXkuaXNBcnJheShyYW5nZSkgPyByYW5nZVswXSA6IHJhbmdlO1xuICAgIHRoaXMuX3N1Z2dlc3Rpb25NYXJrZXIgPSB0ZXh0RWRpdG9yLm1hcmtCdWZmZXJQb3NpdGlvbihwb3NpdGlvbik7XG4gICAgaWYgKHRoaXMuX3N1Z2dlc3Rpb25NYXJrZXIpIHtcbiAgICAgIHRoaXMuX292ZXJsYXlEZWNvcmF0aW9uID0gdGV4dEVkaXRvci5kZWNvcmF0ZU1hcmtlcih0aGlzLl9zdWdnZXN0aW9uTWFya2VyLCB7XG4gICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgaXRlbTogdGhpcyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgLy8gJEZsb3dGaXhNZSBtZXRob2Qgb3ZlcnJpZGUgbm90IHdvcmtpbmcgd2l0aCBgdGhpc2AuXG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMpLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fc3VnZ2VzdGlvbk1hcmtlcikge1xuICAgICAgdGhpcy5fc3VnZ2VzdGlvbk1hcmtlci5kZXN0cm95KCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9vdmVybGF5RGVjb3JhdGlvbikge1xuICAgICAgdGhpcy5fb3ZlcmxheURlY29yYXRpb24uZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLl9zdWdnZXN0aW9uTWFya2VyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX292ZXJsYXlEZWNvcmF0aW9uID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0VGV4dEVkaXRvcigpOiA/VGV4dEVkaXRvciB7XG4gICAgcmV0dXJuIHRoaXMuX3RleHRFZGl0b3I7XG4gIH1cblxuICBnZXRTdWdnZXN0aW9uKCk6ID9IeXBlcmNsaWNrU3VnZ2VzdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N1Z2dlc3Rpb247XG4gIH1cbn1cbiJdfQ==