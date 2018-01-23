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
  if (activeEditor == null || !activeEditor.getPath() || !(0, (_nullthrows || _load_nullthrows()).default)(activeEditor.getPath()).endsWith('.py')) {
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

class PythonScriptLaunchUiComponent extends _react.Component {

  constructor(props) {
    var _this;

    _this = super(props);
    this._handleLaunchButtonClick = (0, _asyncToGenerator.default)(function* () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-python-debugger-launch-from-dialog');
      const pythonPath = (0, (_nullthrows || _load_nullthrows()).default)(_this._pythonPath).getText().trim();
      const scriptPath = (0, (_nullthrows || _load_nullthrows()).default)(_this._scriptPath).getText().trim();
      const args = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(_this._args).getText());
      const workingDirectory = (0, (_nullthrows || _load_nullthrows()).default)(_this._workingDirectory).getText().trim();
      const environmentVariables = {};
      (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(_this._environmentVariables).getText()).forEach(function (variable) {
        const [key, value] = variable.split('=');
        environmentVariables[key] = value;
      });

      const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parse(_this.props.targetUri);
      const scriptUri = hostname != null ? (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, scriptPath) : scriptPath;

      const launchInfo = yield (0, (_utils || _load_utils()).getPythonScriptLaunchProcessInfo)(scriptUri, pythonPath, args, workingDirectory, environmentVariables);

      const debuggerService = yield (0, (_utils || _load_utils()).getDebuggerService)();
      debuggerService.startDebugging(launchInfo);

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {
        pythonPath: _this.state.pythonPath,
        scriptPath: _this.state.scriptPath,
        args: _this.state.args,
        environmentVariables: _this.state.environmentVariables,
        workingDirectory: _this.state.workingDirectory
      });
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      scriptPath: '',
      pythonPath: '',
      args: '',
      environmentVariables: '',
      workingDirectory: ''
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'launch', 'python'];
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
        pythonPath: savedSettings.pythonPath || '',
        args: savedSettings.args || '',
        environmentVariables: savedSettings.environmentVariables || '',
        workingDirectory
      });
    });

    if (this._scriptPath != null) {
      this._scriptPath.focus();
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
    const { scriptPath, pythonPath } = this.state;
    return scriptPath.length > 0 && pythonPath.length > 0;
  }

  render() {
    const nuclidePythonDebuggerDexUri = 'https://our.intern.facebook.com/intern/dex/python-and-fbcode/debugging/#nuclide';
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'p',
        null,
        'This is intended to debug python script files.',
        _react.createElement('br', null),
        'To debug buck targets, you should',
        ' ',
        _react.createElement(
          'a',
          { href: nuclidePythonDebuggerDexUri },
          'use the buck toolbar instead'
        ),
        '.'
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
        tabIndex: '12',
        placeholderText: 'Input the script path you want to launch',
        value: this.state.scriptPath,
        onDidChange: value => this.setState({ scriptPath: value })
      }),
      _react.createElement(
        'label',
        null,
        'Python Path: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._pythonPath = input;
        },
        tabIndex: '11',
        placeholderText: 'Input python executable path (e.g. /usr/bin/python)',
        value: this.state.pythonPath,
        onDidChange: value => this.setState({ pythonPath: value })
      }),
      _react.createElement(
        'label',
        null,
        'Arguments: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._args = input;
        },
        tabIndex: '13',
        placeholderText: 'Arguments to the executable',
        value: this.state.args,
        onDidChange: value => this.setState({ args: value })
      }),
      _react.createElement(
        'label',
        null,
        'Environment Variables: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._environmentVariables = input;
        },
        tabIndex: '14',
        placeholderText: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
        value: this.state.environmentVariables,
        onDidChange: value => this.setState({ environmentVariables: value })
      }),
      _react.createElement(
        'label',
        null,
        'Working directory: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._workingDirectory = input;
        },
        tabIndex: '15',
        placeholderText: 'Working directory for the launched executable',
        value: this.state.workingDirectory,
        onDidChange: value => this.setState({ workingDirectory: value })
      })
    );
  }

}
exports.default = PythonScriptLaunchUiComponent;