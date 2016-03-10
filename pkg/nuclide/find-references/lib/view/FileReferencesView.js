var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var FilePreview = require('./FilePreview');

var _require2 = require('../../../remote-uri');

var relative = _require2.relative;

var FileReferencesView = React.createClass({
  displayName: 'FileReferencesView',

  propTypes: {
    uri: PropTypes.string.isRequired,
    grammar: PropTypes.object.isRequired,
    previewText: PropTypes.arrayOf(PropTypes.string).isRequired,
    refGroups: PropTypes.arrayOf(PropTypes.object /*ReferenceGroup*/).isRequired,
    basePath: PropTypes.string.isRequired
  },

  _onRefClick: function _onRefClick(ref) {
    atom.workspace.open(this.props.uri, {
      initialLine: ref.start.line - 1,
      initialColumn: ref.start.column - 1
    });
  },

  _onFileClick: function _onFileClick() {
    atom.workspace.open(this.props.uri);
  },

  render: function render() {
    var _this = this;

    var groups = this.props.refGroups.map(function (group, i) {
      var previewText = _this.props.previewText[i];
      var ranges = group.references.map(function (ref, j) {
        var range = ref.start.line;
        if (ref.end.line !== ref.start.line) {
          range += '-' + ref.end.line;
        } else {
          range += ', column ' + ref.start.column;
        }
        var caller = undefined;
        if (ref.name) {
          caller = React.createElement(
            'span',
            null,
            ' ',
            'in ',
            React.createElement(
              'code',
              null,
              ref.name
            )
          );
        }
        return React.createElement(
          'div',
          {
            key: j,
            className: 'nuclide-find-references-ref-name',
            onClick: _this._onRefClick.bind(_this, ref) },
          'Line ',
          range,
          ' ',
          caller
        );
      });

      return React.createElement(
        'div',
        { key: group.startLine, className: 'nuclide-find-references-ref' },
        ranges,
        React.createElement(FilePreview, _extends({
          grammar: _this.props.grammar,
          text: previewText
        }, group))
      );
    });

    return React.createElement(
      'div',
      { className: 'nuclide-find-references-file' },
      React.createElement(
        'div',
        { className: 'nuclide-find-references-filename' },
        React.createElement(
          'a',
          { onClick: this._onFileClick },
          relative(this.props.basePath, this.props.uri)
        )
      ),
      React.createElement(
        'div',
        { className: 'nuclide-find-references-refs' },
        groups
      )
    );
  }
});

module.exports = FileReferencesView;
//# sourceMappingURL=data:application/json;base64,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QUNWLGlCQUFPLEVBQUUsTUFBSyxLQUFLLENBQUMsT0FBTyxBQUFDO0FBQzVCLGNBQUksRUFBRSxXQUFXLEFBQUM7V0FDZCxLQUFLLEVBQ1Q7T0FDRSxDQUNOO0tBQ0gsQ0FBQyxDQUFDOztBQUVILFdBQ0U7O1FBQUssU0FBUyxFQUFDLDhCQUE4QjtNQUMzQzs7VUFBSyxTQUFTLEVBQUMsa0NBQWtDO1FBQy9DOztZQUFHLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxBQUFDO1VBQzNCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztTQUM1QztPQUNBO01BQ047O1VBQUssU0FBUyxFQUFDLDhCQUE4QjtRQUMxQyxNQUFNO09BQ0g7S0FDRixDQUNOO0dBQ0g7Q0FDRixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJGaWxlUmVmZXJlbmNlc1ZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmVmZXJlbmNlLCBSZWZlcmVuY2VHcm91cH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5jb25zdCBGaWxlUHJldmlldyA9IHJlcXVpcmUoJy4vRmlsZVByZXZpZXcnKTtcbmNvbnN0IHtyZWxhdGl2ZX0gPSByZXF1aXJlKCcuLi8uLi8uLi9yZW1vdGUtdXJpJyk7XG5cbmNvbnN0IEZpbGVSZWZlcmVuY2VzVmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgdXJpOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgZ3JhbW1hcjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgIHByZXZpZXdUZXh0OiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuc3RyaW5nKS5pc1JlcXVpcmVkLFxuICAgIHJlZkdyb3VwczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCAvKlJlZmVyZW5jZUdyb3VwKi8pLmlzUmVxdWlyZWQsXG4gICAgYmFzZVBhdGg6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgfSxcblxuICBfb25SZWZDbGljayhyZWY6IFJlZmVyZW5jZSkge1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW4odGhpcy5wcm9wcy51cmksIHtcbiAgICAgIGluaXRpYWxMaW5lOiByZWYuc3RhcnQubGluZSAtIDEsXG4gICAgICBpbml0aWFsQ29sdW1uOiByZWYuc3RhcnQuY29sdW1uIC0gMSxcbiAgICB9KTtcbiAgfSxcblxuICBfb25GaWxlQ2xpY2soKSB7XG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbih0aGlzLnByb3BzLnVyaSk7XG4gIH0sXG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgZ3JvdXBzID0gdGhpcy5wcm9wcy5yZWZHcm91cHMubWFwKChncm91cDogUmVmZXJlbmNlR3JvdXAsIGkpID0+IHtcbiAgICAgIGNvbnN0IHByZXZpZXdUZXh0ID0gdGhpcy5wcm9wcy5wcmV2aWV3VGV4dFtpXTtcbiAgICAgIGNvbnN0IHJhbmdlcyA9IGdyb3VwLnJlZmVyZW5jZXMubWFwKChyZWYsIGopID0+IHtcbiAgICAgICAgbGV0IHJhbmdlID0gcmVmLnN0YXJ0LmxpbmU7XG4gICAgICAgIGlmIChyZWYuZW5kLmxpbmUgIT09IHJlZi5zdGFydC5saW5lKSB7XG4gICAgICAgICAgcmFuZ2UgKz0gJy0nICsgcmVmLmVuZC5saW5lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJhbmdlICs9ICcsIGNvbHVtbiAnICsgcmVmLnN0YXJ0LmNvbHVtbjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY2FsbGVyO1xuICAgICAgICBpZiAocmVmLm5hbWUpIHtcbiAgICAgICAgICBjYWxsZXIgPSA8c3Bhbj57JyAnfWluIDxjb2RlPntyZWYubmFtZX08L2NvZGU+PC9zcGFuPjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGtleT17an1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLXJlZi1uYW1lXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uUmVmQ2xpY2suYmluZCh0aGlzLCByZWYpfT5cbiAgICAgICAgICAgIExpbmUge3JhbmdlfSB7Y2FsbGVyfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYga2V5PXtncm91cC5zdGFydExpbmV9IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLXJlZlwiPlxuICAgICAgICAgIHtyYW5nZXN9XG4gICAgICAgICAgPEZpbGVQcmV2aWV3XG4gICAgICAgICAgICBncmFtbWFyPXt0aGlzLnByb3BzLmdyYW1tYXJ9XG4gICAgICAgICAgICB0ZXh0PXtwcmV2aWV3VGV4dH1cbiAgICAgICAgICAgIHsuLi5ncm91cH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1maWxlXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1maW5kLXJlZmVyZW5jZXMtZmlsZW5hbWVcIj5cbiAgICAgICAgICA8YSBvbkNsaWNrPXt0aGlzLl9vbkZpbGVDbGlja30+XG4gICAgICAgICAgICB7cmVsYXRpdmUodGhpcy5wcm9wcy5iYXNlUGF0aCwgdGhpcy5wcm9wcy51cmkpfVxuICAgICAgICAgIDwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1maW5kLXJlZmVyZW5jZXMtcmVmc1wiPlxuICAgICAgICAgIHtncm91cHN9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVSZWZlcmVuY2VzVmlldztcbiJdfQ==