/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import fsPromise from 'nuclide-commons/fsPromise';

/**
 * A file in the file cache.
 */
export default class File {
  _path: string;
  _source: ?string;

  constructor(path: string) {
    this._path = path;
    this._source = null;
  }

  async getSource(): Promise<string> {
    const hasSource = await this.hasSource();
    if (!hasSource) {
      return '';
    }
    let source = this._source;
    if (source == null) {
      source = await fsPromise.readFile(this._path, 'utf8');
      this._source = source;
    }
    return source;
  }

  async hasSource(): Promise<boolean> {
    // t12549106 -- this is a workaround for some HHVM goofiness.
    return (
      (await fsPromise.exists(this._path)) &&
      (await fsPromise.lstat(this._path)).isFile()
    );
  }
}
