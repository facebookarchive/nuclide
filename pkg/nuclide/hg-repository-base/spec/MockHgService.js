'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Disposable} = require('atom');
var HgService = require('../lib/HgService');

// This class is meant to be stubbed out.
class MockHgService extends HgService {
  fetchStatuses(filePaths: Array<NuclideUri>, options: ?any): Promise<{[key: string]: StatusCodeId}> {
    return Promise.resolve({});
  }

  onFilesDidChange(callback: () => void): Disposable {
    return new Disposable();
  }

  onHgIgnoreFileDidChange(callback: () => void): Disposable {
    return new Disposable();
  }

  onHgRepoStateDidChange(callback: () => void): Disposable {
    return new Disposable();
  }

  fetchDiffInfo(filePath: NuclideUri): Promise<?DiffInfo> {
    return Promise.resolve(null);
  }

  fetchCurrentBookmark(): Promise<string> {
    return Promise.resolve('');
  }

  onHgBookmarkDidChange(): Disposable {
    return new Disposable();
  }
}

module.exports = MockHgService;
