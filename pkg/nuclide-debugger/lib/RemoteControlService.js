'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

class RemoteControlService {

  /**
   * @param getModel function always returning the latest singleton model.
   *
   * NB: Deactivating and reactivating will result in a new Model instance (and
   * new instances of everything else). This object exists in other packages
   * outside of any model, so objects vended early must still always manipulate
   * the latest model's state.
   */
  constructor(getModel) {
    this._getModel = getModel;
  }

  startDebugging(processInfo) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const model = _this._getModel();
      if (model == null) {
        throw new Error('Package is not activated.');
      }
      yield model.getActions().startDebugging(processInfo);
    })();
  }

  toggleBreakpoint(filePath, line) {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    model.getActions().toggleBreakpoint(filePath, line);
  }

  addBreakpoint(filePath, line) {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    model.getActions().addBreakpoint(filePath, line);
  }

  isInDebuggingMode(providerName) {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    const session = model.getStore().getDebuggerInstance();
    return session != null && session.getProviderName() === providerName;
  }

  getDebuggerInstance() {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    return model.getStore().getDebuggerInstance();
  }

  killDebugger() {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    model.getActions().stopDebugging();
  }
}
exports.default = RemoteControlService;