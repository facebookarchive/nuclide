'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMockRevisionInfo = createMockRevisionInfo;
function createMockRevisionInfo(customValues) {
  const blankRevisionInfo = {
    author: '',
    bookmarks: [],
    branch: '',
    date: new Date(),
    description: 'bar',
    hash: '0',
    id: 0,
    isHead: false,
    remoteBookmarks: [],
    parents: [],
    phase: 'draft',
    successorInfo: null,
    tags: [],
    title: 'foo',
    files: []
  };

  return Object.assign({}, blankRevisionInfo, customValues);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */