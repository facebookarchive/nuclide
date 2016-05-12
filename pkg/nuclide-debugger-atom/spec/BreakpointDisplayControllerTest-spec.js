'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import BreakpointDisplayController from '../lib/BreakpointDisplayController';
import BreakpointStore from '../lib/BreakpointStore';
import utils from './utils';
import invariant from 'assert';

const controllerDelegate = {
  handleTextEditorDestroyed(controller: BreakpointDisplayController) {
    controller.dispose();
  },
};

describe('BreakpointDisplayController', () => {
  let editor;
  let store;
  let testFilePath;

  function simulateClickAtBufferPosition(target: EventTarget, row: number) {
    const editorView = atom.views.getView(editor);
    const position = editorView.pixelPositionForBufferPosition([row, 0]);
    const event = new window.MouseEvent('click', {
      clientX: position.left,
      clientY: position.top,
      bubbles: true,
    });
    target.dispatchEvent(event);
  }

  beforeEach(() => {
    waitsForPromise(async () => {
      editor = await utils.createEditorWithUniquePath();
      const editorPath = editor.getPath();
      invariant(editorPath);
      testFilePath = editorPath;
      store = new BreakpointStore();
      document.querySelector('#jasmine-content').appendChild(atom.views.getView(editor));

      // BreakpointDisplayController is created for side-effects /:
      const controller = new BreakpointDisplayController(controllerDelegate, store, editor);
      invariant(controller);
    });
  });

  it('should remove breakpoint when marker decoration is clicked', () => {
    editor.setText('foo\nbar\nbaz');
    store.addBreakpoint(testFilePath, 1);
    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(true);

    const decoration = utils.getBreakpointDecorationInRow(editor, 1);
    invariant(decoration);
    const properties = decoration.getProperties();
    invariant(properties);
    const item = properties.item;
    invariant(item);
    simulateClickAtBufferPosition(decoration.getProperties().item, 1);

    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(false);
    expect(store.getBreakpointsForPath(testFilePath)).toEqual(new Set());
  });

  it('should toggle breakpoint when breakpoint gutter is clicked', () => {
    editor.setText('foo\nbar\nbaz');
    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(false);
    const gutter = editor.gutterWithName('nuclide-breakpoint');
    invariant(gutter);
    const gutterView = atom.views.getView(gutter);
    simulateClickAtBufferPosition(gutterView, 1);
    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(true);
    simulateClickAtBufferPosition(gutterView, 1);
    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(false);
  });

  it('should toggle breakpoint when line number gutter is clicked', () => {
    editor.setText('foo\nbar\nbaz');
    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(false);
    const gutter = editor.gutterWithName('line-number');
    invariant(gutter);
    const lineNumberElem = atom.views.getView(gutter).querySelector('.line-number');
    expect(lineNumberElem).not.toBeNull();
    simulateClickAtBufferPosition(lineNumberElem, 1);
    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(true);
    simulateClickAtBufferPosition(lineNumberElem, 1);
    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(false);
  });

  it('should only set markers for breakpoints in current file', () => {
    editor.setText('foo\nbar\nbaz');
    store.addBreakpoint(testFilePath, 1);
    store.addBreakpoint('/tmp/bar.m', 2);

    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(true);
    expect(utils.hasBreakpointDecorationInRow(editor, 2)).toBe(false);
  });

  it('should update breakpoint when marker moves', () => {
    editor.setText('foo\nbar\nbaz');
    store.addBreakpoint(testFilePath, 1);
    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(true);
    expect(utils.hasBreakpointDecorationInRow(editor, 2)).toBe(false);

    editor.setCursorBufferPosition([0, 0]);
    editor.insertText('newfirstline\n');
    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(false);
    expect(utils.hasBreakpointDecorationInRow(editor, 2)).toBe(true);
    expect(store.getBreakpointsForPath(testFilePath)).toEqual(new Set([2]));
  });

  it('should remove markers for removed breakpoints', () => {
    editor.setText('foo\nbar\nbaz');
    store.addBreakpoint(testFilePath, 1);
    store.addBreakpoint(testFilePath, 2);
    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(true);
    expect(utils.hasBreakpointDecorationInRow(editor, 2)).toBe(true);
    store.deleteBreakpoint(testFilePath, 1);
    expect(utils.hasBreakpointDecorationInRow(editor, 1)).toBe(false);
    expect(utils.hasBreakpointDecorationInRow(editor, 2)).toBe(true);
  });

  function mockText(numLines: number) : string {
    return Array(numLines)
            .fill('MOCK LINE\n')
            .reduce((a, b) => { return a.concat(b); });
  }

  it('should create shadow markers on each row', () => {
    editor.setText(mockText(3));
    store.addBreakpoint(testFilePath, 1);

    const gutter: ?atom$Gutter = editor.gutterWithName('nuclide-breakpoint');
    invariant(gutter);

    const shadowBreakpointElems =
      atom.views.getView(gutter).querySelectorAll('.nuclide-debugger-atom-shadow-breakpoint');

    expect(shadowBreakpointElems).toBeDefined();
    expect(shadowBreakpointElems.length >= 1).toBeTruthy();
  });

  it('should maintain the minimal set of markers', () => {
    editor.setText(mockText(20));

    store.addBreakpoint(testFilePath, 1);
    store.addBreakpoint(testFilePath, 4);
    store.addBreakpoint(testFilePath, 10);

    const gutter: ?atom$Gutter = editor.gutterWithName('nuclide-breakpoint');

    if (gutter == null) {
      return;
    }

    let numBreakpoints: number = 3;
    let shadowBreakpointElems =
      atom.views.getView(gutter).querySelectorAll('.nuclide-debugger-atom-shadow-breakpoint');

    expect(shadowBreakpointElems).toBeDefined();
    expect(shadowBreakpointElems.length).toEqual(editor.rowsPerPage - numBreakpoints);

    store.addBreakpoint(testFilePath, 5);
    store.addBreakpoint(testFilePath, 8);
    store.addBreakpoint(testFilePath, 11);
    store.deleteBreakpoint(testFilePath, 4);
    numBreakpoints += 2;
    shadowBreakpointElems =
      atom.views.getView(gutter).querySelectorAll('.nuclide-debugger-atom-shadow-breakpoint');

    expect(shadowBreakpointElems).toBeDefined();
    expect(shadowBreakpointElems.length).toEqual(editor.rowsPerPage - numBreakpoints);
  });

});
