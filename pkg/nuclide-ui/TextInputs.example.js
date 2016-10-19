Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

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

var AtomInputExample = function AtomInputExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        disabled: false,
        initialValue: 'atom input',
        placeholderText: 'placeholder text'
      })
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        disabled: true,
        initialValue: 'disabled atom input',
        placeholderText: 'placeholder text'
      })
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        initialValue: 'xs atom input',
        placeholderText: 'placeholder text',
        size: 'xs'
      })
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        initialValue: 'sm atom input',
        placeholderText: 'placeholder text',
        size: 'sm'
      })
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        initialValue: 'lg atom input',
        placeholderText: 'placeholder text',
        size: 'lg'
      })
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        initialValue: 'unstyled atom input',
        placeholderText: 'placeholder text',
        unstyled: true
      })
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        initialValue: 'atom input with custom width',
        placeholderText: 'placeholder text',
        width: 200
      })
    )
  );
};

var buffer1 = new (_atom || _load_atom()).TextBuffer({
  text: '/**\n * Hi!\n */\n\n// I am a TextBuffer.\nconst a = 42;'
});
var buffer2 = new (_atom || _load_atom()).TextBuffer({
  text: '/**\n * Hi!\n */\n\n// I am a read-only, gutter-less TextBuffer.\nconst a = 42;'
});
var editorWrapperStyle = {
  display: 'flex',
  flexGrow: 1,
  height: '12em',
  boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.3)'
};

var AtomTextEditorExample = function AtomTextEditorExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    (_Block || _load_Block()).Block,
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      'div',
      { style: editorWrapperStyle },
      (_reactForAtom || _load_reactForAtom()).React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
        gutterHidden: false,
        readOnly: false,
        syncTextContents: false,
        autoGrow: false,
        path: 'aJavaScriptFile.js',
        textBuffer: buffer1
      })
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      'div',
      { style: _extends({}, editorWrapperStyle, { marginTop: '2em' }) },
      (_reactForAtom || _load_reactForAtom()).React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
        gutterHidden: true,
        readOnly: true,
        syncTextContents: false,
        autoGrow: false,
        path: 'aJavaScriptFile.js',
        textBuffer: buffer2
      })
    )
  );
};

var TextInputExamples = {
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
exports.TextInputExamples = TextInputExamples;