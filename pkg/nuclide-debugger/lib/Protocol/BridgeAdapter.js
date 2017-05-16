'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

var _NuclideProtocolParser;

function _load_NuclideProtocolParser() {
  return _NuclideProtocolParser = _interopRequireDefault(require('./NuclideProtocolParser'));
}

var _DebuggerDomainDispatcher;

function _load_DebuggerDomainDispatcher() {
  return _DebuggerDomainDispatcher = _interopRequireDefault(require('./DebuggerDomainDispatcher'));
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

require('./Object');

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)('nuclide-debugger');
class BridgeAdapter {

  constructor() {
    this._handleServerMessage = this._handleServerMessage.bind(this);
  }

  start(debuggerInstance) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._debuggerDispatcher = yield (_NuclideProtocolParser || _load_NuclideProtocolParser()).default.bootstrap(debuggerInstance);
    })();
  }

  resume() {
    if (!(this._debuggerDispatcher != null)) {
      throw new Error('Invariant violation: "this._debuggerDispatcher != null"');
    }

    this._debuggerDispatcher.resume();
  }

  stepOver() {
    if (!(this._debuggerDispatcher != null)) {
      throw new Error('Invariant violation: "this._debuggerDispatcher != null"');
    }

    this._debuggerDispatcher.stepOver();
  }

  stepInto() {
    if (!(this._debuggerDispatcher != null)) {
      throw new Error('Invariant violation: "this._debuggerDispatcher != null"');
    }

    this._debuggerDispatcher.stepInto();
  }

  stepOut() {
    if (!(this._debuggerDispatcher != null)) {
      throw new Error('Invariant violation: "this._debuggerDispatcher != null"');
    }

    this._debuggerDispatcher.stepOut();
  }

  _handleServerMessage(domain, method, params) {
    logger.info(`domain: ${domain}, method: ${method}`);
  }
}
exports.default = BridgeAdapter;