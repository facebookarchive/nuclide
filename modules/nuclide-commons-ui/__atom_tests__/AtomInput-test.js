'use strict';

var _promise;

function _load_promise() {
  return _promise = require('../../nuclide-commons/promise');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../AtomInput');
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

let reactElement;

function createWithProps(props) {
  const hostEl = document.createElement('div');
  return _reactDom.default.render(_react.createElement((_AtomInput || _load_AtomInput()).AtomInput, props), hostEl);
}

describe('AtomInput', () => {
  afterEach(() => {
    if (reactElement) {
      _reactDom.default.unmountComponentAtNode(
      // $FlowFixMe
      _reactDom.default.findDOMNode(reactElement).parentNode);
    }
    reactElement = null;
  });

  it('honors the initialValue param', () => {
    reactElement = createWithProps({ initialValue: 'some text' });
    expect(reactElement.getText()).toBe('some text');
    expect(reactElement.getTextEditor().getText()).toBe('some text');
  });

  it('onDidChange() does not fire initially', () => {
    const initialValue = 'some text';
    const onDidChange = jest.fn();
    reactElement = createWithProps({
      initialValue,
      onDidChange
    });

    expect(onDidChange).not.toHaveBeenCalled();
  });

  it('onDidChange() is fired when the text changes', () => {
    const initialValue = 'some text';
    reactElement = createWithProps({ initialValue });
    const onDidChange = jest.fn();
    const disposable = reactElement.onDidChange(onDidChange);

    reactElement.setText('the new text');
    expect(onDidChange.mock.calls.length).toBe(1);

    reactElement.setText('even more new text');
    expect(onDidChange.mock.calls.length).toBe(2);

    disposable.dispose();
    reactElement.setText('the last update');
    expect(onDidChange.mock.calls.length).toBe(2);
  });

  it('updates will stop firing when the component is unmounted', () => {
    const initialValue = 'some text';
    const onDidChange = jest.fn();
    reactElement = createWithProps({ initialValue, onDidChange });

    const textEditor = reactElement.getTextEditor();
    textEditor.setText('the new text');
    expect(onDidChange.mock.calls.length).toBe(1);

    _reactDom.default.unmountComponentAtNode(
    // $FlowFixMe
    _reactDom.default.findDOMNode(reactElement).parentNode);
    reactElement = null;

    textEditor.setText('even more new text');
    expect(onDidChange.mock.calls.length).toBe(1);
  });

  it('does not leak TextEditorComponent', async () => {
    const hostEl = document.createElement('div');
    const component = _reactDom.default.render(_react.createElement((_AtomInput || _load_AtomInput()).AtomInput, null), hostEl);
    const textEditor = component.getTextEditor();
    const element = textEditor.getElement();
    _reactDom.default.unmountComponentAtNode(hostEl);

    // Cleanup occurs during the next tick.
    await (0, (_promise || _load_promise()).sleep)(0);
    expect(element.component).toBe(null);
  });
});