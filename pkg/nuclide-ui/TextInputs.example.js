'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextInputExamples = undefined;

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('./AtomInput');
}

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('./AtomTextEditor');
}

const AtomInputExample = () => _reactForAtom.React.createElement(
  'div',
  null,
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      disabled: false,
      initialValue: 'atom input',
      placeholderText: 'placeholder text'
    })
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      disabled: true,
      initialValue: 'disabled atom input',
      placeholderText: 'placeholder text'
    })
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      initialValue: 'xs atom input',
      placeholderText: 'placeholder text',
      size: 'xs'
    })
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      initialValue: 'sm atom input',
      placeholderText: 'placeholder text',
      size: 'sm'
    })
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      initialValue: 'lg atom input',
      placeholderText: 'placeholder text',
      size: 'lg'
    })
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      initialValue: 'unstyled atom input',
      placeholderText: 'placeholder text',
      unstyled: true
    })
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
      initialValue: 'atom input with custom width',
      placeholderText: 'placeholder text',
      width: 200
    })
  )
);

const buffer1 = new _atom.TextBuffer({
  text: '/**\n * Hi!\n */\n\n// I am a TextBuffer.\nconst a = 42;'
});
const buffer2 = new _atom.TextBuffer({
  text: '/**\n * Hi!\n */\n\n// I am a read-only, gutter-less TextBuffer.\nconst a = 42;'
});
const editorWrapperStyle = {
  display: 'flex',
  flexGrow: 1,
  height: '12em',
  boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.3)'
};

const AtomTextEditorExample = () => _reactForAtom.React.createElement(
  (_Block || _load_Block()).Block,
  null,
  _reactForAtom.React.createElement(
    'div',
    { style: editorWrapperStyle },
    _reactForAtom.React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
      gutterHidden: false,
      readOnly: false,
      syncTextContents: false,
      autoGrow: false,
      path: 'aJavaScriptFile.js',
      textBuffer: buffer1
    })
  ),
  _reactForAtom.React.createElement(
    'div',
    { style: Object.assign({}, editorWrapperStyle, { marginTop: '2em' }) },
    _reactForAtom.React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
      gutterHidden: true,
      readOnly: true,
      syncTextContents: false,
      autoGrow: false,
      path: 'aJavaScriptFile.js',
      textBuffer: buffer2
    })
  )
);

const TextInputExamples = exports.TextInputExamples = {
  sectionName: 'Text Inputs',
  description: '',
  examples: [{
    title: 'AtomInput',
    component: AtomInputExample
  }, {
    title: 'AtomTextEditor',
    component: AtomTextEditorExample
  }]
};