

var AtomInput = require('../../../nuclide-ui-atom-input');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVQcmV2aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBYUEsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7Ozs7Ozs7Ozs7ZUFDNUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLFlBQUwsS0FBSztJQUNMLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0FBRWhCLElBQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUVwQyxXQUFTLEVBQUU7QUFDVCxRQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2pDLFdBQU8sRUFBRSxTQUFTLENBQUMsTUFBTTtBQUN6QixjQUFVLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxlQUFlLENBQUMsVUFBVTtBQUN4RSxhQUFTLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3RDLFdBQU8sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7R0FDckM7O0FBRUQsbUJBQWlCLEVBQUEsNkJBQUc7QUFDbEIsUUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7aUJBQ1AsSUFBSSxDQUFDLEtBQUs7UUFBNUMsT0FBTyxVQUFQLE9BQU87UUFBRSxVQUFVLFVBQVYsVUFBVTtRQUFFLFNBQVMsVUFBVCxTQUFTOztBQUVyQyxRQUFJLE9BQU8sRUFBRTtBQUNYLFlBQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDNUI7O0FBRUQsY0FBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBZ0I7QUFDckMsVUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUNwQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFNBQVMsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFDbEQsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FDM0MsQ0FBQyxDQUFDO0FBQ0gsWUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQU8sV0FBVyxFQUFDLENBQUMsQ0FBQztLQUN4RSxDQUFDLENBQUM7OztBQUdILFVBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUM1QixVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxTQUFTLEVBQ2xDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FDN0IsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsUUFBTSxFQUFBLGtCQUFpQjtBQUNyQixRQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdkIsU0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDL0QsaUJBQVcsQ0FBQyxJQUFJLENBQ2Q7O1VBQUssR0FBRyxFQUFFLENBQUMsQUFBQyxFQUFDLFNBQVMsRUFBQyxxQ0FBcUM7UUFDekQsQ0FBQztPQUNFLENBQ1AsQ0FBQztLQUNIO0FBQ0QsV0FDRTs7UUFBSyxTQUFTLEVBQUMsc0NBQXNDO01BQ25EOztVQUFLLFNBQVMsRUFBQyw0Q0FBNEM7UUFDeEQsV0FBVztPQUNSO01BQ04sb0JBQUMsU0FBUztBQUNSLFdBQUcsRUFBQyxRQUFRO0FBQ1osb0JBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQUFBQztBQUM5QixnQkFBUSxFQUFFLElBQUksQUFBQztRQUNmO0tBQ0UsQ0FDTjtHQUNIOztDQUVGLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJGaWxlUHJldmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZWZlcmVuY2V9IGZyb20gJy4uL3R5cGVzJztcblxuY29uc3QgQXRvbUlucHV0ID0gcmVxdWlyZSgnLi4vLi4vLi4vbnVjbGlkZS11aS1hdG9tLWlucHV0Jyk7XG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IEZpbGVQcmV2aWV3ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIHRleHQ6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBncmFtbWFyOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHJlZmVyZW5jZXM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5vYmplY3QgLypSZWZlcmVuY2UqLykuaXNSZXF1aXJlZCxcbiAgICBzdGFydExpbmU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBlbmRMaW5lOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy5yZWZzLmVkaXRvci5nZXRUZXh0RWRpdG9yKCk7XG4gICAgY29uc3Qge2dyYW1tYXIsIHJlZmVyZW5jZXMsIHN0YXJ0TGluZX0gPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKGdyYW1tYXIpIHtcbiAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpO1xuICAgIH1cblxuICAgIHJlZmVyZW5jZXMuZm9yRWFjaCgocmVmOiBSZWZlcmVuY2UpID0+IHtcbiAgICAgIGNvbnN0IG1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1xuICAgICAgICBbcmVmLnN0YXJ0LmxpbmUgLSBzdGFydExpbmUsIHJlZi5zdGFydC5jb2x1bW4gLSAxXSxcbiAgICAgICAgW3JlZi5lbmQubGluZSAtIHN0YXJ0TGluZSwgcmVmLmVuZC5jb2x1bW5dLFxuICAgICAgXSk7XG4gICAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiAncmVmZXJlbmNlJ30pO1xuICAgIH0pO1xuXG4gICAgLy8gTWFrZSBzdXJlIGF0IGxlYXN0IG9uZSBoaWdobGlnaHQgaXMgdmlzaWJsZS5cbiAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbXG4gICAgICByZWZlcmVuY2VzWzBdLmVuZC5saW5lIC0gc3RhcnRMaW5lLFxuICAgICAgcmVmZXJlbmNlc1swXS5lbmQuY29sdW1uIC0gMSxcbiAgICBdKTtcbiAgfSxcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBsaW5lTnVtYmVycyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSB0aGlzLnByb3BzLnN0YXJ0TGluZTsgaSA8PSB0aGlzLnByb3BzLmVuZExpbmU7IGkrKykge1xuICAgICAgbGluZU51bWJlcnMucHVzaChcbiAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWxpbmUtbnVtYmVyXCI+XG4gICAgICAgICAge2l9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1maW5kLXJlZmVyZW5jZXMtZmlsZS1wcmV2aWV3XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1maW5kLXJlZmVyZW5jZXMtbGluZS1udW1iZXItY29sdW1uXCI+XG4gICAgICAgICAge2xpbmVOdW1iZXJzfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIHJlZj1cImVkaXRvclwiXG4gICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnByb3BzLnRleHR9XG4gICAgICAgICAgZGlzYWJsZWQ9e3RydWV9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlUHJldmlldztcbiJdfQ==