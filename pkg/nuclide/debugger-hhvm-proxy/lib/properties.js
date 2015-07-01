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
var {
  remoteObjectIdOfObjectId,
  endIndexOfObjectId,
  startIndexOfObjectId,
  countOfObjectId,
  getChildIds,
} = require('./ObjectId');

var {convertValue} = require('./values');

function convertProperties(id: ObjectId, properties: Array<DbgpProperty>): Array<PropertyDescriptor> {
  log('Got properties: ' + JSON.stringify(properties));
  return properties.map(property => convertProperty(id, property));
}

/**
 * Converts a DbgpProperty to a Chrome PropertyDescriptor.
 */
function convertProperty(contextId: ObjectId, dbgpProperty: DbgpProperty): PropertyDescriptor {
  log('Converting to Chrome property: ' + JSON.stringify(dbgpProperty));
  var result = {
    configurable: false,
    enumerable: true,
    name: dbgpProperty.$.name,
    value: convertValue(contextId, dbgpProperty),
  };
  return result;
}

/**
 * Given an ObjectId for a multi page object, gets PropertyDescriptors
 * for the object's children.
 */
function getPagedProperties(pagedId: ObjectId): Array<PropertyDescriptor> {
  var pagesize = pagedId.elementRange.pagesize;
  var endIndex = endIndexOfObjectId(pagedId);

  var childIds = getChildIds(pagedId);
  return childIds.map(childId => {
    var childStartIndex = startIndexOfObjectId(childId, pagesize);
    var childCount = countOfObjectId(childId, pagesize, endIndex);
    return {
      configurable: false,
      enumerable: true,
      name: `Elements(${childStartIndex}..${childStartIndex + childCount - 1})`,
      value: {
        description: `${childCount} elements`,
        type: 'object',
        objectId: remoteObjectIdOfObjectId(childId),
      }
    };
  });
}

module.exports = {
  convertProperties,
  convertProperty,
  getPagedProperties,
};
