'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import path from 'path';
import {fsPromise} from '../lib/main';
import {ScribeProcess, __test__} from '../lib/ScribeProcess';

// The script who simluate behavior of scribe_cat. Different from `scribe_cat` who save
// data into scribe, it save data into ${process.env['SCRIBE_MOCK_PATH'] + category_name}
// so that we could verify that the data is saved.
// Also, if a special data "abort" (with quote) is received, it will crash itself.
const scribeCatMockCommandPath = path.join(path.dirname(__filename), 'scripts', 'scribe_cat_mock');
let tempDir = '';
let scribeProcess: ?ScribeProcess = null;
let originalCommand = '';

async function getContentOfScribeCategory(category: string): Promise<Array<mixed>> {
  const categoryFilePath = path.join(tempDir, category);
  const content = await fsPromise.readFile(categoryFilePath);
  const result = content.toString().split('\n')
    .filter(item => (item.length > 0))
    .map(item => JSON.parse(item));
  return result;
}

function sleep(timeMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeMs);
  });
}

describe('scribe_cat test suites', () => {
  beforeEach(() => {
    window.useRealClock();
    waitsForPromise(async () => {
      tempDir = await fsPromise.tempdir();
      originalCommand = __test__.setScribeCatCommand(scribeCatMockCommandPath);
      process.env['SCRIBE_MOCK_PATH'] = tempDir;
    });
  });

  afterEach(() => {
    waitsForPromise(async () => {
      if (scribeProcess) {
        await scribeProcess.dispose();
      }
      __test__.setScribeCatCommand(originalCommand);
    });
  });

  it('Saves data to scribe category', () => {
    const localScribeProcess = scribeProcess = new ScribeProcess('test');

    const messages = 'A nuclide is an atomic species characterized by the specific constitution of its nucleus.'.split(' ');
    waitsForPromise(async () => {
      await Promise.all(messages.map(message => localScribeProcess.write(message)));
      // Wait for `scribe_cat_mock` to flush data into disk.
      await sleep(100);
      expect(messages).toEqual(await getContentOfScribeCategory('test'));
    });
  });

  it('Saves data to scribe category and resume from error', () => {
    const localScribeProcess = scribeProcess = new ScribeProcess('test');

    const firstPart = 'A nuclide is an atomic species'.split(' ');
    const secondPart = 'characterized by the specific constitution of its nucleus.'.split(' ');

    waitsForPromise(async () => {
      await Promise.all(firstPart.map(message => localScribeProcess.write(message)));
      await localScribeProcess.write('abort');
      // Give some time to scribeProcess and wait for it resume.
      await sleep(100);
      await Promise.all(secondPart.map(message => localScribeProcess.write(message)));
      // Wait for `scribe_cat_mock` to flush data into disk.
      await sleep(100);
      expect(firstPart.concat(secondPart))
        .toEqual(await getContentOfScribeCategory('test'));
    });
  });
});
