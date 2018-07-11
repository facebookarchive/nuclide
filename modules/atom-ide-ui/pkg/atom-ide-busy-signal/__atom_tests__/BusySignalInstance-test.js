"use strict";

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _MessageStore() {
  const data = require("../lib/MessageStore");

  _MessageStore = function () {
    return data;
  };

  return data;
}

function _BusySignalSingleton() {
  const data = _interopRequireDefault(require("../lib/BusySignalSingleton"));

  _BusySignalSingleton = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../../../jest/waits_for"));

  _waits_for = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
describe('BusySignalSingleton', () => {
  let messageStore;
  let singleton;
  let messages;
  const options = {
    debounce: false
  };
  beforeEach(() => {
    messageStore = new (_MessageStore().MessageStore)();
    singleton = new (_BusySignalSingleton().default)(messageStore);
    messages = [];
    messageStore.getMessageStream().skip(1).subscribe(elements => {
      const strings = [...elements].map(element => {
        const titleElement = element.getTitleElement();
        const child = titleElement != null && titleElement.childNodes.length >= 1 ? titleElement.childNodes[0] : {};
        return child.data != null && typeof child.data === 'string' ? child.data : '';
      });
      messages.push(strings);
    });
  });
  it('should record messages before and after a call', async () => {
    expect(messages.length).toBe(0);
    singleton.reportBusyWhile('foo', () => Promise.resolve(5), options);
    expect(messages.length).toBe(1);
    await (0, _waits_for().default)(() => messages.length === 2, 'It should publish a second message', 100);
  });
  it("should send the 'done' message even if the promise rejects", async () => {
    singleton.reportBusyWhile('foo', () => Promise.reject(new Error()), options).catch(() => {});
    expect(messages.length).toBe(1);
    await (0, _waits_for().default)(() => messages.length === 2, 'It should publish a second message', 100);
  });
  it('should properly display duplicate messages', () => {
    const dispose1 = singleton.reportBusy('foo', options);
    expect(messages.length).toBe(1);
    expect(messages[0]).toEqual(['foo']);
    const dispose2 = singleton.reportBusy('foo', options);
    expect(messages.length).toBe(2);
    expect(messages[1]).toEqual(['foo', 'foo']);
    dispose2.dispose();
    expect(messages.length).toBe(3);
    expect(messages[2]).toEqual(['foo']);
    dispose1.dispose();
    expect(messages.length).toBe(4);
    expect(messages[3]).toEqual([]);
  });
  describe('when onlyForFile is provided', () => {
    let editor1 = null;
    let editor2 = null;
    let editor3 = null;
    let file2;
    beforeEach(async () => {
      editor1 = await atom.workspace.open((await _fsPromise().default.tempfile()));
      file2 = await _fsPromise().default.tempfile();
      editor2 = await atom.workspace.open(file2);
      editor3 = await atom.workspace.open();
    });
    afterEach(() => {
      [editor1, editor2, editor3].forEach(editor => editor.destroy());
    });
    it('should only display for the proper text editor', () => {
      atom.workspace.getActivePane().activateItem(editor1);
      const disposable = singleton.reportBusy('foo', Object.assign({
        onlyForFile: file2
      }, options));
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
  it('correctly sets revealTooltip when provided', async () => {
    function getCurrentMessages() {
      return messageStore.getMessageStream().take(1).toPromise();
    }

    singleton.reportBusy('foo', {
      debounce: false,
      revealTooltip: true
    });
    const curMessages = await getCurrentMessages();
    expect(curMessages.length).toBe(1);
    expect(curMessages[0].shouldRevealTooltip()).toBe(true);
  });
});