"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenFilesListComponent = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _PanelComponentScroller() {
  const data = require("../../../modules/nuclide-commons-ui/PanelComponentScroller");

  _PanelComponentScroller = function () {
    return data;
  };

  return data;
}

function _FileTreeActions() {
  const data = _interopRequireDefault(require("../lib/FileTreeActions"));

  _FileTreeActions = function () {
    return data;
  };

  return data;
}

function _FileTreeHelpers() {
  const data = _interopRequireDefault(require("../lib/FileTreeHelpers"));

  _FileTreeHelpers = function () {
    return data;
  };

  return data;
}

function _FileTreeStore() {
  const data = _interopRequireDefault(require("../lib/FileTreeStore"));

  _FileTreeStore = function () {
    return data;
  };

  return data;
}

function _PathWithFileIcon() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/PathWithFileIcon"));

  _PathWithFileIcon = function () {
    return data;
  };

  return data;
}

function _Tree() {
  const data = require("../../../modules/nuclide-commons-ui/Tree");

  _Tree = function () {
    return data;
  };

  return data;
}

function _DragResizeContainer() {
  const data = require("../../../modules/nuclide-commons-ui/DragResizeContainer");

  _DragResizeContainer = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _ChangedFilesList() {
  const data = require("../../nuclide-ui/ChangedFilesList");

  _ChangedFilesList = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../lib/FileTreeSelectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _reselect() {
  const data = require("reselect");

  _reselect = function () {
    return data;
  };

  return data;
}

function _immutable() {
  const data = _interopRequireDefault(require("immutable"));

  _immutable = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class OpenFilesListComponent extends React.PureComponent {
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
    const rootNode = Selectors().getRootForPath(this.props.store, entry.uri);

    if (_FileTreeHelpers().default.getSelectionMode(event) === 'single-select' && !entry.isSelected && rootNode != null) {
      this.props.actions.setTargetNode(rootNode.rootUri, entry.uri);
      this.setState({
        selectedUri: entry.uri
      });
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

    (0, _nuclideAnalytics().track)('filetree-open-from-open-files', {
      uri
    });
    (0, _goToLocation().goToLocation)(uri, {
      activatePane: false
    });
  }

  _onConfirm(entry, event) {
    (0, _goToLocation().goToLocation)(entry.uri);
  }

  _onCloseClick(entry, event) {
    const uri = entry.uri;
    event.preventDefault();

    this._closeFile(uri);
  }

  _closeFile(uri) {
    (0, _nuclideAnalytics().track)('filetree-close-from-open-files', {
      uri
    });
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
    }); // Sort by file name (see https://fb.facebook.com/groups/nuclideintfeedback/permalink/1883372318378041/)

    entries.sort((e1, e2) => _nuclideUri().default.basename(e1.uri).localeCompare(_nuclideUri().default.basename(e2.uri)));
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
    return React.createElement(_DragResizeContainer().DragResizeContainer, null, React.createElement("div", {
      className: "nuclide-file-tree-open-files"
    }, React.createElement(_PanelComponentScroller().PanelComponentScroller, null, React.createElement(_Tree().TreeList, {
      showArrows: true,
      className: "nuclide-file-tree-open-files-list"
    }, React.createElement(_Tree().NestedTreeItem, {
      hasFlatChildren: true
    }, sortedEntries.map(e => {
      const isHoveredUri = this.state.hoveredUri === e.uri;
      return React.createElement(_Tree().TreeItem, {
        className: (0, _classnames().default)('file', 'nuclide-path-with-terminal', this._generatedClass(e.generatedType), {
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
        name: e.name // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
        ,
        ref: e.isSelected ? this._handleSelectedRow : null
      }, React.createElement("span", {
        className: (0, _classnames().default)('icon', {
          'icon-primitive-dot': e.isModified && !isHoveredUri,
          'icon-x': isHoveredUri || !e.isModified,
          'text-info': e.isModified
        }),
        onClick: this._onCloseClick.bind(this, e)
      }), React.createElement(_PathWithFileIcon().default, {
        path: e.name
      }));
    }))))));
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

  this._getDisplayNames = (0, _reselect().createSelector)([props => props.uris], x => {
    return (0, _ChangedFilesList().computeDisplayPaths)(x);
  });
};