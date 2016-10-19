Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libFileTreeActions;

function _load_libFileTreeActions() {
  return _libFileTreeActions = _interopRequireDefault(require('../lib/FileTreeActions'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _commonsAtomFileTypeClass;

function _load_commonsAtomFileTypeClass() {
  return _commonsAtomFileTypeClass = _interopRequireDefault(require('../../commons-atom/file-type-class'));
}

var _libFileTreeFilterHelper;

function _load_libFileTreeFilterHelper() {
  return _libFileTreeFilterHelper = require('../lib/FileTreeFilterHelper');
}

var _nuclideUiCheckbox;

function _load_nuclideUiCheckbox() {
  return _nuclideUiCheckbox = require('../../nuclide-ui/Checkbox');
}

var _nuclideHgRpcLibHgConstants;

function _load_nuclideHgRpcLibHgConstants() {
  return _nuclideHgRpcLibHgConstants = require('../../nuclide-hg-rpc/lib/hg-constants');
}

var _libFileTreeStore;

function _load_libFileTreeStore() {
  return _libFileTreeStore = require('../lib/FileTreeStore');
}

var _libFileTreeHgHelpers;

function _load_libFileTreeHgHelpers() {
  return _libFileTreeHgHelpers = require('../lib/FileTreeHgHelpers');
}

var _os;

function _load_os() {
  return _os = _interopRequireDefault(require('os'));
}

var store = (_libFileTreeStore || _load_libFileTreeStore()).FileTreeStore.getInstance();
var getActions = (_libFileTreeActions || _load_libFileTreeActions()).default.getInstance;

var INDENT_LEVEL = 17;

var FileTreeEntryComponent = (function (_React$Component) {
  _inherits(FileTreeEntryComponent, _React$Component);

  function FileTreeEntryComponent(props) {
    _classCallCheck(this, FileTreeEntryComponent);

    _get(Object.getPrototypeOf(FileTreeEntryComponent.prototype), 'constructor', this).call(this, props);
    this.dragEventCount = 0;
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);

    this._onDragEnter = this._onDragEnter.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDragStart = this._onDragStart.bind(this);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDrop = this._onDrop.bind(this);

    this._checkboxOnChange = this._checkboxOnChange.bind(this);
    this._checkboxOnClick = this._checkboxOnClick.bind(this);
  }

  _createClass(FileTreeEntryComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return nextProps.node !== this.props.node;
    }
  }, {
    key: 'render',
    value: function render() {
      var node = this.props.node;

      var outerClassName = (0, (_classnames || _load_classnames()).default)('entry', {
        'file list-item': !node.isContainer,
        'directory list-nested-item': node.isContainer,
        'current-working-directory': node.isCwd,
        'collapsed': !node.isLoading && !node.isExpanded,
        'expanded': !node.isLoading && node.isExpanded,
        'project-root': node.isRoot,
        'selected': node.isSelected || node.isDragHovered,
        'nuclide-file-tree-softened': node.shouldBeSoftened
      });
      var listItemClassName = (0, (_classnames || _load_classnames()).default)({
        'header list-item': node.isContainer,
        'loading': node.isLoading
      });

      var statusClass = undefined;
      if (!node.conf.isEditingWorkingSet) {
        var vcsStatusCode = node.vcsStatusCode;
        if (vcsStatusCode === (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.MODIFIED) {
          statusClass = 'status-modified';
        } else if (vcsStatusCode === (_nuclideHgRpcLibHgConstants || _load_nuclideHgRpcLibHgConstants()).StatusCodeNumber.ADDED) {
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

      var iconName = undefined;
      if (node.isContainer) {
        iconName = node.isCwd ? 'icon-briefcase' : 'icon-file-directory';
      } else {
        iconName = (0, (_commonsAtomFileTypeClass || _load_commonsAtomFileTypeClass()).default)(node.name);
      }

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'li',
        {
          className: outerClassName + ' ' + statusClass,
          style: { paddingLeft: this.props.node.getDepth() * INDENT_LEVEL },
          draggable: true,
          onMouseDown: this._onMouseDown,
          onClick: this._onClick,
          onDoubleClick: this._onDoubleClick,
          onDragEnter: this._onDragEnter,
          onDragLeave: this._onDragLeave,
          onDragStart: this._onDragStart,
          onDragOver: this._onDragOver,
          onDrop: this._onDrop },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          {
            className: listItemClassName,
            ref: 'arrowContainer' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'span',
            {
              className: 'icon name ' + iconName,
              ref: 'pathContainer',
              'data-name': node.name,
              'data-path': node.uri },
            this._renderCheckbox(),
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              'span',
              {
                'data-name': node.name,
                'data-path': node.uri },
              (0, (_libFileTreeFilterHelper || _load_libFileTreeFilterHelper()).filterName)(node.name, node.highlightedText, node.isSelected)
            )
          ),
          this._renderConnectionTitle()
        )
      );
    }
  }, {
    key: '_renderCheckbox',
    value: function _renderCheckbox() {
      if (!this.props.node.conf.isEditingWorkingSet) {
        return;
      }

      return (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiCheckbox || _load_nuclideUiCheckbox()).Checkbox, {
        checked: this.props.node.checkedStatus === 'checked',
        indeterminate: this.props.node.checkedStatus === 'partial',
        onChange: this._checkboxOnChange,
        onClick: this._checkboxOnClick
      });
    }
  }, {
    key: '_renderConnectionTitle',
    value: function _renderConnectionTitle() {
      if (!this.props.node.isRoot) {
        return null;
      }
      var title = this.props.node.connectionTitle;
      if (title === '') {
        return null;
      }

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'span',
        { className: 'nuclide-file-tree-connection-title highlight' },
        title
      );
    }
  }, {
    key: '_isToggleNodeExpand',
    value: function _isToggleNodeExpand(event) {
      var node = this.props.node;
      return node.isContainer && (_reactForAtom || _load_reactForAtom()).ReactDOM.findDOMNode(this.refs.arrowContainer).contains(event.target) && event.clientX < (_reactForAtom || _load_reactForAtom()).ReactDOM.findDOMNode(this.refs.pathContainer).getBoundingClientRect().left;
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(event) {
      event.stopPropagation();
      if (this._isToggleNodeExpand(event)) {
        return;
      }

      var node = this.props.node;

      var selectionMode = getSelectionMode(event);
      if (selectionMode === 'multi-select' && !node.isSelected) {
        getActions().addSelectedNode(node.rootUri, node.uri);
      } else if (selectionMode === 'range-select') {
        getActions().rangeSelectToNode(node.rootUri, node.uri);
      } else if (selectionMode === 'single-select' && !node.isSelected) {
        getActions().setSelectedNode(node.rootUri, node.uri);
      }
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      event.stopPropagation();
      var node = this.props.node;

      var deep = event.altKey;
      if (this._isToggleNodeExpand(event)) {
        this._toggleNodeExpanded(deep);
        return;
      }

      var selectionMode = getSelectionMode(event);

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
    }
  }, {
    key: '_onDoubleClick',
    value: function _onDoubleClick(event) {
      event.stopPropagation();

      if (this.props.node.isContainer) {
        return;
      }

      if (this.props.node.conf.usePreviewTabs) {
        getActions().keepPreviewTab();
      } else {
        getActions().confirmNode(this.props.node.rootUri, this.props.node.uri);
      }
    }
  }, {
    key: '_onDragEnter',
    value: function _onDragEnter(event) {
      var _this = this;

      event.stopPropagation();
      var movableNodes = store.getSelectedNodes().filter(function (node) {
        return (0, (_libFileTreeHgHelpers || _load_libFileTreeHgHelpers()).isValidRename)(node, _this.props.node.uri);
      });

      // Ignores hover over invalid targets.
      if (!this.props.node.isContainer || movableNodes.size === 0) {
        return;
      }
      if (this.dragEventCount <= 0) {
        this.dragEventCount = 0;
        getActions().setDragHoveredNode(this.props.node.rootUri, this.props.node.uri);
      }
      this.dragEventCount++;
    }
  }, {
    key: '_onDragLeave',
    value: function _onDragLeave(event) {
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
    }
  }, {
    key: '_onDragStart',
    value: function _onDragStart(event) {
      event.stopPropagation();
      var target = this.refs.pathContainer;

      var fileIcon = target.cloneNode(false);
      fileIcon.style.cssText = 'position: absolute; top: 0; left: 0; color: #fff; opacity: .8;';
      document.body.appendChild(fileIcon);

      var nativeEvent = event.nativeEvent;
      nativeEvent.dataTransfer.effectAllowed = 'move';
      nativeEvent.dataTransfer.setDragImage(fileIcon, -8, -4);
      nativeEvent.dataTransfer.setData('initialPath', this.props.node.uri);
      window.requestAnimationFrame(function () {
        return document.body.removeChild(fileIcon);
      });
    }
  }, {
    key: '_onDragOver',
    value: function _onDragOver(event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, {
    key: '_onDrop',
    value: function _onDrop(event) {
      event.preventDefault();
      event.stopPropagation();

      // Reset the dragEventCount for the currently dragged node upon dropping.
      this.dragEventCount = 0;
      getActions().moveToNode(this.props.node.rootUri, this.props.node.uri);
    }
  }, {
    key: '_toggleNodeExpanded',
    value: function _toggleNodeExpanded(deep) {
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
  }, {
    key: '_checkboxOnChange',
    value: function _checkboxOnChange(isChecked) {
      if (isChecked) {
        getActions().checkNode(this.props.node.rootUri, this.props.node.uri);
      } else {
        getActions().uncheckNode(this.props.node.rootUri, this.props.node.uri);
      }
    }
  }, {
    key: '_checkboxOnClick',
    value: function _checkboxOnClick(event) {
      event.stopPropagation();
    }
  }]);

  return FileTreeEntryComponent;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.FileTreeEntryComponent = FileTreeEntryComponent;

function getSelectionMode(event) {

  if ((_os || _load_os()).default.platform() === 'darwin' && event.metaKey && event.button === 0 || (_os || _load_os()).default.platform() !== 'darwin' && event.ctrlKey && event.button === 0) {
    return 'multi-select';
  }
  if (event.shiftKey && event.button === 0) {
    return 'range-select';
  }
  if (!event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
    return 'single-select';
  }
  return 'invalid-select';
}

// Keep track of the # of dragenter/dragleave events in order to properly decide
// when an entry is truly hovered/unhovered, since these fire many times over
// the duration of one user interaction.