'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _RadioGroup;

function _load_RadioGroup() {
  return _RadioGroup = _interopRequireDefault(require('nuclide-commons-ui/RadioGroup'));
}

var _react = _interopRequireWildcard(require('react'));

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _ReactNativeCommonUiComponent;

function _load_ReactNativeCommonUiComponent() {
  return _ReactNativeCommonUiComponent = _interopRequireDefault(require('./ReactNativeCommonUiComponent'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Directly calling string.toLowerCase would lose the specific type.
function checkedLowerCasePlatform(platform) {
  switch (platform) {
    case 'Android':
      return 'android';
    case 'iOS':
      return 'ios';
    default:
      throw new Error('Unexpected platform case');
  }
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

function checkedLowerCaseTarget(target) {
  switch (target) {
    case 'Device':
      return 'device';
    case 'Simulator':
      return 'simulator';
    default:
      throw new Error('Unexpected target case');
  }
}

class ReactNativeLaunchUiComponent extends (_ReactNativeCommonUiComponent || _load_ReactNativeCommonUiComponent()).default {
  constructor(props) {
    var _this;

    _this = super(props);
    this.handleLaunchClick = (0, _asyncToGenerator.default)(function* () {
      const launchInfo = yield (0, (_utils || _load_utils()).getReactNativeLaunchProcessInfo)(_this.stateToArgs());

      const debuggerService = yield (0, (_utils || _load_utils()).getDebuggerService)();
      debuggerService.startDebugging(launchInfo);

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {
        workspacePath: _this.state.workspacePath,
        outDir: _this.state.outDir,
        port: _this.state.port,
        sourceMaps: _this.state.sourceMaps,
        sourceMapPathOverrides: _this.state.sourceMapPathOverrides,
        platform: _this.state.platform,
        target: _this.state.target
      });
    });
    this.state = {
      workspacePath: '',
      outDir: '',
      platform: 'Android',
      target: 'Simulator',
      port: (_utils || _load_utils()).REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString(),
      sourceMaps: true,
      sourceMapPathOverrides: ''
    };
  }

  _getSerializationArgs() {
    return ['local', 'launch', 'React Native'];
  }

  deserializeState() {
    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState({
        workspacePath: savedSettings.workspacePath || '',
        outDir: savedSettings.outDir || '',
        port: savedSettings.port || (_utils || _load_utils()).REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString(),
        sourceMaps: savedSettings.sourceMaps || true,
        sourceMapPathOverrides: savedSettings.sourceMapPathOverrides || '',
        platform: savedSettings.platform || 'Android',
        target: savedSettings.target || 'Simulator'
      });
    });
  }

  render() {
    const platforms = ['Android', 'iOS'];
    const targets = ['Simulator', 'Device'];
    return _react.createElement(
      'span',
      null,
      super.render(),
      _react.createElement(
        'div',
        { className: 'block' },
        _react.createElement(
          'label',
          null,
          'Launch platform: '
        ),
        _react.createElement((_RadioGroup || _load_RadioGroup()).default, {
          selectedIndex: platforms.indexOf(this.state.platform),
          optionLabels: platforms,
          onSelectedChange: index => this.setState({ platform: platforms[index] })
        }),
        _react.createElement(
          'label',
          null,
          'Launch target: '
        ),
        _react.createElement((_RadioGroup || _load_RadioGroup()).default, {
          selectedIndex: targets.indexOf(this.state.target),
          optionLabels: targets,
          onSelectedChange: index => this.setState({ target: targets[index] })
        })
      )
    );
  }

  stateToArgs() {
    const attachArgs = super.stateToArgs();
    const platform = checkedLowerCasePlatform(this.state.platform);
    const target = checkedLowerCaseTarget(this.state.target);
    return Object.assign({}, attachArgs, { platform, target });
  }

}
exports.default = ReactNativeLaunchUiComponent;