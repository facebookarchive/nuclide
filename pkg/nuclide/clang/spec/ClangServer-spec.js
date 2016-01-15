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
  async getFlagsForSrc() {
    return [];
  },
}: any);

describe('ClangServer', () => {

  it('can handle requests', () => {
    waitsForPromise(async () => {
      const server = new ClangServer(mockFlagsManager, TEST_FILE);
      let response = await server.makeRequest('compile', {
        contents: FILE_CONTENTS,
      });
      invariant(response);
      expect(response).toEqual({
        reqid: '0',
        diagnostics: [],
      });

      response = await server.makeRequest('get_completions', {
        contents: FILE_CONTENTS,
        line: 4,
        column: 7,
        tokenStartColumn: 7,
        prefix: 'f',
      });
      invariant(response);
      expect(response.reqid).toBe('1');
      expect(response.completions.map(x => x.spelling)).toEqual([
        'false',
        'float',
        'f()',
      ]);

      response = await server.makeRequest('get_declaration', {
        contents: FILE_CONTENTS,
        line: 4,
        column: 2,
      });
      invariant(response);
      expect(response.reqid).toBe('2');
      const {line, column, spelling, type} = response.locationAndSpelling;
      expect(line).toBe(0);
      expect(column).toBe(5);
      expect(spelling).toBe('f');
      expect(type).toBe('void ()');
    });
  });

  it('returns null when flags are unavailable', () => {
    waitsForPromise(async () => {
      const flagsManager = ({
        getFlagsForSrc: async () => {
          throw 'fail';
        },
      }: any);
      const server = new ClangServer(flagsManager, TEST_FILE);
      let response = await server.makeRequest('compile', {
        contents: FILE_CONTENTS,
      });
      expect(response).toBe(null);

      // Retry should go through.
      spyOn(flagsManager, 'getFlagsForSrc').andReturn(Promise.resolve([]));
      response = await server.makeRequest('compile', {
        contents: FILE_CONTENTS,
      });
      expect(response).not.toBe(null);
    });
  });

  it('gracefully handles server crashes', () => {
    waitsForPromise(async () => {
      const server = new ClangServer(mockFlagsManager, TEST_FILE);
      let response = await server.makeRequest('compile', {
        contents: FILE_CONTENTS,
      });
      expect(response).not.toBe(null);

      const {_asyncConnection} = server;
      invariant(_asyncConnection);
      _asyncConnection.dispose();

      // This request should fail, but cleanup should occur.
      let thrown = false;
      try {
        response = await server.makeRequest('compile', {
          contents: FILE_CONTENTS,
        });
      } catch (e) {
        thrown = true;
      }
      expect(thrown).toBe(true);

      // The next request should work as expected.
      response = await server.makeRequest('get_declaration', {
        contents: FILE_CONTENTS,
        line: 4,
        column: 2,
      });
      expect(response).not.toBe(null);
    });
  });

  it('blocks other requests during compilation', () => {
    waitsForPromise(async () => {
      const server = new ClangServer(mockFlagsManager, TEST_FILE);
      const compilePromise = server.makeRequest('compile', {
        contents: FILE_CONTENTS,
      });

      // Since compilation has been triggered but not awaited, this should instantly fail.
      let response = await server.makeRequest('get_declaration', {
        contents: FILE_CONTENTS,
        line: 4,
        column: 2,
      });
      expect(response).toBe(null);

      response = await compilePromise;
      expect(response).not.toBe(null);

      // Should work again after compilation finishes.
      response = await server.makeRequest('get_declaration', {
        contents: FILE_CONTENTS,
        line: 4,
        column: 2,
      });
      expect(response).not.toBe(null);
    });
  });

});
