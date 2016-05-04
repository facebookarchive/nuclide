function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _BreakpointStore = require('./BreakpointStore');

var _BreakpointStore2 = _interopRequireDefault(_BreakpointStore);

var _Bridge = require('./Bridge');

var _Bridge2 = _interopRequireDefault(_Bridge);

var _DebuggerActions = require('./DebuggerActions');

var _DebuggerActions2 = _interopRequireDefault(_DebuggerActions);

var _reactForAtom = require('react-for-atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nuclideUiLibPanelComponent = require('../../nuclide-ui/lib/PanelComponent');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

/**
 * Wrapper for Chrome Devtools frontend view.
 */
var DebuggerInspector = _reactForAtom.React.createClass({
  _webviewNode: null,

  displayName: 'DebuggerInspector',

  propTypes: {
    actions: _reactForAtom.React.PropTypes.instanceOf(_DebuggerActions2.default).isRequired,
    breakpointStore: _reactForAtom.React.PropTypes.instanceOf(_BreakpointStore2.default).isRequired,
    socket: _reactForAtom.React.PropTypes.string.isRequired,
    bridge: _reactForAtom.React.PropTypes.instanceOf(_Bridge2.default).isRequired
  },

  render: function render() {
    return _reactForAtom.React.createElement(
      _nuclideUiLibPanelComponent.PanelComponent,
      { initialLength: 500, dock: 'right' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'inspector' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'control-bar', ref: 'controlBar' },
          _reactForAtom.React.createElement(_nuclideUiLibButton.Button, {
            title: 'Detach from the current process.',
            icon: 'x',
            buttonType: _nuclideUiLibButton.ButtonTypes.ERROR,
            onClick: this._handleClickClose
          }),
          _reactForAtom.React.createElement(_nuclideUiLibButton.Button, {
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
    var controlBarNode = _reactForAtom.ReactDOM.findDOMNode(this.refs.controlBar);
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
    return _path2.default.join(__dirname, '../scripts/inspector.html') + '?' + this.props.socket;
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