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
import {
  getCompletions,
  getDefinitions,
  getReferences,
  getOutline,
} from '../lib/PythonService';

// Test python file located at fixtures/serverdummy.py
const TEST_FILE = path.join(__dirname, 'fixtures', 'serverdummy.py');
const FILE_CONTENTS = fs.readFileSync(TEST_FILE).toString('utf8');

// Line/column actual offsets are 0-indexed in this test, similar to what atom
// provides as input.
describe('PythonService', () => {

  describe('Completions', () => {
    it('gives a rejected promise when an invalid request is given', () => {
      waitsForPromise(async () => {
        // Basically everything is wrong here, but politely reject the promise.
        try {
          await getCompletions('potato', 'tomato', 6, 15);
          // Fail - this line should not be reachable.
          invariant(false);
        } catch (e) {
          // Python process should respond with a Traceback for what went wrong while
          // processing the request.
          expect(e.startsWith('Traceback')).toBeTruthy();
        }
      });
    });

    it('can make completion suggestions for imported module member functions', () => {
      waitsForPromise(async () => {
        // line 12: def hello = os.path.isab
        const response = await getCompletions(TEST_FILE, FILE_CONTENTS, 11, 20);
        invariant(response);
        expect(response.completions.length).toBeGreaterThan(0);

        const completion = response.completions[0];
        expect(completion.text).toEqual('isabs');
        expect(completion.type).toEqual('function');
        // Check that description exists.
        expect(completion.description).toBeTruthy();
      });
    });

    it('can make completion suggestions for locally defined variables', () => {
      waitsForPromise(async () => {
        // line 14: potato2 = po
        const response = await getCompletions(TEST_FILE, FILE_CONTENTS, 13, 12);
        invariant(response);
        expect(response.completions.length).toBeGreaterThan(0);

        const completion = response.completions[0];
        expect(completion.text).toEqual('potato');
        expect(completion.type).toEqual('statement');
      });
    });

    it('classifies methods with @property decorators as properties', () => {
      waitsForPromise(async () => {
        // line 17: a.t
        const response = await getCompletions(TEST_FILE, FILE_CONTENTS, 17, 3);
        invariant(response);
        expect(response.completions.length).toBeGreaterThan(0);

        const completion = response.completions[0];
        expect(completion.text).toEqual('test');
        expect(completion.type).toEqual('property');
      });
    });
  });

  describe('Definitions', () => {
    it('gives a rejected promise when an invalid request is given', () => {
      waitsForPromise(async () => {
        // Basically everything is wrong here, but politely reject the promise.
        try {
          await getDefinitions('potato', 'tomato', 6, 15);
          // Fail - this line should not be reachable.
          invariant(false);
        } catch (e) {
          // Python process should respond with a Traceback for what went wrong while
          // processing the request.
          expect(e.startsWith('Traceback')).toBeTruthy();
        }
      });
    });

    it('can find definitions for imported modules', () => {
      waitsForPromise(async () => {
        // line 9: import os
        const response = await getDefinitions(TEST_FILE, FILE_CONTENTS, 7, 8);
        invariant(response);
        expect(response.definitions.length).toBeGreaterThan(0);

        const definition = response.definitions[0];
        expect(definition.text).toEqual('os');
        expect(definition.type).toEqual('module');
        // Path is machine dependent, so just check that it exists and isn't empty.
        expect(definition.file.length).toBeGreaterThan(0);
      });
    });

    it('can find the definitions of locally defined variables', () => {
      waitsForPromise(async () => {
        // line 15: potato3 = potato
        const response = await getDefinitions(TEST_FILE, FILE_CONTENTS, 14, 12);
        invariant(response);
        expect(response.definitions.length).toBeGreaterThan(0);

        const definition = response.definitions[0];
        expect(definition.text).toEqual('potato');
        expect(definition.type).toEqual('statement');
        expect(definition.line).toEqual(12);
        // Local variable definition should be within the same file.
        expect(definition.file).toEqual(TEST_FILE);
      });
    });
  });

  describe('References', () => {
    it('can find the references of locally defined variables', () => {
      waitsForPromise(async () => {
        // line 13: potato = 5
        const response = await getReferences(TEST_FILE, FILE_CONTENTS, 12, 2);
        invariant(response);

        expect(response.references).toEqual([
          {
            type: 'statement',
            text: 'potato',
            file: TEST_FILE,
            line: 12,
            column: 0,
          },
          {
            type: 'statement',
            text: 'potato',
            file: TEST_FILE,
            line: 14,
            column: 10,
          },
        ]);
      });
    });

    it('displays the caller name for references within functions', () => {
      waitsForPromise(async () => {
        // line 13: potato = 5
        const response = await getReferences(TEST_FILE, FILE_CONTENTS, 19, 2);
        invariant(response);

        expect(response.references).toEqual([
          {
            type: 'statement',
            text: 'test_parent_name',
            file: TEST_FILE,
            line: 19,
            column: 0,
          },
          {
            type: 'node',
            text: 'test_parent_name',
            file: TEST_FILE,
            line: 23,
            column: 10,
            parentName: 'test_fn',
          },
        ]);
      });
    });
  });

  describe('Outlines', () => {

    function checkOutlineTree(testName: string) {
      waitsForPromise(async () => {
        const dirName = path.join(__dirname, 'fixtures', 'outline-tests');

        const srcPath = path.join(dirName, testName + '.py');
        const srcContents = fs.readFileSync(srcPath).toString('utf8');

        const jsonPath = path.join(dirName, 'expected', testName + '.json');
        const jsonContents = fs.readFileSync(jsonPath).toString('utf8');

        const response = await getOutline(srcPath, srcContents);
        expect(response).toEqual(JSON.parse(jsonContents));
      });
    }

    it('can generate an outline for a basic python script', () => {
      checkOutlineTree('1');
    });

    it('can generate an outline when minor syntax errors exist', () => {
      checkOutlineTree('2');
    });

    it('can generate an outline when decorated functions are present', () => {
      checkOutlineTree('3');
    });

    it('properly includes multiple assignments in the outline', () => {
      checkOutlineTree('4');
    });
  });

});
