

var AtomInput = require('../../../ui/atom-input');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('react-for-atom');

var React = _require.React;
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
//# sourceMappingURL=data:application/json;base64,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OiJGaWxlUHJldmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZWZlcmVuY2V9IGZyb20gJy4uL3R5cGVzJztcblxuY29uc3QgQXRvbUlucHV0ID0gcmVxdWlyZSgnLi4vLi4vLi4vdWkvYXRvbS1pbnB1dCcpO1xuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCBGaWxlUHJldmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICB0ZXh0OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgZ3JhbW1hcjogUHJvcFR5cGVzLm9iamVjdCxcbiAgICByZWZlcmVuY2VzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0IC8qUmVmZXJlbmNlKi8pLmlzUmVxdWlyZWQsXG4gICAgc3RhcnRMaW5lOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgZW5kTGluZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IGVkaXRvciA9IHRoaXMucmVmcy5lZGl0b3IuZ2V0VGV4dEVkaXRvcigpO1xuICAgIGNvbnN0IHtncmFtbWFyLCByZWZlcmVuY2VzLCBzdGFydExpbmV9ID0gdGhpcy5wcm9wcztcblxuICAgIGlmIChncmFtbWFyKSB7XG4gICAgICBlZGl0b3Iuc2V0R3JhbW1hcihncmFtbWFyKTtcbiAgICB9XG5cbiAgICByZWZlcmVuY2VzLmZvckVhY2goKHJlZjogUmVmZXJlbmNlKSA9PiB7XG4gICAgICBjb25zdCBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtcbiAgICAgICAgW3JlZi5zdGFydC5saW5lIC0gc3RhcnRMaW5lLCByZWYuc3RhcnQuY29sdW1uIC0gMV0sXG4gICAgICAgIFtyZWYuZW5kLmxpbmUgLSBzdGFydExpbmUsIHJlZi5lbmQuY29sdW1uXSxcbiAgICAgIF0pO1xuICAgICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogJ3JlZmVyZW5jZSd9KTtcbiAgICB9KTtcblxuICAgIC8vIE1ha2Ugc3VyZSBhdCBsZWFzdCBvbmUgaGlnaGxpZ2h0IGlzIHZpc2libGUuXG4gICAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW1xuICAgICAgcmVmZXJlbmNlc1swXS5lbmQubGluZSAtIHN0YXJ0TGluZSxcbiAgICAgIHJlZmVyZW5jZXNbMF0uZW5kLmNvbHVtbiAtIDEsXG4gICAgXSk7XG4gIH0sXG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgbGluZU51bWJlcnMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gdGhpcy5wcm9wcy5zdGFydExpbmU7IGkgPD0gdGhpcy5wcm9wcy5lbmRMaW5lOyBpKyspIHtcbiAgICAgIGxpbmVOdW1iZXJzLnB1c2goXG4gICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1saW5lLW51bWJlclwiPlxuICAgICAgICAgIHtpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWZpbGUtcHJldmlld1wiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWxpbmUtbnVtYmVyLWNvbHVtblwiPlxuICAgICAgICAgIHtsaW5lTnVtYmVyc31cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICByZWY9XCJlZGl0b3JcIlxuICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy50ZXh0fVxuICAgICAgICAgIGRpc2FibGVkPXt0cnVlfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVByZXZpZXc7XG4iXX0=