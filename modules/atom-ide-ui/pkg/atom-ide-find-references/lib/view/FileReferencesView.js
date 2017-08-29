'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _CodeSnippet;

function _load_CodeSnippet() {
  return _CodeSnippet = require('nuclide-commons-ui/CodeSnippet');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class FileReferencesView extends _react.Component {
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
      // flowlint-next-line sketchy-null-string:off
      if (firstRef.name && firstRef.name === lastRef.name) {
        caller = _react.createElement(
          'span',
          null,
          ' ',
          'in ',
          _react.createElement(
            'code',
            null,
            firstRef.name
          )
        );
      }
      const startRange = firstRef.range.start;
      const endRange = lastRef.range.end;
      return _react.createElement(
        'li',
        { key: group.startLine, className: 'atom-ide-find-references-ref' },
        _react.createElement(
          'div',
          {
            className: 'atom-ide-find-references-ref-name',
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
        _react.createElement((_CodeSnippet || _load_CodeSnippet()).CodeSnippet, {
          grammar: this.props.grammar,
          text: this.props.previewText[i],
          highlights: group.references.map(ref => ref.range),
          startLine: group.startLine,
          endLine: group.endLine,
          onClick: evt => this._onRefClick(evt, firstRef),
          onLineClick: this._onFileNameClick
        })
      );
    });
    const outerClassName = (0, (_classnames || _load_classnames()).default)('atom-ide-find-references-file list-nested-item', {
      collapsed: !this.state.isExpanded,
      expanded: this.state.isExpanded,
      selected: this.props.isSelected
    });

    return _react.createElement(
      'li',
      { className: `${outerClassName}` },
      _react.createElement(
        'div',
        {
          className: 'atom-ide-find-references-filename list-item',
          onClick: this._onFileClick },
        _react.createElement('span', { className: 'icon-file-text icon' }),
        _react.createElement(
          'a',
          { onClick: this._onFileNameClick },
          (_nuclideUri || _load_nuclideUri()).default.relative(this.props.basePath, this.props.uri)
        ),
        _react.createElement(
          'span',
          { className: 'atom-ide-find-references-ref-count badge badge-small' },
          groups.length
        )
      ),
      _react.createElement(
        'ul',
        { className: 'atom-ide-find-references-refs list-tree' },
        groups
      )
    );
  }
}
exports.default = FileReferencesView;