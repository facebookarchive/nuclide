"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchUiComponent = void 0;

var React = _interopRequireWildcard(require("react"));

function _AtomInput() {
  const data = require("../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _debugger() {
  const data = require("../../../modules/nuclide-commons-atom/debugger");

  _debugger = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("../../../modules/nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideDebuggerCommon() {
  const data = require("../../../modules/nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("../../../modules/nuclide-commons-ui/Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

class LaunchUiComponent extends React.Component {
  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable().default)();

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
          return _nuclideUri().default.getPath(fileUri);
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
    return [_nuclideUri().default.isRemote(this.props.targetUri) ? _nuclideUri().default.getHostname(this.props.targetUri) : 'local', 'launch', 'php'];
  }

  componentDidMount() {
    (0, _nuclideDebuggerCommon().deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
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
    return React.createElement("div", {
      className: "block"
    }, React.createElement("label", null, "Recently launched commands: "), React.createElement(_Dropdown().Dropdown, {
      className: "inline-block debugger-recently-launched",
      options: [{
        label: '',
        value: null
      }, ...this.state.recentlyLaunchedScripts],
      onChange: this._handleRecentSelectionChange,
      value: this.state.recentlyLaunchedScript
    }), React.createElement("label", null, "Script path: "), React.createElement(_AtomInput().AtomInput, {
      ref: input => {
        this._scriptPath = input;
      },
      tabIndex: "11",
      placeholderText: "/path/to/my/script.php arg1 arg2",
      initialValue: this._getActiveFilePath(),
      value: this.state.recentlyLaunchedScript || '',
      onDidChange: value => this.setState({
        recentlyLaunchedScript: value
      })
    }), React.createElement("label", null, "Script arguments: "), React.createElement(_AtomInput().AtomInput, {
      ref: input => {
        this._scriptArgs = input;
      },
      tabIndex: "12",
      value: this.state.scriptArgs || '',
      onDidChange: value => this.setState({
        scriptArgs: value
      })
    }), React.createElement("label", null, "Current Working Directory: "), React.createElement(_AtomInput().AtomInput, {
      tabIndex: "13",
      ref: input => {
        this._cwdPath = input;
      },
      placeholderText: "Optional. Working directory to launch script in.",
      initialValue: "",
      value: this.state.cwd || '',
      onDidChange: value => this.setState({
        cwd: value
      })
    }), React.createElement(_Checkbox().Checkbox, {
      checked: this.state.runInTerminal,
      label: "Run in Terminal",
      onChange: checked => this.setState({
        runInTerminal: checked
      }),
      title: "When checked, the target script's STDIN and STDOUT will be redirected to a new Nuclide Terminal pane"
    }));
  }

  _getRecentlyLaunchedKey() {
    const hostname = _nuclideUri().default.getHostname(this.props.targetUri);

    return 'debugger-php.recentlyLaunchedScripts:' + hostname;
  }

  _getCwdKey() {
    const hostname = _nuclideUri().default.getHostname(this.props.targetUri);

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
    const hostname = _nuclideUri().default.getHostname(this.props.targetUri);

    const connections = _nuclideRemoteConnection().RemoteConnection.getByHostname(hostname);

    return connections.map((connection, index) => {
      const pathToProject = connection.getPath();
      return {
        label: pathToProject,
        value: index
      };
    });
  }

  async _handleLaunchButtonClick() {
    const scriptPath = (0, _nullthrows().default)(this._scriptPath).getText().trim();
    const cwdPath = (0, _nullthrows().default)(this._cwdPath).getText().trim();
    const scriptArgs = (0, _nullthrows().default)(this._scriptArgs).getText().trim();

    this._setRecentlyLaunchedScript(scriptPath, this.state.recentlyLaunchedScripts, cwdPath);

    const processConfig = this.props.getLaunchProcessConfig(this.props.targetUri, scriptPath, scriptArgs, null, this.state.runInTerminal, cwdPath);
    const debuggerService = await (0, _debugger().getDebuggerService)();
    debuggerService.startVspDebugging(processConfig);
    (0, _nuclideDebuggerCommon().serializeDebuggerConfig)(...this._getSerializationArgs(), {
      scriptPath,
      scriptArgs,
      cwdPath
    });
  }

  _isValidScriptUri(uri) {
    if (!_nuclideUri().default.isRemote(uri)) {
      return false;
    }

    const scriptPath = _nuclideUri().default.getPath(uri);

    return scriptPath.endsWith('.php') || scriptPath.endsWith('.hh');
  }

}

exports.LaunchUiComponent = LaunchUiComponent;