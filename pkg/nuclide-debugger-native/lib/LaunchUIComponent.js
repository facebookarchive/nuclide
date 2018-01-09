'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchUIComponent = undefined;

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
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

class LaunchUIComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._handleLaunchClick = () => {
      // TODO: perform some validation for the input.
      const launchExecutable = (0, (_nullthrows || _load_nullthrows()).default)(this._launchExecutable).getText().trim();
      const coreDump = (0, (_nullthrows || _load_nullthrows()).default)(this._coreDump).getText().trim();
      const launchArguments = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(this._launchArguments).getText());
      const launchEnvironmentVariables = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(this._launchEnvironmentVariables).getText());
      const launchWorkingDirectory = (0, (_nullthrows || _load_nullthrows()).default)(this._launchWorkingDirectory).getText().trim();
      const launchSourcePath = (0, (_nullthrows || _load_nullthrows()).default)(this._launchSourcePath).getText().trim();
      const stdinFilePath = (0, (_nullthrows || _load_nullthrows()).default)(this._stdinFilePath).getText().trim();
      const launchTarget = {
        executablePath: launchExecutable,
        arguments: launchArguments,
        environmentVariables: launchEnvironmentVariables,
        workingDirectory: launchWorkingDirectory,
        stdinFilePath,
        coreDump
      };
      if (launchSourcePath != null) {
        launchTarget.basepath = launchSourcePath;
      }
      // Fire and forget.
      this.props.actions.launchDebugger(launchTarget);

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(...this._getSerializationArgs(), {
        launchExecutable: this.state.launchExecutable,
        launchArguments: this.state.launchArguments,
        launchEnvironmentVariables: this.state.launchEnvironmentVariables,
        launchWorkingDirectory: this.state.launchWorkingDirectory,
        stdinFilePath: this.state.stdinFilePath,
        coreDump: this.state.coreDump,
        launchSourcePath: this.state.launchSourcePath
      });
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      launchExecutable: '',
      launchArguments: '',
      launchEnvironmentVariables: '',
      launchWorkingDirectory: '',
      stdinFilePath: '',
      coreDump: '',
      launchSourcePath: ''
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
    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState({
        launchExecutable: savedSettings.launchExecutable,
        launchArguments: savedSettings.launchArguments,
        launchEnvironmentVariables: savedSettings.launchEnvironmentVariables,
        launchWorkingDirectory: savedSettings.launchWorkingDirectory,
        stdinFilePath: savedSettings.stdinFilePath,
        coreDump: savedSettings.coreDump || '',
        launchSourcePath: savedSettings.launchSourcePath || ''
      });
    });

    if (this._launchExecutable != null) {
      this._launchExecutable.focus();
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
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'label',
        null,
        'Executable: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._launchExecutable = input;
        },
        tabIndex: '11',
        placeholderText: 'Input the executable path you want to launch',
        value: this.state.launchExecutable,
        onDidChange: value => this.setState({ launchExecutable: value })
      }),
      _react.createElement(
        'label',
        null,
        'Core dump file: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._coreDump = input;
        },
        tabIndex: '12',
        placeholderText: 'Optional path to a core dump file to offline debug a crash',
        value: this.state.coreDump,
        onDidChange: value => this.setState({ coreDump: value })
      }),
      _react.createElement(
        'div',
        { className: 'nuclide-native-launch-small-text' },
        'Be sure to copy the core dump to a location where Nuclide has read access. (Nuclide server does not run as root).'
      ),
      _react.createElement(
        'div',
        {
          className: (0, (_classnames || _load_classnames()).default)({
            'nuclide-native-launch-disabled': this.state.coreDump !== ''
          }) },
        _react.createElement(
          'label',
          null,
          'Arguments: '
        ),
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          ref: input => {
            this._launchArguments = input;
          },
          tabIndex: '13',
          disabled: this.state.coreDump !== '',
          placeholderText: 'Arguments to the executable',
          value: this.state.launchArguments,
          onDidChange: value => this.setState({ launchArguments: value })
        }),
        _react.createElement(
          'label',
          null,
          'Environment Variables: '
        ),
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          ref: input => {
            this._launchEnvironmentVariables = input;
          },
          tabIndex: '14',
          disabled: this.state.coreDump !== '',
          placeholderText: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
          value: this.state.launchEnvironmentVariables,
          onDidChange: value => this.setState({ launchEnvironmentVariables: value })
        }),
        _react.createElement(
          'label',
          null,
          'Source path: '
        ),
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          ref: input => {
            this._launchSourcePath = input;
          },
          tabIndex: '16',
          placeholderText: 'Optional base path for sources',
          value: this.state.launchSourcePath,
          onDidChange: value => this.setState({ launchSourcePath: value })
        }),
        _react.createElement(
          'label',
          null,
          'Working directory: '
        ),
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          ref: input => {
            this._launchWorkingDirectory = input;
          },
          tabIndex: '17',
          disabled: this.state.coreDump !== '',
          placeholderText: 'Working directory for the launched executable',
          value: this.state.launchWorkingDirectory,
          onDidChange: value => this.setState({ launchWorkingDirectory: value })
        }),
        _react.createElement(
          'label',
          null,
          'Stdin file: '
        ),
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          ref: input => {
            this._stdinFilePath = input;
          },
          tabIndex: '18',
          disabled: this.state.coreDump !== '',
          placeholderText: 'Redirect stdin to this file',
          value: this.state.stdinFilePath,
          onDidChange: value => this.setState({ stdinFilePath: value })
        })
      )
    );
  }

}
exports.LaunchUIComponent = LaunchUIComponent;