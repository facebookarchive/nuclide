'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _FilePreview;

function _load_FilePreview() {
  return _FilePreview = _interopRequireDefault(require('./FilePreview'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../commons-atom/go-to-location');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let FileReferencesView = class FileReferencesView extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isExpanded: true
    };
    this._onFileClick = this._onFileClick.bind(this);
    this._onFileNameClick = this._onFileNameClick.bind(this);
  }

  _onRefClick(evt, ref) {
    (0, (_goToLocation || _load_goToLocation()).goToLocation)(this.props.uri, ref.range.start.row, ref.range.start.column);
    evt.stopPropagation();
  }

  _onFileClick() {
    this.props.clickCallback();
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  }

  _onFileNameClick(evt, line) {
    (0, (_goToLocation || _load_goToLocation()).goToLocation)(this.props.uri, line);
    evt.stopPropagation();
  }

  render() {
    const groups = this.props.refGroups.map((group, i) => {
      const firstRef = group.references[0];
      const lastRef = group.references[group.references.length - 1];

      let caller;
      if (firstRef.name && firstRef.name === lastRef.name) {
        caller = _reactForAtom.React.createElement(
          'span',
          null,
          ' in ',
          _reactForAtom.React.createElement(
            'code',
            null,
            firstRef.name
          )
        );
      }
      const startRange = firstRef.range.start;
      const endRange = lastRef.range.end;
      return _reactForAtom.React.createElement(
        'li',
        { key: group.startLine, className: 'nuclide-find-references-ref' },
        _reactForAtom.React.createElement(
          'div',
          {
            className: 'nuclide-find-references-ref-name',
            onClick: evt => this._onRefClick(evt, firstRef) },
          'Line ',
          startRange.row + 1,
          ':',
          startRange.column + 1,
          ' - ',
          endRange.row + 1,
          ':',
          endRange.column + 1,
          caller
        ),
        _reactForAtom.React.createElement((_FilePreview || _load_FilePreview()).default, Object.assign({
          grammar: this.props.grammar,
          text: this.props.previewText[i]
        }, group, {
          onClick: evt => this._onRefClick(evt, firstRef),
          onLineClick: this._onFileNameClick
        }))
      );
    });
    const outerClassName = (0, (_classnames || _load_classnames()).default)('nuclide-find-references-file list-nested-item', {
      collapsed: !this.state.isExpanded,
      expanded: this.state.isExpanded,
      selected: this.props.isSelected
    });

    return _reactForAtom.React.createElement(
      'li',
      { className: `${ outerClassName }` },
      _reactForAtom.React.createElement(
        'div',
        {
          className: 'nuclide-find-references-filename list-item',
          onClick: this._onFileClick },
        _reactForAtom.React.createElement('span', { className: 'icon-file-text icon' }),
        _reactForAtom.React.createElement(
          'a',
          { onClick: this._onFileNameClick },
          (_nuclideUri || _load_nuclideUri()).default.relative(this.props.basePath, this.props.uri)
        ),
        _reactForAtom.React.createElement(
          'span',
          { className: 'nuclide-find-references-ref-count badge badge-small' },
          groups.length
        )
      ),
      _reactForAtom.React.createElement(
        'ul',
        { className: 'nuclide-find-references-refs list-tree' },
        groups
      )
    );
  }
};
exports.default = FileReferencesView;
module.exports = exports['default'];