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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibAtomInput = require('../../nuclide-ui/lib/AtomInput');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

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
      // TODO: smart fill the working directory textbox.
      // TODO: make tab stop between textbox work.
      // Reserve tabIndex [1~10] to header portion of the UI so we start from "11" here.
      return _reactForAtom.React.createElement(
        'div',
        { className: 'block' },
        _reactForAtom.React.createElement(
          'label',
          null,
          'Executable: '
        ),
        _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
          ref: 'launchExecutable',
          tabIndex: '11',
          placeholderText: 'Input the executable path you want to launch'
        }),
        _reactForAtom.React.createElement(
          'label',
          null,
          'Arguments: '
        ),
        _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
          ref: 'launchArguments',
          tabIndex: '12',
          placeholderText: 'Arguments to the executable'
        }),
        _reactForAtom.React.createElement(
          'label',
          null,
          'Working directory: '
        ),
        _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
          ref: 'launchWorkingDirectory',
          tabIndex: '13',
          placeholderText: 'Working directory for the launched executable'
        }),
        _reactForAtom.React.createElement(
          _nuclideUiLibButton.Button,
          { tabIndex: '14', onClick: this._handleLaunchClick },
          'Launch'
        )
      );
    }
  }, {
    key: '_handleLaunchClick',
    value: function _handleLaunchClick() {
      // TODO: perform some validation for the input.
      var launchExecutable = this.refs['launchExecutable'].getText().trim();
      var launchArguments = this.refs['launchArguments'].getText().trim();
      var launchWorkingDirectory = this.refs['launchWorkingDirectory'].getText().trim();
      // TODO: fill other fields from UI.
      var launchTarget = {
        executablePath: launchExecutable,
        arguments: launchArguments,
        environmentVariables: [],
        workingDirectory: launchWorkingDirectory
      };
      // Fire and forget.
      this.props.actions.launchDebugger(launchTarget);
      this.props.actions.showDebuggerPanel();
      this.props.actions.toggleLaunchAttachDialog();
    }
  }]);

  return LaunchUIComponent;
})(_reactForAtom.React.Component);

exports.LaunchUIComponent = LaunchUIComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhdW5jaFVJQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWNvQixnQkFBZ0I7O3FDQUNaLGdDQUFnQzs7a0NBQ25DLDZCQUE2Qjs7SUFPckMsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsS0FBZ0IsRUFBRTswQkFIbkIsaUJBQWlCOztBQUkxQiwrQkFKUyxpQkFBaUIsNkNBSXBCLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDckU7O2VBTlUsaUJBQWlCOztXQVF0QixrQkFBa0I7Ozs7QUFJdEIsYUFDRTs7VUFBSyxTQUFTLEVBQUMsT0FBTztRQUNwQjs7OztTQUEyQjtRQUMzQjtBQUNFLGFBQUcsRUFBQyxrQkFBa0I7QUFDdEIsa0JBQVEsRUFBQyxJQUFJO0FBQ2IseUJBQWUsRUFBQyw4Q0FBOEM7VUFDOUQ7UUFDRjs7OztTQUEwQjtRQUMxQjtBQUNFLGFBQUcsRUFBQyxpQkFBaUI7QUFDckIsa0JBQVEsRUFBQyxJQUFJO0FBQ2IseUJBQWUsRUFBQyw2QkFBNkI7VUFDN0M7UUFDRjs7OztTQUFrQztRQUNsQztBQUNFLGFBQUcsRUFBQyx3QkFBd0I7QUFDNUIsa0JBQVEsRUFBQyxJQUFJO0FBQ2IseUJBQWUsRUFBQywrQ0FBK0M7VUFDL0Q7UUFDRjs7WUFBUSxRQUFRLEVBQUMsSUFBSSxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEFBQUM7O1NBQWdCO09BQ25FLENBQ047S0FDSDs7O1dBRWlCLDhCQUFTOztBQUV6QixVQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN4RSxVQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdEUsVUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRXBGLFVBQU0sWUFBWSxHQUFHO0FBQ25CLHNCQUFjLEVBQUUsZ0JBQWdCO0FBQ2hDLGlCQUFTLEVBQUUsZUFBZTtBQUMxQiw0QkFBb0IsRUFBRSxFQUFFO0FBQ3hCLHdCQUFnQixFQUFFLHNCQUFzQjtPQUN6QyxDQUFDOztBQUVGLFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNoRCxVQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQ3ZDLFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLENBQUM7S0FDL0M7OztTQXJEVSxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkxhdW5jaFVJQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0xhdW5jaEF0dGFjaFN0b3JlfSBmcm9tICcuL0xhdW5jaEF0dGFjaFN0b3JlJztcbmltcG9ydCB0eXBlIHtMYXVuY2hBdHRhY2hBY3Rpb25zfSBmcm9tICcuL0xhdW5jaEF0dGFjaEFjdGlvbnMnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0F0b21JbnB1dH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQXRvbUlucHV0JztcbmltcG9ydCB7QnV0dG9ufSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b24nO1xuXG50eXBlIFByb3BzVHlwZSA9IHtcbiAgc3RvcmU6IExhdW5jaEF0dGFjaFN0b3JlO1xuICBhY3Rpb25zOiBMYXVuY2hBdHRhY2hBY3Rpb25zO1xufTtcblxuZXhwb3J0IGNsYXNzIExhdW5jaFVJQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzVHlwZSwgdm9pZD4ge1xuICBwcm9wczogUHJvcHNUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wc1R5cGUpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUxhdW5jaENsaWNrID0gdGhpcy5faGFuZGxlTGF1bmNoQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICAvLyBUT0RPOiBzbWFydCBmaWxsIHRoZSB3b3JraW5nIGRpcmVjdG9yeSB0ZXh0Ym94LlxuICAgIC8vIFRPRE86IG1ha2UgdGFiIHN0b3AgYmV0d2VlbiB0ZXh0Ym94IHdvcmsuXG4gICAgLy8gUmVzZXJ2ZSB0YWJJbmRleCBbMX4xMF0gdG8gaGVhZGVyIHBvcnRpb24gb2YgdGhlIFVJIHNvIHdlIHN0YXJ0IGZyb20gXCIxMVwiIGhlcmUuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2tcIj5cbiAgICAgICAgPGxhYmVsPkV4ZWN1dGFibGU6IDwvbGFiZWw+XG4gICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICByZWY9XCJsYXVuY2hFeGVjdXRhYmxlXCJcbiAgICAgICAgICB0YWJJbmRleD1cIjExXCJcbiAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJJbnB1dCB0aGUgZXhlY3V0YWJsZSBwYXRoIHlvdSB3YW50IHRvIGxhdW5jaFwiXG4gICAgICAgIC8+XG4gICAgICAgIDxsYWJlbD5Bcmd1bWVudHM6IDwvbGFiZWw+XG4gICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICByZWY9XCJsYXVuY2hBcmd1bWVudHNcIlxuICAgICAgICAgIHRhYkluZGV4PVwiMTJcIlxuICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cIkFyZ3VtZW50cyB0byB0aGUgZXhlY3V0YWJsZVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxsYWJlbD5Xb3JraW5nIGRpcmVjdG9yeTogPC9sYWJlbD5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIHJlZj1cImxhdW5jaFdvcmtpbmdEaXJlY3RvcnlcIlxuICAgICAgICAgIHRhYkluZGV4PVwiMTNcIlxuICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cIldvcmtpbmcgZGlyZWN0b3J5IGZvciB0aGUgbGF1bmNoZWQgZXhlY3V0YWJsZVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxCdXR0b24gdGFiSW5kZXg9XCIxNFwiIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUxhdW5jaENsaWNrfT5MYXVuY2g8L0J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlTGF1bmNoQ2xpY2soKTogdm9pZCB7XG4gICAgLy8gVE9ETzogcGVyZm9ybSBzb21lIHZhbGlkYXRpb24gZm9yIHRoZSBpbnB1dC5cbiAgICBjb25zdCBsYXVuY2hFeGVjdXRhYmxlID0gdGhpcy5yZWZzWydsYXVuY2hFeGVjdXRhYmxlJ10uZ2V0VGV4dCgpLnRyaW0oKTtcbiAgICBjb25zdCBsYXVuY2hBcmd1bWVudHMgPSB0aGlzLnJlZnNbJ2xhdW5jaEFyZ3VtZW50cyddLmdldFRleHQoKS50cmltKCk7XG4gICAgY29uc3QgbGF1bmNoV29ya2luZ0RpcmVjdG9yeSA9IHRoaXMucmVmc1snbGF1bmNoV29ya2luZ0RpcmVjdG9yeSddLmdldFRleHQoKS50cmltKCk7XG4gICAgLy8gVE9ETzogZmlsbCBvdGhlciBmaWVsZHMgZnJvbSBVSS5cbiAgICBjb25zdCBsYXVuY2hUYXJnZXQgPSB7XG4gICAgICBleGVjdXRhYmxlUGF0aDogbGF1bmNoRXhlY3V0YWJsZSxcbiAgICAgIGFyZ3VtZW50czogbGF1bmNoQXJndW1lbnRzLFxuICAgICAgZW52aXJvbm1lbnRWYXJpYWJsZXM6IFtdLFxuICAgICAgd29ya2luZ0RpcmVjdG9yeTogbGF1bmNoV29ya2luZ0RpcmVjdG9yeSxcbiAgICB9O1xuICAgIC8vIEZpcmUgYW5kIGZvcmdldC5cbiAgICB0aGlzLnByb3BzLmFjdGlvbnMubGF1bmNoRGVidWdnZXIobGF1bmNoVGFyZ2V0KTtcbiAgICB0aGlzLnByb3BzLmFjdGlvbnMuc2hvd0RlYnVnZ2VyUGFuZWwoKTtcbiAgICB0aGlzLnByb3BzLmFjdGlvbnMudG9nZ2xlTGF1bmNoQXR0YWNoRGlhbG9nKCk7XG4gIH1cbn1cbiJdfQ==