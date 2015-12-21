'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import fs from 'fs';
import path from 'path';
import ClangServer from '../lib/ClangServer';

const TEST_FILE = path.join(__dirname, 'fixtures', 'test.cpp');
const FILE_CONTENTS = fs.readFileSync(TEST_FILE).toString('utf8');

// The test file doesn't need any special flags.
const mockFlagsManager = ({
  getFlagsForSrc() {
    return [];
  },
}: any);

describe('ClangServer', () => {

  it('can handle requests', () => {
    waitsForPromise(async () => {
      const server = new ClangServer(mockFlagsManager);
      let response = await server.makeRequest('compile', TEST_FILE, {
        contents: FILE_CONTENTS,
      });
      invariant(response);
      expect(response).toEqual({
        reqid: '0',
        diagnostics: [],
      });

      response = await server.makeRequest('get_completions', TEST_FILE, {
        contents: FILE_CONTENTS,
        line: 4,
        column: 7,
        tokenStartColumn: 7,
        prefix: 'f',
      });
      invariant(response);
      expect(response.reqid).toBe('1');
      expect(response.completions.map(x => x.spelling)).toEqual([
        'bool false',
        'float',
        'void f()',
      ]);

      response = await server.makeRequest('get_declaration', TEST_FILE, {
        contents: FILE_CONTENTS,
        line: 4,
        column: 2,
      });
      invariant(response);
      expect(response.reqid).toBe('2');
      const {line, column} = response.locationAndSpelling;
      expect(line).toBe(0);
      expect(column).toBe(5);
    });
  });

  it('returns null when flags are unavailable', () => {
    waitsForPromise(async () => {
      const flagsManager = ({getFlagsForSrc: () => null}: any);
      const server = new ClangServer(flagsManager);
      const response = await server.makeRequest('compile', TEST_FILE, {
        contents: FILE_CONTENTS,
      });
      expect(response).toBe(null);
    });
  });

  it('gracefully handles server crashes', () => {
    waitsForPromise(async () => {
      const server = new ClangServer(mockFlagsManager);
      let response = await server.makeRequest('compile', TEST_FILE, {
        contents: FILE_CONTENTS,
      });
      expect(response).not.toBe(null);

      const {_asyncConnection} = server;
      invariant(_asyncConnection);
      _asyncConnection.dispose();

      // Yield to the clang server's error handler to reset the connection first.
      // TODO(hansonw): remove this when pending requests are properly removed.
      window.useRealClock();
      await new Promise((resolve) => setTimeout(resolve, 10));

      response = await server.makeRequest('compile', TEST_FILE, {
        contents: FILE_CONTENTS,
      });
      expect(response).not.toBe(null);
    });
  });

});
