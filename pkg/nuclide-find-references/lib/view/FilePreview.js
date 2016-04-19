'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Reference} from '../types';

const {AtomInput} = require('../../../nuclide-ui/lib/AtomInput');
const {React} = require('react-for-atom');
const {PropTypes} = React;

const FilePreview = React.createClass({

  propTypes: {
    text: PropTypes.string.isRequired,
    grammar: PropTypes.object,
    references: PropTypes.arrayOf(PropTypes.object /*Reference*/).isRequired,
    startLine: PropTypes.number.isRequired,
    endLine: PropTypes.number.isRequired,
  },

  componentDidMount() {
    const editor = this.refs.editor.getTextEditor();
    const {grammar, references, startLine} = this.props;

    if (grammar) {
      editor.setGrammar(grammar);
    }

    references.forEach((ref: Reference) => {
      const marker = editor.markBufferRange([
        [ref.start.line - startLine, ref.start.column - 1],
        [ref.end.line - startLine, ref.end.column],
      ]);
      editor.decorateMarker(marker, {type: 'highlight', class: 'reference'});
    });

    // Make sure at least one highlight is visible.
    editor.scrollToBufferPosition([
      references[0].end.line - startLine,
      references[0].end.column - 1,
    ]);
  },

  render(): React.Element {
    const lineNumbers = [];
    for (let i = this.props.startLine; i <= this.props.endLine; i++) {
      lineNumbers.push(
        <div key={i} className="nuclide-find-references-line-number">
          {i}
        </div>
      );
    }
    return (
      <div className="nuclide-find-references-file-preview">
        <div className="nuclide-find-references-line-number-column">
          {lineNumbers}
        </div>
        <AtomInput
          ref="editor"
          initialValue={this.props.text}
          disabled={true}
        />
      </div>
    );
  },

});

module.exports = FilePreview;
