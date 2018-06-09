/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {RevisionInfo} from '../lib/HgService';

export function createMockRevisionInfo(customValues: Object): RevisionInfo {
  const blankRevisionInfo: RevisionInfo = {
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
    files: [],
  };

  return {
    ...blankRevisionInfo,
    ...customValues,
  };
}
