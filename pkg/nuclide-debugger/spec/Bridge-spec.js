/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import invariant from 'assert';
import DebuggerModel from '../lib/DebuggerModel';
import {sleep} from '../../commons-node/promise';
import * as utils from './utils';

class MockWebview {
  _listeners: Map<string, Set<Function>>;
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

  _simulateDispatch(name, obj) {
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
  let debuggerModel;
  let breakpointStore;
  let bridge;
  let editor;
  let mockWebview;
  let path;

  function getCallFrameDecorationInRow(row: number): ?atom$Decoration {
    const decorationArrays = editor.decorationsForScreenRowRange(row, row);
    for (const key in decorationArrays) {
      const result = decorationArrays[key].find(
        item => item.getProperties().class === 'nuclide-current-line-highlight',
      );
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
    mockWebview._simulateDispatch('ipc-message', {
      channel: 'notification',
      args,
    });
  }

  beforeEach(() => {
    waitsForPromise(async () => {
      editor = await utils.createEditorWithUniquePath();
      // Feed 30 lines to editor
      editor.setText('foo\nbar\nbaz'.repeat(10));
      const editorPath = editor.getPath();
      invariant(editorPath);
      path = editorPath;
      mockWebview = new MockWebview();
      debuggerModel = new DebuggerModel();
      bridge = debuggerModel.getBridge();
      breakpointStore = debuggerModel.getBreakpointStore();
      spyOn(breakpointStore, '_addBreakpoint').andCallThrough();
      spyOn(breakpointStore, '_bindBreakpoint').andCallThrough();
      spyOn(breakpointStore, '_deleteBreakpoint').andCallThrough();
      bridge._setWebviewElement(((mockWebview: any): WebviewElement));
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
      return Boolean(getCallFrameDecorationInRow(1));
    }, 'call frame highlight to appear', 100);

    runs(() => {
      expect(getCallFrameDecorationInRow(1)).toBeTruthy();
    });
  });

  it('should remove decoration when clear interface', () => {
    waitsFor(() => {
      return Boolean(getCallFrameDecorationInRow(1));
    }, 'call frame highlight to appear', 100);

    runs(() => {
      expect(getCallFrameDecorationInRow(1)).toBeTruthy();
      sendIpcNotification('ClearInterface');
      expect(getCallFrameDecorationInRow(1)).toBeFalsy();
    });
  });

  it('should remove decoration and unregister listener when disposed', () => {
    waitsFor(() => {
      return Boolean(getCallFrameDecorationInRow(1));
    }, 'call frame highlight to appear', 100);

    runs(async () => {
      expect(getCallFrameDecorationInRow(1)).toBeTruthy();
      bridge.dispose();
      await sleep(10);
      expect(getCallFrameDecorationInRow(1)).toBeFalsy();
      expect(mockWebview.getListeners('ipc-message').size).toEqual(0);
    });
  });

  it('should remove decoration and unregister listener after cleanup', () => {
    waitsFor(() => {
      return Boolean(getCallFrameDecorationInRow(1));
    }, 'call frame highlight to appear', 100);

    runs(async () => {
      expect(getCallFrameDecorationInRow(1)).toBeTruthy();
      bridge.cleanup();
      await sleep(10);
      expect(getCallFrameDecorationInRow(1)).toBeFalsy();
      expect(mockWebview.getListeners('ipc-message').size).toEqual(0);
    });
  });

  it('should send breakpoints over ipc when breakpoints change', () => {
    breakpointStore._addBreakpoint('/tmp/foobarbaz.js', 4);
    expect(mockWebview.send).toHaveBeenCalledWith('command', 'AddBreakpoint', {
      sourceURL: 'file:///tmp/foobarbaz.js',
      lineNumber: 4,
      condition: '',
      enabled: true,
    });
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
      return Boolean(getCursorInRow(line));
    }, 'cursor at line to appear', 100);

    runs(() => {
      expect(editor.getCursorBufferPosition().row).toEqual(line);
    });
  });

  it('should change BreakpointStore when getting add/remove breakpoints notification', () => {
    const line = 15;
    const condition = 'Condtion expression';
    const enabled = true;
    const resolved = true;
    sendIpcNotification('BreakpointAdded', {
      sourceURL: 'file://' + path,
      lineNumber: line,
      condition,
      enabled,
      resolved,
    });
    expect(breakpointStore._bindBreakpoint)
      .toHaveBeenCalledWith(path, line, condition, enabled, resolved);

    sendIpcNotification('BreakpointRemoved', {
      sourceURL: 'file://' + path,
      lineNumber: line,
    });
    expect(breakpointStore._deleteBreakpoint).toHaveBeenCalledWith(path, line, false);
  });
});
