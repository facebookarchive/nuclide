'use strict';

/**
 * Responsible for sending and receiving runtime domain protocols from
 * debug engine.
 */
class RuntimeDomainDispatcher {
  // runtime agent from chrome protocol.

  constructor(agent) {
    this._agent = agent;
  }

  enable() {
    this._agent.enable();
  }

  getProperties(objectId, callback) {
    this._agent.getProperties(objectId, false, // ownProperties
    false, // accessorPropertiesOnly
    false, // generatePreview
    callback);
  }
}

// Use old school export to allow legacy code to import it.
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

module.exports = RuntimeDomainDispatcher;