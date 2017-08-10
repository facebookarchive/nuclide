'use strict';

/**
 * Responsible for sending and receiving runtime domain protocols from
 * debug engine.
 */
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

class RuntimeDomainDispatcher {
  // runtime agent from chrome protocol.

  constructor(agent) {
    this._agent = agent;
  }

  enable() {
    this._agent.enable();
  }

  evaluate(expression, objectGroup, callback) {
    this._agent.evaluate(expression, objectGroup, undefined, // includeCommandLineAPI
    undefined, // doNotPauseOnExceptionsAndMuteConsole
    undefined, // contextId
    undefined, // returnByValue
    undefined, // generatePreview
    callback);
  }

  getProperties(objectId, callback) {
    this._agent.getProperties(objectId, false, // ownProperties
    false, // accessorPropertiesOnly
    false, // generatePreview
    callback);
  }

  executionContextCreated(params) {
    // Engine may fire ExecutionContextCreatedEvent event because of RuntimeDomain.enable() call.
    // But we do not need it. Do nothing.
  }
}

// Use old school export to allow legacy code to import it.
module.exports = RuntimeDomainDispatcher; // eslint-disable-line nuclide-internal/no-commonjs