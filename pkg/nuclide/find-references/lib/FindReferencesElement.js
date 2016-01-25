var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react-for-atom');
var FindReferencesView = require('./view/FindReferencesView');

var FindReferencesElement = (function (_HTMLElement) {
  _inherits(FindReferencesElement, _HTMLElement);

  function FindReferencesElement() {
    _classCallCheck(this, FindReferencesElement);

    _get(Object.getPrototypeOf(FindReferencesElement.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(FindReferencesElement, [{
    key: 'initialize',
    value: function initialize(model) {
      this._model = model;
      return this;
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return 'Symbol References: ' + this._model.getSymbolName();
    }
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      React.render(React.createElement(FindReferencesView, { model: this._model }), this);
    }
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {
      React.unmountComponentAtNode(this);
    }
  }]);

  return FindReferencesElement;
})(HTMLElement);

module.exports = FindReferencesElement = document.registerElement('nuclide-find-references-view', {
  prototype: FindReferencesElement.prototype
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbmRSZWZlcmVuY2VzRWxlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBYUEsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDeEMsSUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQzs7SUFFMUQscUJBQXFCO1lBQXJCLHFCQUFxQjs7V0FBckIscUJBQXFCOzBCQUFyQixxQkFBcUI7OytCQUFyQixxQkFBcUI7OztlQUFyQixxQkFBcUI7O1dBR2Ysb0JBQUMsS0FBMEIsRUFBRTtBQUNyQyxVQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFTyxvQkFBRztBQUNULGFBQU8scUJBQXFCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUM1RDs7O1dBRWUsNEJBQUc7QUFDakIsV0FBSyxDQUFDLE1BQU0sQ0FDVixvQkFBQyxrQkFBa0IsSUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQUFBQyxHQUFHLEVBQzFDLElBQUksQ0FDTCxDQUFDO0tBQ0g7OztXQUVlLDRCQUFHO0FBQ2pCLFdBQUssQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNwQzs7O1NBckJHLHFCQUFxQjtHQUFTLFdBQVc7O0FBd0IvQyxNQUFNLENBQUMsT0FBTyxHQUFHLHFCQUFxQixHQUFHLEFBQUMsUUFBUSxDQUFPLGVBQWUsQ0FBQyw4QkFBOEIsRUFBRTtBQUN2RyxXQUFTLEVBQUUscUJBQXFCLENBQUMsU0FBUztDQUMzQyxDQUFDLENBQUMiLCJmaWxlIjoiRmluZFJlZmVyZW5jZXNFbGVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRmluZFJlZmVyZW5jZXNNb2RlbCBmcm9tICcuL0ZpbmRSZWZlcmVuY2VzTW9kZWwnO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBGaW5kUmVmZXJlbmNlc1ZpZXcgPSByZXF1aXJlKCcuL3ZpZXcvRmluZFJlZmVyZW5jZXNWaWV3Jyk7XG5cbmNsYXNzIEZpbmRSZWZlcmVuY2VzRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgX21vZGVsOiBGaW5kUmVmZXJlbmNlc01vZGVsO1xuXG4gIGluaXRpYWxpemUobW9kZWw6IEZpbmRSZWZlcmVuY2VzTW9kZWwpIHtcbiAgICB0aGlzLl9tb2RlbCA9IG1vZGVsO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuICdTeW1ib2wgUmVmZXJlbmNlczogJyArIHRoaXMuX21vZGVsLmdldFN5bWJvbE5hbWUoKTtcbiAgfVxuXG4gIGF0dGFjaGVkQ2FsbGJhY2soKSB7XG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgPEZpbmRSZWZlcmVuY2VzVmlldyBtb2RlbD17dGhpcy5fbW9kZWx9IC8+LFxuICAgICAgdGhpc1xuICAgICk7XG4gIH1cblxuICBkZXRhY2hlZENhbGxiYWNrKCkge1xuICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaW5kUmVmZXJlbmNlc0VsZW1lbnQgPSAoZG9jdW1lbnQ6IGFueSkucmVnaXN0ZXJFbGVtZW50KCdudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy12aWV3Jywge1xuICBwcm90b3R5cGU6IEZpbmRSZWZlcmVuY2VzRWxlbWVudC5wcm90b3R5cGUsXG59KTtcbiJdfQ==