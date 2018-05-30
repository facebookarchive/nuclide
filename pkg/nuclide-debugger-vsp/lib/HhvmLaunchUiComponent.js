'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchUiComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../../modules/nuclide-commons-ui/AtomInput');
}

var _debugger;

function _load_debugger() {
  return _debugger = require('../../../modules/nuclide-commons-atom/debugger');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../modules/nuclide-commons-ui/Dropdown');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../../modules/nuclide-debugger-common');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../../modules/nuclide-commons-ui/Checkbox');
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

/* global localStorage */
const MAX_RECENTLY_LAUNCHED = 5;

class LaunchUiComponent extends _react.Component {

  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    this._handleRecentSelectionChange = newValue => {
      this.setState({
        recentlyLaunchedScript: newValue
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

    this._handleLaunchButtonClick = this._handleLaunchButtonClick.bind(this);

    this.state = {
      recentlyLaunchedScripts: this._getRecentlyLaunchedScripts(),
      recentlyLaunchedScript: null,
      runInTerminal: false,
      scriptArgs: null,
      cwd: this._getLastCwd()
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'launch', 'php'];
  }

  componentDidMount() {
    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState({
        recentlyLaunchedScript: savedSettings.scriptPath || '',
        cwd: savedSettings.cwdPath || '',
        scriptArgs: savedSettings.scriptArgs || ''
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
    super.setState(newState, () => this.props.configIsValidChanged(this._debugButtonShouldEnable()));
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
        className: 'inline-block debugger-recently-launched',
        options: [{ label: '', value: null }, ...this.state.recentlyLaunchedScripts],
        onChange: this._handleRecentSelectionChange,
        value: this.state.recentlyLaunchedScript
      }),
      _react.createElement(
        'label',
        null,
        'Script path: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._scriptPath = input;
        },
        tabIndex: '11',
        placeholderText: '/path/to/my/script.php arg1 arg2',
        initialValue: this._getActiveFilePath(),
        value: this.state.recentlyLaunchedScript || '',
        onDidChange: value => this.setState({ recentlyLaunchedScript: value })
      }),
      _react.createElement(
        'label',
        null,
        'Script arguments: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._scriptArgs = input;
        },
        tabIndex: '12',
        value: this.state.scriptArgs || '',
        onDidChange: value => this.setState({ scriptArgs: value })
      }),
      _react.createElement(
        'label',
        null,
        'Current Working Directory: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '13',
        ref: input => {
          this._cwdPath = input;
        },
        placeholderText: 'Optional. Working directory to launch script in.',
        initialValue: '',
        value: this.state.cwd || '',
        onDidChange: value => this.setState({ cwd: value })
      }),
      _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: this.state.runInTerminal,
        label: 'Run in Terminal',
        onChange: checked => this.setState({ runInTerminal: checked }),
        title: 'When checked, the target script\'s STDIN and STDOUT will be redirected to a new Nuclide Terminal pane'
      })
    );
  }

  _getRecentlyLaunchedKey() {
    const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri);
    return 'debugger-php.recentlyLaunchedScripts:' + hostname;
  }

  _getCwdKey() {
    const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri);
    return 'debugger-php.Cwd:' + hostname;
  }

  _getLastCwd() {
    const lastCwd = localStorage.getItem(this._getCwdKey());
    return lastCwd;
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

  _setRecentlyLaunchedScript(script, recentlyLaunched, cwd) {
    // Act like a simple MRU cache, move the script being launched to the front.
    // NOTE: this array is expected to be really tiny.
    const scriptNames = [script];
    recentlyLaunched.forEach(item => {
      if (item.label !== script && scriptNames.length < MAX_RECENTLY_LAUNCHED) {
        scriptNames.push(item.label);
      }
    });

    localStorage.setItem(this._getRecentlyLaunchedKey(), JSON.stringify(scriptNames));
    localStorage.setItem(this._getCwdKey(), cwd);
    this.setState({
      recentlyLaunchedScripts: this._getRecentlyLaunchedScripts(),
      recentlyLaunchedScript: script
    });
  }

  _getPathMenuItems() {
    const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri);
    const connections = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getByHostname(hostname);
    return connections.map((connection, index) => {
      const pathToProject = connection.getPath();
      return {
        label: pathToProject,
        value: index
      };
    });
  }

  async _handleLaunchButtonClick() {
    const scriptPath = (0, (_nullthrows || _load_nullthrows()).default)(this._scriptPath).getText().trim();
    const cwdPath = (0, (_nullthrows || _load_nullthrows()).default)(this._cwdPath).getText().trim();
    const scriptArgs = (0, (_nullthrows || _load_nullthrows()).default)(this._scriptArgs).getText().trim();

    this._setRecentlyLaunchedScript(scriptPath, this.state.recentlyLaunchedScripts, cwdPath);

    const processInfo = await this.props.getLaunchProcessInfo(this.props.targetUri, scriptPath, scriptArgs, null, this.state.runInTerminal, cwdPath);

    const debuggerService = await (0, (_debugger || _load_debugger()).getDebuggerService)();
    debuggerService.startDebugging(processInfo);

    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(...this._getSerializationArgs(), {
      scriptPath,
      scriptArgs,
      cwdPath
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