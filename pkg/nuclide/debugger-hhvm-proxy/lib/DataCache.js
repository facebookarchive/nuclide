'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


const {log, logErrorAndThrow} = require('./utils');
const {
  remoteObjectIdOfObjectId,
  createContextObjectId,
  isContextObjectId,
  isPagedObjectId,
  getWatchContextObjectId,
  isWatchContextObjectId,
} = require('./ObjectId');

const {
  convertProperties,
  getPagedProperties,
} = require('./properties.js');

const {convertValue} = require('./values.js');

// TODO: Move these Chrome types to a shared package.
type RemoteObjectId = string;

// description wins over value in display
type RemoteObject = {
  className?: string;
  description?: string;
  objectId?: RemoteObjectId;
  subtype?: string; // [ "array" , "date" , "node" , "null" , "regexp" ]
  type: string; // [ "boolean" , "function" , "number" , "object" , "string" , "undefined" ]
  value?: any;
};

// scope.object.description shows on RHS
type Scope = {
  object: RemoteObject;
  type: string; // [ "catch" , "closure" , "global" , "local" , "with" ]
};

type PropertyDescriptor = {
  configurable: boolean;
  enumerable: boolean;
  get?: RemoteObject;
  name: string;
  set?: RemoteObject;
  value?: RemoteObject;
  wasThrown?: boolean;
  writable?: boolean;
};

import type {DbgpSocket} from './DbgpSocket';

const {STATUS_BREAK} = require('./DbgpSocket');

/**
 * Handles data value tracking between Chrome and Dbgp.
 *
 * Maps Dbgp properties to/from Chrome RemoteObjects.
 * RemoteObjects are only valid while the debuggee is paused.
 * Once the debuggee resumes, all RemoteObjects become invalid.
 */
export class DataCache {
  _socket: DbgpSocket;
  _enabled: boolean;
  _enableCount: number;

  constructor(socket: DbgpSocket) {
    this._socket = socket;
    this._enableCount = 0;
    this._enabled = false;
    socket.onStatus(this._onStatusChanged.bind(this));
  }

  _onStatusChanged(status: string): void {
    switch (status) {
      case STATUS_BREAK:
        this._enable();
        break;
      default:
        this._disable();
        break;
    }
  }

  _disable(): void {
    this._enabled = false;
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  _enable(): void {
    this._enableCount += 1;
    this._enabled = true;
  }

  async getScopesForFrame(frameIndex: number): Promise<Scope> {
    if (!this.isEnabled()) {
      throw new Error('Must be enabled to get scopes.');
    }
    const contexts = await this._socket.getContextsForFrame(frameIndex);
    return contexts.map(context => {
      return {
        object: this._remoteObjectOfContext(frameIndex, context),
        type: contextNameToScopeType(context.name),
      };
    });
  }

  async evaluateOnCallFrame(frameIndex: number, expression: string): Promise<Object> {
    if (!this.isEnabled()) {
      throw new Error('Must be enabled to evaluate expression.');
    }

    const evaluatedResult = await this._socket.evaluateOnCallFrame(frameIndex, expression);
    if (evaluatedResult.wasThrown) {
      return evaluatedResult;
    }
    const id = getWatchContextObjectId(this._enableCount, frameIndex);
    const result = convertValue(id, evaluatedResult.result);
    return {
      result,
      wasThrown: false,
    };
  }

  _remoteObjectOfContext(frameIndex: number, context: DbgpContext): RemoteObject {
    return {
      description: context.name,
      type: 'object',
      objectId: remoteObjectIdOfObjectId(this._objectIdOfContext(frameIndex, context)),
    };
  }

  _objectIdOfContext(frameIndex: number, context: DbgpContext): ObjectId {
    return createContextObjectId(this._enableCount, frameIndex, context.id);
  }

  async getProperties(remoteId: RemoteObjectId): Promise<Array<PropertyDescriptor>> {
    const id = JSON.parse(remoteId);
    if (id.enableCount !== this._enableCount) {
      logErrorAndThrow(`Got request for stale RemoteObjectId ${remoteId}`);
    }

    // context and single paged ids require getting children from the debuggee and converting
    // them from dbgp to chrome format.
    if (isContextObjectId(id)) {
      return await this._getContextProperties(id);
    } else if (isPagedObjectId(id)){
      // Paged id's children are constructed directly in chrome format from the contents of the
      // object id. Does not require going to the debuggee.
      return getPagedProperties(id);
    } else {
      return await this._getSinglePageOfProperties(id);
    }
  }

  async _getSinglePageOfProperties(id: ObjectId): Promise<Array<PropertyDescriptor>> {
    let properties = null;
    if (isWatchContextObjectId(id)) {
      properties = await this._socket.getPropertiesByFullnameAllConexts(id.frameIndex, id.fullname, id.page);
    } else {
      properties = await this._socket.getPropertiesByFullname(id.frameIndex, id.contextId, id.fullname, id.page);
    }
    return convertProperties(id, properties);
  }

  async _getContextProperties(id: ObjectId): Promise<Array<PropertyDescriptor>> {
    const properties = await this._socket.getContextProperties(id.frameIndex, id.contextId);
    return convertProperties(id, properties);
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
