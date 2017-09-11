'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchUiComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _LaunchProcessInfo;

function _load_LaunchProcessInfo() {
  return _LaunchProcessInfo = require('./LaunchProcessInfo');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
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

const MAX_RECENTLY_LAUNCHED = 5; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */

/* global localStorage */

class LaunchUiComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._handleRecentSelectionChange = newValue => {
      this.setState({
        recentlyLaunchedScript: newValue
      });
    };

    this._handleLaunchButtonClick = () => {
      const scriptPath = this.refs.scriptPath.getText().trim();
      this._setRecentlyLaunchedScript(scriptPath, this.state.recentlyLaunchedScripts);

      const processInfo = new (_LaunchProcessInfo || _load_LaunchProcessInfo()).LaunchProcessInfo(this.props.targetUri, scriptPath);
      (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote').then(debuggerService => debuggerService.startDebugging(processInfo));

      (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).serializeDebuggerConfig)(...this._getSerializationArgs(), {
        scriptPath
      });
    };

    this._getActiveFilePath = () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        const fileUri = editor.getPath();
        if (fileUri != null && this._isValidScriptUri(fileUri)) {
          return (_nuclideUri || _load_nuclideUri()).default.getPath(fileUri);
        }
      }
      return '';
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      pathsDropdownIndex: 0,
      pathMenuItems: this._getPathMenuItems(),
      recentlyLaunchedScripts: this._getRecentlyLaunchedScripts(),
      recentlyLaunchedScript: null
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'launch', 'php'];
  }

  componentDidMount() {
    (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState({
        recentlyLaunchedScript: savedSettings.scriptPath || ''
      });
    });
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this._debugButtonShouldEnable()) {
          this._handleLaunchButtonClick();
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
    return this.state.recentlyLaunchedScript != null && this.state.recentlyLaunchedScript.trim() !== '';
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'label',
        null,
        'Recently launched commands: '
      ),
      _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        className: 'inline-block nuclide-debugger-recently-launched',
        options: [{ label: '', value: null }, ...this.state.recentlyLaunchedScripts],
        onChange: this._handleRecentSelectionChange,
        value: this.state.recentlyLaunchedScript
      }),
      _react.createElement(
        'label',
        null,
        'Command: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: 'scriptPath',
        tabIndex: '11',
        placeholderText: '/path/to/my/script.php arg1 arg2',
        initialValue: this._getActiveFilePath(),
        value: this.state.recentlyLaunchedScript || '',
        onDidChange: value => this.setState({ recentlyLaunchedScript: value })
      })
    );
  }

  _getRecentlyLaunchedKey() {
    const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri);
    return 'nuclide-debugger-php.recentlyLaunchedScripts:' + hostname;
  }

  _getRecentlyLaunchedScripts() {
    const recentlyLaunched = localStorage.getItem(this._getRecentlyLaunchedKey());
    if (recentlyLaunched == null) {
      return [];
    }

    const items = JSON.parse(String(recentlyLaunched));
    return items.filter(script => script !== '').map(script => {
      return {
        label: script,
        value: script
      };
    });
  }

  _setRecentlyLaunchedScript(script, recentlyLaunched) {
    // Act like a simple MRU cache, move the script being launched to the front.
    // NOTE: this array is expected to be really tiny.
    const scriptNames = [script];
    recentlyLaunched.forEach(item => {
      if (item.label !== script && scriptNames.length < MAX_RECENTLY_LAUNCHED) {
        scriptNames.push(item.label);
      }
    });

    localStorage.setItem(this._getRecentlyLaunchedKey(), JSON.stringify(scriptNames));
    this.setState({
      recentlyLaunchedScripts: this._getRecentlyLaunchedScripts(),
      recentlyLaunchedScript: script
    });
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

  _isValidScriptUri(uri) {
    if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(uri)) {
      return false;
    }
    const scriptPath = (_nuclideUri || _load_nuclideUri()).default.getPath(uri);
    return scriptPath.endsWith('.php') || scriptPath.endsWith('.hh');
  }
}
exports.LaunchUiComponent = LaunchUiComponent;