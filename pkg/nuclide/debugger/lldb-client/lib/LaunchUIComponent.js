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

/* eslint-disable react/prop-types */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _uiAtomInput = require('../../../ui/atom-input');

var _uiAtomInput2 = _interopRequireDefault(_uiAtomInput);

var LaunchUIComponent = (function (_React$Component) {
  _inherits(LaunchUIComponent, _React$Component);

  function LaunchUIComponent(props) {
    _classCallCheck(this, LaunchUIComponent);

    _get(Object.getPrototypeOf(LaunchUIComponent.prototype), 'constructor', this).call(this, props);
    this._handleLaunchClick = this._handleLaunchClick.bind(this);
  }

  _createClass(LaunchUIComponent, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'block' },
        _reactForAtom.React.createElement(
          'label',
          null,
          'Executable: '
        ),
        _reactForAtom.React.createElement(_uiAtomInput2['default'], {
          ref: 'launchCommandLine',
          placeholderText: 'Input the executable path you want to launch'
        }),
        _reactForAtom.React.createElement(
          'button',
          { className: 'btn', onClick: this._handleLaunchClick },
          'Launch'
        )
      );
    }
  }, {
    key: '_handleLaunchClick',
    value: function _handleLaunchClick() {
      var launchExecutable = this.refs['launchCommandLine'].getText();
      // TODO: fill other fields from UI.
      var launchTarget = {
        executablePath: launchExecutable,
        arguments: [],
        environmentVariables: [],
        workingDirectory: '.'
      };
      // Fire and forget.
      this.props.actions.launchDebugger(launchTarget);
    }
  }]);

  return LaunchUIComponent;
})(_reactForAtom.React.Component);

exports.LaunchUIComponent = LaunchUIComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhdW5jaFVJQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFnQm9CLGdCQUFnQjs7MkJBQ2Qsd0JBQXdCOzs7O0lBT2pDLGlCQUFpQjtZQUFqQixpQkFBaUI7O0FBQ2pCLFdBREEsaUJBQWlCLENBQ2hCLEtBQWdCLEVBQUU7MEJBRG5CLGlCQUFpQjs7QUFFMUIsK0JBRlMsaUJBQWlCLDZDQUVwQixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3JFOztlQUpVLGlCQUFpQjs7V0FNdEIsa0JBQWlCO0FBQ3JCLGFBQ0U7O1VBQUssU0FBUyxFQUFDLE9BQU87UUFDcEI7Ozs7U0FBMkI7UUFDM0I7QUFDRSxhQUFHLEVBQUMsbUJBQW1CO0FBQ3ZCLHlCQUFlLEVBQUMsOENBQThDO1VBQzlEO1FBQ0Y7O1lBQVEsU0FBUyxFQUFDLEtBQUssRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixBQUFDOztTQUFnQjtPQUNyRSxDQUNOO0tBQ0g7OztXQUVpQiw4QkFBUztBQUN6QixVQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFbEUsVUFBTSxZQUFZLEdBQUc7QUFDbkIsc0JBQWMsRUFBRSxnQkFBZ0I7QUFDaEMsaUJBQVMsRUFBRSxFQUFFO0FBQ2IsNEJBQW9CLEVBQUUsRUFBRTtBQUN4Qix3QkFBZ0IsRUFBRSxHQUFHO09BQ3RCLENBQUM7O0FBRUYsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ2pEOzs7U0E5QlUsaUJBQWlCO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJMYXVuY2hVSUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cblxuaW1wb3J0IHR5cGUge0xhdW5jaEF0dGFjaFN0b3JlfSBmcm9tICcuL0xhdW5jaEF0dGFjaFN0b3JlJztcbmltcG9ydCB0eXBlIHtMYXVuY2hBdHRhY2hBY3Rpb25zfSBmcm9tICcuL0xhdW5jaEF0dGFjaEFjdGlvbnMnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgQXRvbUlucHV0IGZyb20gJy4uLy4uLy4uL3VpL2F0b20taW5wdXQnO1xuXG50eXBlIFByb3BzVHlwZSA9IHtcbiAgc3RvcmU6IExhdW5jaEF0dGFjaFN0b3JlO1xuICBhY3Rpb25zOiBMYXVuY2hBdHRhY2hBY3Rpb25zO1xufVxuXG5leHBvcnQgY2xhc3MgTGF1bmNoVUlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHNUeXBlLCB2b2lkPiB7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wc1R5cGUpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUxhdW5jaENsaWNrID0gdGhpcy5faGFuZGxlTGF1bmNoQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgIDxsYWJlbD5FeGVjdXRhYmxlOiA8L2xhYmVsPlxuICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgcmVmPVwibGF1bmNoQ29tbWFuZExpbmVcIlxuICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cIklucHV0IHRoZSBleGVjdXRhYmxlIHBhdGggeW91IHdhbnQgdG8gbGF1bmNoXCJcbiAgICAgICAgLz5cbiAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG5cIiBvbkNsaWNrPXt0aGlzLl9oYW5kbGVMYXVuY2hDbGlja30+TGF1bmNoPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUxhdW5jaENsaWNrKCk6IHZvaWQge1xuICAgIGNvbnN0IGxhdW5jaEV4ZWN1dGFibGUgPSB0aGlzLnJlZnNbJ2xhdW5jaENvbW1hbmRMaW5lJ10uZ2V0VGV4dCgpO1xuICAgIC8vIFRPRE86IGZpbGwgb3RoZXIgZmllbGRzIGZyb20gVUkuXG4gICAgY29uc3QgbGF1bmNoVGFyZ2V0ID0ge1xuICAgICAgZXhlY3V0YWJsZVBhdGg6IGxhdW5jaEV4ZWN1dGFibGUsXG4gICAgICBhcmd1bWVudHM6IFtdLFxuICAgICAgZW52aXJvbm1lbnRWYXJpYWJsZXM6IFtdLFxuICAgICAgd29ya2luZ0RpcmVjdG9yeTogJy4nLFxuICAgIH07XG4gICAgLy8gRmlyZSBhbmQgZm9yZ2V0LlxuICAgIHRoaXMucHJvcHMuYWN0aW9ucy5sYXVuY2hEZWJ1Z2dlcihsYXVuY2hUYXJnZXQpO1xuICB9XG59XG4iXX0=