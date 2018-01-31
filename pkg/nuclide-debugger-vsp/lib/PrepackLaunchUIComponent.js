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

class PrepackScriptLaunchUiComponent extends _react.Component {

  constructor(props) {
    var _this;

    _this = super(props);
    this._handleLaunchButtonClick = (0, _asyncToGenerator.default)(function* () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-prepack-debugger-launch-from-dialog');
      const prepackPath = (0, (_nullthrows || _load_nullthrows()).default)(_this._prepackPath).getText().trim();
      const scriptPath = (0, (_nullthrows || _load_nullthrows()).default)(_this._scriptPath).getText().trim();
      const args = (0, (_string || _load_string()).shellParse)((0, (_nullthrows || _load_nullthrows()).default)(_this._args).getText());

      const scriptUri = scriptPath;

      const launchInfo = yield (0, (_utils || _load_utils()).getPrepackLaunchProcessInfo)(scriptUri, prepackPath, args);

      const debuggerService = yield (0, (_utils || _load_utils()).getDebuggerService)();
      debuggerService.startDebugging(launchInfo);

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {
        prepackPath: _this.state.prepackPath,
        scriptPath: _this.state.scriptPath,
        args: _this.state.args
      });
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      scriptPath: '',
      prepackPath: '',
      args: ''
    };
  }

  _getSerializationArgs() {
    return ['local', 'launch', 'Prepack'];
  }

  setState(newState) {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  componentDidMount() {
    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      const scriptPath = savedSettings.scriptPath || getActiveScriptPath();
      this.setState({
        scriptPath,
        prepackPath: savedSettings.prepackPath || '',
        args: savedSettings.args || ''
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
        'This is intended to debug Prepack.'
      ),
      _react.createElement(
        'label',
        null,
        'File to Prepack: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._scriptPath = input;
        },
        tabIndex: '1',
        placeholderText: 'Input the file you want to Prepack',
        value: this.state.scriptPath,
        onDidChange: value => this.setState({ scriptPath: value })
      }),
      _react.createElement(
        'label',
        null,
        '(Optional) Prepack Runtime Path: '
      ),
      _react.createElement(
        'p',
        null,
        'Will use default `prepack` command if not provided.'
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: input => {
          this._prepackPath = input;
        },
        tabIndex: '2',
        placeholderText: 'Prepack executable path (e.g. lib/prepack-cli.js)',
        value: this.state.prepackPath,
        onDidChange: value => this.setState({ prepackPath: value })
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
        placeholderText: 'Arguments to start Prepack',
        value: this.state.args,
        onDidChange: value => this.setState({ args: value })
      })
    );
  }

}
exports.default = PrepackScriptLaunchUiComponent;