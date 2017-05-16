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

import invariant from 'assert';

import {uriToPath} from './helpers';
import File from './File';

/**
 * Handles registering files encountered during debugging with the Chrome debugger
 */
export default class FileCache {
  _sendServerMethod: (method: string, params: ?Object) => mixed;
  _files: Map<string, File>;

  constructor(sendServerMethod: (method: string, params: ?Object) => mixed) {
    this._sendServerMethod = sendServerMethod;
    this._files = new Map();
  }

  registerFile(fileUrl: string): File {
    const filepath = uriToPath(fileUrl);
    if (!this._files.has(filepath)) {
      this._files.set(filepath, new File(filepath));
      this._sendServerMethod('Debugger.scriptParsed', {
        scriptId: filepath,
        url: fileUrl,
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 0,
      });
    }
    const result = this._files.get(filepath);
    invariant(result != null);
    return result;
  }

  getFileSource(filepath: string): Promise<string> {
    return this.registerFile(filepath).getSource();
  }
}
