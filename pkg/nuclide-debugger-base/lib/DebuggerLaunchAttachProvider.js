'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

let uniqueKeySeed = 0;

/**
 * Base class of all launch/attach providers.
 * It allows each concrete provider to provide customized debugging types, actions and UI.
 */
let DebuggerLaunchAttachProvider = class DebuggerLaunchAttachProvider {

  constructor(debuggingTypeName, targetUri) {
    this._debuggingTypeName = debuggingTypeName;
    this._targetUri = targetUri;
    this._uniqueKey = uniqueKeySeed++;
  }

  /**
   * Returns a unique key which can be associated with the component.
   */
  getUniqueKey() {
    return this._uniqueKey;
  }

  /**
   * Returns the debugging type name for this provider(e.g. Natve, Php, Node etc...).
   */
  getDebuggingTypeName() {
    return this._debuggingTypeName;
  }

  /**
   * Returns target uri for this provider.
   */
  getTargetUri() {
    return this._targetUri;
  }

  /**
   * Returns a list of supported debugger actions.
   */
  getActions() {
    throw new Error('abstract method');
  }

  /**
   * Returns the UI component for input debug action.
   */
  getComponent(action) {
    throw new Error('abstract method');
  }

  /**
   * Dispose any resource held by this provider.
   */
  dispose() {
    throw new Error('abstract method');
  }
};
exports.default = DebuggerLaunchAttachProvider;
module.exports = exports['default'];