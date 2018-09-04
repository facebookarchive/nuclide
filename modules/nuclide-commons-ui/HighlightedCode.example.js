"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HighlightedCodeExamples = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _Button() {
  const data = require("./Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _HighlightedCode() {
  const data = require("./HighlightedCode");

  _HighlightedCode = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class HighlightedCodeExample extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.state = {
      count: 1
    }, this._addOneMore = () => {
      // $FlowIgnore
      _reactDom.default.unstable_deferredUpdates(() => {
        // TODO: (wbinnssmith) T30771435 this setState depends on current state
        // and should use an updater function rather than an object
        // eslint-disable-next-line react/no-access-state-in-setstate
        this.setState({
          count: this.state.count + 1
        });
      });
    }, _temp;
  }

  render() {
    const jsGrammar = atom.grammars.grammarForScopeName('source.js');

    if (jsGrammar == null) {
      return null;
    } // Use our own source code as an example!


    const code = (HighlightedCodeExample.toString() + '\n').repeat(this.state.count); // $FlowIgnore: Not an official API yet.

    const AsyncMode = React.unstable_AsyncMode;
    return React.createElement("div", null, "The code below is rendered with async React, so highlighting does not block (no matter how many lines have to be tokenized).", React.createElement("br", null), React.createElement(_Button().Button, {
      onClick: this._addOneMore
    }, "Add more code!"), React.createElement(AsyncMode, null, React.createElement(_HighlightedCode().HighlightedCode, {
      grammar: jsGrammar,
      code: code,
      style: {
        marginTop: '8px'
      }
    })));
  }

}

const HighlightedCodeExamples = {
  sectionName: 'HighlightedCode',
  description: 'HighlightedCode provides a lighter-weight syntax highlighter for code.\n' + 'It uses the same tokenizer as Atom text editors but ditches the editor.',
  examples: [{
    title: 'HighlightedCode',
    component: HighlightedCodeExample
  }]
};
exports.HighlightedCodeExamples = HighlightedCodeExamples;