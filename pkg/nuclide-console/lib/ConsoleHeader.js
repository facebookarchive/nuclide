Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibToolbar = require('../../nuclide-ui/lib/Toolbar');

var _nuclideUiLibToolbarRight = require('../../nuclide-ui/lib/ToolbarRight');

var ConsoleHeader = (function (_React$Component) {
  _inherits(ConsoleHeader, _React$Component);

  function ConsoleHeader(props) {
    _classCallCheck(this, ConsoleHeader);

    _get(Object.getPrototypeOf(ConsoleHeader.prototype), 'constructor', this).call(this, props);
    this._handleClearButtonClick = this._handleClearButtonClick.bind(this);
  }

  _createClass(ConsoleHeader, [{
    key: '_handleClearButtonClick',
    value: function _handleClearButtonClick(event) {
      this.props.clear();
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        _nuclideUiLibToolbar.Toolbar,
        { location: 'top' },
        _reactForAtom.React.createElement(
          _nuclideUiLibToolbarRight.ToolbarRight,
          null,
          _reactForAtom.React.createElement(
            'button',
            { className: 'btn btn-sm icon btn-secondary', onClick: this._handleClearButtonClick },
            'Clear'
          )
        )
      );
    }
  }]);

  return ConsoleHeader;
})(_reactForAtom.React.Component);

exports['default'] = ConsoleHeader;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbnNvbGVIZWFkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBV29CLGdCQUFnQjs7bUNBQ2QsOEJBQThCOzt3Q0FDekIsbUNBQW1DOztJQU16QyxhQUFhO1lBQWIsYUFBYTs7QUFHckIsV0FIUSxhQUFhLENBR3BCLEtBQVksRUFBRTswQkFIUCxhQUFhOztBQUk5QiwrQkFKaUIsYUFBYSw2Q0FJeEIsS0FBSyxFQUFFO0FBQ2IsQUFBQyxRQUFJLENBQU8sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMvRTs7ZUFOa0IsYUFBYTs7V0FRVCxpQ0FBQyxLQUEwQixFQUFRO0FBQ3hELFVBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDcEI7OztXQUVLLGtCQUFrQjtBQUN0QixhQUNFOztVQUFTLFFBQVEsRUFBQyxLQUFLO1FBQ3JCOzs7VUFDRTs7Y0FBUSxTQUFTLEVBQUMsK0JBQStCLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQUFBQzs7V0FFL0U7U0FDSTtPQUNQLENBQ1Y7S0FDSDs7O1NBdEJrQixhQUFhO0dBQVMsb0JBQU0sU0FBUzs7cUJBQXJDLGFBQWEiLCJmaWxlIjoiQ29uc29sZUhlYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7VG9vbGJhcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvVG9vbGJhcic7XG5pbXBvcnQge1Rvb2xiYXJSaWdodH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvVG9vbGJhclJpZ2h0JztcblxudHlwZSBQcm9wcyA9IHtcbiAgY2xlYXI6ICgpID0+IHZvaWQ7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25zb2xlSGVhZGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQ2xlYXJCdXR0b25DbGljayA9IHRoaXMuX2hhbmRsZUNsZWFyQnV0dG9uQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIF9oYW5kbGVDbGVhckJ1dHRvbkNsaWNrKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5jbGVhcigpO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8VG9vbGJhciBsb2NhdGlvbj1cInRvcFwiPlxuICAgICAgICA8VG9vbGJhclJpZ2h0PlxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1zbSBpY29uIGJ0bi1zZWNvbmRhcnlcIiBvbkNsaWNrPXt0aGlzLl9oYW5kbGVDbGVhckJ1dHRvbkNsaWNrfT5cbiAgICAgICAgICAgIENsZWFyXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvVG9vbGJhclJpZ2h0PlxuICAgICAgPC9Ub29sYmFyPlxuICAgICk7XG4gIH1cblxufVxuIl19