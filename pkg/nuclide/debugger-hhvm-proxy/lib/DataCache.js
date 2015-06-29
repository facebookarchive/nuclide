'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {log} = require('./utils');

// TODO: Move these Chrome types to a shared package.
type RemoteObjectId = string;

type RemoteObject = {
  className?: string;
  description?: string;
  objectId?: RemoteObjectId;
  subtype?: string; // [ "array" , "date" , "node" , "null" , "regexp" ]
  type: string; // [ "boolean" , "function" , "number" , "object" , "string" , "undefined" ]
  value?: any;
};

type Scope = {
  object: RemoteObject;
  type: string; // [ "catch" , "closure" , "global" , "local" , "with" ]
};

/**
 * Handles data value tracking between Chrome and Dbgp.
 *
 * Maps Dbgp properties to/from Chrome RemoteObjects.
 * RemoteObjects are only valid while the debuggee is paused.
 * Once the debuggee resumes, all RemoteObjects become invalid.
 */
class DataCache {
  _socket: DbgpSocket;
  _enabled: boolean;
  _enableCount: number;

  constructor(socket: DbgpSocket) {
    this._socket = socket;
    this._enableCount = 0;
    this._enabled = false;
  }

  disable(): void {
    this._enabled = false;
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  enable(): void {
    this._enableCount += 1;
    this._enabled = true;
  }

  async getScopesForFrame(frameIndex: number): Promise<Scope> {
    if (!this.isEnabled()) {
      throw new Error('Must be enabled to get scopes.');
    }
    var contexts = await this._socket.getContextsForFrame(frameIndex);
    return contexts.map(context => {
      return {
        object: this._remoteObjectOfContext(frameIndex, context),
        type: contextNameToScopeType(context.name),
      };
    });
  }

  _remoteObjectOfContext(frameIndex: number, context: DbgpContext): RemoteObject {
    return {
      description: context.name,
      type: 'object',
      objectId: this._objectIdOfContext(frameIndex, context),
    };
  }

  _objectIdOfContext(frameIndex: number, context: DbgpContext): RemoteObjectId {
    return JSON.stringify({
      enableCount: this._enableCount,
      frameIndex,
      contextId: context.id,
    });
  }
}

function contextNameToScopeType(name: string): string {
  switch (name) {
  case 'Locals':
    return 'local';
  case 'Superglobals':
    return 'global';
  case 'User defined constants':
    return 'global';
  // TODO: Verify this ...
  default:
    log(`Unexpected context name: ${name}`);
    return 'closure';
  }
}

module.exports = DataCache;
