'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


let uniqueKeySeed = 0; /**
                        * Copyright (c) 2015-present, Facebook, Inc.
                        * All rights reserved.
                        *
                        * This source code is licensed under the license found in the LICENSE file in
                        * the root directory of this source tree.
                        *
                        * 
                        * @format
                        */

// $FlowFixMe(>=0.53.0) Flow suppress


/**
 * Base class of all launch/attach providers.
 * It allows each concrete provider to provide customized debugging types, actions and UI.
 */
class DebuggerLaunchAttachProvider {

  constructor(debuggingTypeName, targetUri) {
    this._debuggingTypeName = debuggingTypeName;
    this._targetUri = targetUri;
    this._uniqueKey = uniqueKeySeed++;
  }

  getCallbacksForAction(action) {
    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: () => {
        return Promise.resolve(true);
      },

      /**
       * Returns a list of supported debugger types + environments for the specified action.
       */
      getDebuggerTypeNames: () => {
        return [this._debuggingTypeName];
      },

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (debuggerTypeName, configIsValidChanged) => {
        throw new Error('abstract method');
      }
    };
  }

  /**
   * Returns a unique key which can be associated with the component.
   */
  getUniqueKey() {
    return this._uniqueKey;
  }

  /**
   * Returns target uri for this provider.
   */
  getTargetUri() {
    return this._targetUri;
  }

  /**
   * Dispose any resource held by this provider.
   */
  dispose() {
    throw new Error('abstract method');
  }
}
exports.default = DebuggerLaunchAttachProvider;