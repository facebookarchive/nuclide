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
import nuclideUri from '../../commons-node/nuclideUri';
import {addMatchers} from '../../nuclide-test-helpers';
import ClangServer from '../lib/ClangServer';
import findClangServerArgs from '../lib/find-clang-server-args';

const TEST_FILE = nuclideUri.join(__dirname, 'fixtures', 'test.cpp');
const FILE_CONTENTS = fs.readFileSync(TEST_FILE).toString('utf8');
const EXPECTED_FILE_OUTLINE = [
  {
    name: 'f',
    extent: {
      start: {line: 0, column: 0},
      end: {line: 1, column: 1},
    },
    cursor_kind: 'FUNCTION_DECL',
    params: ['x'],
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

describe('ClangServer', () => {

  beforeEach(function() {
    addMatchers(this);
  });

  it('can handle requests', () => {
    waitsForPromise(async () => {
      const serverArgs = await findClangServerArgs();
      const server = new ClangServer(TEST_FILE, serverArgs, []);
      const service = await server.getService();
      let response = await server.compile(
        FILE_CONTENTS,
      );
      invariant(response);
      expect(response).toEqual({
        diagnostics: [
          {
            severity: 3,
            ranges: [
              {
                file: nuclideUri.join(__dirname, 'fixtures/test.cpp'),
                start: {column: 2, line: 5},
                end: {column: 6, line: 5},
              },
            ],
            fixits: [],
            location: {
              column: 2,
              line: 5,
              file: nuclideUri.join(__dirname, 'fixtures/test.cpp'),
            },
            spelling: 'no matching function for call to \'main\'',
            children: [
              {
                location: {
                  column: 4,
                  line: 3,
                  file: nuclideUri.join(__dirname, 'fixtures/test.cpp'),
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
                  file: nuclideUri.join(__dirname, 'fixtures/test.cpp'),
                  start: {column: 10, line: 6},
                  end: {column: 10, line: 6},
                },
                value: ';',
              },
            ],
            location: {
              column: 10,
              line: 6,
              file: nuclideUri.join(__dirname, 'fixtures/test.cpp'),
            },
            spelling: 'expected \';\' after return statement',
            children: [],
          },
        ],
      });

      const mem = await server.getMemoryUsage();
      expect(mem).toBeGreaterThan(0);

      response = await service.get_completions(
        FILE_CONTENTS,
        4,
        7,
        7,
        'f',
      );
      invariant(response);
      expect(response.map(x => x.spelling).sort()).toEqual([
        'f(int x)',
        'false',
        'float',
      ]);

      // This will hit the cache. Double-check the result.
      response = await service.get_completions(
        FILE_CONTENTS,
        4,
        7,
        7,
        'fa',
      );
      invariant(response);
      expect(response.map(x => x.spelling).sort()).toEqual([
        'false',
      ]);

      // Function argument completions are a little special.
      response = await service.get_completions(
        FILE_CONTENTS,
        4,
        4,
        4,
        '',
      );
      invariant(response);
      expect(response[0].spelling).toBe('f(int x)');
      expect(response[0].cursor_kind).toBe('OVERLOAD_CANDIDATE');

      response = await service.get_declaration(
        FILE_CONTENTS,
        4,
        2,
      );
      invariant(response);
      const {line, column, spelling, type} = response;
      expect(line).toBe(0);
      expect(column).toBe(5);
      expect(spelling).toBe('f');
      expect(type).toBe('void (int)');

      response = await service.get_declaration_info(
        FILE_CONTENTS,
        4,
        2,
      );
      invariant(response);
      expect(response.length).toBe(1);
      expect(response[0].name).toBe('f(int)');
      expect(response[0].type).toBe('FUNCTION_DECL');
      // May not be consistent between clang versions.
      expect(response[0].cursor_usr).not.toBe(null);

      response = await service.get_outline(
        FILE_CONTENTS,
      );
      invariant(response);
      expect(response).toEqual(EXPECTED_FILE_OUTLINE);
    });
  });

  it('gracefully handles server crashes', () => {
    waitsForPromise(async () => {
      const serverArgs = await findClangServerArgs();
      const server = new ClangServer(TEST_FILE, serverArgs, []);
      let response = await server.compile(
        FILE_CONTENTS,
      );
      expect(response).not.toBe(null);

      const {_process} = server;
      invariant(_process);
      _process.kill();

      // This request should fail, but cleanup should occur.
      let thrown = false;
      try {
        response = await server.compile(
          FILE_CONTENTS,
        );
      } catch (e) {
        thrown = true;
      }
      expect(thrown).toBe(true);

      // The next request should work as expected.
      const service = await server.getService();
      response = await service.get_declaration(
        FILE_CONTENTS,
        4,
        2,
      );
      expect(response).not.toBe(null);
    });
  });

  it('supports get_local_references', () => {
    waitsForPromise(async () => {
      const file = nuclideUri.join(__dirname, 'fixtures', 'references.cpp');
      const serverArgs = await findClangServerArgs();
      const server = new ClangServer(file, serverArgs, []);
      const service = await server.getService();

      const fileContents = fs.readFileSync(file).toString('utf8');
      const compileResponse = await server.compile(fileContents);

      invariant(compileResponse != null);
      expect(compileResponse.diagnostics).toEqual([]);

      // param var1
      expect(await service.get_local_references(fileContents, 1, 24)).diffJson({
        cursor_name: 'var1',
        cursor_kind: 'PARM_DECL',
        references: [
          {start: {line: 1, column: 24}, end: {line: 1, column: 27}},
          {start: {line: 2, column: 13}, end: {line: 2, column: 16}},
          {start: {line: 2, column: 20}, end: {line: 2, column: 23}},
          {start: {line: 3, column: 20}, end: {line: 3, column: 23}},
          {start: {line: 4, column: 2}, end: {line: 4, column: 5}},
          {start: {line: 9, column: 9}, end: {line: 9, column: 12}},
          {start: {line: 9, column: 16}, end: {line: 9, column: 19}},
        ],
      });

      // var2 (from a reference)
      expect(await service.get_local_references(fileContents, 4, 9)).diffJson({
        cursor_name: 'var2',
        cursor_kind: 'VAR_DECL',
        references: [
          {start: {line: 2, column: 6}, end: {line: 2, column: 9}},
          {start: {line: 4, column: 9}, end: {line: 4, column: 12}},
        ],
      });

      // var3
      expect(await service.get_local_references(fileContents, 2, 26)).diffJson({
        cursor_name: 'var3',
        cursor_kind: 'VAR_DECL',
        references: [
          {start: {line: 2, column: 26}, end: {line: 2, column: 29}},
        ],
      });

      // inner var1
      expect(await service.get_local_references(fileContents, 6, 11)).diffJson({
        cursor_name: 'var1',
        cursor_kind: 'VAR_DECL',
        references: [
          {start: {line: 6, column: 11}, end: {line: 6, column: 14}},
          {start: {line: 6, column: 22}, end: {line: 6, column: 25}},
          {start: {line: 6, column: 33}, end: {line: 6, column: 36}},
          {start: {line: 7, column: 11}, end: {line: 7, column: 14}},
        ],
      });

      // nothing
      expect(await service.get_local_references(fileContents, 0, 0)).toBe(null);
      expect(await service.get_local_references(fileContents, 11, 0)).toBe(null);
    });
  });

  it('tracks server status', () => {
    waitsForPromise(async () => {
      const serverArgs = await findClangServerArgs();
      const server = new ClangServer(TEST_FILE, serverArgs, []);
      expect(server.getStatus()).toBe('ready');
      server.compile('');

      expect(server.getStatus()).toBe('compiling');
      await server.waitForReady();
      expect(server.getStatus()).toBe('ready');
    });
  });

});
