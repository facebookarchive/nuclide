var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

/**
 * Wrapper for Chrome Devtools frontend view.
 */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var BreakpointStore = require('./BreakpointStore');
var Bridge = require('./Bridge');
var DebuggerActions = require('./DebuggerActions');

var _require = require('react-for-atom');

var React = _require.React;
var ReactDOM = _require.ReactDOM;
var PropTypes = React.PropTypes;

var path = require('path');

var _require2 = require('../../nuclide-ui/lib/PanelComponent');

var PanelComponent = _require2.PanelComponent;
var DebuggerInspector = React.createClass({
  _webviewNode: null,

  displayName: 'DebuggerInspector',

  propTypes: {
    actions: PropTypes.instanceOf(DebuggerActions).isRequired,
    breakpointStore: PropTypes.instanceOf(BreakpointStore).isRequired,
    socket: PropTypes.string.isRequired,
    bridge: PropTypes.instanceOf(Bridge).isRequired
  },

  render: function render() {
    return React.createElement(
      PanelComponent,
      { initialLength: 500, dock: 'right' },
      React.createElement(
        'div',
        { className: 'inspector' },
        React.createElement(
          'div',
          { className: 'control-bar', ref: 'controlBar' },
          React.createElement(_nuclideUiLibButton.Button, {
            title: 'Detach from the current process.',
            icon: 'x',
            buttonType: _nuclideUiLibButton.ButtonTypes.ERROR,
            onClick: this._handleClickClose
          }),
          React.createElement(_nuclideUiLibButton.Button, {
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
    var controlBarNode = ReactDOM.findDOMNode(this.refs.controlBar);
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
    return path.join(__dirname, '../scripts/inspector.html') + '?' + this.props.socket;
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