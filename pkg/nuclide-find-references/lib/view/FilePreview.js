var _require = require('../../../nuclide-ui/lib/AtomInput');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomInput = _require.AtomInput;

var _require2 = require('react-for-atom');

var React = _require2.React;
var PropTypes = React.PropTypes;

var FilePreview = React.createClass({
  displayName: 'FilePreview',

  propTypes: {
    text: PropTypes.string.isRequired,
    grammar: PropTypes.object,
    references: PropTypes.arrayOf(PropTypes.object /*Reference*/).isRequired,
    startLine: PropTypes.number.isRequired,
    endLine: PropTypes.number.isRequired
  },

  componentDidMount: function componentDidMount() {
    var editor = this.refs.editor.getTextEditor();
    var _props = this.props;
    var grammar = _props.grammar;
    var references = _props.references;
    var startLine = _props.startLine;

    if (grammar) {
      editor.setGrammar(grammar);
    }

    references.forEach(function (ref) {
      var marker = editor.markBufferRange([[ref.start.line - startLine, ref.start.column - 1], [ref.end.line - startLine, ref.end.column]]);
      editor.decorateMarker(marker, { type: 'highlight', 'class': 'reference' });
    });

    // Make sure at least one highlight is visible.
    editor.scrollToBufferPosition([references[0].end.line - startLine, references[0].end.column - 1]);
  },

  render: function render() {
    var lineNumbers = [];
    for (var i = this.props.startLine; i <= this.props.endLine; i++) {
      lineNumbers.push(React.createElement(
        'div',
        { key: i, className: 'nuclide-find-references-line-number' },
        i
      ));
    }
    return React.createElement(
      'div',
      { className: 'nuclide-find-references-file-preview' },
      React.createElement(
        'div',
        { className: 'nuclide-find-references-line-number-column' },
        lineNumbers
      ),
      React.createElement(AtomInput, {
        ref: 'editor',
        initialValue: this.props.text,
        disabled: true
      })
    );
  }

});

module.exports = FilePreview;