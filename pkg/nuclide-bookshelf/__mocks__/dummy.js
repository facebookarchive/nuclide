'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ACTIVE_SHOTHEAD_1 = exports.SHOTHEAD_1_2 = exports.SHOTHEAD_1_1 = exports.REPO_PATH_1 = undefined;
exports.getDummyRepositoryState = getDummyRepositoryState;
exports.getDummyBookShelfState = getDummyBookShelfState;

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

const REPO_PATH_1 = exports.REPO_PATH_1 = '/fake/path_1';
const SHOTHEAD_1_1 = exports.SHOTHEAD_1_1 = 'foo';
const SHOTHEAD_1_2 = exports.SHOTHEAD_1_2 = 'bar';
const ACTIVE_SHOTHEAD_1 = exports.ACTIVE_SHOTHEAD_1 = 'bar';

function getDummyRepositoryState() {
  return {
    activeShortHead: ACTIVE_SHOTHEAD_1,
    isRestoring: false,
    shortHeadsToFileList: (_immutable || _load_immutable()).Map([[SHOTHEAD_1_1, ['c.txt', 'd.txt']], [SHOTHEAD_1_2, ['e.txt']]])
  };
}

function getDummyBookShelfState() {
  return Object.freeze({
    repositoryPathToState: (_immutable || _load_immutable()).Map([[REPO_PATH_1, getDummyRepositoryState()]])
  });
}