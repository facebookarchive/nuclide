/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import {Range} from 'atom';
import temp from 'temp';
import * as config from '../lib/config';
import CodeFormatManager from '../lib/CodeFormatManager';
import waitsFor from '../../../../../jest/waits_for';

const sleep = n => new Promise(r => setTimeout(r, n));

describe('CodeFormatManager', () => {
  let textEditor;
  beforeEach(async () => {
    temp.track();
    const file = temp.openSync();
    textEditor = await atom.workspace.open(file.path);
  });

  it('formats an editor on request', async () => {
    const manager = new CodeFormatManager();
    manager.addRangeProvider({
      grammarScopes: ['text.plain.null-grammar'],
      priority: 1,
      formatCode: () =>
        Promise.resolve([
          {
            oldRange: new Range([0, 0], [0, 3]),
            oldText: 'abc',
            newText: 'def',
          },
        ]),
    });

    textEditor.setText('abc');
    atom.commands.dispatch(
      atom.views.getView(textEditor),
      'code-format:format-code',
    );
    await waitsFor(() => textEditor.getText() === 'def');
  });

  it('format an editor using formatEntireFile', async () => {
    const manager = new CodeFormatManager();
    manager.addFileProvider({
      grammarScopes: ['text.plain.null-grammar'],
      priority: 1,
      formatEntireFile: () => Promise.resolve({formatted: 'ghi'}),
    });

    textEditor.setText('abc');
    atom.commands.dispatch(
      atom.views.getView(textEditor),
      'code-format:format-code',
    );
    await waitsFor(() => textEditor.getText() === 'ghi');
  });

  it('formats an editor on type', async () => {
    jest.spyOn(config, 'getFormatOnType').mockReturnValue(true);
    const manager = new CodeFormatManager();
    const provider = {
      grammarScopes: ['text.plain.null-grammar'],
      priority: 1,
      formatAtPosition: () =>
        Promise.resolve([
          {
            oldRange: new Range([0, 0], [0, 3]),
            oldText: 'abc',
            newText: 'def',
          },
        ]),
      keepCursorPosition: false,
    };
    const spy = jest.spyOn(provider, 'formatAtPosition');
    manager.addOnTypeProvider(provider);

    textEditor.setText('a');
    textEditor.setCursorBufferPosition([0, 1]);
    textEditor.insertText('b');
    textEditor.insertText('c');

    await waitsFor(() => textEditor.getText() === 'def');
    // Debouncing should ensure only one format call.
    expect(spy.mock.calls.length).toBe(1);
  });

  it('formats an editor on save', async () => {
    jest.spyOn(config, 'getFormatOnSave').mockReturnValue(true);
    const manager = new CodeFormatManager();
    manager.addOnSaveProvider({
      grammarScopes: ['text.plain.null-grammar'],
      priority: 1,
      formatOnSave: () =>
        Promise.resolve([
          {
            oldRange: new Range([0, 0], [0, 3]),
            oldText: 'abc',
            newText: 'def',
          },
        ]),
    });

    textEditor.setText('abc');
    await textEditor.save();
    expect(textEditor.getText()).toBe('def');
  });

  it('should still save on timeout', async () => {
    jest.spyOn(config, 'getFormatOnSave').mockReturnValue(true);
    const manager = new CodeFormatManager();
    manager.addRangeProvider({
      grammarScopes: ['text.plain.null-grammar'],
      priority: 1,
      formatCode: () => new Promise(() => {}),
    });

    const spy = jest.spyOn(textEditor.getBuffer(), 'save');
    textEditor.save();
    const savePromise = Promise.resolve(textEditor.save());

    // The first save should be pushed through after the 2nd.
    await waitsFor(() => spy.mock.calls.length === 1);

    await sleep(3000);

    // Hitting the timeout will force the 2nd save through.
    await waitsFor(() => spy.mock.calls.length === 2);

    // The real save should still go through.
    await (() => savePromise)();

    // Sanity check.
    expect(spy.mock.calls.length).toBe(2);
  });
});
