"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileTreeEntryComponent = void 0;

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

function Selectors() {
  const data = _interopRequireWildcard(require("../lib/FileTreeSelectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _FileTreeFilterHelper() {
  const data = require("../lib/FileTreeFilterHelper");

  _FileTreeFilterHelper = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("../../../modules/nuclide-commons-ui/Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function _hgConstants() {
  const data = require("../../nuclide-hg-rpc/lib/hg-constants");

  _hgConstants = function () {
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

function _FileTreeHgHelpers() {
  const data = _interopRequireDefault(require("../lib/FileTreeHgHelpers"));

  _FileTreeHgHelpers = function () {
    return data;
  };

  return data;
}

function _addTooltip() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
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

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const SUBSEQUENT_FETCH_SPINNER_DELAY = 500;
const INITIAL_FETCH_SPINNER_DELAY = 25;
const INDENT_LEVEL = 17;

class FileTreeEntryComponent extends React.Component {
  // Keep track of the # of dragenter/dragleave events in order to properly decide
  // when an entry is truly hovered/unhovered, since these fire many times over
  // the duration of one user interaction.
  constructor(props) {
    super(props);

    this._onMouseDown = event => {
      event.stopPropagation();

      if (this._isToggleNodeExpand(event)) {
        return;
      }

      const node = this.props.node;
      const isSelected = this.props.selectedNodes.has(node);

      const selectionMode = _FileTreeHelpers().default.getSelectionMode(event);

      if (selectionMode === 'multi-select' && !isSelected) {
        this.props.actions.addSelectedNode(node.rootUri, node.uri);
      } else if (selectionMode === 'range-select') {
        this.props.actions.rangeSelectToNode(node.rootUri, node.uri);
      } else if (selectionMode === 'single-select' && !isSelected) {
        this.props.actions.setSelectedNode(node.rootUri, node.uri);
      }
    };

    this._onClick = event => {
      event.stopPropagation();
      const node = this.props.node;
      const isSelected = this.props.selectedNodes.has(node);
      const isFocused = this.props.focusedNodes.has(node);
      const deep = event.altKey;

      if (this._isToggleNodeExpand(event)) {
        this._toggleNodeExpanded(deep);

        return;
      }

      const selectionMode = _FileTreeHelpers().default.getSelectionMode(event);

      if (selectionMode === 'range-select' || selectionMode === 'invalid-select') {
        return;
      }

      if (selectionMode === 'multi-select') {
        if (isFocused) {
          this.props.actions.unselectNode(node.rootUri, node.uri); // If this node was just unselected, immediately return and skip
          // the statement below that sets this node to focused.

          return;
        }
      } else {
        if (node.isContainer) {
          if (isFocused || node.conf.usePreviewTabs) {
            this._toggleNodeExpanded(deep);
          }
        } else {
          if (node.conf.usePreviewTabs) {
            this.props.actions.confirmNode(node.rootUri, node.uri, true // pending
            );
          }
        } // Set selected node to clear any other selected nodes (i.e. in the case of
        // previously having multiple selections).


        this.props.actions.setSelectedNode(node.rootUri, node.uri);
      }

      if (isSelected) {
        this.props.actions.setFocusedNode(node.rootUri, node.uri);
      }
    };

    this._onDoubleClick = event => {
      event.stopPropagation();

      if (this.props.node.isContainer) {
        return;
      }

      this.props.actions.confirmNode(this.props.node.rootUri, this.props.node.uri);
    };

    this._onDragEnter = event => {
      event.stopPropagation();
      const nodes = Selectors().getSelectedNodes(this.props.store);

      if (!this.props.isPreview && nodes.size === 1 && (0, _nullthrows().default)(nodes.first()).isRoot) {
        this.props.actions.reorderDragInto(this.props.node.rootUri);
        return;
      }

      const movableNodes = nodes.filter(node => _FileTreeHgHelpers().default.isValidRename(node, this.props.node.uri)); // Ignores hover over invalid targets.

      if (!this.props.node.isContainer || movableNodes.size === 0) {
        return;
      }

      if (this.dragEventCount <= 0) {
        this.dragEventCount = 0;
        this.props.actions.setDragHoveredNode(this.props.node.rootUri, this.props.node.uri);
      }

      this.dragEventCount++;
    };

    this._onDragLeave = event => {
      event.stopPropagation(); // Avoid calling an unhoverNode action if dragEventCount is already 0.

      if (this.dragEventCount === 0) {
        return;
      }

      this.dragEventCount--;

      if (this.dragEventCount <= 0) {
        this.dragEventCount = 0;
        this.props.actions.unhoverNode(this.props.node.rootUri, this.props.node.uri);
      }
    };

    this._onDragStart = event => {
      event.stopPropagation();

      if (this._pathContainer == null) {
        return;
      } // $FlowFixMe


      const target = _reactDom.default.findDOMNode(this._pathContainer);

      if (target == null) {
        return;
      }

      const fileIcon = target.cloneNode(false);
      fileIcon.style.cssText = 'position: absolute; top: 0; left: 0; color: #fff; opacity: .8;';

      if (!(document.body != null)) {
        throw new Error("Invariant violation: \"document.body != null\"");
      }

      document.body.appendChild(fileIcon);
      const {
        dataTransfer
      } = event;

      if (dataTransfer != null) {
        dataTransfer.effectAllowed = 'move';
        dataTransfer.setDragImage(fileIcon, -8, -4);
        dataTransfer.setData('initialPath', this.props.node.uri);
      }

      _observable().nextAnimationFrame.subscribe(() => {
        if (!(document.body != null)) {
          throw new Error("Invariant violation: \"document.body != null\"");
        }

        document.body.removeChild(fileIcon);
      });

      if (this.props.node.isRoot) {
        this.props.actions.startReorderDrag(this.props.node.uri);
      }
    };

    this._onDragOver = event => {
      event.preventDefault();
      event.stopPropagation();
    };

    this._onDragEnd = event => {
      if (this.props.node.isRoot) {
        this.props.actions.endReorderDrag();
      }
    };

    this._onDrop = event => {
      event.preventDefault();
      event.stopPropagation();
      const dragNode = Selectors().getSingleSelectedNode(this.props.store);

      if (dragNode != null && dragNode.isRoot) {
        this.props.actions.reorderRoots();
      } else {
        // Reset the dragEventCount for the currently dragged node upon dropping.
        this.dragEventCount = 0;
        this.props.actions.moveToNode(this.props.node.rootUri, this.props.node.uri);
      }
    };

    this._checkboxOnChange = isChecked => {
      if (isChecked) {
        this.props.actions.checkNode(this.props.node.rootUri, this.props.node.uri);
      } else {
        this.props.actions.uncheckNode(this.props.node.rootUri, this.props.node.uri);
      }
    };

    this._checkboxOnClick = event => {
      event.stopPropagation();
    };

    this._checkboxOnMouseDown = event => {
      // Chrome messes with scrolling if a focused input is being scrolled out of view
      // so we'll just prevent the checkbox from receiving the focus
      event.preventDefault();
    };

    this.dragEventCount = 0;
    this.state = {
      isLoading: props.node.isLoading
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.node !== this.props.node || nextProps.node.isLoading !== this.props.node.isLoading || nextState.isLoading !== this.state.isLoading || nextProps.selectedNodes !== this.props.selectedNodes || nextProps.focusedNodes !== this.props.focusedNodes;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.node.isLoading !== this.props.node.isLoading) {
      if (this._loadingTimeout != null) {
        clearTimeout(this._loadingTimeout);
        this._loadingTimeout = null;
      }

      if (nextProps.node.isLoading) {
        const spinnerDelay = nextProps.node.wasFetched ? SUBSEQUENT_FETCH_SPINNER_DELAY : INITIAL_FETCH_SPINNER_DELAY;
        this._loadingTimeout = setTimeout(() => {
          this._loadingTimeout = null;
          this.setState({
            isLoading: Boolean(this.props.node.isLoading)
          });
        }, spinnerDelay);
      } else {
        this.setState({
          isLoading: false
        });
      }
    }
  }

  componentDidMount() {
    const el = _reactDom.default.findDOMNode(this);

    this._disposables = new (_UniversalDisposable().default)( // Because this element can be inside of an Atom panel (which adds its own drag and drop
    // handlers) we need to sidestep React's event delegation.
    _RxMin.Observable.fromEvent(el, 'dragenter').subscribe(this._onDragEnter), _RxMin.Observable.fromEvent(el, 'dragleave').subscribe(this._onDragLeave), _RxMin.Observable.fromEvent(el, 'dragstart').subscribe(this._onDragStart), _RxMin.Observable.fromEvent(el, 'dragover').subscribe(this._onDragOver), _RxMin.Observable.fromEvent(el, 'dragend').subscribe(this._onDragEnd), _RxMin.Observable.fromEvent(el, 'drop').subscribe(this._onDrop));
  }

  componentWillUnmount() {
    if (!(this._disposables != null)) {
      throw new Error("Invariant violation: \"this._disposables != null\"");
    }

    this._disposables.dispose();

    if (this._loadingTimeout != null) {
      clearTimeout(this._loadingTimeout);
    }
  }

  render() {
    const node = this.props.node;
    const isSelected = this.props.selectedNodes.has(node);
    const outerClassName = (0, _classnames().default)('entry', {
      'file list-item': !node.isContainer,
      'directory list-nested-item': node.isContainer,
      'current-working-directory': node.isCwd,
      collapsed: !node.isLoading && !node.isExpanded,
      expanded: !node.isLoading && node.isExpanded,
      'project-root': node.isRoot,
      selected: isSelected || node.isDragHovered,
      'nuclide-file-tree-softened': node.shouldBeSoftened,
      'nuclide-file-tree-root-being-reordered': node.isBeingReordered,
      'nuclide-file-tree-entry-item': true
    });
    const listItemClassName = (0, _classnames().default)({
      'header list-item': node.isContainer,
      loading: this.state.isLoading
    });
    let statusClass;

    if (!node.conf.isEditingWorkingSet) {
      const vcsStatusCode = node.vcsStatusCode;

      if (vcsStatusCode === _hgConstants().StatusCodeNumber.MODIFIED) {
        statusClass = 'status-modified';
      } else if (vcsStatusCode === _hgConstants().StatusCodeNumber.ADDED) {
        statusClass = 'status-added';
      } else if (node.isIgnored) {
        statusClass = 'status-ignored';
      } else {
        statusClass = '';
      }
    } else {
      switch (node.checkedStatus) {
        case 'checked':
          statusClass = 'status-added';
          break;

        case 'partial':
          statusClass = 'status-modified';
          break;

        default:
          statusClass = '';
          break;
      }
    }

    let generatedClass;

    if (node.generatedStatus === 'generated') {
      generatedClass = 'generated-fully';
    } else if (node.generatedStatus === 'partial') {
      generatedClass = 'generated-partly';
    } else {
      generatedClass = '';
    }

    let tooltip;

    if (node.isContainer) {
      if (node.isCwd) {
        tooltip = (0, _addTooltip().default)({
          title: 'Current Working Root'
        });
      }
    }

    return React.createElement("li", {
      className: (0, _classnames().default)(outerClassName, statusClass, generatedClass, {
        // `atom/find-and-replace` looks for this class to determine if a
        // data-path is a directory or not:
        directory: node.isContainer
      }),
      style: {
        paddingLeft: node.isContainer ? this.props.node.getDepth() * INDENT_LEVEL : // Folders typically render a disclosure triangle, making them appear
        // at one depth level more than they actually are. Compensate by
        // adding the appearance of an extra level of depth for files.
        this.props.node.getDepth() * INDENT_LEVEL + INDENT_LEVEL,
        marginLeft: 0
      },
      draggable: true,
      onMouseDown: this._onMouseDown,
      onClick: this._onClick,
      onDoubleClick: this._onDoubleClick,
      "data-name": node.name,
      "data-path": node.uri
    }, React.createElement("div", {
      className: listItemClassName // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ,
      ref: el => {
        this._arrowContainer = el;
      }
    }, React.createElement(_PathWithFileIcon().default, {
      className: (0, _classnames().default)('name', 'nuclide-file-tree-path', {
        'icon-nuclicon-file-directory': node.isContainer && !node.isCwd,
        'icon-nuclicon-file-directory-starred': node.isContainer && node.isCwd
      }),
      isFolder: node.isContainer,
      path: node.uri // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ,
      ref: elem => {
        // $FlowFixMe(>=0.53.0) Flow suppress
        this._pathContainer = elem;
        tooltip && tooltip(elem);
      },
      "data-name": node.name,
      "data-path": node.uri
    }, this._renderCheckbox(), (0, _FileTreeFilterHelper().filterName)(node.name, node.highlightedText, isSelected)), this._renderConnectionTitle()));
  }

  _renderCheckbox() {
    if (!this.props.node.conf.isEditingWorkingSet) {
      return;
    }

    return React.createElement(_Checkbox().Checkbox, {
      checked: this.props.node.checkedStatus === 'checked',
      indeterminate: this.props.node.checkedStatus === 'partial',
      onChange: this._checkboxOnChange,
      onClick: this._checkboxOnClick,
      onMouseDown: this._checkboxOnMouseDown
    });
  }

  _renderConnectionTitle() {
    if (!this.props.node.isRoot) {
      return null;
    }

    const title = this.props.node.connectionTitle;

    if (title === '' || title === '(default)') {
      return null;
    }

    return React.createElement("span", {
      className: "nuclide-file-tree-connection-title highlight"
    }, title);
  }

  _isToggleNodeExpand(event) {
    if (!this._pathContainer) {
      return;
    }

    const node = this.props.node;

    const shouldToggleExpand = node.isContainer && // $FlowFixMe
    (0, _nullthrows().default)(this._arrowContainer).contains(event.target) && event.clientX < // $FlowFixMe
    _reactDom.default.findDOMNode(this._pathContainer).getBoundingClientRect().left;

    if (shouldToggleExpand) {
      this.props.actions.clearTrackedNode();
    }

    return shouldToggleExpand;
  }

  _toggleNodeExpanded(deep) {
    if (this.props.node.isExpanded) {
      if (deep) {
        this.props.actions.collapseNodeDeep(this.props.node.rootUri, this.props.node.uri);
      } else {
        this.props.actions.collapseNode(this.props.node.rootUri, this.props.node.uri);
      }
    } else {
      if (deep) {
        this.props.actions.expandNodeDeep(this.props.node.rootUri, this.props.node.uri);
      } else {
        this.props.actions.expandNode(this.props.node.rootUri, this.props.node.uri);
      }
    }
  }

}

exports.FileTreeEntryComponent = FileTreeEntryComponent;