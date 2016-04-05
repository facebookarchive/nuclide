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

var _require2 = require('../../../nuclide-remote-uri');

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
//# sourceMappingURL=data:application/json;base64,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QUNWLGlCQUFPLEVBQUUsTUFBSyxLQUFLLENBQUMsT0FBTyxBQUFDO0FBQzVCLGNBQUksRUFBRSxXQUFXLEFBQUM7V0FDZCxLQUFLLEVBQ1Q7T0FDRSxDQUNOO0tBQ0gsQ0FBQyxDQUFDOztBQUVILFdBQ0U7O1FBQUssU0FBUyxFQUFDLDhCQUE4QjtNQUMzQzs7VUFBSyxTQUFTLEVBQUMsa0NBQWtDO1FBQy9DOztZQUFHLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxBQUFDO1VBQzNCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztTQUM1QztPQUNBO01BQ047O1VBQUssU0FBUyxFQUFDLDhCQUE4QjtRQUMxQyxNQUFNO09BQ0g7S0FDRixDQUNOO0dBQ0g7Q0FDRixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJGaWxlUmVmZXJlbmNlc1ZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UmVmZXJlbmNlLCBSZWZlcmVuY2VHcm91cH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5jb25zdCBGaWxlUHJldmlldyA9IHJlcXVpcmUoJy4vRmlsZVByZXZpZXcnKTtcbmNvbnN0IHtyZWxhdGl2ZX0gPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLXJlbW90ZS11cmknKTtcblxuY29uc3QgRmlsZVJlZmVyZW5jZXNWaWV3ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICB1cmk6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBncmFtbWFyOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgcHJldmlld1RleHQ6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zdHJpbmcpLmlzUmVxdWlyZWQsXG4gICAgcmVmR3JvdXBzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMub2JqZWN0IC8qUmVmZXJlbmNlR3JvdXAqLykuaXNSZXF1aXJlZCxcbiAgICBiYXNlUGF0aDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICB9LFxuXG4gIF9vblJlZkNsaWNrKHJlZjogUmVmZXJlbmNlKSB7XG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbih0aGlzLnByb3BzLnVyaSwge1xuICAgICAgaW5pdGlhbExpbmU6IHJlZi5zdGFydC5saW5lIC0gMSxcbiAgICAgIGluaXRpYWxDb2x1bW46IHJlZi5zdGFydC5jb2x1bW4gLSAxLFxuICAgIH0pO1xuICB9LFxuXG4gIF9vbkZpbGVDbGljaygpIHtcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHRoaXMucHJvcHMudXJpKTtcbiAgfSxcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBncm91cHMgPSB0aGlzLnByb3BzLnJlZkdyb3Vwcy5tYXAoKGdyb3VwOiBSZWZlcmVuY2VHcm91cCwgaSkgPT4ge1xuICAgICAgY29uc3QgcHJldmlld1RleHQgPSB0aGlzLnByb3BzLnByZXZpZXdUZXh0W2ldO1xuICAgICAgY29uc3QgcmFuZ2VzID0gZ3JvdXAucmVmZXJlbmNlcy5tYXAoKHJlZiwgaikgPT4ge1xuICAgICAgICBsZXQgcmFuZ2UgPSByZWYuc3RhcnQubGluZTtcbiAgICAgICAgaWYgKHJlZi5lbmQubGluZSAhPT0gcmVmLnN0YXJ0LmxpbmUpIHtcbiAgICAgICAgICByYW5nZSArPSAnLScgKyByZWYuZW5kLmxpbmU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmFuZ2UgKz0gJywgY29sdW1uICcgKyByZWYuc3RhcnQuY29sdW1uO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjYWxsZXI7XG4gICAgICAgIGlmIChyZWYubmFtZSkge1xuICAgICAgICAgIGNhbGxlciA9IDxzcGFuPnsnICd9aW4gPGNvZGU+e3JlZi5uYW1lfTwvY29kZT48L3NwYW4+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdlxuICAgICAgICAgICAga2V5PXtqfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1maW5kLXJlZmVyZW5jZXMtcmVmLW5hbWVcIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25SZWZDbGljay5iaW5kKHRoaXMsIHJlZil9PlxuICAgICAgICAgICAgTGluZSB7cmFuZ2V9IHtjYWxsZXJ9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9e2dyb3VwLnN0YXJ0TGluZX0gY2xhc3NOYW1lPVwibnVjbGlkZS1maW5kLXJlZmVyZW5jZXMtcmVmXCI+XG4gICAgICAgICAge3Jhbmdlc31cbiAgICAgICAgICA8RmlsZVByZXZpZXdcbiAgICAgICAgICAgIGdyYW1tYXI9e3RoaXMucHJvcHMuZ3JhbW1hcn1cbiAgICAgICAgICAgIHRleHQ9e3ByZXZpZXdUZXh0fVxuICAgICAgICAgICAgey4uLmdyb3VwfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWZpbGVcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1maWxlbmFtZVwiPlxuICAgICAgICAgIDxhIG9uQ2xpY2s9e3RoaXMuX29uRmlsZUNsaWNrfT5cbiAgICAgICAgICAgIHtyZWxhdGl2ZSh0aGlzLnByb3BzLmJhc2VQYXRoLCB0aGlzLnByb3BzLnVyaSl9XG4gICAgICAgICAgPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1yZWZzXCI+XG4gICAgICAgICAge2dyb3Vwc31cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVJlZmVyZW5jZXNWaWV3O1xuIl19