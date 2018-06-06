'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenFilesListComponent = undefined;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _react = _interopRequireWildcard(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('../../../modules/nuclide-commons-ui/PanelComponentScroller');
}

var _FileTreeActions;

function _load_FileTreeActions() {
  return _FileTreeActions = _interopRequireDefault(require('../lib/FileTreeActions'));
}

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('../lib/FileTreeHelpers'));
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('../lib/FileTreeStore');
}

var _PathWithFileIcon;

function _load_PathWithFileIcon() {
  return _PathWithFileIcon = _interopRequireDefault(require('../../nuclide-ui/PathWithFileIcon'));
}

var _Tree;

function _load_Tree() {
  return _Tree = require('../../../modules/nuclide-commons-ui/Tree');
}

var _DragResizeContainer;

function _load_DragResizeContainer() {
  return _DragResizeContainer = require('../../../modules/nuclide-commons-ui/DragResizeContainer');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
}

var _ChangedFilesList;

function _load_ChangedFilesList() {
  return _ChangedFilesList = require('../../nuclide-ui/ChangedFilesList');
}

var _reselect;

function _load_reselect() {
  return _reselect = require('reselect');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getActions = (_FileTreeActions || _load_FileTreeActions()).default.getInstance; /**
                                                                                       * Copyright (c) 2015-present, Facebook, Inc.
                                                                                       * All rights reserved.
                                                                                       *
                                                                                       * This source code is licensed under the license found in the LICENSE file in
                                                                                       * the root directory of this source tree.
                                                                                       *
                                                                                       *  strict-local
                                                                                       * @format
                                                                                       */

const store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();

class OpenFilesListComponent extends _react.PureComponent {

  constructor(props) {
    super(props);

    _initialiseProps.call(this);

    this.state = {
      hoveredUri: null,
      selectedUri: null
    };
  }

  componentDidUpdate(prevProps) {
    const selectedRow = this._selectedRow;
    if (selectedRow != null && this.state.selectedUri !== this.props.activeUri && prevProps.activeUri !== this.props.activeUri) {
      // Our lint rule isn't smart enough to recognize that this is a custom method and not the one
      // on HTMLElements, so we just have to squelch the error.
      // eslint-disable-next-line nuclide-internal/dom-apis
      selectedRow.scrollIntoView();
    }
  }

  _onMouseDown(entry, event) {
    event.stopPropagation();
    const rootNode = store.getRootForPath(entry.uri);
    if ((_FileTreeHelpers || _load_FileTreeHelpers()).default.getSelectionMode(event) === 'single-select' && !entry.isSelected && rootNode != null) {
      getActions().setTargetNode(rootNode.rootUri, entry.uri);
      this.setState({ selectedUri: entry.uri });
    }
  }

  _onSelect(entry, event) {
    if (event.defaultPrevented) {
      return;
    }

    const uri = entry.uri;

    if (event.button === 1) {
      this._closeFile(uri);
      return;
    }

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-open-from-open-files', { uri });
    (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri, { activatePane: false });
  }

  _onConfirm(entry, event) {
    (0, (_goToLocation || _load_goToLocation()).goToLocation)(entry.uri);
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

  propsToEntries() {
    const displayPaths = this._getDisplayNames(this.props);
    const entries = this.props.uris.map((uri, index) => {
      const isModified = this.props.modifiedUris.indexOf(uri) >= 0;
      const isSelected = uri === this.props.activeUri;
      const generatedType = this.props.generatedTypes.get(uri);
      return {
        uri,
        name: displayPaths[index],
        isModified,
        isSelected,
        generatedType
      };
    });

    // Sort by file name (see https://fb.facebook.com/groups/nuclideintfeedback/permalink/1883372318378041/)
    entries.sort((e1, e2) => (_nuclideUri || _load_nuclideUri()).default.basename(e1.uri).localeCompare((_nuclideUri || _load_nuclideUri()).default.basename(e2.uri)));
    return entries;
  }

  _generatedClass(generatedType) {
    switch (generatedType) {
      case 'generated':
        return 'generated-fully';
      case 'partial':
        return 'generated-partly';
      default:
        return null;
    }
  }

  render() {
    const sortedEntries = this.propsToEntries();

    return _react.createElement(
      (_DragResizeContainer || _load_DragResizeContainer()).DragResizeContainer,
      null,
      _react.createElement(
        'div',
        { className: 'nuclide-file-tree-open-files' },
        _react.createElement(
          (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
          null,
          _react.createElement(
            (_Tree || _load_Tree()).TreeList,
            { showArrows: true, className: 'nuclide-file-tree-open-files-list' },
            _react.createElement(
              (_Tree || _load_Tree()).NestedTreeItem,
              { hasFlatChildren: true },
              sortedEntries.map(e => {
                const isHoveredUri = this.state.hoveredUri === e.uri;
                return _react.createElement(
                  (_Tree || _load_Tree()).TreeItem,
                  {
                    className: (0, (_classnames || _load_classnames()).default)('file', 'nuclide-path-with-terminal', this._generatedClass(e.generatedType), {
                      'text-highlight': isHoveredUri
                    }),
                    selected: e.isSelected,
                    key: e.uri,
                    onConfirm: this._onConfirm.bind(this, e),
                    onSelect: this._onSelect.bind(this, e),
                    onMouseEnter: this._onListItemMouseEnter.bind(this, e),
                    onMouseLeave: this._onListItemMouseLeave,
                    onMouseDown: this._onMouseDown.bind(this, e),
                    path: e.uri,
                    name: e.name
                    // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
                    , ref: e.isSelected ? this._handleSelectedRow : null },
                  _react.createElement('span', {
                    className: (0, (_classnames || _load_classnames()).default)('icon', {
                      'icon-primitive-dot': e.isModified && !isHoveredUri,
                      'icon-x': isHoveredUri || !e.isModified,
                      'text-info': e.isModified
                    }),
                    onClick: this._onCloseClick.bind(this, e)
                  }),
                  _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: e.name })
                );
              })
            )
          )
        )
      )
    );
  }
}
exports.OpenFilesListComponent = OpenFilesListComponent;

var _initialiseProps = function () {
  this._onListItemMouseLeave = () => {
    this.setState({
      hoveredUri: null
    });
  };

  this._handleSelectedRow = treeItem => {
    this._selectedRow = treeItem;
  };

  this._getDisplayNames = (0, (_reselect || _load_reselect()).createSelector)([props => props.uris], x => {
    return (0, (_ChangedFilesList || _load_ChangedFilesList()).computeDisplayPaths)(x);
  });
};