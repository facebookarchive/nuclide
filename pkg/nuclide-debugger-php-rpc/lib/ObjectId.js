'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWatchContextObjectId = getWatchContextObjectId;
exports.remoteObjectIdOfObjectId = remoteObjectIdOfObjectId;
exports.createContextObjectId = createContextObjectId;
exports.pagedObjectId = pagedObjectId;
exports.singlePageObjectId = singlePageObjectId;
exports.isWatchContextObjectId = isWatchContextObjectId;
exports.isContextObjectId = isContextObjectId;
exports.isSinglePageObjectId = isSinglePageObjectId;
exports.isPagedObjectId = isPagedObjectId;
exports.copyObjectId = copyObjectId;
exports.endIndexOfElementRange = endIndexOfElementRange;
exports.endIndexOfObjectId = endIndexOfObjectId;
exports.startIndexOfObjectId = startIndexOfObjectId;
exports.countOfObjectId = countOfObjectId;
exports.getChildIds = getChildIds;


/*
 * An ElementRange identifies a range of child elements of a data value.
 * startIndex represents the index of the first element in the range.
 * count the number of elements in the range.
 * pagesize is always the debuggee pagesize which currently defaults to 32.
 *
 * Note that the children of an ElementRange may be aggregated into ranges whose size
 * is larger than the debuggeee pagesize. For example given a range with pagesize
 * of 32, and count of 32^5, the children of the range will have a pagesize of 32
 * and count of 32^4.
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

/*
 * ObjectIds identify data values with children.
 *
 * Initially when data with children is returned to the Chrome
 * debugger only the ObjectId is returned. Subsequent calls by the debugger can request
 * the child properties of an ObjectId.
 *
 * There are 3 valid forms of ObjectId.
 *
 * ObjectIds for stack frame contexts just have the 3 required fields.
 * Contexts are never paged - even with large numbers of variables.
 *
 * Array and Object children may be paged.
 *
 * SinglePageObjectIds have fullname and page set. They represent a single page of
 * children of the value represented by fullname.
 *
 * PagedObjectIds have fullname and elementRange set. They represent multiple pages
 * of children of the value represented by fullname. Note that the children of
 * PagedObjectIds may be a combination of SinglePageObjectIds and PagedObjectIds.
 */
const WATCH_CONTEXT_ID = 'Watch Context Id';

function getWatchContextObjectId(enableCount, frameIndex) {
  return createContextObjectId(enableCount, frameIndex, WATCH_CONTEXT_ID);
}

function remoteObjectIdOfObjectId(id) {
  return JSON.stringify(id);
}

function createContextObjectId(enableCount, frameIndex, contextId) {
  return {
    enableCount,
    frameIndex,
    contextId
  };
}

function pagedObjectId(objectId, fullname, elementRange) {
  const result = copyObjectId(objectId);
  result.fullname = fullname;
  result.elementRange = elementRange;

  return result;
}

function singlePageObjectId(objectId, fullname, page) {
  const result = copyObjectId(objectId);
  result.fullname = fullname;
  result.page = page;

  return result;
}

function isWatchContextObjectId(id) {
  return id.contextId === WATCH_CONTEXT_ID;
}

function isContextObjectId(id) {
  return !id.hasOwnProperty('fullname');
}

function isSinglePageObjectId(id) {
  return id.hasOwnProperty('page');
}

function isPagedObjectId(id) {
  return id.hasOwnProperty('elementRange');
}

/**
 * Extracts just the shared parts from an ObjectId. Does not use object.assign as objectId
 * may have fields which we must not copy.
 */
function copyObjectId(id) {
  return createContextObjectId(id.enableCount, id.frameIndex, id.contextId);
}

function endIndexOfElementRange(elementRange) {
  return elementRange.startIndex + elementRange.count;
}

function endIndexOfObjectId(id) {
  if (!id.elementRange) {
    throw new Error('Invariant violation: "id.elementRange"');
  }

  return endIndexOfElementRange(id.elementRange);
}

function startIndexOfObjectId(id, pagesize) {
  if (isSinglePageObjectId(id)) {
    if (!(id.page != null)) {
      throw new Error('Invariant violation: "id.page != null"');
    }

    return id.page * pagesize;
  } else {
    if (!id.elementRange) {
      throw new Error('Invariant violation: "id.elementRange"');
    }

    return id.elementRange.startIndex;
  }
}

function countOfObjectId(id, pagesize, parentEndIndex) {
  if (isSinglePageObjectId(id)) {
    return Math.min(pagesize, parentEndIndex - startIndexOfObjectId(id, pagesize));
  } else {
    if (!id.elementRange) {
      throw new Error('Invariant violation: "id.elementRange"');
    }

    return id.elementRange.count;
  }
}

/*
 * Given a PagedObjectId, return an array of ObjectIds for its children.
 * Note that the children may be a combination of PagedObjectIds and SinglePageObjectIds.
 */
function getChildIds(id) {
  if (!id.elementRange) {
    throw new Error('Invariant violation: "id.elementRange"');
  }

  const pagesize = id.elementRange.pagesize;

  // Handle a page of pages (... of pages)
  let childSize = pagesize;
  while (childSize * pagesize < id.elementRange.count) {
    childSize *= pagesize;
  }

  const result = [];
  let childStartIndex = id.elementRange.startIndex;
  const endIndex = endIndexOfObjectId(id);
  while (childStartIndex < endIndex) {
    const childCount = Math.min(childSize, endIndex - childStartIndex);

    let childId;

    if (!(id.fullname != null)) {
      throw new Error('Invariant violation: "id.fullname != null"');
    }

    if (childCount <= pagesize) {
      childId = singlePageObjectId(id, id.fullname, Math.trunc(childStartIndex / pagesize));
    } else {
      childId = pagedObjectId(id, id.fullname, {
        pagesize,
        startIndex: childStartIndex,
        count: childCount
      });
    }

    result.push(childId);

    childStartIndex += childCount;
  }

  return result;
}