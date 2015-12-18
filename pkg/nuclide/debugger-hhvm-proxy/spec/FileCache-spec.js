'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ClientCallback} from '../lib/ClientCallback';

const FileCache = require('../lib/FileCache');

describe('debugger-hhvm-proxy FileCache', () => {
  let callback;
  let cache;
  let filepath;

  beforeEach(() => {
    callback = ((
      jasmine.createSpyObj('callback', ['replyToCommand', 'replyWithError', 'sendMethod']): any
    ): ClientCallback);
    cache = new FileCache(callback);
    const path = require('path');
    const fixturesPath = path.join(__dirname, 'fixtures');
    filepath = path.join(fixturesPath, 'test.php');
  });

  it('registerFile - source file path', () => {
    waitsForPromise(async () => {
      const sourceFileUrl = `file://${filepath}`;
      cache.registerFile(sourceFileUrl);
      expect(callback.sendMethod).toHaveBeenCalledWith(
        'Debugger.scriptParsed',
        {
          'scriptId': filepath,
          'url': sourceFileUrl,
          'startLine': 0,
          'startColumn': 0,
          'endLine': 0,
          'endColumn': 0,
        });
      const source = await cache.getFileSource(filepath);
      expect(source).toBe('<?hh\n');
    });
  });

  it('registerFile - no source file', () => {
    waitsForPromise(async () => {
      const noSourceFileUrl = filepath;
      cache.registerFile(noSourceFileUrl);
      expect(callback.sendMethod).toHaveBeenCalledWith(
        'Debugger.scriptParsed',
        {
          'scriptId': filepath,
          'url': noSourceFileUrl,
          'startLine': 0,
          'startColumn': 0,
          'endLine': 0,
          'endColumn': 0,
        });
      const source = await cache.getFileSource(filepath);
      expect(source).toBe('<?hh\n');
    });
  });
});
