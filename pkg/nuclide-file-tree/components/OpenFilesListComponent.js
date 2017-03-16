'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenFilesListComponent = undefined;

var _react = _interopRequireDefault(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('../../nuclide-ui/PanelComponentScroller');
}

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('../lib/FileTreeHelpers'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class OpenFilesListComponent extends _react.default.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      hoveredUri: null
    };
    this._onListItemMouseLeave = this._onListItemMouseLeave.bind(this);
  }

  componentDidUpdate(prevProps) {
    const selectedRow = this.refs.selectedRow;
    if (selectedRow != null && prevProps.activeUri !== this.props.activeUri) {
      selectedRow.scrollIntoViewIfNeeded();
    }
  }

  _onClick(entry, event) {
    if (event.defaultPrevented) {
      return;
    }

    const uri = entry.uri;

    if (event.button === 1) {
      this._closeFile(uri);
      return;
    }

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-open-from-open-files', { uri });
    (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri);
  }

  _onCloseClick(entry, event) {
    const uri = entry.uri;
    event.preventDefault();
    this._closeFile(uri);
  }

  _closeFile(uri) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-close-from-open-files', { uri });
    atom.workspace.getPanes().forEach(pane => {
      pane.getItems().filter(item => item.getPath && item.getPath() === uri).forEach(item => {
        pane.destroyItem(item);
      });
    });
  }

  _onListItemMouseEnter(entry) {
    this.setState({
      hoveredUri: entry.uri
    });
  }

  _onListItemMouseLeave() {
    this.setState({
      hoveredUri: null
    });
  }

  render() {
    const sortedEntries = propsToEntries(this.props);

    return _react.default.createElement(
      'div',
      { className: 'nuclide-file-tree-open-files' },
      _react.default.createElement(
        (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
        null,
        _react.default.createElement(
          'ul',
          { className: 'list-tree nuclide-file-tree-open-files-list' },
          sortedEntries.map(e => {
            const isHoveredUri = this.state.hoveredUri === e.uri;
            return _react.default.createElement(
              'li',
              {
                className: (0, (_classnames || _load_classnames()).default)('list-item', {
                  'selected': e.isSelected,
                  'text-highlight': isHoveredUri
                }),
                key: e.uri,
                onClick: this._onClick.bind(this, e),
                onMouseEnter: this._onListItemMouseEnter.bind(this, e),
                onMouseLeave: this._onListItemMouseLeave,
                ref: e.isSelected ? 'selectedRow' : null },
              _react.default.createElement('span', {
                className: (0, (_classnames || _load_classnames()).default)('icon', {
                  'icon-primitive-dot': e.isModified && !isHoveredUri,
                  'icon-x': isHoveredUri || !e.isModified,
                  'text-info': e.isModified
                }),
                onClick: this._onCloseClick.bind(this, e)
              }),
              _react.default.createElement(
                'span',
                { className: 'icon icon-file-text', 'data-name': e.name },
                e.name
              )
            );
          })
        )
      )
    );
  }
}

exports.OpenFilesListComponent = OpenFilesListComponent; /**
                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                          * All rights reserved.
                                                          *
                                                          * This source code is licensed under the license found in the LICENSE file in
                                                          * the root directory of this source tree.
                                                          *
                                                          * 
                                                          */

function propsToEntries(props) {
  const entries = props.uris.map(uri => {
    const isModified = props.modifiedUris.indexOf(uri) >= 0;
    const isSelected = uri === props.activeUri;
    return { uri, name: (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToName(uri), isModified, isSelected };
  });

  entries.sort((e1, e2) => e1.name.toLowerCase().localeCompare(e2.name.toLowerCase()));
  return entries;
}