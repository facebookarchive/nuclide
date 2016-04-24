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
import {Subject} from 'rxjs';
import ClangServer from '../lib/ClangServer';

const TEST_FILE = path.join(__dirname, 'fixtures', 'test.cpp');
const FILE_CONTENTS = fs.readFileSync(TEST_FILE).toString('utf8');
const EXPECTED_FILE_OUTLINE = [
  {
    name: 'f',
    extent: {
      start: {line: 0, column: 0},
      end: {line: 1, column: 1},
    },
    cursor_kind: 'FUNCTION_DECL',
    params: [],
    tparams: [],
  },
  {
    name: 'main',
    extent: {
      start: {line: 3, column: 0},
      end: {line: 7, column: 1},
    },
    cursor_kind: 'FUNCTION_DECL',
    params: [],
    tparams: [],
  },
];

// The test file doesn't need any special flags.
const mockFlagsManager = ({
  subject: new Subject(),
  async getFlagsForSrc() {
    return {flags: [], changes: this.subject};
  },
}: any);

describe('ClangServer', () => {

  it('can handle requests', () => {
    waitsForPromise(async () => {
      const server = new ClangServer(mockFlagsManager, TEST_FILE);
      let response = await server.makeRequest('compile', null, {
        contents: FILE_CONTENTS,
      });
      invariant(response);
      expect(response).toEqual({
        reqid: '0',
        diagnostics: [
          {
            severity: 3,
            ranges: [
              {
                file: path.join(__dirname, 'fixtures/test.cpp'),
                start: {column: 2, line: 5},
                end: {column: 3, line: 5},
              },
            ],
            fixits: [],
            location: {
              column: 2,
              line: 5,
              file: path.join(__dirname, 'fixtures/test.cpp'),
            },
            spelling: 'no matching function for call to \'f\'',
            children: [
              {
                location: {
                  column: 5,
                  line: 0,
                  file: path.join(__dirname, 'fixtures/test.cpp'),
                },
                ranges: [],
                spelling: 'candidate function not viable: requires 0 arguments, but 1 was provided',
              },
            ],
          },
          {
            severity: 3,
            ranges: null,
            fixits: [
              {
                range: {
                  file: path.join(__dirname, 'fixtures/test.cpp'),
                  start: {column: 10, line: 6},
                  end: {column: 10, line: 6},
                },
                value: ';',
              },
            ],
            location: {
              column: 10,
              line: 6,
              file: path.join(__dirname, 'fixtures/test.cpp'),
            },
            spelling: 'expected \';\' after return statement',
            children: [],
          },
        ],
        accurateFlags: true,
      });

      const mem = await server.getMemoryUsage();
      expect(mem).toBeGreaterThan(0);

      response = await server.makeRequest('get_completions', null, {
        contents: FILE_CONTENTS,
        line: 4,
        column: 7,
        tokenStartColumn: 7,
        prefix: 'f',
      });
      invariant(response);
      expect(response.reqid).toBe('1');
      expect(response.completions.map(x => x.spelling).sort()).toEqual([
        'f()',
        'false',
        'float',
      ]);

      // This will hit the cache. Double-check the result.
      response = await server.makeRequest('get_completions', null, {
        contents: FILE_CONTENTS,
        line: 4,
        column: 7,
        tokenStartColumn: 7,
        prefix: 'fa',
      });
      invariant(response);
      expect(response.reqid).toBe('2');
      expect(response.completions.map(x => x.spelling).sort()).toEqual([
        'false',
      ]);

      // Function argument completions are a little special.
      response = await server.makeRequest('get_completions', null, {
        contents: FILE_CONTENTS,
        line: 4,
        column: 4,
        tokenStartColumn: 4,
        prefix: '',
      });
      invariant(response);
      expect(response.reqid).toBe('3');
      expect(response.completions[0].spelling).toBe('f()');
      expect(response.completions[0].cursor_kind).toBe('OVERLOAD_CANDIDATE');

      response = await server.makeRequest('get_declaration', null, {
        contents: FILE_CONTENTS,
        line: 4,
        column: 2,
      });
      invariant(response);
      expect(response.reqid).toBe('4');
      const {line, column, spelling, type} = response.locationAndSpelling;
      expect(line).toBe(0);
      expect(column).toBe(5);
      expect(spelling).toBe('f');
      expect(type).toBe('void ()');

      response = await server.makeRequest('get_declaration_info', null, {
        contents: FILE_CONTENTS,
        line: 4,
        column: 2,
      });
      invariant(response);
      expect(response.reqid).toBe('5');
      expect(response.line).toBe(4);
      expect(response.column).toBe(2);
      const {info} = response;
      expect(info.length).toBe(1);
      expect(info[0].name).toBe('f()');
      expect(info[0].type).toBe('FUNCTION_DECL');
      // May not be consistent between clang versions.
      expect(info[0].cursor_usr).not.toBe(null);

      response = await server.makeRequest('get_outline', null, {
        contents: FILE_CONTENTS,
      });
      invariant(response);
      expect(response.outline).toEqual(EXPECTED_FILE_OUTLINE);
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
      let response = await server.makeRequest('compile', null, {
        contents: FILE_CONTENTS,
      });
      expect(response).toBe(null);

      // Default flags should work.
      response = await server.makeRequest('compile', [], {
        contents: FILE_CONTENTS,
      });
      expect(response).not.toBe(null);
      invariant(response);
      expect(response.accurateFlags).toBe(false);

      // Retry should go through.
      spyOn(flagsManager, 'getFlagsForSrc').andReturn(Promise.resolve({
        flags: [],
        changes: new Subject(),
      }));
      response = await server.makeRequest('compile', null, {
        contents: FILE_CONTENTS,
      });
      expect(response).not.toBe(null);
      invariant(response);
      expect(response.accurateFlags).toBe(true);
    });
  });

  it('stops retrying flags after a limit', () => {
    waitsForPromise(async () => {
      let calls = 0;
      const flagsManager = ({
        getFlagsForSrc: async () => {
          calls++;
          throw 'fail';
        },
      }: any);
      const server = new ClangServer(flagsManager, TEST_FILE);
      const retryLimit = 2;
      for (let i = 0; i < retryLimit + 2; i++) {
        /* eslint-disable babel/no-await-in-loop */
        const response = await server.makeRequest('compile', null, {
          contents: FILE_CONTENTS,
        });
        expect(response).toBe(null);
      }
      // Last call should not trigger flags.
      expect(calls).toBe(retryLimit + 1);
    });
  });

  it('gracefully handles server crashes', () => {
    waitsForPromise(async () => {
      const server = new ClangServer(mockFlagsManager, TEST_FILE);
      let response = await server.makeRequest('compile', null, {
        contents: FILE_CONTENTS,
      });
      expect(response).not.toBe(null);

      const {_asyncConnection} = server;
      invariant(_asyncConnection);
      _asyncConnection.dispose();

      // This request should fail, but cleanup should occur.
      let thrown = false;
      try {
        response = await server.makeRequest('compile', null, {
          contents: FILE_CONTENTS,
        });
      } catch (e) {
        thrown = true;
      }
      expect(thrown).toBe(true);

      // The next request should work as expected.
      response = await server.makeRequest('get_declaration', null, {
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
      const compilePromise = server.makeRequest('compile', null, {
        contents: FILE_CONTENTS,
      });

      // Since compilation has been triggered but not awaited, this should instantly fail.
      let response = await server.makeRequest('get_declaration', null, {
        contents: FILE_CONTENTS,
        line: 4,
        column: 2,
      });
      expect(response).toBe(null);

      response = await compilePromise;
      expect(response).not.toBe(null);

      // Should work again after compilation finishes.
      response = await server.makeRequest('get_declaration', null, {
        contents: FILE_CONTENTS,
        line: 4,
        column: 2,
      });
      expect(response).not.toBe(null);
    });
  });

  it('detects changes in the flags file', () => {
    waitsForPromise(async () => {
      const server = new ClangServer(mockFlagsManager, TEST_FILE);
      await server.makeRequest('compile', null, {
        contents: FILE_CONTENTS,
      });
      expect(server.getFlagsChanged()).toBe(false);

      mockFlagsManager.subject.next('change');
      expect(server.getFlagsChanged()).toBe(true);
    });
  });

});
