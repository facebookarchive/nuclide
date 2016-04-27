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