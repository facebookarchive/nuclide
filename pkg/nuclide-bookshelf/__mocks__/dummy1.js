"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDummyRepositoryState = getDummyRepositoryState;
exports.getDummyBookShelfState = getDummyBookShelfState;
exports.ACTIVE_SHOTHEAD_1 = exports.SHOTHEAD_1_2 = exports.SHOTHEAD_1_1 = exports.REPO_PATH_1 = void 0;

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const REPO_PATH_1 = '/fake/path_1';
exports.REPO_PATH_1 = REPO_PATH_1;
const SHOTHEAD_1_1 = 'foo';
exports.SHOTHEAD_1_1 = SHOTHEAD_1_1;
const SHOTHEAD_1_2 = 'bar';
exports.SHOTHEAD_1_2 = SHOTHEAD_1_2;
const ACTIVE_SHOTHEAD_1 = 'bar';
exports.ACTIVE_SHOTHEAD_1 = ACTIVE_SHOTHEAD_1;

function getDummyRepositoryState() {
  return {
    activeShortHead: ACTIVE_SHOTHEAD_1,
    isRestoring: false,
    shortHeadsToFileList: Immutable().Map([[SHOTHEAD_1_1, ['c.txt', 'd.txt']], [SHOTHEAD_1_2, ['e.txt']]])
  };
}

function getDummyBookShelfState() {
  return Object.freeze({
    repositoryPathToState: Immutable().Map([[REPO_PATH_1, getDummyRepositoryState()]])
  });
}