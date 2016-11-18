'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _BreakpointStore;

function _load_BreakpointStore() {
  return _BreakpointStore = _interopRequireDefault(require('./BreakpointStore'));
}

var _Bridge;

function _load_Bridge() {
  return _Bridge = _interopRequireDefault(require('./Bridge'));
}

var _DebuggerActions;

function _load_DebuggerActions() {
  return _DebuggerActions = _interopRequireDefault(require('./DebuggerActions'));
}

var _reactForAtom = require('react-for-atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper for Chrome Devtools frontend view.
 */
let DebuggerInspector = class DebuggerInspector extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._webviewNode = null;
    this._getUrl = this._getUrl.bind(this);
    this._handleClickClose = this._handleClickClose.bind(this);
    this._handleClickDevTools = this._handleClickDevTools.bind(this);
    this._handleClickUISwitch = this._handleClickUISwitch.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.actions !== this.props.actions || nextProps.breakpointStore !== this.props.breakpointStore || nextProps.socket !== this.props.socket || nextProps.bridge !== this.props.bridge || nextProps.showOldView !== this.props.showOldView || nextProps.toggleOldView !== this.props.toggleOldView;
  }

  render() {
    return _reactForAtom.React.createElement(
      'div',
      { className: 'inspector' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'control-bar', ref: 'controlBar' },
        _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
          title: 'Detach from the current process.',
          icon: 'x',
          buttonType: (_Button || _load_Button()).ButtonTypes.ERROR,
          onClick: this._handleClickClose
        }),
        _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
          title: '(Debug) Open Web Inspector for the debugger frame.',
          icon: 'gear',
          onClick: this._handleClickDevTools
        }),
        _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
          className: 'nuclide-debugger-toggle-old-ui-button',
          title: 'Toggle new / old Nuclide Debugger UI',
          icon: 'history',
          onClick: this._handleClickUISwitch
        })
      )
    );
  }

  componentDidMount() {
    // Cast from HTMLElement down to WebviewElement without instanceof
    // checking, as WebviewElement constructor is not exposed.
    const webviewNode = document.createElement('webview');
    webviewNode.src = this._getUrl();
    webviewNode.nodeintegration = true;
    webviewNode.disablewebsecurity = true;
    webviewNode.classList.add('native-key-bindings'); // required to pass through certain key events
    webviewNode.classList.add('nuclide-debugger-webview');
    if (!this.props.showOldView) {
      webviewNode.classList.add('nuclide-debugger-webview-hidden');
    }
    this._webviewNode = webviewNode;
    const controlBarNode = _reactForAtom.ReactDOM.findDOMNode(this.refs.controlBar);
    controlBarNode.parentNode.insertBefore(webviewNode, controlBarNode.nextSibling);
    this.props.bridge.setWebviewElement(webviewNode);
  }

  componentDidUpdate(prevProps) {
    const webviewNode = this._webviewNode;
    if (webviewNode == null) {
      return;
    }
    if (this.props.socket !== prevProps.socket) {
      webviewNode.src = this._getUrl();
    }
    const showOldView = this.props.showOldView;

    if (showOldView !== prevProps.showOldView) {
      webviewNode.classList.toggle('nuclide-debugger-webview-hidden', !showOldView);
    }
  }

  componentWillUnmount() {
    if (this.props.bridge) {
      this.props.bridge.cleanup();
    }
    this._webviewNode = null;
  }

  _getUrl() {
    return `${ (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../scripts/inspector.html') }?${ this.props.socket }`;
  }

  _handleClickClose() {
    this.props.actions.stopDebugging();
  }

  _handleClickDevTools() {
    const webviewNode = this._webviewNode;
    if (webviewNode) {
      webviewNode.openDevTools();
    }
  }

  _handleClickUISwitch() {
    this.props.toggleOldView();
  }
};
exports.default = DebuggerInspector;
module.exports = exports['default'];