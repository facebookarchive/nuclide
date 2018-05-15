'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.HighlightedCodeExamples = undefined;











var _react = _interopRequireWildcard(require('react'));
var _reactDom = _interopRequireDefault(require('react-dom'));var _Button;
function _load_Button() {return _Button = require('./Button');}var _HighlightedCode;
function _load_HighlightedCode() {return _HighlightedCode = require('./HighlightedCode');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                         * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                         * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                         * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                         * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                         *  strict-local
                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                         */class HighlightedCodeExample extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.state = { count: 1 }, this._addOneMore = () => {// $FlowIgnore
      _reactDom.default.unstable_deferredUpdates(() => {this.setState({ count: this.state.count + 1 });});
    }, _temp;}

  render() {
    const jsGrammar = atom.grammars.grammarForScopeName('source.js');
    if (jsGrammar == null) {
      return null;
    }
    // Use our own source code as an example!
    const code = (HighlightedCodeExample.toString() + '\n').repeat(
    this.state.count);

    // $FlowIgnore: Not an official API yet.
    const AsyncComponent = _react.unstable_AsyncComponent;
    return (
      _react.createElement('div', null, 'The code below is rendered with async React, so highlighting does not block (no matter how many lines have to be tokenized).',


        _react.createElement('br', null),
        _react.createElement((_Button || _load_Button()).Button, { onClick: this._addOneMore }, 'Add more code!'),
        _react.createElement(AsyncComponent, null,
          _react.createElement((_HighlightedCode || _load_HighlightedCode()).HighlightedCode, {
            grammar: jsGrammar,
            code: code,
            style: { marginTop: '8px' } }))));




  }}


const HighlightedCodeExamples = exports.HighlightedCodeExamples = {
  sectionName: 'HighlightedCode',
  description:
  'HighlightedCode provides a lighter-weight syntax highlighter for code.\n' +
  'It uses the same tokenizer as Atom text editors but ditches the editor.',
  examples: [
  {
    title: 'HighlightedCode',
    component: HighlightedCodeExample }] };