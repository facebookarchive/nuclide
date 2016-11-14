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
exports.default = undefined;

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../../nuclide-ui/AtomInput');
}

var _reactForAtom = require('react-for-atom');

let FilePreview = class FilePreview extends _reactForAtom.React.Component {

  componentDidMount() {
    const editor = this.refs.editor.getTextEditor();
    var _props = this.props;
    const grammar = _props.grammar,
          references = _props.references,
          startLine = _props.startLine;


    if (grammar) {
      editor.setGrammar(grammar);
    }

    references.forEach(ref => {
      const range = ref.range;
      const marker = editor.markBufferRange([[range.start.row - startLine, range.start.column], [range.end.row - startLine, range.end.column]]);
      editor.decorateMarker(marker, { type: 'highlight', class: 'reference' });
    });

    // Make sure at least one highlight is visible.
    editor.scrollToBufferPosition([references[0].range.end.row - startLine + 1, references[0].range.end.column]);
  }

  render() {
    const lineNumbers = [];
    for (let i = this.props.startLine; i <= this.props.endLine; i++) {
      lineNumbers.push(_reactForAtom.React.createElement(
        'div',
        {
          key: i,
          className: 'nuclide-find-references-line-number',
          onClick: evt => this.props.onLineClick(evt, i) },
        i + 1
      ));
    }
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-find-references-file-preview' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-find-references-line-number-column' },
        lineNumbers
      ),
      _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: 'editor',
        initialValue: this.props.text,
        disabled: true,
        onClick: this.props.onClick
      })
    );
  }

};
exports.default = FilePreview;
module.exports = exports['default'];