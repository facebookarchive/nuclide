"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _reactRedux() {
  const data = require("react-redux");

  _reactRedux = function () {
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
  const data = _interopRequireWildcard(require("../lib/redux/Selectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../lib/redux/Actions"));

  Actions = function () {
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

      const {
        isSelected
      } = this.props;

      const selectionMode = _FileTreeHelpers().default.getSelectionMode(event);

      if (selectionMode === 'multi-select' && !isSelected) {
        this.props.addSelectedNode();
      } else if (selectionMode === 'range-select') {
        this.props.rangeSelectToNode();
      } else if (selectionMode === 'single-select' && !isSelected) {
        this.props.setSelectedNode();
      }
    };

    this._onClick = event => {
      event.stopPropagation();
      const {
        node,
        isSelected,
        isFocused
      } = this.props;
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
          this.props.unselectNode(); // If this node was just unselected, immediately return and skip
          // the statement below that sets this node to focused.

          return;
        }
      } else {
        if (node.isContainer) {
          if (isFocused || this.props.usePreviewTabs) {
            this._toggleNodeExpanded(deep);
          }
        } else {
          if (this.props.usePreviewTabs) {
            this.props.confirmNode(true);
          }
        } // Set selected node to clear any other selected nodes (i.e. in the case of
        // previously having multiple selections).


        this.props.setSelectedNode();
      }

      if (isSelected) {
        this.props.setFocusedNode();
      }
    };

    this._onDoubleClick = event => {
      event.stopPropagation();

      if (this.props.node.isContainer) {
        return;
      }

      this.props.confirmNode(false);
    };

    this._onDragEnter = event => {
      event.stopPropagation();
      const nodes = this.props.selectedNodes;

      if (!this.props.isPreview && nodes.size === 1 && (0, _nullthrows().default)(nodes.first()).isRoot) {
        this.props.reorderDragInto();
        return;
      }

      const movableNodes = nodes.filter(node => _FileTreeHgHelpers().default.isValidRename(node, this.props.node.uri)); // Ignores hover over invalid targets.

      if (!this.props.node.isContainer || movableNodes.size === 0) {
        return;
      }

      if (this.dragEventCount <= 0) {
        this.dragEventCount = 0;
        this.props.setDragHoveredNode();
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
        this.props.unhoverNode();
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
        this.props.startReorderDrag();
      }
    };

    this._onDragOver = event => {
      event.preventDefault();
      event.stopPropagation();
    };

    this._onDragEnd = event => {
      if (this.props.node.isRoot) {
        this.props.endReorderDrag();
      }
    };

    this._onDrop = event => {
      event.preventDefault();
      event.stopPropagation();
      const dragNode = this.props.selectedNodes.size === 1 ? this.props.selectedNodes.first() : null;

      if (dragNode != null && dragNode.isRoot) {
        this.props.reorderRoots();
      } else {
        // Reset the dragEventCount for the currently dragged node upon dropping.
        this.dragEventCount = 0;
        this.props.moveToNode();
      }
    };

    this._checkboxOnChange = isChecked => {
      if (isChecked) {
        this.props.checkNode();
      } else {
        this.props.uncheckNode();
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
  /**
   * react-redux will cause a rerender every time because it remaps the dispatch props. Therefore
   * we can't use PureComponent.
   */


  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.node !== this.props.node || nextProps.isSelected !== this.props.isSelected || nextProps.isFocused !== this.props.isFocused || nextProps.isPreview !== this.props.isPreview || nextProps.usePreviewTabs !== this.props.usePreviewTabs || nextProps.isEditingWorkingSet !== this.props.isEditingWorkingSet || nextState.isLoading !== this.state.isLoading;
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
    const {
      node,
      isSelected
    } = this.props;
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

    if (!this.props.isEditingWorkingSet) {
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
    if (!this.props.isEditingWorkingSet) {
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
      this.props.clearTrackedNode();
    }

    return shouldToggleExpand;
  }

  _toggleNodeExpanded(deep) {
    if (this.props.node.isExpanded) {
      if (deep) {
        this.props.collapseNodeDeep();
      } else {
        this.props.collapseNode();
      }
    } else {
      if (deep) {
        this.props.expandNodeDeep();
      } else {
        this.props.expandNode();
      }
    }
  }

}

const mapStateToProps = (state, ownProps) => ({
  isSelected: Selectors().getSelectedNodes(state).includes(ownProps.node),
  isFocused: Selectors().getFocusedNodes(state).includes(ownProps.node),
  usePreviewTabs: Selectors().getConf(state).usePreviewTabs,
  isEditingWorkingSet: Selectors().isEditingWorkingSet(state)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  clearTrackedNode: () => {
    dispatch(Actions().clearTrackedNode());
  },
  rangeSelectToNode: () => {
    dispatch(Actions().rangeSelectToNode(ownProps.node.rootUri, ownProps.node.uri));
  },
  confirmNode: pending => {
    dispatch(Actions().confirmNode(ownProps.node.rootUri, ownProps.node.uri, pending));
  },
  unselectNode: () => {
    dispatch(Actions().unselectNode(ownProps.node.rootUri, ownProps.node.uri));
  },
  setSelectedNode: () => {
    dispatch(Actions().setSelectedNode(ownProps.node.rootUri, ownProps.node.uri));
  },
  addSelectedNode: () => {
    dispatch(Actions().addSelectedNode(ownProps.node.rootUri, ownProps.node.uri));
  },
  collapseNode: () => {
    dispatch(Actions().collapseNode(ownProps.node.rootUri, ownProps.node.uri));
  },
  collapseNodeDeep: () => {
    dispatch(Actions().collapseNodeDeep(ownProps.node.rootUri, ownProps.node.uri));
  },
  checkNode: () => {
    dispatch(Actions().checkNode(ownProps.node.rootUri, ownProps.node.uri));
  },
  uncheckNode: () => {
    dispatch(Actions().uncheckNode(ownProps.node.rootUri, ownProps.node.uri));
  },
  expandNode: () => {
    dispatch(Actions().expandNode(ownProps.node.rootUri, ownProps.node.uri));
  },
  expandNodeDeep: () => {
    dispatch(Actions().expandNodeDeep(ownProps.node.rootUri, ownProps.node.uri));
  },
  reorderDragInto: () => {
    dispatch(Actions().reorderDragInto(ownProps.node.rootUri));
  },
  setDragHoveredNode: () => {
    dispatch(Actions().setDragHoveredNode(ownProps.node.rootUri, ownProps.node.uri));
  },
  setFocusedNode: () => {
    dispatch(Actions().setFocusedNode(ownProps.node.rootUri, ownProps.node.uri));
  },
  unhoverNode: () => {
    dispatch(Actions().unhoverNode(ownProps.node.rootUri, ownProps.node.uri));
  },
  startReorderDrag: () => {
    dispatch(Actions().startReorderDrag(ownProps.node.uri));
  },
  endReorderDrag: () => {
    dispatch(Actions().endReorderDrag());
  },
  reorderRoots: () => {
    dispatch(Actions().reorderRoots());
  },
  moveToNode: () => {
    dispatch(Actions().moveToNode(ownProps.node.rootUri, ownProps.node.uri));
  }
});

var _default = (0, _reactRedux().connect)(mapStateToProps, mapDispatchToProps)(FileTreeEntryComponent);

exports.default = _default;