var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom = require('react-for-atom');

var _FilePreview = require('./FilePreview');

var _FilePreview2 = _interopRequireDefault(_FilePreview);

var _nuclideRemoteUri = require('../../../nuclide-remote-uri');

var FileReferencesView = _reactForAtom.React.createClass({
  displayName: 'FileReferencesView',

  propTypes: {
    uri: _reactForAtom.React.PropTypes.string.isRequired,
    grammar: _reactForAtom.React.PropTypes.object.isRequired,
    previewText: _reactForAtom.React.PropTypes.arrayOf(_reactForAtom.React.PropTypes.string).isRequired,
    refGroups: _reactForAtom.React.PropTypes.arrayOf(_reactForAtom.React.PropTypes.object /*ReferenceGroup*/).isRequired,
    basePath: _reactForAtom.React.PropTypes.string.isRequired
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
          caller = _reactForAtom.React.createElement(
            'span',
            null,
            ' ',
            'in ',
            _reactForAtom.React.createElement(
              'code',
              null,
              ref.name
            )
          );
        }
        return _reactForAtom.React.createElement(
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

      return _reactForAtom.React.createElement(
        'div',
        { key: group.startLine, className: 'nuclide-find-references-ref' },
        ranges,
        _reactForAtom.React.createElement(_FilePreview2.default, _extends({
          grammar: _this.props.grammar,
          text: previewText
        }, group))
      );
    });

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-find-references-file' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-find-references-filename' },
        _reactForAtom.React.createElement(
          'a',
          { onClick: this._onFileClick },
          (0, _nuclideRemoteUri.relative)(this.props.basePath, this.props.uri)
        )
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-find-references-refs' },
        groups
      )
    );
  }
});

module.exports = FileReferencesView;