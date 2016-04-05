var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var callDebugService = _asyncToGenerator(function* (processInfo) {
  // Use commands here to trigger package activation.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  var debuggerService = yield require('../../nuclide-service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
  debuggerService.startDebugging(processInfo);
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../nuclide-ui/lib/AtomInput');

var AtomInput = _require.AtomInput;

var _require2 = require('../../nuclide-ui/lib/Dropdown');

var Dropdown = _require2.Dropdown;

var _require3 = require('react-for-atom');

var React = _require3.React;
var PropTypes = React.PropTypes;

var WEB_SERVER_OPTION = { label: 'WebServer', value: 0 };
var SCRIPT_OPTION = { label: 'Script', value: 1 };
var DEFAULT_OPTION_INDEX = WEB_SERVER_OPTION.value;

var DEBUG_OPTIONS = [WEB_SERVER_OPTION, SCRIPT_OPTION];

var NO_LAUNCH_DEBUG_OPTIONS = [WEB_SERVER_OPTION];

var HhvmToolbar = (function (_React$Component) {
  _inherits(HhvmToolbar, _React$Component);

  _createClass(HhvmToolbar, null, [{
    key: 'propTypes',
    value: {
      targetFilePath: PropTypes.string.isRequired
    },
    enumerable: true
  }]);

  function HhvmToolbar(props) {
    _classCallCheck(this, HhvmToolbar);

    _get(Object.getPrototypeOf(HhvmToolbar.prototype), 'constructor', this).call(this, props);
    this.state = {
      selectedIndex: DEFAULT_OPTION_INDEX
    };
    this._debug = this._debug.bind(this);
    this._handleDropdownChange = this._handleDropdownChange.bind(this);
  }

  _createClass(HhvmToolbar, [{
    key: '_getMenuItems',
    value: function _getMenuItems() {
      return this._isTargetLaunchable(this.props.targetFilePath) ? DEBUG_OPTIONS : NO_LAUNCH_DEBUG_OPTIONS;
    }
  }, {
    key: '_isTargetLaunchable',
    value: function _isTargetLaunchable(targetFilePath) {
      return targetFilePath.endsWith('.php') || targetFilePath.endsWith('.hh');
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var selectedIndex = this.state.selectedIndex;
      // Reset selected item to DEFAULT_OPTION_INDEX if target is not launchable anymore.
      // TODO[jeffreytan]: this is ugly, refactor to make it more elegant.
      if (!this._isTargetLaunchable(nextProps.targetFilePath)) {
        selectedIndex = DEFAULT_OPTION_INDEX;
        this.setState({ selectedIndex: selectedIndex });
      }
      this.refs.debugTarget.setText(this._getDebugTarget(selectedIndex, nextProps.targetFilePath));
    }
  }, {
    key: 'render',
    value: function render() {
      var debugTarget = this._getDebugTarget(this.state.selectedIndex, this.props.targetFilePath);
      var isDebugScript = this._isDebugScript(this.state.selectedIndex);
      return React.createElement(
        'div',
        { className: 'buck-toolbar hhvm-toolbar block padded' },
        React.createElement(Dropdown, {
          className: 'inline-block',
          menuItems: this._getMenuItems(),
          selectedIndex: this.state.selectedIndex,
          onSelectedChange: this._handleDropdownChange,
          ref: 'dropdown',
          size: 'sm'
        }),
        React.createElement(
          'div',
          { className: 'inline-block', style: { width: '500px' } },
          React.createElement(AtomInput, {
            ref: 'debugTarget',
            initialValue: debugTarget,
            disabled: !isDebugScript,
            size: 'sm'
          })
        ),
        React.createElement(
          'div',
          { className: 'btn-group btn-group-sm inline-block' },
          React.createElement(
            'button',
            {
              onClick: this._debug,
              className: 'btn' },
            isDebugScript ? 'Launch' : 'Attach'
          )
        )
      );
    }
  }, {
    key: '_isDebugScript',
    value: function _isDebugScript(index) {
      return index === SCRIPT_OPTION.value;
    }
  }, {
    key: '_getDebugTarget',
    value: function _getDebugTarget(index, targetFilePath) {
      var remoteUri = require('../../nuclide-remote-uri');
      var hostName = remoteUri.getHostname(targetFilePath);
      var remoteFilePath = remoteUri.getPath(targetFilePath);
      return this._isDebugScript(index) ? remoteFilePath : hostName;
    }
  }, {
    key: '_handleDropdownChange',
    value: function _handleDropdownChange(newIndex) {
      var debugTarget = this._getDebugTarget(newIndex, this.props.targetFilePath);
      if (this.refs['debugTarget']) {
        this.refs['debugTarget'].setText(debugTarget);
      }
      this.setState({ selectedIndex: newIndex });
    }

    /**
     * Use void here to explictly disallow async function in react component.
     */
  }, {
    key: '_debug',
    value: function _debug() {
      // Stop any existing debugging sessions, as install hangs if an existing
      // app that's being overwritten is being debugged.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:stop-debugging');

      // TODO: is this.props.targetFilePath best one for targetUri?
      var processInfo = null;
      if (this._isDebugScript(this.state.selectedIndex)) {
        var scriptTarget = this.refs['debugTarget'].getText();

        var _require4 = require('../../nuclide-debugger-hhvm/lib/LaunchProcessInfo');

        var LaunchProcessInfo = _require4.LaunchProcessInfo;

        processInfo = new LaunchProcessInfo(this.props.targetFilePath, scriptTarget);
      } else {
        var _require5 = require('../../nuclide-debugger-hhvm/lib/AttachProcessInfo');

        var AttachProcessInfo = _require5.AttachProcessInfo;

        processInfo = new AttachProcessInfo(this.props.targetFilePath);
      }
      callDebugService(processInfo);
    }
  }]);

  return HhvmToolbar;
})(React.Component);

module.exports = HhvmToolbar;
//# sourceMappingURL=data:application/json;base64,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RyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO09BQzlFLE1BQU07d0JBQ3VCLE9BQU8sQ0FBQyxtREFBbUQsQ0FBQzs7WUFBakYsaUJBQWlCLGFBQWpCLGlCQUFpQjs7QUFDeEIsbUJBQVcsR0FBRyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7T0FDaEU7QUFDRCxzQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMvQjs7O1NBaEhHLFdBQVc7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUFtSHpDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDIiwiZmlsZSI6Ikhodm1Ub29sYmFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRGVidWdnZXJQcm9jZXNzSW5mbyBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWF0b20vbGliL0RlYnVnZ2VyUHJvY2Vzc0luZm8nO1xuY29uc3Qge0F0b21JbnB1dH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tSW5wdXQnKTtcbmNvbnN0IHtEcm9wZG93bn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpL2xpYi9Ecm9wZG93bicpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCBXRUJfU0VSVkVSX09QVElPTiA9IHtsYWJlbDogJ1dlYlNlcnZlcicsIHZhbHVlOiAwfTtcbmNvbnN0IFNDUklQVF9PUFRJT04gPSB7bGFiZWw6ICdTY3JpcHQnLCB2YWx1ZTogMX07XG5jb25zdCBERUZBVUxUX09QVElPTl9JTkRFWCA9IFdFQl9TRVJWRVJfT1BUSU9OLnZhbHVlO1xuXG5jb25zdCBERUJVR19PUFRJT05TID0gW1xuICBXRUJfU0VSVkVSX09QVElPTixcbiAgU0NSSVBUX09QVElPTixcbl07XG5cbmNvbnN0IE5PX0xBVU5DSF9ERUJVR19PUFRJT05TID0gW1xuICBXRUJfU0VSVkVSX09QVElPTixcbl07XG5cbmFzeW5jIGZ1bmN0aW9uIGNhbGxEZWJ1Z1NlcnZpY2UocHJvY2Vzc0luZm86IERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBQcm9taXNlIHtcbiAgLy8gVXNlIGNvbW1hbmRzIGhlcmUgdG8gdHJpZ2dlciBwYWNrYWdlIGFjdGl2YXRpb24uXG4gIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ251Y2xpZGUtZGVidWdnZXI6c2hvdycpO1xuICBjb25zdCBkZWJ1Z2dlclNlcnZpY2UgPSBhd2FpdCByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXNlcnZpY2UtaHViLXBsdXMnKVxuICAgICAgLmNvbnN1bWVGaXJzdFByb3ZpZGVyKCdudWNsaWRlLWRlYnVnZ2VyLnJlbW90ZScpO1xuICBkZWJ1Z2dlclNlcnZpY2Uuc3RhcnREZWJ1Z2dpbmcocHJvY2Vzc0luZm8pO1xufVxuXG5jbGFzcyBIaHZtVG9vbGJhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgdGFyZ2V0RmlsZVBhdGg6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBzdGF0ZToge1xuICAgIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogbWl4ZWQpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNlbGVjdGVkSW5kZXg6IERFRkFVTFRfT1BUSU9OX0lOREVYLFxuICAgIH07XG4gICAgKHRoaXM6IGFueSkuX2RlYnVnID0gdGhpcy5fZGVidWcuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlRHJvcGRvd25DaGFuZ2UgPSB0aGlzLl9oYW5kbGVEcm9wZG93bkNoYW5nZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgX2dldE1lbnVJdGVtcygpOiBBcnJheTx7bGFiZWw6IHN0cmluZzsgdmFsdWU6IG51bWJlcn0+IHtcbiAgICByZXR1cm4gdGhpcy5faXNUYXJnZXRMYXVuY2hhYmxlKHRoaXMucHJvcHMudGFyZ2V0RmlsZVBhdGgpXG4gICAgICA/IERFQlVHX09QVElPTlNcbiAgICAgIDogTk9fTEFVTkNIX0RFQlVHX09QVElPTlM7XG4gIH1cblxuICBfaXNUYXJnZXRMYXVuY2hhYmxlKHRhcmdldEZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGFyZ2V0RmlsZVBhdGguZW5kc1dpdGgoJy5waHAnKSB8fFxuICAgICAgdGFyZ2V0RmlsZVBhdGguZW5kc1dpdGgoJy5oaCcpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IE9iamVjdCkge1xuICAgIGxldCBzZWxlY3RlZEluZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4O1xuICAgIC8vIFJlc2V0IHNlbGVjdGVkIGl0ZW0gdG8gREVGQVVMVF9PUFRJT05fSU5ERVggaWYgdGFyZ2V0IGlzIG5vdCBsYXVuY2hhYmxlIGFueW1vcmUuXG4gICAgLy8gVE9ET1tqZWZmcmV5dGFuXTogdGhpcyBpcyB1Z2x5LCByZWZhY3RvciB0byBtYWtlIGl0IG1vcmUgZWxlZ2FudC5cbiAgICBpZiAoIXRoaXMuX2lzVGFyZ2V0TGF1bmNoYWJsZShuZXh0UHJvcHMudGFyZ2V0RmlsZVBhdGgpKSB7XG4gICAgICBzZWxlY3RlZEluZGV4ID0gREVGQVVMVF9PUFRJT05fSU5ERVg7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4OiBzZWxlY3RlZEluZGV4fSk7XG4gICAgfVxuICAgIHRoaXMucmVmcy5kZWJ1Z1RhcmdldC5zZXRUZXh0KHRoaXMuX2dldERlYnVnVGFyZ2V0KHNlbGVjdGVkSW5kZXgsIG5leHRQcm9wcy50YXJnZXRGaWxlUGF0aCkpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgZGVidWdUYXJnZXQgPSB0aGlzLl9nZXREZWJ1Z1RhcmdldCh0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXgsIHRoaXMucHJvcHMudGFyZ2V0RmlsZVBhdGgpO1xuICAgIGNvbnN0IGlzRGVidWdTY3JpcHQgPSB0aGlzLl9pc0RlYnVnU2NyaXB0KHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnVjay10b29sYmFyIGhodm0tdG9vbGJhciBibG9jayBwYWRkZWRcIj5cbiAgICAgICAgPERyb3Bkb3duXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICBtZW51SXRlbXM9e3RoaXMuX2dldE1lbnVJdGVtcygpfVxuICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleH1cbiAgICAgICAgICBvblNlbGVjdGVkQ2hhbmdlPXt0aGlzLl9oYW5kbGVEcm9wZG93bkNoYW5nZX1cbiAgICAgICAgICByZWY9XCJkcm9wZG93blwiXG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIiBzdHlsZT17e3dpZHRoOiAnNTAwcHgnfX0+XG4gICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgcmVmPVwiZGVidWdUYXJnZXRcIlxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXtkZWJ1Z1RhcmdldH1cbiAgICAgICAgICAgIGRpc2FibGVkPXshaXNEZWJ1Z1NjcmlwdH1cbiAgICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwIGJ0bi1ncm91cC1zbSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9kZWJ1Z31cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0blwiPlxuICAgICAgICAgICAge2lzRGVidWdTY3JpcHQgPyAnTGF1bmNoJyA6ICdBdHRhY2gnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaXNEZWJ1Z1NjcmlwdChpbmRleDogbnVtYmVyKTogYm9vbCB7XG4gICAgcmV0dXJuIGluZGV4ID09PSBTQ1JJUFRfT1BUSU9OLnZhbHVlO1xuICB9XG5cbiAgX2dldERlYnVnVGFyZ2V0KGluZGV4OiBudW1iZXIsIHRhcmdldEZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaScpO1xuICAgIGNvbnN0IGhvc3ROYW1lID0gcmVtb3RlVXJpLmdldEhvc3RuYW1lKHRhcmdldEZpbGVQYXRoKTtcbiAgICBjb25zdCByZW1vdGVGaWxlUGF0aCA9IHJlbW90ZVVyaS5nZXRQYXRoKHRhcmdldEZpbGVQYXRoKTtcbiAgICByZXR1cm4gdGhpcy5faXNEZWJ1Z1NjcmlwdChpbmRleCkgPyByZW1vdGVGaWxlUGF0aCA6IGhvc3ROYW1lO1xuICB9XG5cbiAgX2hhbmRsZURyb3Bkb3duQ2hhbmdlKG5ld0luZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCBkZWJ1Z1RhcmdldCA9IHRoaXMuX2dldERlYnVnVGFyZ2V0KG5ld0luZGV4LCB0aGlzLnByb3BzLnRhcmdldEZpbGVQYXRoKTtcbiAgICBpZiAodGhpcy5yZWZzWydkZWJ1Z1RhcmdldCddKSB7XG4gICAgICB0aGlzLnJlZnNbJ2RlYnVnVGFyZ2V0J10uc2V0VGV4dChkZWJ1Z1RhcmdldCk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXg6IG5ld0luZGV4fSk7XG4gIH1cblxuICAvKipcbiAgICogVXNlIHZvaWQgaGVyZSB0byBleHBsaWN0bHkgZGlzYWxsb3cgYXN5bmMgZnVuY3Rpb24gaW4gcmVhY3QgY29tcG9uZW50LlxuICAgKi9cbiAgX2RlYnVnKCk6IHZvaWQge1xuICAgIC8vIFN0b3AgYW55IGV4aXN0aW5nIGRlYnVnZ2luZyBzZXNzaW9ucywgYXMgaW5zdGFsbCBoYW5ncyBpZiBhbiBleGlzdGluZ1xuICAgIC8vIGFwcCB0aGF0J3MgYmVpbmcgb3ZlcndyaXR0ZW4gaXMgYmVpbmcgZGVidWdnZWQuXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAnbnVjbGlkZS1kZWJ1Z2dlcjpzdG9wLWRlYnVnZ2luZycpO1xuXG4gICAgLy8gVE9ETzogaXMgdGhpcy5wcm9wcy50YXJnZXRGaWxlUGF0aCBiZXN0IG9uZSBmb3IgdGFyZ2V0VXJpP1xuICAgIGxldCBwcm9jZXNzSW5mbyA9IG51bGw7XG4gICAgaWYgKHRoaXMuX2lzRGVidWdTY3JpcHQodGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4KSkge1xuICAgICAgY29uc3Qgc2NyaXB0VGFyZ2V0ID0gdGhpcy5yZWZzWydkZWJ1Z1RhcmdldCddLmdldFRleHQoKTtcbiAgICAgIGNvbnN0IHtMYXVuY2hQcm9jZXNzSW5mb30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWhodm0vbGliL0xhdW5jaFByb2Nlc3NJbmZvJyk7XG4gICAgICBwcm9jZXNzSW5mbyA9IG5ldyBMYXVuY2hQcm9jZXNzSW5mbyh0aGlzLnByb3BzLnRhcmdldEZpbGVQYXRoLCBzY3JpcHRUYXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7QXR0YWNoUHJvY2Vzc0luZm99ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1oaHZtL2xpYi9BdHRhY2hQcm9jZXNzSW5mbycpO1xuICAgICAgcHJvY2Vzc0luZm8gPSBuZXcgQXR0YWNoUHJvY2Vzc0luZm8odGhpcy5wcm9wcy50YXJnZXRGaWxlUGF0aCk7XG4gICAgfVxuICAgIGNhbGxEZWJ1Z1NlcnZpY2UocHJvY2Vzc0luZm8pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGh2bVRvb2xiYXI7XG4iXX0=