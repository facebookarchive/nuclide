Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable react/prop-types */

var _reactForAtom = require('react-for-atom');

var _ReactNativeServerStatus = require('./ReactNativeServerStatus');

var _ReactNativeServerStatus2 = _interopRequireDefault(_ReactNativeServerStatus);

var ReactNativeServerPanel = (function (_React$Component) {
  _inherits(ReactNativeServerPanel, _React$Component);

  function ReactNativeServerPanel(props) {
    var _this = this;

    _classCallCheck(this, ReactNativeServerPanel);

    _get(Object.getPrototypeOf(ReactNativeServerPanel.prototype), 'constructor', this).call(this, props);
    this._storeSubscription = props.store.subscribe(function () {
      _this.forceUpdate();
    });
  }

  _createClass(ReactNativeServerPanel, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._storeSubscription.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      // TODO(natthu): Add another button to allow debugging RN Javascript.
      var status = this.props.store.isServerRunning() ? _reactForAtom.React.createElement(
        'span',
        { className: 'inline-block highlight-success' },
        'Running'
      ) : _reactForAtom.React.createElement(
        'span',
        { className: 'inline-block highlight-error' },
        'Stopped'
      );
      return _reactForAtom.React.createElement(
        'div',
        { className: 'inset-panel padded' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'inline-block' },
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'btn icon icon-primitive-square inline-block-tight',
              onClick: this.props.stopServer },
            'Stop'
          ),
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'btn icon icon-sync inline-block-tight',
              onClick: this.props.restartServer },
            'Restart'
          )
        ),
        _reactForAtom.React.createElement(
          'span',
          { className: 'inline-block' },
          'Status: ',
          status
        )
      );
    }
  }]);

  return ReactNativeServerPanel;
})(_reactForAtom.React.Component);

exports['default'] = ReactNativeServerPanel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyUGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWFvQixnQkFBZ0I7O3VDQUNBLDJCQUEyQjs7OztJQVExQyxzQkFBc0I7WUFBdEIsc0JBQXNCOztBQUk5QixXQUpRLHNCQUFzQixDQUk3QixLQUFZLEVBQUU7OzswQkFKUCxzQkFBc0I7O0FBS3ZDLCtCQUxpQixzQkFBc0IsNkNBS2pDLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFNO0FBQ3BELFlBQUssV0FBVyxFQUFFLENBQUM7S0FDcEIsQ0FBQyxDQUFDO0dBQ0o7O2VBVGtCLHNCQUFzQjs7V0FXckIsZ0NBQUc7QUFDckIsVUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ25DOzs7V0FFSyxrQkFBaUI7O0FBRXJCLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxHQUM3Qzs7VUFBTSxTQUFTLEVBQUMsZ0NBQWdDOztPQUFlLEdBQy9EOztVQUFNLFNBQVMsRUFBQyw4QkFBOEI7O09BQWUsQ0FBQztBQUNsRSxhQUNFOztVQUFLLFNBQVMsRUFBQyxvQkFBb0I7UUFDakM7O1lBQUssU0FBUyxFQUFDLGNBQWM7VUFDM0I7OztBQUNFLHVCQUFTLEVBQUMsbURBQW1EO0FBQzdELHFCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEFBQUM7O1dBRXhCO1VBQ1Q7OztBQUNFLHVCQUFTLEVBQUMsdUNBQXVDO0FBQ2pELHFCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEFBQUM7O1dBRTNCO1NBQ0w7UUFDTjs7WUFBTSxTQUFTLEVBQUMsY0FBYzs7VUFBVSxNQUFNO1NBQVE7T0FDbEQsQ0FDTjtLQUNIOzs7U0FyQ2tCLHNCQUFzQjtHQUFTLG9CQUFNLFNBQVM7O3FCQUE5QyxzQkFBc0IiLCJmaWxlIjoiUmVhY3ROYXRpdmVTZXJ2ZXJQYW5lbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUmVhY3ROYXRpdmVTZXJ2ZXJTdGF0dXMgZnJvbSAnLi9SZWFjdE5hdGl2ZVNlcnZlclN0YXR1cyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIHN0b3JlOiBSZWFjdE5hdGl2ZVNlcnZlclN0YXR1cztcbiAgcmVzdGFydFNlcnZlcjogKCkgPT4gdm9pZDtcbiAgc3RvcFNlcnZlcjogKCkgPT4gdm9pZDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlYWN0TmF0aXZlU2VydmVyUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcblxuICBfc3RvcmVTdWJzY3JpcHRpb246IElEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9zdG9yZVN1YnNjcmlwdGlvbiA9IHByb3BzLnN0b3JlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9zdG9yZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBUT0RPKG5hdHRodSk6IEFkZCBhbm90aGVyIGJ1dHRvbiB0byBhbGxvdyBkZWJ1Z2dpbmcgUk4gSmF2YXNjcmlwdC5cbiAgICBjb25zdCBzdGF0dXMgPSB0aGlzLnByb3BzLnN0b3JlLmlzU2VydmVyUnVubmluZygpXG4gICAgICA/IDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayBoaWdobGlnaHQtc3VjY2Vzc1wiPlJ1bm5pbmc8L3NwYW4+XG4gICAgICA6IDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayBoaWdobGlnaHQtZXJyb3JcIj5TdG9wcGVkPC9zcGFuPjtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbnNldC1wYW5lbCBwYWRkZWRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gaWNvbiBpY29uLXByaW1pdGl2ZS1zcXVhcmUgaW5saW5lLWJsb2NrLXRpZ2h0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMuc3RvcFNlcnZlcn0+XG4gICAgICAgICAgICBTdG9wXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGljb24gaWNvbi1zeW5jIGlubGluZS1ibG9jay10aWdodFwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLnJlc3RhcnRTZXJ2ZXJ9PlxuICAgICAgICAgICAgUmVzdGFydFxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+U3RhdHVzOiB7c3RhdHVzfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuIl19