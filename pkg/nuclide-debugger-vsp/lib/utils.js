'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.getNativeVSPAttachProcessInfo = exports.getNativeVSPLaunchProcessInfo = exports.resolveConfiguration = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));let lldbVspAdapterWrapperPath = (() => {var _ref = (0, _asyncToGenerator.default)(













































































  function* (program) {
    try {
      // $FlowFB
      return require('./fb-LldbVspAdapterPath').getLldbVspAdapterPath(program);
    } catch (ex) {
      return 'lldb-vscode';
    }
  });return function lldbVspAdapterWrapperPath(_x) {return _ref.apply(this, arguments);};})();let resolveConfiguration = exports.resolveConfiguration = (() => {var _ref2 = (0, _asyncToGenerator.default)(

  function* (
  configuration)
  {
    const { adapterExecutable } = configuration;
    if (adapterExecutable == null) {
      throw new Error('Cannot resolve configuration for unset adapterExecutable');
    } else if (adapterExecutable.command === 'lldb-vscode') {
      adapterExecutable.command = yield lldbVspAdapterWrapperPath(
      configuration.targetUri);

    }
    return configuration;
  });return function resolveConfiguration(_x2) {return _ref2.apply(this, arguments);};})();let getNativeVSPLaunchProcessInfo = exports.getNativeVSPLaunchProcessInfo = (() => {var _ref3 = (0, _asyncToGenerator.default)(















































































  function* (
  adapter,
  program,
  args)
  {
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(
    program,
    'launch',
    adapter,
    null, Object.assign({

      program: (_nuclideUri || _load_nuclideUri()).default.getPath(program) },
    args),

    { threads: true });

  });return function getNativeVSPLaunchProcessInfo(_x3, _x4, _x5) {return _ref3.apply(this, arguments);};})();let getNativeVSPAttachProcessInfo = exports.getNativeVSPAttachProcessInfo = (() => {var _ref4 = (0, _asyncToGenerator.default)(

  function* (
  adapter,
  targetUri,
  args)
  {
    return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(targetUri, 'attach', adapter, null, args, {
      threads: true });

  });return function getNativeVSPAttachProcessInfo(_x6, _x7, _x8) {return _ref4.apply(this, arguments);};})();exports.getPrepackAutoGenConfig = getPrepackAutoGenConfig;exports.getNativeAutoGenConfig = getNativeAutoGenConfig;var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));}var _nuclideDebuggerCommon;function _load_nuclideDebuggerCommon() {return _nuclideDebuggerCommon = require('nuclide-debugger-common');}var _react = _interopRequireWildcard(require('react'));function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * the root directory of this source tree.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function getPrepackAutoGenConfig() {const fileToPrepack = { name: 'sourceFile', type: 'string', description: 'Input the file you want to Prepack', required: true, visible: true };const prepackRuntimePath = { name: 'prepackRuntime', type: 'string', description: 'Prepack executable path (e.g. lib/prepack-cli.js). Will use default prepack command if not provided', required: false, visible: true };const argumentsProperty = { name: 'prepackArguments', type: 'array', itemType: 'string', description: 'Arguments to start Prepack', required: false, defaultValue: '', visible: true };const autoGenLaunchConfig = { launch: true, vsAdapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PREPACK, threads: false, properties: [fileToPrepack, prepackRuntimePath, argumentsProperty], scriptPropertyName: 'fileToPrepack', scriptExtension: '.js', cwdPropertyName: null, header: null };return { launch: autoGenLaunchConfig, attach: null };}function getNativeAutoGenConfig(vsAdapterType) {const program = { name: 'program', type: 'string', description: 'Input the program/executable you want to launch', required: true, visible: true };const cwd = { name: 'cwd', type: 'string', description: 'Working directory for the launched executable', required: true, visible: true };const args = { name: 'args', type: 'array', itemType: 'string', description: 'Arguments to the executable', required: false, defaultValue: '', visible: true };const env = { name: 'env', type: 'array', itemType: 'string', description: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)', required: false, defaultValue: '', visible: true };const sourcePath = { name: 'sourcePath', type: 'string', description: 'Optional base path for sources', required: false, defaultValue: '', visible: true };const debugTypeMessage = `using ${vsAdapterType === (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_GDB ? 'gdb' : 'lldb'}`;const autoGenLaunchConfig = { launch: true, vsAdapterType, threads: true, properties: [program, cwd, args, env, sourcePath], scriptPropertyName: 'program', cwdPropertyName: 'working directory', header: _react.createElement('p', null, 'Debug native programs ', debugTypeMessage, '.') };const pid = { name: 'pid', type: 'process', description: '', required: true, visible: true };const autoGenAttachConfig = { launch: false, vsAdapterType, threads: true, properties: [pid, sourcePath], header: _react.createElement('p', null, 'Attach to a running native process ', debugTypeMessage) };return { launch: autoGenLaunchConfig, attach: autoGenAttachConfig };}