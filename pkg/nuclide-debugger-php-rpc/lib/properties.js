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
import {
  remoteObjectIdOfObjectId,
  endIndexOfObjectId,
  startIndexOfObjectId,
  countOfObjectId,
  getChildIds,
} from './ObjectId';
import {convertValue} from './values';
import invariant from 'assert';

import type {ObjectId} from './ObjectId';
import type {DbgpProperty} from './DbgpSocket';

function convertProperties(
  id: ObjectId,
  properties: Array<DbgpProperty>,
): Array<Runtime$PropertyDescriptor> {
  logger.log('Got properties: ' + JSON.stringify(properties));
  return properties.map(property => convertProperty(id, property));
}

/**
 * Converts a DbgpProperty to a Chrome PropertyDescriptor.
 */
function convertProperty(
  contextId: ObjectId,
  dbgpProperty: DbgpProperty,
): Runtime$PropertyDescriptor {
  logger.log('Converting to Chrome property: ' + JSON.stringify(dbgpProperty));
  const result = {
    configurable: false,
    enumerable: true,
    name: dbgpProperty.$.name || 'Anonymous Property',
    value: convertValue(contextId, dbgpProperty),
  };
  return result;
}

/**
 * Given an ObjectId for a multi page object, gets PropertyDescriptors
 * for the object's children.
 */
function getPagedProperties(pagedId: ObjectId): Array<Runtime$PropertyDescriptor> {
  invariant(pagedId.elementRange);
  const pagesize = pagedId.elementRange.pagesize;
  const endIndex = endIndexOfObjectId(pagedId);

  const childIds = getChildIds(pagedId);
  return childIds.map(childId => {
    const childStartIndex = startIndexOfObjectId(childId, pagesize);
    const childCount = countOfObjectId(childId, pagesize, endIndex);
    return {
      configurable: false,
      enumerable: true,
      name: `Elements(${childStartIndex}..${childStartIndex + childCount - 1})`,
      value: {
        description: `${childCount} elements`,
        type: 'object',
        objectId: remoteObjectIdOfObjectId(childId),
      },
    };
  });
}

module.exports = {
  convertProperties,
  convertProperty,
  getPagedProperties,
};
