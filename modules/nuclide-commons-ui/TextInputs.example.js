"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextInputExamples = void 0;

var _atom = require("atom");

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("./AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _AtomTextEditor() {
  const data = require("./AtomTextEditor");

  _AtomTextEditor = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const AtomInputExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_AtomInput().AtomInput, {
  disabled: false,
  initialValue: "atom input",
  placeholderText: "placeholder text"
})), React.createElement(_Block().Block, null, React.createElement(_AtomInput().AtomInput, {
  disabled: true,
  initialValue: "disabled atom input",
  placeholderText: "placeholder text"
})), React.createElement(_Block().Block, null, React.createElement(_AtomInput().AtomInput, {
  initialValue: "xs atom input",
  placeholderText: "placeholder text",
  size: "xs"
})), React.createElement(_Block().Block, null, React.createElement(_AtomInput().AtomInput, {
  initialValue: "sm atom input",
  placeholderText: "placeholder text",
  size: "sm"
})), React.createElement(_Block().Block, null, React.createElement(_AtomInput().AtomInput, {
  initialValue: "lg atom input",
  placeholderText: "placeholder text",
  size: "lg"
})), React.createElement(_Block().Block, null, React.createElement(_AtomInput().AtomInput, {
  initialValue: "unstyled atom input",
  placeholderText: "placeholder text",
  unstyled: true
})), React.createElement(_Block().Block, null, React.createElement(_AtomInput().AtomInput, {
  initialValue: "atom input with custom width",
  placeholderText: "placeholder text",
  width: 200
})));

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

const AtomTextEditorExample = () => React.createElement(_Block().Block, null, React.createElement("div", {
  style: editorWrapperStyle
}, React.createElement(_AtomTextEditor().AtomTextEditor, {
  gutterHidden: false,
  readOnly: false,
  syncTextContents: false,
  autoGrow: false,
  path: "aJavaScriptFile.js",
  textBuffer: buffer1
})), React.createElement("div", {
  style: Object.assign({}, editorWrapperStyle, {
    marginTop: '2em'
  })
}, React.createElement(_AtomTextEditor().AtomTextEditor, {
  gutterHidden: true,
  readOnly: true,
  syncTextContents: false,
  autoGrow: false,
  path: "aJavaScriptFile.js",
  textBuffer: buffer2
})));

const TextInputExamples = {
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