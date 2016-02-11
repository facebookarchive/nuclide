var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var callDebugService = _asyncToGenerator(function* (scriptTarget) {
  // Use commands here to trigger package activation.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  var debuggerService = yield require('../../service-hub-plus').consumeFirstProvider('nuclide-debugger.remote');
  debuggerService.debugHhvm(scriptTarget);
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

var AtomInput = require('../../ui/atom-input');
var NuclideDropdown = require('../../ui/dropdown');

var _require = require('react-for-atom');

var React = _require.React;
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
        React.createElement(NuclideDropdown, {
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
            size: 'sm' })
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
      var remoteUri = require('../../remote-uri');
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

      var scriptTarget = null;
      if (this._isDebugScript(this.state.selectedIndex)) {
        scriptTarget = this.refs['debugTarget'].getText();
      }
      callDebugService(scriptTarget);
    }
  }]);

  return HhvmToolbar;
})(React.Component);

module.exports = HhvmToolbar;
//# sourceMappingURL=data:application/json;base64,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QUFPLEdBQUcsV0FBVyxDQUFDIiwiZmlsZSI6Ikhodm1Ub29sYmFyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgQXRvbUlucHV0ID0gcmVxdWlyZSgnLi4vLi4vdWkvYXRvbS1pbnB1dCcpO1xuY29uc3QgTnVjbGlkZURyb3Bkb3duID0gcmVxdWlyZSgnLi4vLi4vdWkvZHJvcGRvd24nKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgV0VCX1NFUlZFUl9PUFRJT04gPSB7bGFiZWw6ICdXZWJTZXJ2ZXInLCB2YWx1ZTogMH07XG5jb25zdCBTQ1JJUFRfT1BUSU9OID0ge2xhYmVsOiAnU2NyaXB0JywgdmFsdWU6IDF9O1xuY29uc3QgREVGQVVMVF9PUFRJT05fSU5ERVggPSBXRUJfU0VSVkVSX09QVElPTi52YWx1ZTtcblxuY29uc3QgREVCVUdfT1BUSU9OUyA9IFtcbiAgV0VCX1NFUlZFUl9PUFRJT04sXG4gIFNDUklQVF9PUFRJT04sXG5dO1xuXG5jb25zdCBOT19MQVVOQ0hfREVCVUdfT1BUSU9OUyA9IFtcbiAgV0VCX1NFUlZFUl9PUFRJT04sXG5dO1xuXG5hc3luYyBmdW5jdGlvbiBjYWxsRGVidWdTZXJ2aWNlKHNjcmlwdFRhcmdldDogP3N0cmluZyk6IFByb21pc2Uge1xuICAvLyBVc2UgY29tbWFuZHMgaGVyZSB0byB0cmlnZ2VyIHBhY2thZ2UgYWN0aXZhdGlvbi5cbiAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnbnVjbGlkZS1kZWJ1Z2dlcjpzaG93Jyk7XG4gIGNvbnN0IGRlYnVnZ2VyU2VydmljZSA9IGF3YWl0IHJlcXVpcmUoJy4uLy4uL3NlcnZpY2UtaHViLXBsdXMnKVxuICAgICAgLmNvbnN1bWVGaXJzdFByb3ZpZGVyKCdudWNsaWRlLWRlYnVnZ2VyLnJlbW90ZScpO1xuICBkZWJ1Z2dlclNlcnZpY2UuZGVidWdIaHZtKHNjcmlwdFRhcmdldCk7XG59XG5cbmNsYXNzIEhodm1Ub29sYmFyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICB0YXJnZXRGaWxlUGF0aDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc2VsZWN0ZWRJbmRleDogREVGQVVMVF9PUFRJT05fSU5ERVgsXG4gICAgfTtcbiAgICB0aGlzLl9kZWJ1ZyA9IHRoaXMuX2RlYnVnLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faGFuZGxlRHJvcGRvd25DaGFuZ2UgPSB0aGlzLl9oYW5kbGVEcm9wZG93bkNoYW5nZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgX2dldE1lbnVJdGVtcygpOiBBcnJheTx7bGFiZWw6IHN0cmluZywgdmFsdWU6IG51bWJlcn0+IHtcbiAgICByZXR1cm4gdGhpcy5faXNUYXJnZXRMYXVuY2hhYmxlKHRoaXMucHJvcHMudGFyZ2V0RmlsZVBhdGgpXG4gICAgICA/IERFQlVHX09QVElPTlNcbiAgICAgIDogTk9fTEFVTkNIX0RFQlVHX09QVElPTlM7XG4gIH1cblxuICBfaXNUYXJnZXRMYXVuY2hhYmxlKHRhcmdldEZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGFyZ2V0RmlsZVBhdGguZW5kc1dpdGgoJy5waHAnKSB8fFxuICAgICAgdGFyZ2V0RmlsZVBhdGguZW5kc1dpdGgoJy5oaCcpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IE9iamVjdCkge1xuICAgIGxldCBzZWxlY3RlZEluZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4O1xuICAgIC8vIFJlc2V0IHNlbGVjdGVkIGl0ZW0gdG8gREVGQVVMVF9PUFRJT05fSU5ERVggaWYgdGFyZ2V0IGlzIG5vdCBsYXVuY2hhYmxlIGFueW1vcmUuXG4gICAgLy8gVE9ET1tqZWZmcmV5dGFuXTogdGhpcyBpcyB1Z2x5LCByZWZhY3RvciB0byBtYWtlIGl0IG1vcmUgZWxlZ2FudC5cbiAgICBpZiAoIXRoaXMuX2lzVGFyZ2V0TGF1bmNoYWJsZShuZXh0UHJvcHMudGFyZ2V0RmlsZVBhdGgpKSB7XG4gICAgICBzZWxlY3RlZEluZGV4ID0gREVGQVVMVF9PUFRJT05fSU5ERVg7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4OiBzZWxlY3RlZEluZGV4fSk7XG4gICAgfVxuICAgIHRoaXMucmVmcy5kZWJ1Z1RhcmdldC5zZXRUZXh0KHRoaXMuX2dldERlYnVnVGFyZ2V0KHNlbGVjdGVkSW5kZXgsIG5leHRQcm9wcy50YXJnZXRGaWxlUGF0aCkpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgZGVidWdUYXJnZXQgPSB0aGlzLl9nZXREZWJ1Z1RhcmdldCh0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXgsIHRoaXMucHJvcHMudGFyZ2V0RmlsZVBhdGgpO1xuICAgIGNvbnN0IGlzRGVidWdTY3JpcHQgPSB0aGlzLl9pc0RlYnVnU2NyaXB0KHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnVjay10b29sYmFyIGhodm0tdG9vbGJhciBibG9jayBwYWRkZWRcIj5cbiAgICAgICAgPE51Y2xpZGVEcm9wZG93blxuICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiXG4gICAgICAgICAgbWVudUl0ZW1zPXt0aGlzLl9nZXRNZW51SXRlbXMoKX1cbiAgICAgICAgICBzZWxlY3RlZEluZGV4PXt0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXh9XG4gICAgICAgICAgb25TZWxlY3RlZENoYW5nZT17dGhpcy5faGFuZGxlRHJvcGRvd25DaGFuZ2V9XG4gICAgICAgICAgcmVmPVwiZHJvcGRvd25cIlxuICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCIgc3R5bGU9e3t3aWR0aDogJzUwMHB4J319PlxuICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgIHJlZj1cImRlYnVnVGFyZ2V0XCJcbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17ZGVidWdUYXJnZXR9XG4gICAgICAgICAgICBkaXNhYmxlZD17IWlzRGVidWdTY3JpcHR9XG4gICAgICAgICAgICBzaXplPVwic21cIi8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cCBidG4tZ3JvdXAtc20gaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5fZGVidWd9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJidG5cIj5cbiAgICAgICAgICAgIHtpc0RlYnVnU2NyaXB0ID8gJ0xhdW5jaCcgOiAnQXR0YWNoJ31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2lzRGVidWdTY3JpcHQoaW5kZXg6IG51bWJlcik6IGJvb2wge1xuICAgIHJldHVybiBpbmRleCA9PT0gU0NSSVBUX09QVElPTi52YWx1ZTtcbiAgfVxuXG4gIF9nZXREZWJ1Z1RhcmdldChpbmRleDogbnVtYmVyLCB0YXJnZXRGaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCByZW1vdGVVcmkgPSByZXF1aXJlKCcuLi8uLi9yZW1vdGUtdXJpJyk7XG4gICAgY29uc3QgaG9zdE5hbWUgPSByZW1vdGVVcmkuZ2V0SG9zdG5hbWUodGFyZ2V0RmlsZVBhdGgpO1xuICAgIGNvbnN0IHJlbW90ZUZpbGVQYXRoID0gcmVtb3RlVXJpLmdldFBhdGgodGFyZ2V0RmlsZVBhdGgpO1xuICAgIHJldHVybiB0aGlzLl9pc0RlYnVnU2NyaXB0KGluZGV4KSA/IHJlbW90ZUZpbGVQYXRoIDogaG9zdE5hbWU7XG4gIH1cblxuICBfaGFuZGxlRHJvcGRvd25DaGFuZ2UobmV3SW5kZXg6IG51bWJlcikge1xuICAgIGNvbnN0IGRlYnVnVGFyZ2V0ID0gdGhpcy5fZ2V0RGVidWdUYXJnZXQobmV3SW5kZXgsIHRoaXMucHJvcHMudGFyZ2V0RmlsZVBhdGgpO1xuICAgIGlmICh0aGlzLnJlZnNbJ2RlYnVnVGFyZ2V0J10pIHtcbiAgICAgIHRoaXMucmVmc1snZGVidWdUYXJnZXQnXS5zZXRUZXh0KGRlYnVnVGFyZ2V0KTtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRJbmRleDogbmV3SW5kZXh9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2Ugdm9pZCBoZXJlIHRvIGV4cGxpY3RseSBkaXNhbGxvdyBhc3luYyBmdW5jdGlvbiBpbiByZWFjdCBjb21wb25lbnQuXG4gICAqL1xuICBfZGVidWcoKTogdm9pZCB7XG4gICAgLy8gU3RvcCBhbnkgZXhpc3RpbmcgZGVidWdnaW5nIHNlc3Npb25zLCBhcyBpbnN0YWxsIGhhbmdzIGlmIGFuIGV4aXN0aW5nXG4gICAgLy8gYXBwIHRoYXQncyBiZWluZyBvdmVyd3JpdHRlbiBpcyBiZWluZyBkZWJ1Z2dlZC5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWRlYnVnZ2VyOnN0b3AtZGVidWdnaW5nJyk7XG5cbiAgICBsZXQgc2NyaXB0VGFyZ2V0ID0gbnVsbDtcbiAgICBpZiAodGhpcy5faXNEZWJ1Z1NjcmlwdCh0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXgpKSB7XG4gICAgICBzY3JpcHRUYXJnZXQgPSB0aGlzLnJlZnNbJ2RlYnVnVGFyZ2V0J10uZ2V0VGV4dCgpO1xuICAgIH1cbiAgICBjYWxsRGVidWdTZXJ2aWNlKHNjcmlwdFRhcmdldCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIaHZtVG9vbGJhcjtcbiJdfQ==