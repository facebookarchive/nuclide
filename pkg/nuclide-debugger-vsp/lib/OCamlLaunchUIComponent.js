'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OCamlLaunchUIComponent = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _react = _interopRequireDefault(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _vscodeDebugadapter;

function _load_vscodeDebugadapter() {
  return _vscodeDebugadapter = require('vscode-debugadapter');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
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
 * @format
 */

class OCamlLaunchUIComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      ocamldebugExecutable: '',
      launchExecutable: '',
      launchArguments: '',
      environmentVariables: '',
      workingDirectory: '',
      additionalIncludeDirectories: '',
      breakAfterStart: false
    };
    this._handleLaunchClick = this._handleLaunchClick.bind(this);
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'launch', 'OCaml'];
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(state) {
    super.setState(state);
    // const canLaunch = this.state.launchExecutable.trim().length > 0;
    // this.props.configIsValidChanged(canLaunch);
    this.props.configIsValidChanged(true);
  }

  componentDidMount() {
    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState({
        ocamldebugExecutable: savedSettings.ocamldebugExecutable || '',
        launchExecutable: savedSettings.launchExecutable || '',
        launchArguments: savedSettings.launchArguments || '',
        environmentVariables: savedSettings.environmentVariables || '',
        workingDirectory: savedSettings.workingDirectory || '',
        additionalIncludeDirectories: savedSettings.additionalIncludeDirectories || '',
        breakAfterStart: savedSettings.breakAfterStart || false
      });
    });
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        this._handleLaunchClick();
      }
    }));
  }

  render() {
    return _react.default.createElement(
      'div',
      { className: 'block' },
      _react.default.createElement(
        'label',
        null,
        'Ocamldebug executable: '
      ),
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '11',
        placeholderText: 'Path to ocamldebug',
        value: this.state.ocamldebugExecutable,
        onDidChange: value => this.setState({ ocamldebugExecutable: value })
      }),
      _react.default.createElement(
        'label',
        null,
        'Executable: '
      ),
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '12',
        placeholderText: 'Input the executable path you want to launch',
        value: this.state.launchExecutable,
        onDidChange: value => this.setState({ launchExecutable: value })
      }),
      _react.default.createElement(
        'label',
        null,
        'Arguments: '
      ),
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '13',
        placeholderText: 'Arguments to the executable',
        value: this.state.launchArguments,
        onDidChange: value => this.setState({ launchArguments: value })
      }),
      _react.default.createElement(
        'label',
        null,
        'Environment Variables: '
      ),
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '14',
        placeholderText: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
        value: this.state.environmentVariables,
        onDidChange: value => this.setState({ environmentVariables: value })
      }),
      _react.default.createElement(
        'label',
        null,
        'Working directory: '
      ),
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '15',
        placeholderText: 'Working directory for the launched executable',
        value: this.state.workingDirectory,
        onDidChange: value => this.setState({ workingDirectory: value })
      }),
      _react.default.createElement(
        'label',
        null,
        'Additional include directories: '
      ),
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '16',
        placeholderText: 'Additional include directories that debugger will use to search for source code',
        value: this.state.additionalIncludeDirectories,
        onDidChange: value => this.setState({ additionalIncludeDirectories: value })
      }),
      _react.default.createElement(
        'label',
        null,
        'Break after start: '
      ),
      _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        tabIndex: '16',
        checked: this.state.breakAfterStart,
        onChange: value => this.setState({ breakAfterStart: value })
      })
    );
  }

  _handleLaunchClick() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      // TODO: perform some validation for the input.
      const launchExecutable = _this._expandIfLocal(_this.state.launchExecutable.trim());
      const ocamldebugExecutable = _this._expandIfLocal(_this.state.ocamldebugExecutable.trim());
      const launchArguments = (0, (_string || _load_string()).shellParse)(_this.state.launchArguments);
      const launchEnvironmentVariables = (0, (_string || _load_string()).shellParse)(_this.state.environmentVariables);
      const launchWorkingDirectory = _this._expandIfLocal(_this.state.workingDirectory.trim());
      const additionalIncludeDirectories = (0, (_string || _load_string()).shellParse)(_this.state.additionalIncludeDirectories);
      const launchTarget = {
        ocamldebugExecutable,
        executablePath: launchExecutable,
        arguments: launchArguments,
        environmentVariables: launchEnvironmentVariables,
        workingDirectory: launchWorkingDirectory,
        includeDirectories: additionalIncludeDirectories,
        breakAfterStart: _this.state.breakAfterStart,
        targetUri: _this.props.targetUri,
        logLevel: (_vscodeDebugadapter || _load_vscodeDebugadapter()).Logger.LogLevel.Verbose // TODO: read from configuration
      };

      const debuggerService = yield (0, (_utils || _load_utils()).getDebuggerService)();
      const launchProcessInfo = yield (0, (_utils || _load_utils()).getOCamlLaunchProcessInfo)(_this.props.targetUri, launchTarget);
      debuggerService.startDebugging(launchProcessInfo);
      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), _this.state);
    })();
  }

  _expandIfLocal(path) {
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri)) {
      // TODO: support expansion for remote paths.
      return path;
    }

    return (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(path);
  }
}
exports.OCamlLaunchUIComponent = OCamlLaunchUIComponent;