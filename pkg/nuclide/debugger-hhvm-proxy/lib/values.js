'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import logger from './utils';
import {base64Decode} from './helpers.js';
import {
  remoteObjectIdOfObjectId,
  pagedObjectId,
  singlePageObjectId,
} from './ObjectId';
import invariant from 'assert';

import type {DbgpProperty} from './DbgpSocket';
import type {ObjectId} from './ObjectId';
import type {RemoteObject, RemoteObjectId} from './DataCache';

/**
 * Converts a dbgp value to a Chrome RemoteObject.
 */
function convertValue(contextId: ObjectId, dbgpProperty: DbgpProperty): RemoteObject {
  switch (dbgpProperty.$.type) {
    case 'string':
      return convertStringValue(dbgpProperty);
    case 'int':
      return convertIntValue(dbgpProperty);
    case 'float':
      return convertFloatValue(dbgpProperty);
    case 'bool':
      return convertBoolValue(dbgpProperty);
    case 'null':
      return convertNullValue(dbgpProperty);
    case 'array':
      return convertArrayValue(contextId, dbgpProperty);
    case 'object':
      return convertObjectValue(contextId, dbgpProperty);
    default:
      // TODO: Remaining property types - closure, hashmap, ...
      return convertUnknownValue(dbgpProperty);
  }
}

function convertStringValue(dbgpProperty: DbgpProperty): RemoteObject {
  let value;
  if (dbgpProperty.hasOwnProperty('_')) {
    value = dbgpProperty.$.encoding === 'base64' ? base64Decode(dbgpProperty._) :
      `TODO: Non-base64 encoded string: ${JSON.stringify(dbgpProperty)}`;
  } else {
    // zero length strings have no dbgpProperty._ property
    value = '';
  }

  return {
    type: 'string',
    value,
  };
}

function convertIntValue(dbgpProperty: DbgpProperty): RemoteObject {
  const value = dbgpProperty.$.encoding === 'base64' ?
    `TODO: Base64 encoded int: ${JSON.stringify(dbgpProperty)}`
    : dbgpProperty._;
  return {
    type: 'number',
    value,
  };
}

function convertFloatValue(dbgpProperty: DbgpProperty): RemoteObject {
  const value = dbgpProperty.$.encoding === 'base64' ?
    `TODO: Base64 encoded float: ${JSON.stringify(dbgpProperty)}`
    : dbgpProperty._;
  return {
    type: 'number',
    value,
  };
}

function convertBoolValue(dbgpProperty: DbgpProperty): RemoteObject {
  invariant(dbgpProperty._ != null);
  const value = dbgpProperty.$.encoding === 'base64'
    ? `TODO: Base64 encoded bool: ${JSON.stringify(dbgpProperty)}`
    : toBool(dbgpProperty._);
  return {
    type: 'boolean',
    value,
  };
}

function convertNullValue(dbgpProperty: DbgpProperty): RemoteObject {
  return {
    type: 'undefined',
    subtype: 'null',
    value: null,
  };
}

function convertArrayValue(contextId: ObjectId, dbgpProperty: DbgpProperty): RemoteObject {
  const remoteId = getAggregateRemoteObjectId(contextId, dbgpProperty);
  invariant(dbgpProperty.$.numchildren != null);
  return {
    description: `Array[${dbgpProperty.$.numchildren}]`,
    type: 'object',
    subtype: 'array',
    objectId: remoteId,
  };
}

function convertObjectValue(contextId: ObjectId, dbgpProperty: DbgpProperty): RemoteObject {
  const remoteId = getAggregateRemoteObjectId(contextId, dbgpProperty);
  invariant(dbgpProperty.$.classname != null);
  return {
    description: dbgpProperty.$.classname,
    type: 'object',
    objectId: remoteId,
  };
}

function getAggregateRemoteObjectId(
  contextId: ObjectId,
  dbgpProperty: DbgpProperty
): RemoteObjectId {
  invariant(dbgpProperty.$.numchildren != null);
  const numchildren = Number(dbgpProperty.$.numchildren);
  const pagesize = Number(dbgpProperty.$.pagesize);
  const pageCount = Math.trunc((numchildren + pagesize - 1) / pagesize);
  logger.log(`numchildren: ${numchildren} pagesize: ${pagesize} pageCount ${pageCount}`);
  if (pageCount > 1) {
    const elementRange = {
      pagesize,
      startIndex: 0,
      count: numchildren,
    };
    return remoteObjectIdOfObjectId(
      pagedObjectId(contextId, dbgpProperty.$.fullname, elementRange));
  } else {
    return remoteObjectIdOfObjectId(singlePageObjectId(contextId, dbgpProperty.$.fullname, 0));
  }
}

function convertUnknownValue(dbgpProperty: DbgpProperty): RemoteObject {
  return {
    type: 'string',
    value: 'TODO: unknown: ' + JSON.stringify(dbgpProperty),
  };
}

function toBool(value: string): mixed {
  switch (value) {
    case '0': return false;
    case '1': return true;
    default: return 'Unexpected bool value: ' + value;
  }
}

module.exports = {convertValue};
