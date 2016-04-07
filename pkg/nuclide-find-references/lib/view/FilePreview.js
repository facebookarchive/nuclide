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
//# sourceMappingURL=data:application/json;base64,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IjoiRmlsZVByZXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmVmZXJlbmNlfSBmcm9tICcuLi90eXBlcyc7XG5cbmNvbnN0IHtBdG9tSW5wdXR9ID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS11aS9saWIvQXRvbUlucHV0Jyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IEZpbGVQcmV2aWV3ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIHRleHQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBncmFtbWFyOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHJlZmVyZW5jZXM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5vYmplY3QgLypSZWZlcmVuY2UqLykuaXNSZXF1aXJlZCxcbiAgICBzdGFydExpbmU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBlbmRMaW5lOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy5yZWZzLmVkaXRvci5nZXRUZXh0RWRpdG9yKCk7XG4gICAgY29uc3Qge2dyYW1tYXIsIHJlZmVyZW5jZXMsIHN0YXJ0TGluZX0gPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKGdyYW1tYXIpIHtcbiAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpO1xuICAgIH1cblxuICAgIHJlZmVyZW5jZXMuZm9yRWFjaCgocmVmOiBSZWZlcmVuY2UpID0+IHtcbiAgICAgIGNvbnN0IG1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1xuICAgICAgICBbcmVmLnN0YXJ0LmxpbmUgLSBzdGFydExpbmUsIHJlZi5zdGFydC5jb2x1bW4gLSAxXSxcbiAgICAgICAgW3JlZi5lbmQubGluZSAtIHN0YXJ0TGluZSwgcmVmLmVuZC5jb2x1bW5dLFxuICAgICAgXSk7XG4gICAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiAncmVmZXJlbmNlJ30pO1xuICAgIH0pO1xuXG4gICAgLy8gTWFrZSBzdXJlIGF0IGxlYXN0IG9uZSBoaWdobGlnaHQgaXMgdmlzaWJsZS5cbiAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbXG4gICAgICByZWZlcmVuY2VzWzBdLmVuZC5saW5lIC0gc3RhcnRMaW5lLFxuICAgICAgcmVmZXJlbmNlc1swXS5lbmQuY29sdW1uIC0gMSxcbiAgICBdKTtcbiAgfSxcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBsaW5lTnVtYmVycyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSB0aGlzLnByb3BzLnN0YXJ0TGluZTsgaSA8PSB0aGlzLnByb3BzLmVuZExpbmU7IGkrKykge1xuICAgICAgbGluZU51bWJlcnMucHVzaChcbiAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWxpbmUtbnVtYmVyXCI+XG4gICAgICAgICAge2l9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1maW5kLXJlZmVyZW5jZXMtZmlsZS1wcmV2aWV3XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1maW5kLXJlZmVyZW5jZXMtbGluZS1udW1iZXItY29sdW1uXCI+XG4gICAgICAgICAge2xpbmVOdW1iZXJzfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIHJlZj1cImVkaXRvclwiXG4gICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnByb3BzLnRleHR9XG4gICAgICAgICAgZGlzYWJsZWQ9e3RydWV9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlUHJldmlldztcbiJdfQ==