'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Disposable} from 'event-kit';
import type {DiffInfo, StatusCodeIdValue} from '../lib/hg-constants';
import type {NuclideUri} from 'nuclide-remote-uri';
var HgService = require('../lib/HgService');

// This class is meant to be stubbed out.
class MockHgService extends HgService {
  fetchStatuses(
    filePaths: Array<NuclideUri>,
    options: ?any
  ): Promise<{[key: string]: StatusCodeIdValue}> {
    return Promise.resolve({});
  }

  onFilesDidChange(callback: (changedPaths: Array<NuclideUri>) => void): Disposable {
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
