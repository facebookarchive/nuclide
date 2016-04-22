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

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideUiLibButtonGroup = require('../../nuclide-ui/lib/ButtonGroup');

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
          _nuclideUiLibButtonGroup.ButtonGroup,
          { size: _nuclideUiLibButtonGroup.ButtonGroupSizes.SMALL, className: 'inline-block' },
          React.createElement(
            _nuclideUiLibButton.Button,
            { onClick: this._debug },
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
//# sourceMappingURL=data:application/json;base64,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QUN1QixPQUFPLENBQUMsbURBQW1ELENBQUM7O1lBQWpGLGlCQUFpQixhQUFqQixpQkFBaUI7O0FBQ3hCLG1CQUFXLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO09BQ2hFO0FBQ0Qsc0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDL0I7OztTQXhHRyxXQUFXO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBMkd6QyxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJIaHZtVG9vbGJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIERlYnVnZ2VyUHJvY2Vzc0luZm8gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1hdG9tL2xpYi9EZWJ1Z2dlclByb2Nlc3NJbmZvJztcbmNvbnN0IHtBdG9tSW5wdXR9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS11aS9saWIvQXRvbUlucHV0Jyk7XG5jb25zdCB7RHJvcGRvd259ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS11aS9saWIvRHJvcGRvd24nKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcbmltcG9ydCB7XG4gIEJ1dHRvbixcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQnV0dG9uJztcbmltcG9ydCB7XG4gIEJ1dHRvbkdyb3VwLFxuICBCdXR0b25Hcm91cFNpemVzLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b25Hcm91cCc7XG5cbmNvbnN0IFdFQl9TRVJWRVJfT1BUSU9OID0ge2xhYmVsOiAnV2ViU2VydmVyJywgdmFsdWU6IDB9O1xuY29uc3QgU0NSSVBUX09QVElPTiA9IHtsYWJlbDogJ1NjcmlwdCcsIHZhbHVlOiAxfTtcbmNvbnN0IERFRkFVTFRfT1BUSU9OX0lOREVYID0gV0VCX1NFUlZFUl9PUFRJT04udmFsdWU7XG5cbmNvbnN0IERFQlVHX09QVElPTlMgPSBbXG4gIFdFQl9TRVJWRVJfT1BUSU9OLFxuICBTQ1JJUFRfT1BUSU9OLFxuXTtcblxuY29uc3QgTk9fTEFVTkNIX0RFQlVHX09QVElPTlMgPSBbXG4gIFdFQl9TRVJWRVJfT1BUSU9OLFxuXTtcblxuYXN5bmMgZnVuY3Rpb24gY2FsbERlYnVnU2VydmljZShwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mbyk6IFByb21pc2Uge1xuICAvLyBVc2UgY29tbWFuZHMgaGVyZSB0byB0cmlnZ2VyIHBhY2thZ2UgYWN0aXZhdGlvbi5cbiAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93Jyk7XG4gIGNvbnN0IGRlYnVnZ2VyU2VydmljZSA9IGF3YWl0IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtc2VydmljZS1odWItcGx1cycpXG4gICAgICAuY29uc3VtZUZpcnN0UHJvdmlkZXIoJ251Y2xpZGUtZGVidWdnZXIucmVtb3RlJyk7XG4gIGRlYnVnZ2VyU2VydmljZS5zdGFydERlYnVnZ2luZyhwcm9jZXNzSW5mbyk7XG59XG5cbmNsYXNzIEhodm1Ub29sYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICB0YXJnZXRGaWxlUGF0aDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHN0YXRlOiB7XG4gICAgc2VsZWN0ZWRJbmRleDogbnVtYmVyO1xuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2VsZWN0ZWRJbmRleDogREVGQVVMVF9PUFRJT05fSU5ERVgsXG4gICAgfTtcbiAgICAodGhpczogYW55KS5fZGVidWcgPSB0aGlzLl9kZWJ1Zy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVEcm9wZG93bkNoYW5nZSA9IHRoaXMuX2hhbmRsZURyb3Bkb3duQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICBfZ2V0TWVudUl0ZW1zKCk6IEFycmF5PHtsYWJlbDogc3RyaW5nOyB2YWx1ZTogbnVtYmVyfT4ge1xuICAgIHJldHVybiB0aGlzLl9pc1RhcmdldExhdW5jaGFibGUodGhpcy5wcm9wcy50YXJnZXRGaWxlUGF0aClcbiAgICAgID8gREVCVUdfT1BUSU9OU1xuICAgICAgOiBOT19MQVVOQ0hfREVCVUdfT1BUSU9OUztcbiAgfVxuXG4gIF9pc1RhcmdldExhdW5jaGFibGUodGFyZ2V0RmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0YXJnZXRGaWxlUGF0aC5lbmRzV2l0aCgnLnBocCcpIHx8XG4gICAgICB0YXJnZXRGaWxlUGF0aC5lbmRzV2l0aCgnLmhoJyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogT2JqZWN0KSB7XG4gICAgbGV0IHNlbGVjdGVkSW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXg7XG4gICAgLy8gUmVzZXQgc2VsZWN0ZWQgaXRlbSB0byBERUZBVUxUX09QVElPTl9JTkRFWCBpZiB0YXJnZXQgaXMgbm90IGxhdW5jaGFibGUgYW55bW9yZS5cbiAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiB0aGlzIGlzIHVnbHksIHJlZmFjdG9yIHRvIG1ha2UgaXQgbW9yZSBlbGVnYW50LlxuICAgIGlmICghdGhpcy5faXNUYXJnZXRMYXVuY2hhYmxlKG5leHRQcm9wcy50YXJnZXRGaWxlUGF0aCkpIHtcbiAgICAgIHNlbGVjdGVkSW5kZXggPSBERUZBVUxUX09QVElPTl9JTkRFWDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXg6IHNlbGVjdGVkSW5kZXh9KTtcbiAgICB9XG4gICAgdGhpcy5yZWZzLmRlYnVnVGFyZ2V0LnNldFRleHQodGhpcy5fZ2V0RGVidWdUYXJnZXQoc2VsZWN0ZWRJbmRleCwgbmV4dFByb3BzLnRhcmdldEZpbGVQYXRoKSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3QgZGVidWdUYXJnZXQgPSB0aGlzLl9nZXREZWJ1Z1RhcmdldCh0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXgsIHRoaXMucHJvcHMudGFyZ2V0RmlsZVBhdGgpO1xuICAgIGNvbnN0IGlzRGVidWdTY3JpcHQgPSB0aGlzLl9pc0RlYnVnU2NyaXB0KHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnVjay10b29sYmFyIGhodm0tdG9vbGJhciBibG9jayBwYWRkZWRcIj5cbiAgICAgICAgPERyb3Bkb3duXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCJcbiAgICAgICAgICBtZW51SXRlbXM9e3RoaXMuX2dldE1lbnVJdGVtcygpfVxuICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3RoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleH1cbiAgICAgICAgICBvblNlbGVjdGVkQ2hhbmdlPXt0aGlzLl9oYW5kbGVEcm9wZG93bkNoYW5nZX1cbiAgICAgICAgICByZWY9XCJkcm9wZG93blwiXG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIiBzdHlsZT17e3dpZHRoOiAnNTAwcHgnfX0+XG4gICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgcmVmPVwiZGVidWdUYXJnZXRcIlxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXtkZWJ1Z1RhcmdldH1cbiAgICAgICAgICAgIGRpc2FibGVkPXshaXNEZWJ1Z1NjcmlwdH1cbiAgICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxCdXR0b25Hcm91cCBzaXplPXtCdXR0b25Hcm91cFNpemVzLlNNQUxMfSBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e3RoaXMuX2RlYnVnfT5cbiAgICAgICAgICAgIHtpc0RlYnVnU2NyaXB0ID8gJ0xhdW5jaCcgOiAnQXR0YWNoJ31cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9CdXR0b25Hcm91cD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaXNEZWJ1Z1NjcmlwdChpbmRleDogbnVtYmVyKTogYm9vbCB7XG4gICAgcmV0dXJuIGluZGV4ID09PSBTQ1JJUFRfT1BUSU9OLnZhbHVlO1xuICB9XG5cbiAgX2dldERlYnVnVGFyZ2V0KGluZGV4OiBudW1iZXIsIHRhcmdldEZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaScpO1xuICAgIGNvbnN0IGhvc3ROYW1lID0gcmVtb3RlVXJpLmdldEhvc3RuYW1lKHRhcmdldEZpbGVQYXRoKTtcbiAgICBjb25zdCByZW1vdGVGaWxlUGF0aCA9IHJlbW90ZVVyaS5nZXRQYXRoKHRhcmdldEZpbGVQYXRoKTtcbiAgICByZXR1cm4gdGhpcy5faXNEZWJ1Z1NjcmlwdChpbmRleCkgPyByZW1vdGVGaWxlUGF0aCA6IGhvc3ROYW1lO1xuICB9XG5cbiAgX2hhbmRsZURyb3Bkb3duQ2hhbmdlKG5ld0luZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCBkZWJ1Z1RhcmdldCA9IHRoaXMuX2dldERlYnVnVGFyZ2V0KG5ld0luZGV4LCB0aGlzLnByb3BzLnRhcmdldEZpbGVQYXRoKTtcbiAgICBpZiAodGhpcy5yZWZzWydkZWJ1Z1RhcmdldCddKSB7XG4gICAgICB0aGlzLnJlZnNbJ2RlYnVnVGFyZ2V0J10uc2V0VGV4dChkZWJ1Z1RhcmdldCk7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXg6IG5ld0luZGV4fSk7XG4gIH1cblxuICAvKipcbiAgICogVXNlIHZvaWQgaGVyZSB0byBleHBsaWN0bHkgZGlzYWxsb3cgYXN5bmMgZnVuY3Rpb24gaW4gcmVhY3QgY29tcG9uZW50LlxuICAgKi9cbiAgX2RlYnVnKCk6IHZvaWQge1xuICAgIC8vIFRPRE86IGlzIHRoaXMucHJvcHMudGFyZ2V0RmlsZVBhdGggYmVzdCBvbmUgZm9yIHRhcmdldFVyaT9cbiAgICBsZXQgcHJvY2Vzc0luZm8gPSBudWxsO1xuICAgIGlmICh0aGlzLl9pc0RlYnVnU2NyaXB0KHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCkpIHtcbiAgICAgIGNvbnN0IHNjcmlwdFRhcmdldCA9IHRoaXMucmVmc1snZGVidWdUYXJnZXQnXS5nZXRUZXh0KCk7XG4gICAgICBjb25zdCB7TGF1bmNoUHJvY2Vzc0luZm99ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1oaHZtL2xpYi9MYXVuY2hQcm9jZXNzSW5mbycpO1xuICAgICAgcHJvY2Vzc0luZm8gPSBuZXcgTGF1bmNoUHJvY2Vzc0luZm8odGhpcy5wcm9wcy50YXJnZXRGaWxlUGF0aCwgc2NyaXB0VGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qge0F0dGFjaFByb2Nlc3NJbmZvfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtZGVidWdnZXItaGh2bS9saWIvQXR0YWNoUHJvY2Vzc0luZm8nKTtcbiAgICAgIHByb2Nlc3NJbmZvID0gbmV3IEF0dGFjaFByb2Nlc3NJbmZvKHRoaXMucHJvcHMudGFyZ2V0RmlsZVBhdGgpO1xuICAgIH1cbiAgICBjYWxsRGVidWdTZXJ2aWNlKHByb2Nlc3NJbmZvKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhodm1Ub29sYmFyO1xuIl19