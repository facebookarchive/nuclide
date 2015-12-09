'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const BreakpointStore = require('../lib/BreakpointStore');
const Bridge = require('../lib/Bridge');
const utils = require('./utils');
const {array} = require('../../../commons');

class MockWebview {
  _listeners: Map<String, Set<Function>>;
  _sendSpy: Object;

  constructor() {
    this._listeners = new Map();
    this._sendSpy = jasmine.createSpy('send');
  }

  addEventListener(name, callback) {
    const set = this._listeners.get(name);
    if (set) {
      set.add(callback);
    } else {
      this._listeners.set(name, new Set([callback]));
    }
  }

  removeEventListener(name, callback) {
    const set = this._listeners.get(name);
    if (set) {
      set.delete(callback);
    }
  }

  dispatchEvent(name, obj) {
    const set = this._listeners.get(name);
    if (set) {
      set.forEach(callback => callback(obj));
    }
  }

  getListeners(name): Set<Function> {
    return this._listeners.get(name) || new Set();
  }

  // send(...args: any[])
  get send() {
    return this._sendSpy;
  }
}

describe('Bridge', () => {
  let breakpointStore;
  let bridge;
  let editor;
  let mockWebview;
  let path;

  function getCallFrameDecorationInRow(row: number): ?atom$Decoration {
    const decorationArrays = editor.decorationsForScreenRowRange(row, row);
    for (const key in decorationArrays) {
      const result = array.find(decorationArrays[key], (item) => item.getProperties().class === 'nuclide-current-line-highlight');
      if (result !== undefined) {
        return result;
      }
    }
    return null;
  }

  function getCursorInRow(row: number): ?atom$Cursor {
    let result = null;
    const cursors = editor.getCursors();
    cursors.forEach(cursor => {
      if (cursor.getBufferRow() === row) {
        result = cursor;
      }
    });
    return result;
  }

  function sendIpcNotification(...args: any[]) {
    mockWebview.dispatchEvent('ipc-message', {
      channel: 'notification',
      args: args,
    });
  }

  beforeEach(() => {
    waitsForPromise(async () => {
      editor = await utils.createEditorWithUniquePath();
      // Feed 30 lines to editor
      editor.setText('foo\nbar\nbaz'.repeat(10));
      path = editor.getPath();
      mockWebview = new MockWebview();
      breakpointStore = new BreakpointStore();
      bridge = new Bridge(breakpointStore);
      spyOn(breakpointStore, 'addBreakpoint').andCallThrough();
      spyOn(breakpointStore, 'deleteBreakpoint').andCallThrough();
      bridge.setWebviewElement(mockWebview);
    });
    runs(() => {
      sendIpcNotification('CallFrameSelected', {
        sourceURL: 'file://' + path,
        lineNumber: 1,
      });
    });
  });

  it('should add decoration to line of current call frame', () => {
    waitsFor(() => {
      return !!getCallFrameDecorationInRow(1);
    }, 'call frame highlight to appear', 100);

    runs(() => {
      expect(getCallFrameDecorationInRow(1)).toBeTruthy();
    });
  });

  it('should remove decoration when resuming', () => {
    waitsFor(() => {
      return !!getCallFrameDecorationInRow(1);
    }, 'call frame highlight to appear', 100);

    runs(() => {
      expect(getCallFrameDecorationInRow(1)).toBeTruthy();
      sendIpcNotification('DebuggerResumed');
      expect(getCallFrameDecorationInRow(1)).toBeFalsy();
    });
  });

  it('should remove decoration and unregister listener when disposed', () => {
    waitsFor(() => {
      return !!getCallFrameDecorationInRow(1);
    }, 'call frame highlight to appear', 100);

    runs(() => {
      expect(getCallFrameDecorationInRow(1)).toBeTruthy();
      bridge.dispose();
      expect(getCallFrameDecorationInRow(1)).toBeFalsy();
      expect(mockWebview.getListeners('ipc-message').size).toEqual(0);
    });
  });

  it('should remove decoration and unregister listener after cleanup', () => {
    waitsFor(() => {
      return !!getCallFrameDecorationInRow(1);
    }, 'call frame highlight to appear', 100);

    runs(() => {
      expect(getCallFrameDecorationInRow(1)).toBeTruthy();
      bridge.cleanup();
      expect(getCallFrameDecorationInRow(1)).toBeFalsy();
      expect(mockWebview.getListeners('ipc-message').size).toEqual(0);
    });
  });

  it('should send breakpoints over ipc when breakpoints change', () => {
    breakpointStore.addBreakpoint('/tmp/foobarbaz.js', 4);
    expect(mockWebview.send).toHaveBeenCalledWith('command', 'SyncBreakpoints', [{
      sourceURL: 'file:///tmp/foobarbaz.js',
      lineNumber: 4,
    }]);
  });

  it('should send execution control commands over ipc', () => {
    bridge.continue();
    expect(mockWebview.send).toHaveBeenCalledWith('command', 'Continue');

    bridge.stepOver();
    expect(mockWebview.send).toHaveBeenCalledWith('command', 'StepOver');

    bridge.stepInto();
    expect(mockWebview.send).toHaveBeenCalledWith('command', 'StepInto');

    bridge.stepOut();
    expect(mockWebview.send).toHaveBeenCalledWith('command', 'StepOut');
  });

  it('should move cursor to target line when open source location', () => {
    const line = 13;
    sendIpcNotification('OpenSourceLocation', {
      sourceURL: 'file://' + path,
      lineNumber: line,
    });

    waitsFor(() => {
      return !!getCursorInRow(line);
    }, 'cursor at line to appear', 100);

    runs(() => {
      expect(editor.getCursorBufferPosition().row).toEqual(line);
    });
  });

  it('should change BreakpointStore when getting add/remove breakpoints notification', () => {
    const line = 15;
    sendIpcNotification('BreakpointAdded', {
      sourceURL: 'file://' + path,
      lineNumber: line,
    });
    expect(breakpointStore.addBreakpoint).toHaveBeenCalledWith(path, line);

    sendIpcNotification('BreakpointRemoved', {
      sourceURL: 'file://' + path,
      lineNumber: line,
    });
    expect(breakpointStore.deleteBreakpoint).toHaveBeenCalledWith(path, line);
  });
});
