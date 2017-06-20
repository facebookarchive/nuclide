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

import MessageStore from '../lib/MessageStore';
import BusySignalInstance from '../lib/BusySignalInstance';

describe('BusySignalInstance', () => {
  let messageStore: MessageStore;
  let instance: BusySignalInstance;
  let messages: Array<Array<string>>;

  beforeEach(() => {
    messageStore = new MessageStore();
    instance = new BusySignalInstance(messageStore);
    messages = [];
    messageStore.getMessageStream().skip(1).subscribe(m => {
      messages.push(m);
    });
  });

  it('should record messages before and after a call', () => {
    expect(messages.length).toBe(0);
    instance.reportBusyWhile('foo', () => Promise.resolve(5));
    expect(messages.length).toBe(1);
    waitsFor(
      () => messages.length === 2,
      'It should publish a second message',
      100,
    );
  });

  it('should throw if the function does not return a promise', () => {
    // We have to cast here because the test case purposely subverts the type system.
    const f = () => instance.reportBusyWhile('foo', (() => 5: any));
    expect(f).toThrow();
    expect(messages.length).toBe(2);
  });

  it("should send the 'done' message even if the promise rejects", () => {
    instance.reportBusyWhile('foo', () => Promise.reject(new Error()));
    expect(messages.length).toBe(1);
    waitsFor(
      () => messages.length === 2,
      'It should publish a second message',
      100,
    );
  });

  it('should properly display and dispose of a duplicate message', () => {
    const dispose1 = instance.reportBusy('foo');
    expect(messages.length).toBe(1);
    const dispose2 = instance.reportBusy('foo');

    expect(messages.length).toBe(1);
    expect(messages[0]).toEqual(['foo']);

    dispose2.dispose();
    expect(messages.length).toBe(1);
    expect(messages[0]).toEqual(['foo']);

    dispose1.dispose();

    expect(messages.length).toBe(2);
    expect(messages[1]).toEqual([]);
  });

  describe('when onlyForFile is provided', () => {
    let editor1: atom$TextEditor = (null: any);
    let editor2: atom$TextEditor = (null: any);
    let editor3: atom$TextEditor = (null: any);

    beforeEach(() => {
      waitsForPromise(async () => {
        editor1 = await atom.workspace.open('/file1.txt');
        editor2 = await atom.workspace.open('/file2.txt');
        editor3 = await atom.workspace.open();
      });
    });

    afterEach(() => {
      [editor1, editor2, editor3].forEach(editor => editor.destroy());
    });

    it('should only display for the proper text editor', () => {
      atom.workspace.getActivePane().activateItem(editor1);

      const disposable = instance.reportBusy('foo', {
        onlyForFile: '/file2.txt',
      });
      expect(messages).toEqual([]);

      atom.workspace.getActivePane().activateItem(editor2);
      expect(messages.length).toBe(1);
      expect(messages[0]).toEqual(['foo']);

      atom.workspace.getActivePane().activateItem(editor3);
      expect(messages.length).toBe(2);
      expect(messages[1]).toEqual([]);

      atom.workspace.getActivePane().activateItem(editor2);
      expect(messages.length).toBe(3);
      expect(messages[2]).toEqual(['foo']);

      disposable.dispose();
      expect(messages.length).toBe(4);
      expect(messages[3]).toEqual([]);
    });
  });
});
