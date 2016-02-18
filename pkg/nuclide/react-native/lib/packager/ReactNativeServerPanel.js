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
              onClick: this.props.stopServer
            },
            'Stop'
          ),
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'btn icon icon-sync inline-block-tight',
              onClick: this.props.restartServer
            },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyUGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWFvQixnQkFBZ0I7O3VDQUNBLDJCQUEyQjs7OztJQVExQyxzQkFBc0I7WUFBdEIsc0JBQXNCOztBQUk5QixXQUpRLHNCQUFzQixDQUk3QixLQUFZLEVBQUU7OzswQkFKUCxzQkFBc0I7O0FBS3ZDLCtCQUxpQixzQkFBc0IsNkNBS2pDLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFNO0FBQ3BELFlBQUssV0FBVyxFQUFFLENBQUM7S0FDcEIsQ0FBQyxDQUFDO0dBQ0o7O2VBVGtCLHNCQUFzQjs7V0FXckIsZ0NBQUc7QUFDckIsVUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ25DOzs7V0FFSyxrQkFBaUI7O0FBRXJCLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxHQUM3Qzs7VUFBTSxTQUFTLEVBQUMsZ0NBQWdDOztPQUFlLEdBQy9EOztVQUFNLFNBQVMsRUFBQyw4QkFBOEI7O09BQWUsQ0FBQztBQUNsRSxhQUNFOztVQUFLLFNBQVMsRUFBQyxvQkFBb0I7UUFDakM7O1lBQUssU0FBUyxFQUFDLGNBQWM7VUFDM0I7OztBQUNFLHVCQUFTLEVBQUMsbURBQW1EO0FBQzdELHFCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEFBQUM7OztXQUd4QjtVQUNUOzs7QUFDRSx1QkFBUyxFQUFDLHVDQUF1QztBQUNqRCxxQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxBQUFDOzs7V0FHM0I7U0FDTDtRQUNOOztZQUFNLFNBQVMsRUFBQyxjQUFjOztVQUFVLE1BQU07U0FBUTtPQUNsRCxDQUNOO0tBQ0g7OztTQXZDa0Isc0JBQXNCO0dBQVMsb0JBQU0sU0FBUzs7cUJBQTlDLHNCQUFzQiIsImZpbGUiOiJSZWFjdE5hdGl2ZVNlcnZlclBhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyplc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBSZWFjdE5hdGl2ZVNlcnZlclN0YXR1cyBmcm9tICcuL1JlYWN0TmF0aXZlU2VydmVyU3RhdHVzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgc3RvcmU6IFJlYWN0TmF0aXZlU2VydmVyU3RhdHVzO1xuICByZXN0YXJ0U2VydmVyOiAoKSA9PiB2b2lkO1xuICBzdG9wU2VydmVyOiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhY3ROYXRpdmVTZXJ2ZXJQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wcywgdm9pZD4ge1xuXG4gIF9zdG9yZVN1YnNjcmlwdGlvbjogSURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX3N0b3JlU3Vic2NyaXB0aW9uID0gcHJvcHMuc3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX3N0b3JlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIFRPRE8obmF0dGh1KTogQWRkIGFub3RoZXIgYnV0dG9uIHRvIGFsbG93IGRlYnVnZ2luZyBSTiBKYXZhc2NyaXB0LlxuICAgIGNvbnN0IHN0YXR1cyA9IHRoaXMucHJvcHMuc3RvcmUuaXNTZXJ2ZXJSdW5uaW5nKClcbiAgICAgID8gPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGhpZ2hsaWdodC1zdWNjZXNzXCI+UnVubmluZzwvc3Bhbj5cbiAgICAgIDogPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGhpZ2hsaWdodC1lcnJvclwiPlN0b3BwZWQ8L3NwYW4+O1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImluc2V0LXBhbmVsIHBhZGRlZFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBpY29uIGljb24tcHJpbWl0aXZlLXNxdWFyZSBpbmxpbmUtYmxvY2stdGlnaHRcIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5zdG9wU2VydmVyfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFN0b3BcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gaWNvbiBpY29uLXN5bmMgaW5saW5lLWJsb2NrLXRpZ2h0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMucmVzdGFydFNlcnZlcn1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBSZXN0YXJ0XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5TdGF0dXM6IHtzdGF0dXN9PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59XG4iXX0=