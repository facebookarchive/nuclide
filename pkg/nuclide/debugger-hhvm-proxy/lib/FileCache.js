'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


/**
 * Handles registering files encountered during debugging with the Chrome debugger
 */
class FileCache {
  _callback: ChromeCallback;
  _files: Map<string, File>;

  constructor(callback: ChromeCallback) {
    this._callback = callback;
    this._files = new Map();
  }

  registerFile(filepath: string): File {
    if (!this._files.has(filepath)) {
      var File = require('./File');
      this._files.set(filepath, new File(filepath));
      this._callback.sendMethod(
        'Debugger.scriptParsed',
        {
          'scriptId': filepath,
          'url': 'file://' + filepath,
          'startLine': 0,
          'startColumn': 0,
          'endLine': 0,
          'endColumn': 0,
        });
    }
    return this._files.get(filepath);
  }

  getFileSource(filepath: string): Promise<string> {
    return this.registerFile(filepath).getSource();
  }
}

module.exports = FileCache;
