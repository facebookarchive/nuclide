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
//# sourceMappingURL=data:application/json;base64,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QUFpQixhQUFqQixpQkFBaUI7O0FBQ3hCLG1CQUFXLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO09BQ2hFO0FBQ0Qsc0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDL0I7OztTQTFHRyxXQUFXO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBNkd6QyxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJIaHZtVG9vbGJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIERlYnVnZ2VyUHJvY2Vzc0luZm8gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1hdG9tL2xpYi9EZWJ1Z2dlclByb2Nlc3NJbmZvJztcbmNvbnN0IHtBdG9tSW5wdXR9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS11aS9saWIvQXRvbUlucHV0Jyk7XG5jb25zdCB7RHJvcGRvd259ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS11aS9saWIvRHJvcGRvd24nKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgV0VCX1NFUlZFUl9PUFRJT04gPSB7bGFiZWw6ICdXZWJTZXJ2ZXInLCB2YWx1ZTogMH07XG5jb25zdCBTQ1JJUFRfT1BUSU9OID0ge2xhYmVsOiAnU2NyaXB0JywgdmFsdWU6IDF9O1xuY29uc3QgREVGQVVMVF9PUFRJT05fSU5ERVggPSBXRUJfU0VSVkVSX09QVElPTi52YWx1ZTtcblxuY29uc3QgREVCVUdfT1BUSU9OUyA9IFtcbiAgV0VCX1NFUlZFUl9PUFRJT04sXG4gIFNDUklQVF9PUFRJT04sXG5dO1xuXG5jb25zdCBOT19MQVVOQ0hfREVCVUdfT1BUSU9OUyA9IFtcbiAgV0VCX1NFUlZFUl9PUFRJT04sXG5dO1xuXG5hc3luYyBmdW5jdGlvbiBjYWxsRGVidWdTZXJ2aWNlKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKTogUHJvbWlzZSB7XG4gIC8vIFVzZSBjb21tYW5kcyBoZXJlIHRvIHRyaWdnZXIgcGFja2FnZSBhY3RpdmF0aW9uLlxuICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdudWNsaWRlLWRlYnVnZ2VyOnNob3cnKTtcbiAgY29uc3QgZGVidWdnZXJTZXJ2aWNlID0gYXdhaXQgcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1zZXJ2aWNlLWh1Yi1wbHVzJylcbiAgICAgIC5jb25zdW1lRmlyc3RQcm92aWRlcignbnVjbGlkZS1kZWJ1Z2dlci5yZW1vdGUnKTtcbiAgZGVidWdnZXJTZXJ2aWNlLnN0YXJ0RGVidWdnaW5nKHByb2Nlc3NJbmZvKTtcbn1cblxuY2xhc3MgSGh2bVRvb2xiYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHRhcmdldEZpbGVQYXRoOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgc3RhdGU6IHtcbiAgICBzZWxlY3RlZEluZGV4OiBudW1iZXI7XG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBzZWxlY3RlZEluZGV4OiBERUZBVUxUX09QVElPTl9JTkRFWCxcbiAgICB9O1xuICAgICh0aGlzOiBhbnkpLl9kZWJ1ZyA9IHRoaXMuX2RlYnVnLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZURyb3Bkb3duQ2hhbmdlID0gdGhpcy5faGFuZGxlRHJvcGRvd25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIF9nZXRNZW51SXRlbXMoKTogQXJyYXk8e2xhYmVsOiBzdHJpbmc7IHZhbHVlOiBudW1iZXJ9PiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzVGFyZ2V0TGF1bmNoYWJsZSh0aGlzLnByb3BzLnRhcmdldEZpbGVQYXRoKVxuICAgICAgPyBERUJVR19PUFRJT05TXG4gICAgICA6IE5PX0xBVU5DSF9ERUJVR19PUFRJT05TO1xuICB9XG5cbiAgX2lzVGFyZ2V0TGF1bmNoYWJsZSh0YXJnZXRGaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRhcmdldEZpbGVQYXRoLmVuZHNXaXRoKCcucGhwJykgfHxcbiAgICAgIHRhcmdldEZpbGVQYXRoLmVuZHNXaXRoKCcuaGgnKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBPYmplY3QpIHtcbiAgICBsZXQgc2VsZWN0ZWRJbmRleCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleDtcbiAgICAvLyBSZXNldCBzZWxlY3RlZCBpdGVtIHRvIERFRkFVTFRfT1BUSU9OX0lOREVYIGlmIHRhcmdldCBpcyBub3QgbGF1bmNoYWJsZSBhbnltb3JlLlxuICAgIC8vIFRPRE9bamVmZnJleXRhbl06IHRoaXMgaXMgdWdseSwgcmVmYWN0b3IgdG8gbWFrZSBpdCBtb3JlIGVsZWdhbnQuXG4gICAgaWYgKCF0aGlzLl9pc1RhcmdldExhdW5jaGFibGUobmV4dFByb3BzLnRhcmdldEZpbGVQYXRoKSkge1xuICAgICAgc2VsZWN0ZWRJbmRleCA9IERFRkFVTFRfT1BUSU9OX0lOREVYO1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRJbmRleDogc2VsZWN0ZWRJbmRleH0pO1xuICAgIH1cbiAgICB0aGlzLnJlZnMuZGVidWdUYXJnZXQuc2V0VGV4dCh0aGlzLl9nZXREZWJ1Z1RhcmdldChzZWxlY3RlZEluZGV4LCBuZXh0UHJvcHMudGFyZ2V0RmlsZVBhdGgpKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGRlYnVnVGFyZ2V0ID0gdGhpcy5fZ2V0RGVidWdUYXJnZXQodGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4LCB0aGlzLnByb3BzLnRhcmdldEZpbGVQYXRoKTtcbiAgICBjb25zdCBpc0RlYnVnU2NyaXB0ID0gdGhpcy5faXNEZWJ1Z1NjcmlwdCh0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXgpO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ1Y2stdG9vbGJhciBoaHZtLXRvb2xiYXIgYmxvY2sgcGFkZGVkXCI+XG4gICAgICAgIDxEcm9wZG93blxuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgbWVudUl0ZW1zPXt0aGlzLl9nZXRNZW51SXRlbXMoKX1cbiAgICAgICAgICBzZWxlY3RlZEluZGV4PXt0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXh9XG4gICAgICAgICAgb25TZWxlY3RlZENoYW5nZT17dGhpcy5faGFuZGxlRHJvcGRvd25DaGFuZ2V9XG4gICAgICAgICAgcmVmPVwiZHJvcGRvd25cIlxuICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCIgc3R5bGU9e3t3aWR0aDogJzUwMHB4J319PlxuICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgIHJlZj1cImRlYnVnVGFyZ2V0XCJcbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17ZGVidWdUYXJnZXR9XG4gICAgICAgICAgICBkaXNhYmxlZD17IWlzRGVidWdTY3JpcHR9XG4gICAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cCBidG4tZ3JvdXAtc20gaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5fZGVidWd9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJidG5cIj5cbiAgICAgICAgICAgIHtpc0RlYnVnU2NyaXB0ID8gJ0xhdW5jaCcgOiAnQXR0YWNoJ31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2lzRGVidWdTY3JpcHQoaW5kZXg6IG51bWJlcik6IGJvb2wge1xuICAgIHJldHVybiBpbmRleCA9PT0gU0NSSVBUX09QVElPTi52YWx1ZTtcbiAgfVxuXG4gIF9nZXREZWJ1Z1RhcmdldChpbmRleDogbnVtYmVyLCB0YXJnZXRGaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCByZW1vdGVVcmkgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknKTtcbiAgICBjb25zdCBob3N0TmFtZSA9IHJlbW90ZVVyaS5nZXRIb3N0bmFtZSh0YXJnZXRGaWxlUGF0aCk7XG4gICAgY29uc3QgcmVtb3RlRmlsZVBhdGggPSByZW1vdGVVcmkuZ2V0UGF0aCh0YXJnZXRGaWxlUGF0aCk7XG4gICAgcmV0dXJuIHRoaXMuX2lzRGVidWdTY3JpcHQoaW5kZXgpID8gcmVtb3RlRmlsZVBhdGggOiBob3N0TmFtZTtcbiAgfVxuXG4gIF9oYW5kbGVEcm9wZG93bkNoYW5nZShuZXdJbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgZGVidWdUYXJnZXQgPSB0aGlzLl9nZXREZWJ1Z1RhcmdldChuZXdJbmRleCwgdGhpcy5wcm9wcy50YXJnZXRGaWxlUGF0aCk7XG4gICAgaWYgKHRoaXMucmVmc1snZGVidWdUYXJnZXQnXSkge1xuICAgICAgdGhpcy5yZWZzWydkZWJ1Z1RhcmdldCddLnNldFRleHQoZGVidWdUYXJnZXQpO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4OiBuZXdJbmRleH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB2b2lkIGhlcmUgdG8gZXhwbGljdGx5IGRpc2FsbG93IGFzeW5jIGZ1bmN0aW9uIGluIHJlYWN0IGNvbXBvbmVudC5cbiAgICovXG4gIF9kZWJ1ZygpOiB2b2lkIHtcbiAgICAvLyBUT0RPOiBpcyB0aGlzLnByb3BzLnRhcmdldEZpbGVQYXRoIGJlc3Qgb25lIGZvciB0YXJnZXRVcmk/XG4gICAgbGV0IHByb2Nlc3NJbmZvID0gbnVsbDtcbiAgICBpZiAodGhpcy5faXNEZWJ1Z1NjcmlwdCh0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXgpKSB7XG4gICAgICBjb25zdCBzY3JpcHRUYXJnZXQgPSB0aGlzLnJlZnNbJ2RlYnVnVGFyZ2V0J10uZ2V0VGV4dCgpO1xuICAgICAgY29uc3Qge0xhdW5jaFByb2Nlc3NJbmZvfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtZGVidWdnZXItaGh2bS9saWIvTGF1bmNoUHJvY2Vzc0luZm8nKTtcbiAgICAgIHByb2Nlc3NJbmZvID0gbmV3IExhdW5jaFByb2Nlc3NJbmZvKHRoaXMucHJvcHMudGFyZ2V0RmlsZVBhdGgsIHNjcmlwdFRhcmdldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHtBdHRhY2hQcm9jZXNzSW5mb30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWhodm0vbGliL0F0dGFjaFByb2Nlc3NJbmZvJyk7XG4gICAgICBwcm9jZXNzSW5mbyA9IG5ldyBBdHRhY2hQcm9jZXNzSW5mbyh0aGlzLnByb3BzLnRhcmdldEZpbGVQYXRoKTtcbiAgICB9XG4gICAgY2FsbERlYnVnU2VydmljZShwcm9jZXNzSW5mbyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIaHZtVG9vbGJhcjtcbiJdfQ==