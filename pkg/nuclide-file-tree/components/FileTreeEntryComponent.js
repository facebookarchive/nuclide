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

var _libFileTreeActions2;

function _libFileTreeActions() {
  return _libFileTreeActions2 = _interopRequireDefault(require('../lib/FileTreeActions'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _commonsAtomFileTypeClass2;

function _commonsAtomFileTypeClass() {
  return _commonsAtomFileTypeClass2 = _interopRequireDefault(require('../../commons-atom/file-type-class'));
}

var _libFileTreeFilterHelper2;

function _libFileTreeFilterHelper() {
  return _libFileTreeFilterHelper2 = require('../lib/FileTreeFilterHelper');
}

var _nuclideUiLibCheckbox2;

function _nuclideUiLibCheckbox() {
  return _nuclideUiLibCheckbox2 = require('../../nuclide-ui/lib/Checkbox');
}

var _nuclideHgRepositoryBaseLibHgConstants2;

function _nuclideHgRepositoryBaseLibHgConstants() {
  return _nuclideHgRepositoryBaseLibHgConstants2 = require('../../nuclide-hg-repository-base/lib/hg-constants');
}

var _libFileTreeStore2;

function _libFileTreeStore() {
  return _libFileTreeStore2 = require('../lib/FileTreeStore');
}

var _libFileTreeHgHelpers2;

function _libFileTreeHgHelpers() {
  return _libFileTreeHgHelpers2 = require('../lib/FileTreeHgHelpers');
}

var store = (_libFileTreeStore2 || _libFileTreeStore()).FileTreeStore.getInstance();
var getActions = (_libFileTreeActions2 || _libFileTreeActions()).default.getInstance;

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

      var outerClassName = (0, (_classnames2 || _classnames()).default)('entry', {
        'file list-item': !node.isContainer,
        'directory list-nested-item': node.isContainer,
        'current-working-directory': node.isCwd,
        'collapsed': !node.isLoading && !node.isExpanded,
        'expanded': !node.isLoading && node.isExpanded,
        'project-root': node.isRoot,
        'selected': node.isSelected || node.isDragHovered,
        'nuclide-file-tree-softened': node.shouldBeSoftened
      });
      var listItemClassName = (0, (_classnames2 || _classnames()).default)({
        'header list-item': node.isContainer,
        'loading': node.isLoading
      });

      var statusClass = undefined;
      if (!node.conf.isEditingWorkingSet) {
        var vcsStatusCode = node.vcsStatusCode;
        if (vcsStatusCode === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.MODIFIED) {
          statusClass = 'status-modified';
        } else if (vcsStatusCode === (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.ADDED) {
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
        iconName = (0, (_commonsAtomFileTypeClass2 || _commonsAtomFileTypeClass()).default)(node.name);
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
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
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          {
            className: listItemClassName,
            ref: 'arrowContainer' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            {
              className: 'icon name ' + iconName,
              ref: 'pathContainer',
              'data-name': node.name,
              'data-path': node.uri },
            this._renderCheckbox(),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'span',
              {
                'data-name': node.name,
                'data-path': node.uri },
              (0, (_libFileTreeFilterHelper2 || _libFileTreeFilterHelper()).filterName)(node.name, node.highlightedText, node.isSelected)
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

      return (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibCheckbox2 || _nuclideUiLibCheckbox()).Checkbox, {
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

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        { className: 'nuclide-file-tree-connection-title highlight' },
        title
      );
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(event) {
      event.stopPropagation();
      var node = this.props.node;

      var modifySelection = event.ctrlKey || event.metaKey;
      if (modifySelection && !node.isSelected) {
        getActions().addSelectedNode(node.rootUri, node.uri);
      } else if (!node.isSelected) {
        getActions().setSelectedNode(node.rootUri, node.uri);
      }
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      event.stopPropagation();
      var node = this.props.node;

      var deep = event.altKey;
      if (node.isContainer && (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.arrowContainer).contains(event.target) && event.clientX < (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.pathContainer).getBoundingClientRect().left) {
        this._toggleNodeExpanded(deep);
        return;
      }

      var modifySelection = event.ctrlKey || event.metaKey;
      if (modifySelection) {
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
        return (0, (_libFileTreeHgHelpers2 || _libFileTreeHgHelpers()).isValidRename)(node, _this.props.node.uri);
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
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.FileTreeEntryComponent = FileTreeEntryComponent;

// Keep track of the # of dragenter/dragleave events in order to properly decide
// when an entry is truly hovered/unhovered, since these fire many times over
// the duration of one user interaction.