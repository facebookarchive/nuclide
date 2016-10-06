Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _BreakpointStore2;

function _BreakpointStore() {
  return _BreakpointStore2 = _interopRequireDefault(require('./BreakpointStore'));
}

var _Bridge2;

function _Bridge() {
  return _Bridge2 = _interopRequireDefault(require('./Bridge'));
}

var _DebuggerActions2;

function _DebuggerActions() {
  return _DebuggerActions2 = _interopRequireDefault(require('./DebuggerActions'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../nuclide-ui/Button');
}

/**
 * Wrapper for Chrome Devtools frontend view.
 */

var DebuggerInspector = (function (_React$Component) {
  _inherits(DebuggerInspector, _React$Component);

  function DebuggerInspector(props) {
    _classCallCheck(this, DebuggerInspector);

    _get(Object.getPrototypeOf(DebuggerInspector.prototype), 'constructor', this).call(this, props);
    this._webviewNode = null;
    this._getUrl = this._getUrl.bind(this);
    this._handleClickClose = this._handleClickClose.bind(this);
    this._handleClickDevTools = this._handleClickDevTools.bind(this);
    this._handleClickUISwitch = this._handleClickUISwitch.bind(this);
  }

  _createClass(DebuggerInspector, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return nextProps.actions !== this.props.actions || nextProps.breakpointStore !== this.props.breakpointStore || nextProps.socket !== this.props.socket || nextProps.bridge !== this.props.bridge || nextProps.showOldView !== this.props.showOldView || nextProps.toggleOldView !== this.props.toggleOldView;
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'inspector' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'control-bar', ref: 'controlBar' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiButton2 || _nuclideUiButton()).Button, {
            title: 'Detach from the current process.',
            icon: 'x',
            buttonType: (_nuclideUiButton2 || _nuclideUiButton()).ButtonTypes.ERROR,
            onClick: this._handleClickClose
          }),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiButton2 || _nuclideUiButton()).Button, {
            title: '(Debug) Open Web Inspector for the debugger frame.',
            icon: 'gear',
            onClick: this._handleClickDevTools
          }),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiButton2 || _nuclideUiButton()).Button, {
            className: 'nuclide-debugger-toggle-old-ui-button',
            title: 'Toggle new / old Nuclide Debugger UI',
            icon: 'history',
            onClick: this._handleClickUISwitch
          })
        )
      );
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Cast from HTMLElement down to WebviewElement without instanceof
      // checking, as WebviewElement constructor is not exposed.
      var webviewNode = document.createElement('webview');
      webviewNode.src = this._getUrl();
      webviewNode.nodeintegration = true;
      webviewNode.disablewebsecurity = true;
      webviewNode.classList.add('native-key-bindings'); // required to pass through certain key events
      webviewNode.classList.add('nuclide-debugger-webview');
      if (!this.props.showOldView) {
        webviewNode.classList.add('nuclide-debugger-webview-hidden');
      }
      this._webviewNode = webviewNode;
      var controlBarNode = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.controlBar);
      controlBarNode.parentNode.insertBefore(webviewNode, controlBarNode.nextSibling);
      this.props.bridge.setWebviewElement(webviewNode);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var webviewNode = this._webviewNode;
      if (webviewNode == null) {
        return;
      }
      if (this.props.socket !== prevProps.socket) {
        webviewNode.src = this._getUrl();
      }
      var showOldView = this.props.showOldView;

      if (showOldView !== prevProps.showOldView) {
        webviewNode.classList.toggle('nuclide-debugger-webview-hidden', !showOldView);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.props.bridge) {
        this.props.bridge.cleanup();
      }
      this._webviewNode = null;
    }
  }, {
    key: '_getUrl',
    value: function _getUrl() {
      return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(__dirname, '../scripts/inspector.html') + '?' + this.props.socket;
    }
  }, {
    key: '_handleClickClose',
    value: function _handleClickClose() {
      this.props.actions.stopDebugging();
    }
  }, {
    key: '_handleClickDevTools',
    value: function _handleClickDevTools() {
      var webviewNode = this._webviewNode;
      if (webviewNode) {
        webviewNode.openDevTools();
      }
    }
  }, {
    key: '_handleClickUISwitch',
    value: function _handleClickUISwitch() {
      this.props.toggleOldView();
    }
  }]);

  return DebuggerInspector;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = DebuggerInspector;
module.exports = exports.default;