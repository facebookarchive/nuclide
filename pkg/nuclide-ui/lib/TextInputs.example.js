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

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _Block = require('./Block');

var _AtomInput = require('./AtomInput');

var _AtomTextEditor = require('./AtomTextEditor');

var AtomInputExample = function AtomInputExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        disabled: false,
        initialValue: 'atom input',
        placeholderText: 'placeholder text'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        disabled: true,
        initialValue: 'disabled atom input',
        placeholderText: 'placeholder text'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        initialValue: 'xs atom input',
        placeholderText: 'placeholder text',
        size: 'xs'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        initialValue: 'sm atom input',
        placeholderText: 'placeholder text',
        size: 'sm'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        initialValue: 'lg atom input',
        placeholderText: 'placeholder text',
        size: 'lg'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        initialValue: 'unstyled atom input',
        placeholderText: 'placeholder text',
        unstyled: true
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        initialValue: 'atom input with custom width',
        placeholderText: 'placeholder text',
        width: 200
      })
    )
  );
};

var buffer1 = new _atom.TextBuffer({
  text: '/**\n * Hi!\n */\n\n// I am a TextBuffer.\nconst a = 42;'
});
var buffer2 = new _atom.TextBuffer({
  text: '/**\n * Hi!\n */\n\n// I am a read-only, gutter-less TextBuffer.\nconst a = 42;'
});
var editorWrapperStyle = {
  display: 'flex',
  flexGrow: 1,
  height: '12em',
  boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.3)'
};

var AtomTextEditorExample = function AtomTextEditorExample() {
  return _reactForAtom.React.createElement(
    _Block.Block,
    null,
    _reactForAtom.React.createElement(
      'div',
      { style: editorWrapperStyle },
      _reactForAtom.React.createElement(_AtomTextEditor.AtomTextEditor, {
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
      { style: _extends({}, editorWrapperStyle, { marginTop: '2em' }) },
      _reactForAtom.React.createElement(_AtomTextEditor.AtomTextEditor, {
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