var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');
var FilePreview = require('./FilePreview');

var _require = require('../../../remote-uri');

var relative = _require.relative;

var FileReferencesView = React.createClass({
  displayName: 'FileReferencesView',

  propTypes: {
    uri: React.PropTypes.string.isRequired,
    grammar: React.PropTypes.object.isRequired,
    previewText: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    refGroups: React.PropTypes.arrayOf(React.PropTypes.object /*ReferenceGroup*/).isRequired,
    basePath: React.PropTypes.string.isRequired
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
//# sourceMappingURL=data:application/json;base64,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QkFBNkI7UUFDL0QsTUFBTTtRQUNQLG9CQUFDLFdBQVc7QUFDVixpQkFBTyxFQUFFLE1BQUssS0FBSyxDQUFDLE9BQU8sQUFBQztBQUM1QixjQUFJLEVBQUUsV0FBVyxBQUFDO1dBQ2QsS0FBSyxFQUNUO09BQ0UsQ0FDTjtLQUNILENBQUMsQ0FBQzs7QUFFSCxXQUNFOztRQUFLLFNBQVMsRUFBQyw4QkFBOEI7TUFDM0M7O1VBQUssU0FBUyxFQUFDLGtDQUFrQztRQUMvQzs7WUFBRyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQUFBQztVQUMzQixRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7U0FDNUM7T0FDQTtNQUNOOztVQUFLLFNBQVMsRUFBQyw4QkFBOEI7UUFDMUMsTUFBTTtPQUNIO0tBQ0YsQ0FDTjtHQUNIO0NBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiRmlsZVJlZmVyZW5jZXNWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1JlZmVyZW5jZSwgUmVmZXJlbmNlR3JvdXB9IGZyb20gJy4uL3R5cGVzJztcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3QgRmlsZVByZXZpZXcgPSByZXF1aXJlKCcuL0ZpbGVQcmV2aWV3Jyk7XG5jb25zdCB7cmVsYXRpdmV9ID0gcmVxdWlyZSgnLi4vLi4vLi4vcmVtb3RlLXVyaScpO1xuXG5jb25zdCBGaWxlUmVmZXJlbmNlc1ZpZXcgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIHVyaTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGdyYW1tYXI6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICBwcmV2aWV3VGV4dDogUmVhY3QuUHJvcFR5cGVzLmFycmF5T2YoUmVhY3QuUHJvcFR5cGVzLnN0cmluZykuaXNSZXF1aXJlZCxcbiAgICByZWZHcm91cHM6IFJlYWN0LlByb3BUeXBlcy5hcnJheU9mKFJlYWN0LlByb3BUeXBlcy5vYmplY3QgLypSZWZlcmVuY2VHcm91cCovKS5pc1JlcXVpcmVkLFxuICAgIGJhc2VQYXRoOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgX29uUmVmQ2xpY2socmVmOiBSZWZlcmVuY2UpIHtcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHRoaXMucHJvcHMudXJpLCB7XG4gICAgICBpbml0aWFsTGluZTogcmVmLnN0YXJ0LmxpbmUgLSAxLFxuICAgICAgaW5pdGlhbENvbHVtbjogcmVmLnN0YXJ0LmNvbHVtbiAtIDEsXG4gICAgfSk7XG4gIH0sXG5cbiAgX29uRmlsZUNsaWNrKCkge1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW4odGhpcy5wcm9wcy51cmkpO1xuICB9LFxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGdyb3VwcyA9IHRoaXMucHJvcHMucmVmR3JvdXBzLm1hcCgoZ3JvdXA6IFJlZmVyZW5jZUdyb3VwLCBpKSA9PiB7XG4gICAgICBjb25zdCBwcmV2aWV3VGV4dCA9IHRoaXMucHJvcHMucHJldmlld1RleHRbaV07XG4gICAgICBjb25zdCByYW5nZXMgPSBncm91cC5yZWZlcmVuY2VzLm1hcCgocmVmLCBqKSA9PiB7XG4gICAgICAgIGxldCByYW5nZSA9IHJlZi5zdGFydC5saW5lO1xuICAgICAgICBpZiAocmVmLmVuZC5saW5lICE9PSByZWYuc3RhcnQubGluZSkge1xuICAgICAgICAgIHJhbmdlICs9ICctJyArIHJlZi5lbmQubGluZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYW5nZSArPSAnLCBjb2x1bW4gJyArIHJlZi5zdGFydC5jb2x1bW47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNhbGxlcjtcbiAgICAgICAgaWYgKHJlZi5uYW1lKSB7XG4gICAgICAgICAgY2FsbGVyID0gPHNwYW4+eycgJ31pbiA8Y29kZT57cmVmLm5hbWV9PC9jb2RlPjwvc3Bhbj47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICBrZXk9e2p9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1yZWYtbmFtZVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vblJlZkNsaWNrLmJpbmQodGhpcywgcmVmKX0+XG4gICAgICAgICAgICBMaW5lIHtyYW5nZX0ge2NhbGxlcn1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGtleT17Z3JvdXAuc3RhcnRMaW5lfSBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1yZWZcIj5cbiAgICAgICAgICB7cmFuZ2VzfVxuICAgICAgICAgIDxGaWxlUHJldmlld1xuICAgICAgICAgICAgZ3JhbW1hcj17dGhpcy5wcm9wcy5ncmFtbWFyfVxuICAgICAgICAgICAgdGV4dD17cHJldmlld1RleHR9XG4gICAgICAgICAgICB7Li4uZ3JvdXB9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1maW5kLXJlZmVyZW5jZXMtZmlsZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWZpbGVuYW1lXCI+XG4gICAgICAgICAgPGEgb25DbGljaz17dGhpcy5fb25GaWxlQ2xpY2t9PlxuICAgICAgICAgICAge3JlbGF0aXZlKHRoaXMucHJvcHMuYmFzZVBhdGgsIHRoaXMucHJvcHMudXJpKX1cbiAgICAgICAgICA8L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLXJlZnNcIj5cbiAgICAgICAgICB7Z3JvdXBzfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlUmVmZXJlbmNlc1ZpZXc7XG4iXX0=