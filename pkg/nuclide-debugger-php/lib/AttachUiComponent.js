'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachUiComponent = undefined;

var _react = _interopRequireDefault(require('react'));

var _AttachProcessInfo;

function _load_AttachProcessInfo() {
  return _AttachProcessInfo = require('./AttachProcessInfo');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class AttachUiComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleAttachButtonClick = this._handleAttachButtonClick.bind(this);
    this._handlePathsDropdownChange = this._handlePathsDropdownChange.bind(this);
    this.state = {
      selectedPathIndex: 0,
      pathMenuItems: this._getPathMenuItems()
    };
  }

  componentWillMount() {
    this.props.parentEmitter.on((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleAttachButtonClick);
  }

  componentWillUnmount() {
    this.props.parentEmitter.removeListener((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleAttachButtonClick);
  }

  render() {
    return _react.default.createElement(
      'div',
      { className: 'block' },
      _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-php-launch-attach-ui-select-project' },
        _react.default.createElement(
          'label',
          null,
          'Selected Project Directory: '
        ),
        _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          className: 'inline-block nuclide-debugger-connection-box',
          options: this.state.pathMenuItems,
          onChange: this._handlePathsDropdownChange,
          value: this.state.selectedPathIndex
        })
      ),
      _react.default.createElement(
        'div',
        { className: 'padded text-right' },
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._handleCancelButtonClick },
          'Cancel'
        ),
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          {
            buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
            onClick: this._handleAttachButtonClick },
          'Attach'
        )
      )
    );
  }

  _getPathMenuItems() {
    const connections = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getByHostname((_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri));
    return connections.map((connection, index) => {
      const pathToProject = connection.getPathForInitialWorkingDirectory();
      return {
        label: pathToProject,
        value: index
      };
    });
  }

  _handlePathsDropdownChange(newIndex) {
    this.setState({
      selectedPathIndex: newIndex,
      pathMenuItems: this._getPathMenuItems()
    });
  }

  _handleAttachButtonClick() {
    // Start a debug session with the user-supplied information.
    const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parseRemoteUri(this.props.targetUri);
    const selectedPath = this.state.pathMenuItems[this.state.selectedPathIndex].label;
    const processInfo = new (_AttachProcessInfo || _load_AttachProcessInfo()).AttachProcessInfo((_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, selectedPath));
    (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote').then(debuggerService => debuggerService.startDebugging(processInfo));
    this._showDebuggerPanel();
    this._handleCancelButtonClick();
  }

  _showDebuggerPanel() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  }

  _handleCancelButtonClick() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
  }
}
exports.AttachUiComponent = AttachUiComponent;