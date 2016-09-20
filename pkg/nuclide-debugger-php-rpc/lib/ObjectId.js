Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

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

var WATCH_CONTEXT_ID = 'Watch Context Id';

function getWatchContextObjectId(enableCount, frameIndex) {
  return createContextObjectId(enableCount, frameIndex, WATCH_CONTEXT_ID);
}

function remoteObjectIdOfObjectId(id) {
  return JSON.stringify(id);
}

function createContextObjectId(enableCount, frameIndex, contextId) {
  return {
    enableCount: enableCount,
    frameIndex: frameIndex,
    contextId: contextId
  };
}

function pagedObjectId(objectId, fullname, elementRange) {
  var result = copyObjectId(objectId);
  result.fullname = fullname;
  result.elementRange = elementRange;

  return result;
}

function singlePageObjectId(objectId, fullname, page) {
  var result = copyObjectId(objectId);
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
  (0, (_assert2 || _assert()).default)(id.elementRange);
  return endIndexOfElementRange(id.elementRange);
}

function startIndexOfObjectId(id, pagesize) {
  if (isSinglePageObjectId(id)) {
    (0, (_assert2 || _assert()).default)(id.page != null);
    return id.page * pagesize;
  } else {
    (0, (_assert2 || _assert()).default)(id.elementRange);
    return id.elementRange.startIndex;
  }
}

function countOfObjectId(id, pagesize, parentEndIndex) {
  if (isSinglePageObjectId(id)) {
    return Math.min(pagesize, parentEndIndex - startIndexOfObjectId(id, pagesize));
  } else {
    (0, (_assert2 || _assert()).default)(id.elementRange);
    return id.elementRange.count;
  }
}

/*
 * Given a PagedObjectId, return an array of ObjectIds for its children.
 * Note that the children may be a combination of PagedObjectIds and SinglePageObjectIds.
 */
function getChildIds(id) {
  (0, (_assert2 || _assert()).default)(id.elementRange);
  var pagesize = id.elementRange.pagesize;

  // Handle a page of pages (... of pages)
  var childSize = pagesize;
  while (childSize * pagesize < id.elementRange.count) {
    childSize *= pagesize;
  }

  var result = [];
  var childStartIndex = id.elementRange.startIndex;
  var endIndex = endIndexOfObjectId(id);
  while (childStartIndex < endIndex) {
    var childCount = Math.min(childSize, endIndex - childStartIndex);

    var childId = undefined;
    (0, (_assert2 || _assert()).default)(id.fullname != null);
    if (childCount <= pagesize) {
      childId = singlePageObjectId(id, id.fullname, Math.trunc(childStartIndex / pagesize));
    } else {
      childId = pagedObjectId(id, id.fullname, { pagesize: pagesize, startIndex: childStartIndex, count: childCount });
    }

    result.push(childId);

    childStartIndex += childCount;
  }

  return result;
}

module.exports = {
  remoteObjectIdOfObjectId: remoteObjectIdOfObjectId,
  createContextObjectId: createContextObjectId,
  pagedObjectId: pagedObjectId,
  singlePageObjectId: singlePageObjectId,
  isContextObjectId: isContextObjectId,
  isSinglePageObjectId: isSinglePageObjectId,
  isPagedObjectId: isPagedObjectId,
  copyObjectId: copyObjectId,
  endIndexOfElementRange: endIndexOfElementRange,
  endIndexOfObjectId: endIndexOfObjectId,
  startIndexOfObjectId: startIndexOfObjectId,
  countOfObjectId: countOfObjectId,
  getChildIds: getChildIds,
  getWatchContextObjectId: getWatchContextObjectId,
  isWatchContextObjectId: isWatchContextObjectId
};