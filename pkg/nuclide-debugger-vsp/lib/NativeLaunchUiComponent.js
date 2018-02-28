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

var _debugger;

function _load_debugger() {
  return _debugger = require('../../commons-atom/debugger');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class NativeLaunchUiComponent extends _react.Component {

  constructor(props) {
    var _this;

    _this = super(props);
    this._handleLaunchButtonClick = (0, _asyncToGenerator.default)(function* () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-gdb-debugger-launch-from-dialog');
      const program = (0, (_nullthrows || _load_nullthrows()).default)(_this._program).getText().trim();
      const args = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(_this._args).getText());
      const workingDirectory = (0, (_nullthrows || _load_nullthrows()).default)(_this._workingDirectory).getText().trim();

      const environmentVariables = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(_this._environmentVariables).getText());

      // NB this is an object, not a map, because Map doesn't seem to be
      // expressable in the VSP package.json type system
      let environment = {};
      environmentVariables.forEach(function (_) {
        const equal = _.indexOf('=');
        if (equal === -1) {
          throw new Error('Given environment is malformed.');
        }
        const key = _.substr(0, equal);
        const value = _.substr(equal + 1);
        environment = Object.assign({}, environment, {
          [key]: value
        });
      });

      const { hostname } = (_nuclideUri || _load_nuclideUri()).default.parse(_this.props.targetUri);
      const programUri = hostname != null ? (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, program) : program;

      const launchInfo = yield (0, (_utils || _load_utils()).getGdbLaunchProcessInfo)(programUri, args, workingDirectory, environment, _this.state.sourcePath);

      const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
      debuggerService.startDebugging(launchInfo);

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {
        program: _this.state.program,
        args: _this.state.args,
        workingDirectory: _this.state.workingDirectory,
        environmentVariables: _this.state.environmentVariables,
        sourcePath: _this.state.sourcePath
      });
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      program: '',
      args: '',
      workingDirectory: '',
      environmentVariables: '',
      sourcePath: ''
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'launch', 'gdb'];
  }

  setState(newState) {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  componentDidMount() {
    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      const program = savedSettings.program || '';
      const workingDirectory = savedSettings.workingDirectory || (program.length > 0 ? (_nuclideUri || _load_nuclideUri()).default.dirname(program) : '');
      const environmentVariables = savedSettings.environmentVariables || '';
      const sourcePath = savedSettings.sourcePath || '';
      this.setState({
        program,
        args: savedSettings.args || '',
        workingDirectory,
        environmentVariables,
        sourcePath
      });
    });

    if (this._program != null) {
      this._program.focus();
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
    return true;
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'p',
        null,
        'This is intended to debug native programs with gdb.'
      ),
      _react.createElement(
        'label',
        null,
        'Executable: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._program = input;
        },
        tabIndex: '1',
        placeholderText: 'Input the program you want to launch',
        value: this.state.program,
        onDidChange: value => this.setState({ program: value })
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
        tabIndex: '3',
        placeholderText: 'Arguments to the program (optional)',
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
        tabIndex: '3',
        placeholderText: 'Environment variables (.e.g, SHELL=/bin/bash PATH=/bin) (optional)',
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
        tabIndex: '5',
        placeholderText: 'Working directory for the launched program (optional)',
        value: this.state.workingDirectory,
        onDidChange: value => this.setState({ workingDirectory: value })
      }),
      _react.createElement(
        'label',
        null,
        'Source path: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Optional base path for sources',
        value: this.state.sourcePath,
        onDidChange: value => this.setState({ sourcePath: value })
      })
    );
  }

}
exports.default = NativeLaunchUiComponent;