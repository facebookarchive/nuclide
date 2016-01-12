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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var _ReactNativeServerActions = require('./ReactNativeServerActions');

var _ReactNativeServerActions2 = _interopRequireDefault(_ReactNativeServerActions);

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
    this._stopServer = this._handleStopClicked.bind(this);
    this._restartServer = this._handleRestartClicked.bind(this);
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
      var status = this.props.store.isServerRunning() ? _reactForAtom2['default'].createElement(
        'span',
        { className: 'inline-block highlight-success' },
        'Running'
      ) : _reactForAtom2['default'].createElement(
        'span',
        { className: 'inline-block highlight-error' },
        'Stopped'
      );
      return _reactForAtom2['default'].createElement(
        'div',
        { className: 'inset-panel padded' },
        _reactForAtom2['default'].createElement(
          'div',
          { className: 'inline-block' },
          _reactForAtom2['default'].createElement(
            'button',
            {
              className: 'btn icon icon-primitive-square inline-block-tight',
              onClick: this._stopServer
            },
            'Stop'
          ),
          _reactForAtom2['default'].createElement(
            'button',
            {
              className: 'btn icon icon-sync inline-block-tight',
              onClick: this._restartServer
            },
            'Restart'
          )
        ),
        _reactForAtom2['default'].createElement(
          'span',
          { className: 'inline-block' },
          'Status: ',
          status
        )
      );
    }
  }, {
    key: '_handleStopClicked',
    value: function _handleStopClicked() {
      this.props.actions.stopServer();
    }
  }, {
    key: '_handleRestartClicked',
    value: function _handleRestartClicked() {
      this.props.actions.restartServer(this.props.serverCommand);
    }
  }]);

  return ReactNativeServerPanel;
})(_reactForAtom2['default'].Component);

exports['default'] = ReactNativeServerPanel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyUGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFZa0IsZ0JBQWdCOzs7O3dDQUNHLDRCQUE0Qjs7Ozt1Q0FDN0IsMkJBQTJCOzs7O0lBUTFDLHNCQUFzQjtZQUF0QixzQkFBc0I7O0FBSTlCLFdBSlEsc0JBQXNCLENBSTdCLEtBQVksRUFBRTs7OzBCQUpQLHNCQUFzQjs7QUFLdkMsK0JBTGlCLHNCQUFzQiw2Q0FLakMsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQU07QUFDcEQsWUFBSyxXQUFXLEVBQUUsQ0FBQztLQUNwQixDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEQsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzdEOztlQVhrQixzQkFBc0I7O1dBYXJCLGdDQUFHO0FBQ3JCLFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNuQzs7O1dBRUssa0JBQWlCOztBQUVyQixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsR0FDN0M7O1VBQU0sU0FBUyxFQUFDLGdDQUFnQzs7T0FBZSxHQUMvRDs7VUFBTSxTQUFTLEVBQUMsOEJBQThCOztPQUFlLENBQUM7QUFDbEUsYUFDRTs7VUFBSyxTQUFTLEVBQUMsb0JBQW9CO1FBQ2pDOztZQUFLLFNBQVMsRUFBQyxjQUFjO1VBQzNCOzs7QUFDRSx1QkFBUyxFQUFDLG1EQUFtRDtBQUM3RCxxQkFBTyxFQUFFLElBQUksQ0FBQyxXQUFXLEFBQUM7OztXQUduQjtVQUNUOzs7QUFDRSx1QkFBUyxFQUFDLHVDQUF1QztBQUNqRCxxQkFBTyxFQUFFLElBQUksQ0FBQyxjQUFjLEFBQUM7OztXQUd0QjtTQUNMO1FBQ047O1lBQU0sU0FBUyxFQUFDLGNBQWM7O1VBQVUsTUFBTTtTQUFRO09BQ2xELENBQ047S0FDSDs7O1dBRWlCLDhCQUFHO0FBQ25CLFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ2pDOzs7V0FFb0IsaUNBQUc7QUFDdEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDNUQ7OztTQWpEa0Isc0JBQXNCO0dBQVMsMEJBQU0sU0FBUzs7cUJBQTlDLHNCQUFzQiIsImZpbGUiOiJSZWFjdE5hdGl2ZVNlcnZlclBhbmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0Rpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMgZnJvbSAnLi9SZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMnO1xuaW1wb3J0IFJlYWN0TmF0aXZlU2VydmVyU3RhdHVzIGZyb20gJy4vUmVhY3ROYXRpdmVTZXJ2ZXJTdGF0dXMnO1xuXG50eXBlIFByb3BzID0ge1xuICBhY3Rpb25zOiBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnM7XG4gIHN0b3JlOiBSZWFjdE5hdGl2ZVNlcnZlclN0YXR1cztcbiAgc2VydmVyQ29tbWFuZDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhY3ROYXRpdmVTZXJ2ZXJQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgX3N0b3JlU3Vic2NyaXB0aW9uOiBEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9zdG9yZVN1YnNjcmlwdGlvbiA9IHByb3BzLnN0b3JlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc3RvcFNlcnZlciA9IHRoaXMuX2hhbmRsZVN0b3BDbGlja2VkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fcmVzdGFydFNlcnZlciA9IHRoaXMuX2hhbmRsZVJlc3RhcnRDbGlja2VkLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9zdG9yZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICAvLyBUT0RPKG5hdHRodSk6IEFkZCBhbm90aGVyIGJ1dHRvbiB0byBhbGxvdyBkZWJ1Z2dpbmcgUk4gSmF2YXNjcmlwdC5cbiAgICBjb25zdCBzdGF0dXMgPSB0aGlzLnByb3BzLnN0b3JlLmlzU2VydmVyUnVubmluZygpXG4gICAgICA/IDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayBoaWdobGlnaHQtc3VjY2Vzc1wiPlJ1bm5pbmc8L3NwYW4+XG4gICAgICA6IDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1ibG9jayBoaWdobGlnaHQtZXJyb3JcIj5TdG9wcGVkPC9zcGFuPjtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbnNldC1wYW5lbCBwYWRkZWRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gaWNvbiBpY29uLXByaW1pdGl2ZS1zcXVhcmUgaW5saW5lLWJsb2NrLXRpZ2h0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX3N0b3BTZXJ2ZXJ9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgU3RvcFxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBpY29uIGljb24tc3luYyBpbmxpbmUtYmxvY2stdGlnaHRcIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5fcmVzdGFydFNlcnZlcn1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBSZXN0YXJ0XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5TdGF0dXM6IHtzdGF0dXN9PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVTdG9wQ2xpY2tlZCgpIHtcbiAgICB0aGlzLnByb3BzLmFjdGlvbnMuc3RvcFNlcnZlcigpO1xuICB9XG5cbiAgX2hhbmRsZVJlc3RhcnRDbGlja2VkKCkge1xuICAgIHRoaXMucHJvcHMuYWN0aW9ucy5yZXN0YXJ0U2VydmVyKHRoaXMucHJvcHMuc2VydmVyQ29tbWFuZCk7XG4gIH1cbn1cbiJdfQ==