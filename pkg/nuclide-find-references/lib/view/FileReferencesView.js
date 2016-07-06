var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _FilePreview2;

function _FilePreview() {
  return _FilePreview2 = _interopRequireDefault(require('./FilePreview'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../../nuclide-remote-uri'));
}

var FileReferencesView = (_reactForAtom2 || _reactForAtom()).React.createClass({
  propTypes: {
    uri: (_reactForAtom2 || _reactForAtom()).React.PropTypes.string.isRequired,
    grammar: (_reactForAtom2 || _reactForAtom()).React.PropTypes.object.isRequired,
    previewText: (_reactForAtom2 || _reactForAtom()).React.PropTypes.arrayOf((_reactForAtom2 || _reactForAtom()).React.PropTypes.string).isRequired,
    refGroups: (_reactForAtom2 || _reactForAtom()).React.PropTypes.arrayOf((_reactForAtom2 || _reactForAtom()).React.PropTypes.object /*ReferenceGroup*/).isRequired,
    basePath: (_reactForAtom2 || _reactForAtom()).React.PropTypes.string.isRequired,
    clickCallback: (_reactForAtom2 || _reactForAtom()).React.PropTypes.func.isRequired,
    isSelected: (_reactForAtom2 || _reactForAtom()).React.PropTypes.bool.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      isExpanded: true
    };
  },

  _onRefClick: function _onRefClick(ref) {
    atom.workspace.open(this.props.uri, {
      initialLine: ref.start.line - 1,
      initialColumn: ref.start.column - 1
    });
  },

  _onFileClick: function _onFileClick() {
    this.props.clickCallback();
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  },

  _onFileNameClick: function _onFileNameClick() {
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
          caller = (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            null,
            ' ',
            'in ',
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'code',
              null,
              ref.name
            )
          );
        }
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
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

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'li',
        { key: group.startLine, className: 'nuclide-find-references-ref' },
        ranges,
        (_reactForAtom2 || _reactForAtom()).React.createElement((_FilePreview2 || _FilePreview()).default, _extends({
          grammar: _this.props.grammar,
          text: previewText
        }, group, {
          onClick: _this._onRefClick.bind(_this, group.references[0])
        }))
      );
    });
    var outerClassName = (0, (_classnames2 || _classnames()).default)('nuclide-find-references-file list-nested-item', {
      collapsed: !this.state.isExpanded,
      expanded: this.state.isExpanded,
      selected: this.props.isSelected
    });

    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'li',
      { className: '' + outerClassName,
        onClick: this._onFileClick },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-find-references-filename list-item' },
        (_reactForAtom2 || _reactForAtom()).React.createElement('span', { className: 'icon-file-text icon' }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'a',
          { onClick: this._onFileNameClick },
          (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.relative(this.props.basePath, this.props.uri)
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: 'nuclide-find-references-ref-count badge badge-small' },
          groups.length
        )
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'ul',
        { className: 'nuclide-find-references-refs list-tree' },
        groups
      )
    );
  }
});

module.exports = FileReferencesView;