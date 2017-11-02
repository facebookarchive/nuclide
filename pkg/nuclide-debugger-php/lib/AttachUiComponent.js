'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachUiComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _AttachProcessInfo;

function _load_AttachProcessInfo() {
  return _AttachProcessInfo = require('./AttachProcessInfo');
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
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class AttachUiComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._handlePathsDropdownChange = newIndex => {
      this.setState({
        selectedPathIndex: newIndex,
        pathMenuItems: this._getPathMenuItems()
      });
    };

    this._handleAttachButtonClick = () => {
      // Start a debug session with the user-supplied information.
      const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parseRemoteUri(this.props.targetUri);
      const selectedPath = this.state.pathMenuItems[this.state.selectedPathIndex].label;
      const processInfo = new (_AttachProcessInfo || _load_AttachProcessInfo()).AttachProcessInfo((_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, selectedPath));
      (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote').then(debuggerService => debuggerService.startDebugging(processInfo));

      (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).serializeDebuggerConfig)(...this._getSerializationArgs(), {
        selectedPath
      });
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      selectedPathIndex: 0,
      pathMenuItems: this._getPathMenuItems()
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'attach', 'php'];
  }

  componentDidMount() {
    (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      const savedPath = this.state.pathMenuItems.find(item => item.label === savedSettings.selectedPath);
      if (savedPath != null) {
        this.setState({
          selectedPathIndex: this.state.pathMenuItems.indexOf(savedPath)
        });
      }
    });

    this.props.configIsValidChanged(this._debugButtonShouldEnable());
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this._debugButtonShouldEnable()) {
          this._handleAttachButtonClick();
        }
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState) {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  _debugButtonShouldEnable() {
    return true;
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'div',
        { className: 'nuclide-debugger-php-launch-attach-ui-select-project' },
        _react.createElement(
          'label',
          null,
          'Selected Project Directory: '
        ),
        _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          className: 'inline-block nuclide-debugger-connection-box',
          options: this.state.pathMenuItems,
          onChange: this._handlePathsDropdownChange,
          value: this.state.selectedPathIndex
        })
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

}
exports.AttachUiComponent = AttachUiComponent;