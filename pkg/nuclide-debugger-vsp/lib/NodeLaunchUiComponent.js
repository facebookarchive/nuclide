'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getActiveScriptPath() {
  const center = atom.workspace.getCenter ? atom.workspace.getCenter() : atom.workspace;
  const activeEditor = center.getActiveTextEditor();
  if (activeEditor == null || !activeEditor.getPath() || !(0, (_nullthrows || _load_nullthrows()).default)(activeEditor.getPath()).endsWith('.js')) {
    return '';
  }
  return (_nuclideUri || _load_nuclideUri()).default.getPath((0, (_nullthrows || _load_nullthrows()).default)(activeEditor.getPath()));
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

class NodeScriptLaunchUiComponent extends _react.Component {

  constructor(props) {
    var _this;

    _this = super(props);
    this._handleLaunchButtonClick = (0, _asyncToGenerator.default)(function* () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-node-debugger-launch-from-dialog');
      const nodePath = (0, (_nullthrows || _load_nullthrows()).default)(_this._nodePath).getText().trim();
      const scriptPath = (0, (_nullthrows || _load_nullthrows()).default)(_this._scriptPath).getText().trim();
      const args = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(_this._args).getText());
      const workingDirectory = (0, (_nullthrows || _load_nullthrows()).default)(_this._workingDirectory).getText().trim();
      const outFiles = (0, (_nullthrows || _load_nullthrows()).default)(_this._outFiles).getText().trim();
      const environmentVariables = {};
      (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(_this._environmentVariables).getText()).forEach(function (variable) {
        const [key, value] = variable.split('=');
        environmentVariables[key] = value;
      });

      const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parse(_this.props.targetUri);
      const scriptUri = hostname != null ? (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, scriptPath) : scriptPath;

      const launchInfo = yield (0, (_utils || _load_utils()).getNodeLaunchProcessInfo)(scriptUri, nodePath, args, workingDirectory, environmentVariables, outFiles);

      const debuggerService = yield (0, (_utils || _load_utils()).getDebuggerService)();
      debuggerService.startDebugging(launchInfo);

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {
        nodePath: _this.state.nodePath,
        scriptPath: _this.state.scriptPath,
        args: _this.state.args,
        environmentVariables: _this.state.environmentVariables,
        workingDirectory: _this.state.workingDirectory,
        outFiles: _this.state.outFiles
      });
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      scriptPath: '',
      nodePath: '',
      args: '',
      environmentVariables: '',
      workingDirectory: '',
      outFiles: ''
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'launch', 'node'];
  }

  setState(newState) {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  componentDidMount() {
    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      const scriptPath = savedSettings.scriptPath || getActiveScriptPath();
      const workingDirectory = savedSettings.workingDirectory || (scriptPath.length > 0 ? (_nuclideUri || _load_nuclideUri()).default.dirname(scriptPath) : '');
      this.setState({
        scriptPath,
        nodePath: savedSettings.nodePath || '',
        args: savedSettings.args || '',
        environmentVariables: savedSettings.environmentVariables || '',
        workingDirectory,
        outFiles: savedSettings.outFiles || ''
      });
    });

    const scriptPathInput = this._scriptPath;
    if (scriptPathInput != null) {
      scriptPathInput.focus();
    }

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

  _debugButtonShouldEnable() {
    const { scriptPath } = this.state;
    return scriptPath.length > 0;
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'p',
        null,
        'This is intended to debug node.js files (for node version 6.3+).'
      ),
      _react.createElement(
        'label',
        null,
        'Script Path: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._scriptPath = input;
        },
        tabIndex: '1',
        placeholderText: 'Input the script path you want to launch',
        value: this.state.scriptPath,
        onDidChange: value => this.setState({ scriptPath: value })
      }),
      _react.createElement(
        'label',
        null,
        '(Optional) Node Runtime Path: '
      ),
      _react.createElement(
        'p',
        null,
        'Will use Nuclide\'s node version if not provided.'
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._nodePath = input;
        },
        tabIndex: '2',
        placeholderText: 'Node executable path (e.g. /usr/local/bin/node)',
        value: this.state.nodePath,
        onDidChange: value => this.setState({ nodePath: value })
      }),
      _react.createElement(
        'label',
        null,
        '(Optional) Arguments: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._args = input;
        },
        tabIndex: '3',
        placeholderText: 'Arguments to the executable',
        value: this.state.args,
        onDidChange: value => this.setState({ args: value })
      }),
      _react.createElement(
        'label',
        null,
        '(Optional) Environment Variables: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._environmentVariables = input;
        },
        tabIndex: '4',
        placeholderText: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
        value: this.state.environmentVariables,
        onDidChange: value => this.setState({ environmentVariables: value })
      }),
      _react.createElement(
        'label',
        null,
        '(Optional) Working directory: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._workingDirectory = input;
        },
        tabIndex: '5',
        placeholderText: 'Working directory for the launched executable',
        value: this.state.workingDirectory,
        onDidChange: value => this.setState({ workingDirectory: value })
      }),
      _react.createElement(
        'label',
        null,
        '(Optional) source maps output files: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._outFiles = input;
        },
        tabIndex: '6',
        placeholderText: 'Output files pattern (e.g. $projectRoot/out/**/*.js)',
        value: this.state.outFiles,
        onDidChange: value => this.setState({ outFiles: value })
      })
    );
  }

}
exports.default = NodeScriptLaunchUiComponent;