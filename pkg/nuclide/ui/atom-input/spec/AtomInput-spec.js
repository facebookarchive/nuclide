'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomInput = require('../lib/AtomInput');
var React = require('react-for-atom');

var reactElement;

function createWithProps(props: any) {
  var hostEl = document.createElement('div');
  return React.render(<AtomInput {...props} />, hostEl);
}

describe('AtomInput', () => {

  afterEach(() => {
    if (reactElement) {
      React.unmountComponentAtNode(reactElement.getDOMNode().parentNode);
    }
    reactElement = null;
  });

  it('honors the initialValue param', () => {
    reactElement = createWithProps({initialValue: 'some text'});
    expect(reactElement.getText()).toBe('some text');
    expect(reactElement.getTextEditor().getText()).toBe('some text');
  });

  it('focus() focuses the end of the line', () => {
    var initialValue = 'some text';
    reactElement = createWithProps({initialValue});
    expect(reactElement.getTextEditor().getCursorBufferPosition()).toEqual(
        [0, 0]);
    reactElement.focus();
    expect(reactElement.getTextEditor().getCursorBufferPosition()).toEqual(
        [0, initialValue.length]);
  });

  it('onDidChange() is fired when the text changes', () => {
    var initialValue = 'some text';
    reactElement = createWithProps({initialValue});
    var onDidChange = jasmine.createSpy('onDidChange');
    var disposable = reactElement.onDidChange(onDidChange);

    reactElement.setText('the new text');
    expect(onDidChange.calls.length).toBe(1);

    reactElement.setText('even more new text');
    expect(onDidChange.calls.length).toBe(2);

    disposable.dispose();
    reactElement.setText('the last update');
    expect(onDidChange.calls.length).toBe(2);
  });

  it('updates will stop firing when the component is unmounted', () => {
    var initialValue = 'some text';
    reactElement = createWithProps({initialValue});
    var onDidChange = jasmine.createSpy('onDidChange');
    reactElement.onDidChange(onDidChange);

    var textEditor = reactElement.getTextEditor();
    textEditor.setText('the new text');
    expect(onDidChange.calls.length).toBe(1);

    React.unmountComponentAtNode(reactElement.getDOMNode().parentNode);
    reactElement = null;

    textEditor.setText('even more new text');
    expect(onDidChange.calls.length).toBe(1);
  });

  it('.renderToStaticMarkup()', () => {
    var initialValue = 'some text';
    var props = {initialValue};
    expect(React.renderToStaticMarkup(<AtomInput {...props} />)).toBe(
      '<atom-text-editor mini>some text</atom-text-editor>'
    );
  });

  // This test is currently disabled because it appears that WeakMap may be
  // explicitly designed not to support this use case.
  xit('releases references after it is unmounted', () => {
    var initialValue = 'I am the text!';
    reactElement = createWithProps({initialValue});
    var weakReferences = new WeakMap();
    var textEditorKey = {};
    weakReferences.set(textEditorKey, reactElement.getTextEditor());
    expect(weakReferences.get(textEditorKey)).not.toBe(null);

    React.unmountComponentAtNode(reactElement.getDOMNode().parentNode);
    reactElement = null;
    expect(weakReferences.get(textEditorKey)).toBe(null);
  });
});
