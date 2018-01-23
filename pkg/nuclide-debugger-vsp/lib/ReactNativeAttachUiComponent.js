'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _ReactNativeCommonUiComponent;

function _load_ReactNativeCommonUiComponent() {
  return _ReactNativeCommonUiComponent = _interopRequireDefault(require('./ReactNativeCommonUiComponent'));
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

class ReactNativeAttachUiComponent extends (_ReactNativeCommonUiComponent || _load_ReactNativeCommonUiComponent()).default {
  constructor(props) {
    var _this;

    _this = super(props);
    this.handleLaunchClick = (0, _asyncToGenerator.default)(function* () {
      const launchInfo = yield (0, (_utils || _load_utils()).getReactNativeAttachProcessInfo)(_this.stateToArgs());

      const debuggerService = yield (0, (_utils || _load_utils()).getDebuggerService)();
      debuggerService.startDebugging(launchInfo);

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(), {
        workspacePath: _this.state.workspacePath,
        outDir: _this.state.outDir,
        port: _this.state.port,
        sourceMaps: _this.state.sourceMaps,
        sourceMapPathOverrides: _this.state.sourceMapPathOverrides
      });
    });
    this.state = {
      workspacePath: '',
      outDir: '',
      port: (_utils || _load_utils()).REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString(),
      sourceMaps: true,
      sourceMapPathOverrides: ''
    };
  }

  _getSerializationArgs() {
    return ['local', 'attach', 'React Native'];
  }

  deserializeState() {
    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(), (transientSettings, savedSettings) => {
      this.setState({
        workspacePath: savedSettings.workspacePath || '',
        outDir: savedSettings.outDir || '',
        port: savedSettings.port || (_utils || _load_utils()).REACT_NATIVE_PACKAGER_DEFAULT_PORT.toString(),
        sourceMaps: savedSettings.sourceMaps || true,
        sourceMapPathOverrides: savedSettings.sourceMapPathOverrides || ''
      });
    });
  }

}
exports.default = ReactNativeAttachUiComponent;