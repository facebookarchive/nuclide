'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchUiComponent = undefined;

var _react = _interopRequireDefault(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _LaunchProcessInfo;

function _load_LaunchProcessInfo() {
  return _LaunchProcessInfo = require('./LaunchProcessInfo');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LaunchUiComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._getActiveFilePath = this._getActiveFilePath.bind(this);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleLaunchButtonClick = this._handleLaunchButtonClick.bind(this);
    this._handlePathsDropdownChange = this._handlePathsDropdownChange.bind(this);
    this.state = {
      pathsDropdownIndex: 0,
      pathMenuItems: this._getPathMenuItems()
    };
  }

  componentWillMount() {
    this.props.parentEmitter.on((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleLaunchButtonClick);
  }

  componentWillUnmount() {
    this.props.parentEmitter.removeListener((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleLaunchButtonClick);
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
          value: this.state.pathsDropdownIndex
        })
      ),
      _react.default.createElement(
        'label',
        null,
        'Command: '
      ),
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: 'scriptPath',
        tabIndex: '11',
        placeholderText: '/path/to/my/script.php arg1 arg2',
        initialValue: this._getActiveFilePath()
      }),
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
            onClick: this._handleLaunchButtonClick },
          'Launch'
        )
      )
    );
  }

  _getPathMenuItems() {
    const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri);
    const connections = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getByHostname(hostname);
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
      pathsDropdownIndex: newIndex,
      pathMenuItems: this._getPathMenuItems()
    });
  }

  _handleLaunchButtonClick() {
    const scriptPath = this.refs.scriptPath.getText().trim();
    const processInfo = new (_LaunchProcessInfo || _load_LaunchProcessInfo()).LaunchProcessInfo(this.props.targetUri, scriptPath);
    (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote').then(debuggerService => debuggerService.startDebugging(processInfo));
    this._showDebuggerPanel();
    this._handleCancelButtonClick();
  }

  _getActiveFilePath() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor != null) {
      const fileUri = editor.getPath();
      if (fileUri != null && this._isValidScriptUri(fileUri)) {
        return (_nuclideUri || _load_nuclideUri()).default.getPath(fileUri);
      }
    }
    return '';
  }

  _isValidScriptUri(uri) {
    if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(uri)) {
      return false;
    }
    const scriptPath = (_nuclideUri || _load_nuclideUri()).default.getPath(uri);
    return scriptPath.endsWith('.php') || scriptPath.endsWith('.hh');
  }

  _showDebuggerPanel() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  }

  _handleCancelButtonClick() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
  }
}
exports.LaunchUiComponent = LaunchUiComponent; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                */