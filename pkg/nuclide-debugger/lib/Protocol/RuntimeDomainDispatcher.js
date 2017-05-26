/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

/**
 * Responsible for sending and receiving runtime domain protocols from
 * debug engine.
 */
class RuntimeDomainDispatcher {
  _agent: Object; // runtime agent from chrome protocol.

  constructor(agent: Object) {
    this._agent = agent;
  }
}

// Use old school export to allow legacy code to import it.
module.exports = RuntimeDomainDispatcher;
