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
import {getCompletions} from '../lib/JediService';

// Test python file located at fixtures/serverdummy.py
const TEST_FILE = path.join(__dirname, 'fixtures', 'serverdummy.py');
const FILE_CONTENTS = fs.readFileSync(TEST_FILE).toString('utf8');

// Line/column actual offsets are 0-indexed in this test, similar to what atom
// provides as input.
describe('JediService', () => {

  describe('Completions', () => {
    it('gives a rejected promise when an invalid request is given', () => {
      waitsForPromise(async () => {
        // Basically everything is wrong here, but politely reject the promise.
        try {
          await getCompletions('potato', 'tomato', 5, 15);
          // Fail - this line should not be reachable.
          invariant(false);
        } catch (e) {
          // Python process should respond with a Traceback for what went wrong while
          // processing the request.
          expect(e.message.startsWith('Traceback')).toBeTruthy();
        }
      });
    });

    it('can make completion suggestions for imported module member functions', () => {
      waitsForPromise(async () => {
        // line 11: def hello = os.path.isab
        const response = await getCompletions(TEST_FILE, FILE_CONTENTS, 10, 24);
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
        // line 13: potato2 = po
        const response = await getCompletions(TEST_FILE, FILE_CONTENTS, 12, 12);
        invariant(response);
        expect(response.completions.length).toBeGreaterThan(0);

        const completion = response.completions[0];
        expect(completion.text).toEqual('potato');
        expect(completion.type).toEqual('statement');
      });
    });
  });

});
