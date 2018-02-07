'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachProcessInfo = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _PhpDebuggerInstance;

function _load_PhpDebuggerInstance() {
  return _PhpDebuggerInstance = require('./PhpDebuggerInstance');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _utils2;

function _load_utils2() {
  return _utils2 = require('./utils');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
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

class AttachProcessInfo extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerProcessInfo {

  constructor(targetUri, debugPort) {
    super('hhvm', targetUri);
    this._debugPort = debugPort;
  }

  clone() {
    return new AttachProcessInfo(this._targetUri);
  }

  getDebuggerCapabilities() {
    return Object.assign({}, super.getDebuggerCapabilities(), {
      completionsRequest: true,
      conditionalBreakpoints: true,
      continueToLocation: true,
      setVariable: true,
      threads: true
    });
  }

  getDebuggerProps() {
    return Object.assign({}, super.getDebuggerProps(), {
      customControlButtons: this._getCustomControlButtons(),
      threadColumns: this._getThreadColumns(),
      threadsComponentTitle: 'Requests'
    });
  }

  preAttachActions() {
    try {
      // $FlowFB
      const services = require('./fb/services');
      services.startSlog();
    } catch (_) {}
  }

  _hhvmDebug() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getHhvmDebuggerServiceByNuclideUri)(_this.getTargetUri());
      const hhvmDebuggerService = new service.HhvmDebuggerService();

      // Note: not specifying startup document or debug port here, the backend
      // will use the default parameters. We can surface these options in the
      // Attach Dialog if users need to be able to customize them in the future.
      const config = {
        targetUri: (_nuclideUri || _load_nuclideUri()).default.getPath(_this.getTargetUri()),
        action: 'attach'
      };

      let debugPort = _this._debugPort;
      if (debugPort == null) {
        try {
          // $FlowFB
          const fetch = require('../../commons-node/fb-sitevar').fetchSitevarOnce;
          debugPort = yield fetch('NUCLIDE_HHVM_DEBUG_PORT');
        } catch (e) {}
      }

      if (debugPort != null) {
        config.debugPort = debugPort;
      }

      (_utils || _load_utils()).default.info(`Connection session config: ${JSON.stringify(config)}`);
      const result = yield hhvmDebuggerService.debug(config);
      (_utils || _load_utils()).default.info(`Attach process result: ${result}`);
      return new (_PhpDebuggerInstance || _load_PhpDebuggerInstance()).PhpDebuggerInstance(_this, hhvmDebuggerService);
    })();
  }

  debug() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const useNewDebugger = yield (0, (_passesGK || _load_passesGK()).default)('nuclide_hhvm_debugger_vscode');
      if (useNewDebugger) {
        // TODO: Ericblue - this will be cleaned up when the old debugger
        // is removed. For now we need to leave both in place until the new
        // one is ready.
        return _this2._hhvmDebug();
      }

      (_utils || _load_utils()).default.info('Connecting to: ' + _this2.getTargetUri());
      _this2.preAttachActions();

      const rpcService = _this2._getRpcService();
      const sessionConfig = (0, (_utils2 || _load_utils2()).getSessionConfig)((_nuclideUri || _load_nuclideUri()).default.getPath(_this2.getTargetUri()), false);
      (_utils || _load_utils()).default.info(`Connection session config: ${JSON.stringify(sessionConfig)}`);
      const result = yield rpcService.debug(sessionConfig);
      (_utils || _load_utils()).default.info(`Attach process result: ${result}`);

      return new (_PhpDebuggerInstance || _load_PhpDebuggerInstance()).PhpDebuggerInstance(_this2, rpcService);
    })();
  }

  _getRpcService() {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getPhpDebuggerServiceByNuclideUri)(this.getTargetUri());
    return new service.PhpDebuggerService();
  }

  _getThreadColumns() {
    return [{
      key: 'id',
      title: 'ID',
      width: 0.15
    }, {
      key: 'address',
      title: 'Location',
      width: 0.55
    }, {
      key: 'stopReason',
      title: 'Stop Reason',
      width: 0.25
    }];
  }

  _getCustomControlButtons() {
    const customControlButtons = [{
      icon: 'link-external',
      title: 'Toggle HTTP Request Sender',
      onClick: () => atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-http-request-sender:toggle-http-request-edit-dialog')
    }];
    try {
      return customControlButtons.concat(
      // $FlowFB
      require('./fb/services').customControlButtons);
    } catch (_) {
      return customControlButtons;
    }
  }
}
exports.AttachProcessInfo = AttachProcessInfo;