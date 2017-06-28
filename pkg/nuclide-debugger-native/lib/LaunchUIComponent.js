'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchUIComponent = undefined;

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _react = _interopRequireDefault(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
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

class LaunchUIComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleLaunchClick = this._handleLaunchClick.bind(this);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      launchExecutable: '',
      launchArguments: '',
      launchEnvironmentVariables: '',
      launchWorkingDirectory: '',
      stdinFilePath: ''
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'launch', 'native'];
  }

  setState(newState) {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  _debugButtonShouldEnable() {
    return true;
  }

  componentDidMount() {
    (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState({
        launchExecutable: savedSettings.launchExecutable,
        launchArguments: savedSettings.launchArguments,
        launchEnvironmentVariables: savedSettings.launchEnvironmentVariables,
        launchWorkingDirectory: savedSettings.launchWorkingDirectory,
        stdinFilePath: savedSettings.stdinFilePath
      });
    });

    const launchExecutableInput = this.refs.launchExecutable;
    if (launchExecutableInput != null) {
      launchExecutableInput.focus();
    }

    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        this._handleLaunchClick();
      }
    }));

    this.props.configIsValidChanged(true);
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    // TODO: smart fill the working directory textbox.
    // TODO: make tab stop between textbox work.
    // Reserve tabIndex [1~10] to header portion of the UI so we start from "11" here.
    return _react.default.createElement(
      'div',
      { className: 'block' },
      _react.default.createElement(
        'label',
        null,
        'Executable: '
      ),
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: 'launchExecutable',
        tabIndex: '11',
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
        ref: 'launchArguments',
        tabIndex: '12',
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
        ref: 'launchEnvironmentVariables',
        tabIndex: '13',
        placeholderText: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
        value: this.state.launchEnvironmentVariables,
        onDidChange: value => this.setState({ launchEnvironmentVariables: value })
      }),
      _react.default.createElement(
        'label',
        null,
        'Working directory: '
      ),
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: 'launchWorkingDirectory',
        tabIndex: '14',
        placeholderText: 'Working directory for the launched executable',
        value: this.state.launchWorkingDirectory,
        onDidChange: value => this.setState({ launchWorkingDirectory: value })
      }),
      _react.default.createElement(
        'label',
        null,
        'Stdin file: '
      ),
      _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: 'stdinFilePath',
        tabIndex: '15',
        placeholderText: 'Redirect stdin to this file',
        value: this.state.stdinFilePath,
        onDidChange: value => this.setState({ stdinFilePath: value })
      })
    );
  }

  _handleLaunchClick() {
    // TODO: perform some validation for the input.
    const launchExecutable = this.refs.launchExecutable.getText().trim();
    const launchArguments = (0, (_string || _load_string()).shellParse)(this.refs.launchArguments.getText());
    const launchEnvironmentVariables = (0, (_string || _load_string()).shellParse)(this.refs.launchEnvironmentVariables.getText());
    const launchWorkingDirectory = this.refs.launchWorkingDirectory.getText().trim();
    const stdinFilePath = this.refs.stdinFilePath.getText().trim();
    const launchTarget = {
      executablePath: launchExecutable,
      arguments: launchArguments,
      environmentVariables: launchEnvironmentVariables,
      workingDirectory: launchWorkingDirectory,
      stdinFilePath
    };
    // Fire and forget.
    this.props.actions.launchDebugger(launchTarget);

    (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).serializeDebuggerConfig)(...this._getSerializationArgs(), {
      launchExecutable: this.state.launchExecutable,
      launchArguments: this.state.launchArguments,
      launchEnvironmentVariables: this.state.launchEnvironmentVariables,
      launchWorkingDirectory: this.state.launchWorkingDirectory,
      stdinFilePath: this.state.stdinFilePath
    });
  }
}
exports.LaunchUIComponent = LaunchUIComponent;