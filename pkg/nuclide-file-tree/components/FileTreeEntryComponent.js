'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileTreeEntryComponent = undefined;

var _FileTreeActions;

function _load_FileTreeActions() {
  return _FileTreeActions = _interopRequireDefault(require('../lib/FileTreeActions'));
}

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('../lib/FileTreeHelpers'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _FileTreeFilterHelper;

function _load_FileTreeFilterHelper() {
  return _FileTreeFilterHelper = require('../lib/FileTreeFilterHelper');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _hgConstants;

function _load_hgConstants() {
  return _hgConstants = require('../../nuclide-hg-rpc/lib/hg-constants');
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('../lib/FileTreeStore');
}

var _FileTreeHgHelpers;

function _load_FileTreeHgHelpers() {
  return _FileTreeHgHelpers = _interopRequireDefault(require('../lib/FileTreeHgHelpers'));
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _PathWithFileIcon;

function _load_PathWithFileIcon() {
  return _PathWithFileIcon = _interopRequireDefault(require('../../nuclide-ui/PathWithFileIcon'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
const getActions = (_FileTreeActions || _load_FileTreeActions()).default.getInstance;

const SUBSEQUENT_FETCH_SPINNER_DELAY = 500;
const INITIAL_FETCH_SPINNER_DELAY = 25;
const INDENT_LEVEL = 17;

class FileTreeEntryComponent extends _react.Component {
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

      const selectionMode = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getSelectionMode(event);
      if (selectionMode === 'multi-select' && !node.isSelected) {
        getActions().addSelectedNode(node.rootUri, node.uri);
      } else if (selectionMode === 'range-select') {
        getActions().rangeSelectToNode(node.rootUri, node.uri);
      } else if (selectionMode === 'single-select' && !node.isSelected) {
        getActions().setSelectedNode(node.rootUri, node.uri);
      }
    };

    this._onClick = event => {
      event.stopPropagation();
      const node = this.props.node;

      const deep = event.altKey;
      if (this._isToggleNodeExpand(event)) {
        this._toggleNodeExpanded(deep);
        return;
      }

      const selectionMode = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getSelectionMode(event);

      if (selectionMode === 'range-select' || selectionMode === 'invalid-select') {
        return;
      }

      if (selectionMode === 'multi-select') {
        if (node.isFocused) {
          getActions().unselectNode(node.rootUri, node.uri);
          // If this node was just unselected, immediately return and skip
          // the statement below that sets this node to focused.
          return;
        }
      } else {
        if (node.isContainer) {
          if (node.isFocused || node.conf.usePreviewTabs) {
            this._toggleNodeExpanded(deep);
          }
        } else {
          if (node.conf.usePreviewTabs) {
            getActions().confirmNode(node.rootUri, node.uri);
          }
        }
        // Set selected node to clear any other selected nodes (i.e. in the case of
        // previously having multiple selections).
        getActions().setSelectedNode(node.rootUri, node.uri);
      }

      if (node.isSelected) {
        getActions().setFocusedNode(node.rootUri, node.uri);
      }
    };

    this._onDoubleClick = event => {
      event.stopPropagation();

      if (this.props.node.isContainer) {
        return;
      }

      if (this.props.node.conf.usePreviewTabs) {
        getActions().keepPreviewTab();
      } else {
        getActions().confirmNode(this.props.node.rootUri, this.props.node.uri);
      }
    };

    this._onDragEnter = event => {
      event.stopPropagation();

      const nodes = store.getSelectedNodes();
      if (!this.props.isPreview && nodes.size === 1 && nodes.first().isRoot) {
        getActions().reorderDragInto(this.props.node.rootUri);
        return;
      }
      const movableNodes = nodes.filter(node => (_FileTreeHgHelpers || _load_FileTreeHgHelpers()).default.isValidRename(node, this.props.node.uri));

      // Ignores hover over invalid targets.
      if (!this.props.node.isContainer || movableNodes.size === 0) {
        return;
      }
      if (this.dragEventCount <= 0) {
        this.dragEventCount = 0;
        getActions().setDragHoveredNode(this.props.node.rootUri, this.props.node.uri);
      }
      this.dragEventCount++;
    };

    this._onDragLeave = event => {
      event.stopPropagation();
      // Avoid calling an unhoverNode action if dragEventCount is already 0.
      if (this.dragEventCount === 0) {
        return;
      }
      this.dragEventCount--;
      if (this.dragEventCount <= 0) {
        this.dragEventCount = 0;
        getActions().unhoverNode(this.props.node.rootUri, this.props.node.uri);
      }
    };

    this._onDragStart = event => {
      event.stopPropagation();

      if (this._pathContainer == null) {
        return;
      }

      // $FlowFixMe
      const target = _reactDom.default.findDOMNode(this._pathContainer);
      if (target == null) {
        return;
      }

      const fileIcon = target.cloneNode(false);
      fileIcon.style.cssText = 'position: absolute; top: 0; left: 0; color: #fff; opacity: .8;';

      if (!(document.body != null)) {
        throw new Error('Invariant violation: "document.body != null"');
      }

      document.body.appendChild(fileIcon);

      const { dataTransfer } = event;
      if (dataTransfer != null) {
        dataTransfer.effectAllowed = 'move';
        dataTransfer.setDragImage(fileIcon, -8, -4);
        dataTransfer.setData('initialPath', this.props.node.uri);
      }
      (_observable || _load_observable()).nextAnimationFrame.subscribe(() => {
        if (!(document.body != null)) {
          throw new Error('Invariant violation: "document.body != null"');
        }

        document.body.removeChild(fileIcon);
      });

      if (this.props.node.isRoot) {
        getActions().startReorderDrag(this.props.node.uri);
      }
    };

    this._onDragOver = event => {
      event.preventDefault();
      event.stopPropagation();
    };

    this._onDragEnd = event => {
      if (this.props.node.isRoot) {
        getActions().endReorderDrag();
      }
    };

    this._onDrop = event => {
      event.preventDefault();
      event.stopPropagation();

      const dragNode = store.getSingleSelectedNode();
      if (dragNode != null && dragNode.isRoot) {
        getActions().reorderRoots();
      } else {
        // Reset the dragEventCount for the currently dragged node upon dropping.
        this.dragEventCount = 0;
        getActions().moveToNode(this.props.node.rootUri, this.props.node.uri);
      }
    };

    this._checkboxOnChange = isChecked => {
      if (isChecked) {
        getActions().checkNode(this.props.node.rootUri, this.props.node.uri);
      } else {
        getActions().uncheckNode(this.props.node.rootUri, this.props.node.uri);
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
      isLoading: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.node !== this.props.node || nextState.isLoading !== this.state.isLoading;
  }

  componentWillReceiveProps(nextProps) {
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
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // Because this element can be inside of an Atom panel (which adds its own drag and drop
    // handlers) we need to sidestep React's event delegation.
    _rxjsBundlesRxMinJs.Observable.fromEvent(el, 'dragenter').subscribe(this._onDragEnter), _rxjsBundlesRxMinJs.Observable.fromEvent(el, 'dragleave').subscribe(this._onDragLeave), _rxjsBundlesRxMinJs.Observable.fromEvent(el, 'dragstart').subscribe(this._onDragStart), _rxjsBundlesRxMinJs.Observable.fromEvent(el, 'dragover').subscribe(this._onDragOver), _rxjsBundlesRxMinJs.Observable.fromEvent(el, 'dragend').subscribe(this._onDragEnd), _rxjsBundlesRxMinJs.Observable.fromEvent(el, 'drop').subscribe(this._onDrop));
  }

  componentWillUnmount() {
    if (!(this._disposables != null)) {
      throw new Error('Invariant violation: "this._disposables != null"');
    }

    this._disposables.dispose();
    if (this._loadingTimeout != null) {
      clearTimeout(this._loadingTimeout);
    }
  }

  render() {
    const node = this.props.node;

    const outerClassName = (0, (_classnames || _load_classnames()).default)('entry', {
      'file list-item': !node.isContainer,
      'directory list-nested-item': node.isContainer,
      'current-working-directory': node.isCwd,
      collapsed: !node.isLoading && !node.isExpanded,
      expanded: !node.isLoading && node.isExpanded,
      'project-root': node.isRoot,
      selected: node.isSelected || node.isDragHovered,
      'nuclide-file-tree-softened': node.shouldBeSoftened,
      'nuclide-file-tree-root-being-reordered': node.isBeingReordered
    });
    const listItemClassName = (0, (_classnames || _load_classnames()).default)({
      'header list-item': node.isContainer,
      loading: this.state.isLoading
    });

    let statusClass;
    if (!node.conf.isEditingWorkingSet) {
      const vcsStatusCode = node.vcsStatusCode;
      if (vcsStatusCode === (_hgConstants || _load_hgConstants()).StatusCodeNumber.MODIFIED) {
        statusClass = 'status-modified';
      } else if (vcsStatusCode === (_hgConstants || _load_hgConstants()).StatusCodeNumber.ADDED) {
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

    let tooltip;
    if (node.isContainer) {
      if (node.isCwd) {
        tooltip = (0, (_addTooltip || _load_addTooltip()).default)({ title: 'Current Working Root' });
      }
    }

    return _react.createElement(
      'li',
      {
        className: `${outerClassName} ${statusClass}`,
        style: { paddingLeft: this.props.node.getDepth() * INDENT_LEVEL },
        draggable: true,
        onMouseDown: this._onMouseDown,
        onClick: this._onClick,
        onDoubleClick: this._onDoubleClick },
      _react.createElement(
        'div',
        { className: listItemClassName, ref: 'arrowContainer' },
        _react.createElement(
          (_PathWithFileIcon || _load_PathWithFileIcon()).default,
          {
            className: (0, (_classnames || _load_classnames()).default)('name', 'nuclide-file-tree-path', {
              'icon-nuclicon-file-directory': node.isContainer && !node.isCwd,
              'icon-nuclicon-file-directory-starred': node.isContainer && node.isCwd
            }),
            isFolder: node.isContainer,
            path: node.uri,
            ref: elem => {
              // $FlowFixMe(>=0.53.0) Flow suppress
              this._pathContainer = elem;
              // $FlowFixMe(>=0.53.0) Flow suppress
              tooltip && tooltip(elem);
            },
            'data-name': node.name,
            'data-path': node.uri },
          this._renderCheckbox(),
          (0, (_FileTreeFilterHelper || _load_FileTreeFilterHelper()).filterName)(node.name, node.highlightedText, node.isSelected)
        ),
        this._renderConnectionTitle()
      )
    );
  }

  _renderCheckbox() {
    if (!this.props.node.conf.isEditingWorkingSet) {
      return;
    }

    return _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
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

    return _react.createElement(
      'span',
      { className: 'nuclide-file-tree-connection-title highlight' },
      title
    );
  }

  _isToggleNodeExpand(event) {
    if (!this._pathContainer) {
      return;
    }

    const node = this.props.node;
    return node.isContainer &&
    // $FlowFixMe
    _reactDom.default.findDOMNode(this.refs.arrowContainer).contains(event.target) && event.clientX <
    // $FlowFixMe
    _reactDom.default.findDOMNode(this._pathContainer).getBoundingClientRect().left;
  }

  _toggleNodeExpanded(deep) {
    if (this.props.node.isExpanded) {
      if (deep) {
        getActions().collapseNodeDeep(this.props.node.rootUri, this.props.node.uri);
      } else {
        getActions().collapseNode(this.props.node.rootUri, this.props.node.uri);
      }
    } else {
      if (deep) {
        getActions().expandNodeDeep(this.props.node.rootUri, this.props.node.uri);
      } else {
        getActions().expandNode(this.props.node.rootUri, this.props.node.uri);
      }
    }
  }

}
exports.FileTreeEntryComponent = FileTreeEntryComponent;