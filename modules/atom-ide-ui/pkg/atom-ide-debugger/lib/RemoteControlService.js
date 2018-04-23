'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _vscodeDebugprotocol;


















function _load_vscodeDebugprotocol() {return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));}var _constants;

function _load_constants() {return _constants = require('./constants');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}


class RemoteControlService {


  constructor(service) {
    this._service = service;
  }

  startDebugging(processInfo) {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      const instance = yield _this.startVspDebugging(
      processInfo.getProcessConfig());


      processInfo.setVspDebuggerInstance(instance);

      const { focusedProcess } = _this._service.viewModel;if (!(
      focusedProcess != null)) {throw new Error('Invariant violation: "focusedProcess != null"');}
      const disposable = _this._service.viewModel.onDidFocusProcess(function () {
        if (
        !_this._service.
        getModel().
        getProcesses().
        includes(focusedProcess))
        {
          processInfo.dispose();
          disposable.dispose();
        }
      });})();
  }

  startVspDebugging(config) {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      yield _this2._service.startDebugging(config);

      const { viewModel } = _this2._service;
      const { focusedProcess } = viewModel;if (!(
      focusedProcess != null)) {throw new Error('Invariant violation: "focusedProcess != null"');}

      const isFocusedProcess = function () {
        return (
          _this2._service.getDebuggerMode() !== (_constants || _load_constants()).DebuggerMode.STOPPED &&
          viewModel.focusedProcess === focusedProcess);

      };

      const customRequest = (() => {var _ref = (0, _asyncToGenerator.default)(function* (
        request,
        args)
        {
          if (!isFocusedProcess()) {
            throw new Error(
            'Cannot send custom requests to a no longer active debug session!');

          }
          return focusedProcess.session.custom(request, args);
        });return function customRequest(_x, _x2) {return _ref.apply(this, arguments);};})();

      const observeCustomEvents = function () {
        if (!isFocusedProcess()) {
          throw new Error(
          'Cannot send custom requests to a no longer active debug session!');

        }
        return focusedProcess.session.observeCustomEvents();
      };

      return Object.freeze({
        customRequest,
        observeCustomEvents });})();

  }}exports.default = RemoteControlService; /**
                                             * Copyright (c) 2017-present, Facebook, Inc.
                                             * All rights reserved.
                                             *
                                             * This source code is licensed under the BSD-style license found in the
                                             * LICENSE file in the root directory of this source tree. An additional grant
                                             * of patent rights can be found in the PATENTS file in the same directory.
                                             *
                                             * 
                                             * @format
                                             */