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

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _nuclideUiLibPanelComponent2;

function _nuclideUiLibPanelComponent() {
  return _nuclideUiLibPanelComponent2 = require('../../nuclide-ui/lib/PanelComponent');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

/**
 * Wrapper for Chrome Devtools frontend view.
 */
var DebuggerInspector = (_reactForAtom2 || _reactForAtom()).React.createClass({
  _webviewNode: null,

  displayName: 'DebuggerInspector',

  propTypes: {
    actions: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_DebuggerActions2 || _DebuggerActions()).default).isRequired,
    breakpointStore: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_BreakpointStore2 || _BreakpointStore()).default).isRequired,
    socket: (_reactForAtom2 || _reactForAtom()).React.PropTypes.string.isRequired,
    bridge: (_reactForAtom2 || _reactForAtom()).React.PropTypes.instanceOf((_Bridge2 || _Bridge()).default).isRequired
  },

  shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
    return nextProps.actions !== this.props.actions || nextProps.breakpointStore !== this.props.breakpointStore || nextProps.socket !== this.props.socket || nextProps.bridge !== this.props.bridge;
  },

  render: function render() {
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_nuclideUiLibPanelComponent2 || _nuclideUiLibPanelComponent()).PanelComponent,
      { initialLength: 500, dock: 'right' },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'inspector' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'control-bar', ref: 'controlBar' },
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
            title: 'Detach from the current process.',
            icon: 'x',
            buttonType: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonTypes.ERROR,
            onClick: this._handleClickClose
          }),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
            title: '(Debug) Open Web Inspector for the debugger frame.',
            icon: 'gear',
            onClick: this._handleClickDevTools
          })
        )
      )
    );
  },

  componentDidMount: function componentDidMount() {
    // Cast from HTMLElement down to WebviewElement without instanceof
    // checking, as WebviewElement constructor is not exposed.
    var webviewNode = document.createElement('webview');
    webviewNode.src = this._getUrl();
    webviewNode.nodeintegration = true;
    webviewNode.disablewebsecurity = true;
    webviewNode.classList.add('native-key-bindings'); // required to pass through certain key events
    webviewNode.classList.add('nuclide-debugger-webview');
    this._webviewNode = webviewNode;
    var controlBarNode = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.controlBar);
    controlBarNode.parentNode.insertBefore(webviewNode, controlBarNode.nextSibling);
    this.props.bridge.setWebviewElement(webviewNode);
  },

  componentDidUpdate: function componentDidUpdate() {
    var webviewNode = this._webviewNode;
    if (webviewNode) {
      webviewNode.src = this._getUrl();
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    if (this.props.bridge) {
      this.props.bridge.cleanup();
    }
    this._webviewNode = null;
  },

  _getUrl: function _getUrl() {
    return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, '../scripts/inspector.html') + '?' + this.props.socket;
  },

  _handleClickClose: function _handleClickClose() {
    this.props.actions.stopDebugging();
  },

  _handleClickDevTools: function _handleClickDevTools() {
    var webviewNode = this._webviewNode;
    if (webviewNode) {
      webviewNode.openDevTools();
    }
  }
});

module.exports = DebuggerInspector;