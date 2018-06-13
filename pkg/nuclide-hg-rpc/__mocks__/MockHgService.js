'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

class MockHgRepositorySubscriptions {
  observeFilesDidChange() {
    return new _rxjsBundlesRxMinJs.Subject().publish();
  }

  observeHgIgnoreFileDidChange() {
    return new _rxjsBundlesRxMinJs.Subject().publish();
  }

  observeHgRepoStateDidChange() {
    return new _rxjsBundlesRxMinJs.Subject().publish();
  }

  observeHgCommitsDidChange() {
    return new _rxjsBundlesRxMinJs.Subject().publish();
  }

  observeHgConflictStateDidChange() {
    return new _rxjsBundlesRxMinJs.Subject().publish();
  }

  observeActiveBookmarkDidChange() {
    return new _rxjsBundlesRxMinJs.Subject().publish();
  }

  observeBookmarksDidChange() {
    return new _rxjsBundlesRxMinJs.Subject().publish();
  }
}

// This class is meant to be stubbed out.
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

class MockHgService {
  createRepositorySubscriptions() {
    return Promise.resolve(new MockHgRepositorySubscriptions());
  }

  fetchStatuses(filePaths, options) {
    return new _rxjsBundlesRxMinJs.Subject().publish();
  }

  deleteBookmark(name) {
    return Promise.resolve();
  }

  renameBookmark(name, nextName) {
    return Promise.resolve();
  }

  fetchDiffInfo(filePaths) {
    return Promise.resolve(null);
  }

  fetchActiveBookmark() {
    return Promise.resolve('');
  }

  fetchBookmarks() {
    return Promise.resolve([]);
  }

  dispose() {
    return Promise.resolve();
  }

  getHeadId() {
    return new _rxjsBundlesRxMinJs.Observable();
  }

  getFullHashForRevision() {
    return Promise.resolve(null);
  }

  fetchFileContentAtRevision(filePath, revision) {
    return new _rxjsBundlesRxMinJs.Subject().publish();
  }
}
exports.default = MockHgService;