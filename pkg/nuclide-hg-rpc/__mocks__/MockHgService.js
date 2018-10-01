"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
class MockHgRepositorySubscriptions {
  observeFilesDidChange() {
    return new _RxMin.Subject().publish();
  }

  observeHgIgnoreFileDidChange() {
    return new _RxMin.Subject().publish();
  }

  observeHgRepoStateDidChange() {
    return new _RxMin.Subject().publish();
  }

  observeHgCommitsDidChange() {
    return new _RxMin.Subject().publish();
  }

  observeHgConflictStateDidChange() {
    return new _RxMin.Subject().publish();
  }

  observeActiveBookmarkDidChange() {
    return new _RxMin.Subject().publish();
  }

  observeBookmarksDidChange() {
    return new _RxMin.Subject().publish();
  }

} // This class is meant to be stubbed out.


class MockHgService {
  createRepositorySubscriptions() {
    return Promise.resolve(new MockHgRepositorySubscriptions());
  }

  fetchStatuses(filePaths, options) {
    return new _RxMin.Subject().publish();
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
    return new _RxMin.Observable();
  }

  getFullHashForRevision() {
    return Promise.resolve(null);
  }

  fetchFileContentAtRevision(filePath, revision) {
    return new _RxMin.Subject().publish();
  }

}

exports.default = MockHgService;