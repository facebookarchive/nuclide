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

import fs from 'fs';
import fsPromise from 'nuclide-commons/fsPromise';
import nuclideUri from 'nuclide-commons/nuclideUri';
import ScribeProcess, {__test__} from '../ScribeProcess';

describe('scribe_cat test suites', () => {
  let tempDir = '';
  let originalCommand = '';

  function getContentOfScribeCategory(category: string): Array<string> {
    try {
      const categoryFilePath = nuclideUri.join(tempDir, category);
      const content = fs.readFileSync(categoryFilePath, 'utf8');
      const result = content.split('\n').filter(item => item.length > 0);
      return result;
    } catch (err) {
      return [];
    }
  }

  beforeEach(() => {
    jasmine.useRealClock();
    // Simulated scribe_cat script which saves data into:
    //   ${process.env['SCRIBE_MOCK_PATH'] + category_name}
    // It terminates once we cut off the stdin stream.
    const scribeCatMockCommandPath = nuclideUri.join(
      nuclideUri.dirname(__filename),
      'scripts',
      'scribe_cat_mock',
    );
    waitsForPromise(async () => {
      tempDir = await fsPromise.tempdir();
      originalCommand = __test__.setScribeCatCommand(scribeCatMockCommandPath);
      process.env.SCRIBE_MOCK_PATH = tempDir;
    });
  });

  afterEach(() => {
    waitsForPromise(async () => {
      __test__.setScribeCatCommand(originalCommand);
    });
  });

  it('Saves data to scribe category', () => {
    const localScribeProcess = new ScribeProcess('test');

    const messages = [
      'A',
      'nuclide',
      'is',
      'an',
      'atomic',
      'species',
      'characterized',
      'by',
      'the',
      'specific',
      'constitution',
      'of',
      'its',
      'nucleus.',
    ];
    waitsForPromise(async () => {
      messages.map(message => localScribeProcess.write(message));
      // Wait for `scribe_cat_mock` to flush data into disk.
      await localScribeProcess.join();
      expect(messages).toEqual(getContentOfScribeCategory('test'));
    });
  });

  it('Saves data to scribe category and resume from error', () => {
    const localScribeProcess = new ScribeProcess('test');

    const firstPart = 'A nuclide is an atomic species'.split(' ');
    const secondPart = 'characterized by the specific constitution of its nucleus.'.split(
      ' ',
    );

    waitsForPromise(async () => {
      firstPart.map(message => localScribeProcess.write(message));
      // Kill the existing process.
      await localScribeProcess.join();
      secondPart.map(message => localScribeProcess.write(message));
      // Wait for `scribe_cat_mock` to flush data into disk.
      await localScribeProcess.join();
      expect(firstPart.concat(secondPart)).toEqual(
        getContentOfScribeCategory('test'),
      );
    });
  });

  it('Can automatically join', () => {
    const localScribeProcess = new ScribeProcess('test', 100);
    runs(() => {
      localScribeProcess.write('test1');
    });

    waitsFor(() => getContentOfScribeCategory('test').includes('test1'));

    runs(() => {
      localScribeProcess.write('test2');
      localScribeProcess.write('test3');
      expect(getContentOfScribeCategory('test')).toEqual(['test1']);
    });

    waitsFor(() => getContentOfScribeCategory('test').includes('test3'));

    runs(() => {
      expect(getContentOfScribeCategory('test')).toEqual([
        'test1',
        'test2',
        'test3',
      ]);
    });
  });
});
