'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchUIComponent = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _react = _interopRequireWildcard(require('react'));

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

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _JavaDebuggerServiceHelpers;

function _load_JavaDebuggerServiceHelpers() {
  return _JavaDebuggerServiceHelpers = require('./JavaDebuggerServiceHelpers');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LaunchUIComponent extends _react.Component {

  constructor(props) {
    var _this;

    _this = super(props);

    this._debugButtonShouldEnable = () => {
      return this.state.launchCommandLine.trim() !== '';
    };

    this._handleLaunchClick = (0, _asyncToGenerator.default)(function* () {
      // TODO: perform some validation for the input.
      const commandLine = _this.state.launchCommandLine.trim();
      const classPath = _this.state.classPath.trim();

      yield (0, (_JavaDebuggerServiceHelpers || _load_JavaDebuggerServiceHelpers()).debugJavaDebuggerService)(_this.props.targetUri, {
        debugMode: 'launch',
        commandLine,
        classPath
      });

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {
        launchCommandLine: _this.state.launchCommandLine,
        classPath: _this.state.classPath
      });
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      launchCommandLine: '',
      classPath: ''
    };
  }

  _getSerializationArgs() {
    return [(_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.targetUri) : 'local', 'launch', 'Java'];
  }

  componentDidMount() {
    var _this2 = this;

    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState({
        launchCommandLine: savedSettings.launchCommandLine || '',
        classPath: savedSettings.classPath || ''
      });
    });

    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': (() => {
        var _ref2 = (0, _asyncToGenerator.default)(function* () {
          if (_this2._debugButtonShouldEnable()) {
            yield _this2._handleLaunchClick();
          }
        });

        return function coreConfirm() {
          return _ref2.apply(this, arguments);
        };
      })()
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState) {
    super.setState(newState, () => this.props.configIsValidChanged(this._debugButtonShouldEnable()));
  }

  render() {
    // TODO: smart fill the working directory textbox.
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'label',
        null,
        'Entry Point Class: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Input the Java entry point name you want to launch',
        value: this.state.launchCommandLine,
        onDidChange: value => this.setState({ launchCommandLine: value }),
        autofocus: true
      }),
      _react.createElement(
        'label',
        null,
        'Class Path: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Java class path',
        value: this.state.classPath,
        onDidChange: value => this.setState({ classPath: value })
      })
    );
  }

}
exports.LaunchUIComponent = LaunchUIComponent; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */