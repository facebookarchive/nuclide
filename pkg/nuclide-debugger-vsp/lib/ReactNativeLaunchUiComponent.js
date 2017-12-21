'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _RadioGroup;

function _load_RadioGroup() {
  return _RadioGroup = _interopRequireDefault(require('nuclide-commons-ui/RadioGroup'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
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

class ReactNativeLaunchUiComponent extends _react.Component {

  constructor(props) {
    var _this;

    _this = super(props);

    this._debugButtonShouldEnable = () => {
      return this.state.workspacePath.trim() !== '';
    };

    this._handleLaunchClick = (0, _asyncToGenerator.default)(function* () {
      const workspace = _this.state.workspacePath.trim();
      const platform = _this.state.platform.trim().toLowerCase();
      const port = _this.state.port;

      const launchInfo = yield (0, (_utils || _load_utils()).getReactNativeLaunchProcessInfo)(workspace, port, platform);

      const debuggerService = yield (0, (_utils || _load_utils()).getDebuggerService)();
      debuggerService.startDebugging(launchInfo);

      (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {
        workspacePath: _this.state.workspacePath,
        platform: _this.state.platform,
        port: _this.state.port
      });
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      workspacePath: '',
      platform: 'Android',
      port: (_utils || _load_utils()).REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString()
    };
  }

  _getSerializationArgs() {
    return ['local', 'launch', 'React Native'];
  }

  componentDidMount() {
    (0, (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState({
        workspacePath: savedSettings.workspacePath || '',
        platform: savedSettings.platform || '',
        port: savedSettings.port || ''
      });
    });

    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this._debugButtonShouldEnable()) {
          this._handleLaunchClick();
        }
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState) {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  render() {
    const platforms = ['Android', 'iOS'];
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'label',
        null,
        'Workspace path (should contain package.json): '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        placeholderText: 'Path containing package.json',
        value: this.state.workspacePath,
        onDidChange: value => this.setState({ workspacePath: value }),
        autofocus: true
      }),
      _react.createElement(
        'label',
        null,
        'Platform: '
      ),
      _react.createElement((_RadioGroup || _load_RadioGroup()).default, {
        selectedIndex: platforms.indexOf(this.state.platform),
        optionLabels: platforms,
        onSelectedChange: index => this.setState({ platform: platforms[index] })
      }),
      _react.createElement(
        'label',
        null,
        'Debug port number: '
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        tabIndex: '1',
        placeholderText: 'React Native packager port (default 8081)',
        value: this.state.port,
        onDidChange: port => this.setState({ port })
      }),
      this.state.port !== (_utils || _load_utils()).REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString() && _react.createElement(
        'label',
        null,
        'Note: first consult',
        ' ',
        _react.createElement(
          'a',
          { href: 'https://github.com/facebook/react-native/issues/9145' },
          'React Native issue #9145'
        ),
        ' ',
        'for setting a port other than 8081.'
      )
    );
  }

}
exports.default = ReactNativeLaunchUiComponent;