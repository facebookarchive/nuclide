'use babel';
/* flow */
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type DiffViewState = {
  filePath: string;
  oldText: string;
  newText: string;
};

class DiffViewModel {
  // The model will evolve with every step of the diff view to include more of the diff and source control logic.
  constructor(uri: string, filePath: string) {
    this._uri = uri;
    this._filePath = filePath;
  }

  getDiffState(): Promise<DiffViewState> {
    // TODO(most): fetch from the repo and the filesystem.
    return Promise.resolve({
      filePath: this._filePath,
      oldText: 'sossa\nabc-long-text\ndef\nghikl\nnew-line-of-matching-text',
      newText: 'sossa\nnew-abc-long-text\nghiklm\nnew-line-of-matching-text',
    });
  }

  getURI(): string {
    return this._uri;
  }
}

module.exports = DiffViewModel;
