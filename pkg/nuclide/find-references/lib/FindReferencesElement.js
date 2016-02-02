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

var _require = require('react-for-atom');

var React = _require.React;
var ReactDOM = _require.ReactDOM;

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
      ReactDOM.render(React.createElement(FindReferencesView, { model: this._model }), this);
    }
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {
      ReactDOM.unmountComponentAtNode(this);
    }
  }]);

  return FindReferencesElement;
})(HTMLElement);

module.exports = FindReferencesElement = document.registerElement('nuclide-find-references-view', {
  prototype: FindReferencesElement.prototype
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbmRSZWZlcmVuY2VzRWxlbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2VBZ0JJLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFGM0IsS0FBSyxZQUFMLEtBQUs7SUFDTCxRQUFRLFlBQVIsUUFBUTs7QUFFVixJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDOztJQUUxRCxxQkFBcUI7WUFBckIscUJBQXFCOztXQUFyQixxQkFBcUI7MEJBQXJCLHFCQUFxQjs7K0JBQXJCLHFCQUFxQjs7O2VBQXJCLHFCQUFxQjs7V0FHZixvQkFBQyxLQUEwQixFQUFFO0FBQ3JDLFVBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVPLG9CQUFHO0FBQ1QsYUFBTyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQzVEOzs7V0FFZSw0QkFBRztBQUNqQixjQUFRLENBQUMsTUFBTSxDQUNiLG9CQUFDLGtCQUFrQixJQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxBQUFDLEdBQUcsRUFDMUMsSUFBSSxDQUNMLENBQUM7S0FDSDs7O1dBRWUsNEJBQUc7QUFDakIsY0FBUSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3ZDOzs7U0FyQkcscUJBQXFCO0dBQVMsV0FBVzs7QUF3Qi9DLE1BQU0sQ0FBQyxPQUFPLEdBQUcscUJBQXFCLEdBQUcsQUFBQyxRQUFRLENBQU8sZUFBZSxDQUFDLDhCQUE4QixFQUFFO0FBQ3ZHLFdBQVMsRUFBRSxxQkFBcUIsQ0FBQyxTQUFTO0NBQzNDLENBQUMsQ0FBQyIsImZpbGUiOiJGaW5kUmVmZXJlbmNlc0VsZW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBGaW5kUmVmZXJlbmNlc01vZGVsIGZyb20gJy4vRmluZFJlZmVyZW5jZXNNb2RlbCc7XG5cbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBGaW5kUmVmZXJlbmNlc1ZpZXcgPSByZXF1aXJlKCcuL3ZpZXcvRmluZFJlZmVyZW5jZXNWaWV3Jyk7XG5cbmNsYXNzIEZpbmRSZWZlcmVuY2VzRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgX21vZGVsOiBGaW5kUmVmZXJlbmNlc01vZGVsO1xuXG4gIGluaXRpYWxpemUobW9kZWw6IEZpbmRSZWZlcmVuY2VzTW9kZWwpIHtcbiAgICB0aGlzLl9tb2RlbCA9IG1vZGVsO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuICdTeW1ib2wgUmVmZXJlbmNlczogJyArIHRoaXMuX21vZGVsLmdldFN5bWJvbE5hbWUoKTtcbiAgfVxuXG4gIGF0dGFjaGVkQ2FsbGJhY2soKSB7XG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgPEZpbmRSZWZlcmVuY2VzVmlldyBtb2RlbD17dGhpcy5fbW9kZWx9IC8+LFxuICAgICAgdGhpc1xuICAgICk7XG4gIH1cblxuICBkZXRhY2hlZENhbGxiYWNrKCkge1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaW5kUmVmZXJlbmNlc0VsZW1lbnQgPSAoZG9jdW1lbnQ6IGFueSkucmVnaXN0ZXJFbGVtZW50KCdudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy12aWV3Jywge1xuICBwcm90b3R5cGU6IEZpbmRSZWZlcmVuY2VzRWxlbWVudC5wcm90b3R5cGUsXG59KTtcbiJdfQ==