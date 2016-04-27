Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _libFileTreeActions = require('../lib/FileTreeActions');

var _libFileTreeActions2 = _interopRequireDefault(_libFileTreeActions);

var _reactForAtom = require('react-for-atom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _libFileTreeFilterHelper = require('../lib/FileTreeFilterHelper');

var _libFileTreeHelpers = require('../lib/FileTreeHelpers');

var _nuclideUiLibCheckbox = require('../../nuclide-ui/lib/Checkbox');

var _nuclideHgRepositoryBaseLibHgConstants = require('../../nuclide-hg-repository-base/lib/hg-constants');

var getActions = _libFileTreeActions2['default'].getInstance;

var INDENT_LEVEL = 17;

var FileTreeEntryComponent = (function (_React$Component) {
  _inherits(FileTreeEntryComponent, _React$Component);

  function FileTreeEntryComponent(props) {
    _classCallCheck(this, FileTreeEntryComponent);

    _get(Object.getPrototypeOf(FileTreeEntryComponent.prototype), 'constructor', this).call(this, props);
    this._onClick = this._onClick.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
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

      var outerClassName = (0, _classnames2['default'])('entry', {
        'file list-item': !node.isContainer,
        'directory list-nested-item': node.isContainer,
        'current-working-directory': node.isCwd,
        'collapsed': !node.isExpanded,
        'expanded': node.isExpanded,
        'project-root': node.isRoot,
        'selected': node.isSelected,
        'nuclide-file-tree-softened': node.shouldBeSoftened
      });
      var listItemClassName = (0, _classnames2['default'])({
        'header list-item': node.isContainer,
        'loading': node.isLoading
      });

      var statusClass = undefined;
      if (!node.conf.isEditingWorkingSet) {
        var vcsStatusCode = node.vcsStatusCode;
        if (vcsStatusCode === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED) {
          statusClass = 'status-modified';
        } else if (vcsStatusCode === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.ADDED) {
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
        iconName = (0, _nuclideAtomHelpers.fileTypeClass)(node.name);
      }

      return _reactForAtom.React.createElement(
        'li',
        {
          className: outerClassName + ' ' + statusClass,
          style: { paddingLeft: this.props.node.getDepth() * INDENT_LEVEL },
          onClick: this._onClick,
          onDoubleClick: this._onDoubleClick,
          onMouseDown: this._onMouseDown },
        _reactForAtom.React.createElement(
          'div',
          {
            className: listItemClassName,
            ref: 'arrowContainer' },
          _reactForAtom.React.createElement(
            'span',
            {
              className: 'icon name ' + iconName,
              ref: 'pathContainer',
              'data-name': node.name,
              'data-path': node.uri },
            this._renderCheckbox(),
            _reactForAtom.React.createElement(
              'span',
              {
                'data-name': node.name,
                'data-path': node.uri },
              (0, _libFileTreeFilterHelper.filterName)(node.name, node.highlightedText, node.isSelected)
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

      return _reactForAtom.React.createElement(_nuclideUiLibCheckbox.Checkbox, {
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

      return _reactForAtom.React.createElement(
        'span',
        { className: 'nuclide-file-tree-connection-title highlight' },
        title
      );
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      event.stopPropagation();
      var node = this.props.node;

      var deep = event.altKey;
      if (node.isContainer && _reactForAtom.ReactDOM.findDOMNode(this.refs['arrowContainer']).contains(event.target) && event.clientX < _reactForAtom.ReactDOM.findDOMNode(this.refs['pathContainer']).getBoundingClientRect().left) {
        this._toggleNodeExpanded(deep);
        return;
      }

      var modifySelection = event.ctrlKey || event.metaKey;
      if (modifySelection) {
        if (node.isSelected) {
          getActions().unselectNode(node.rootUri, node.uri);
        } else {
          getActions().addSelectedNode(node.rootUri, node.uri);
        }
      } else {
        if (!node.isSelected) {
          getActions().setSelectedNode(node.rootUri, node.uri);
        }
        if (node.isContainer) {
          if (node.isSelected || node.conf.usePreviewTabs) {
            this._toggleNodeExpanded(deep);
          }
        } else {
          if (this.props.node.conf.usePreviewTabs) {
            getActions().confirmNode(this.props.node.rootUri, this.props.node.uri);
          }
        }
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
    key: '_onMouseDown',
    value: function _onMouseDown(event) {
      event.stopPropagation();

      // Select node on right-click (in order for context menu to behave correctly).
      if ((0, _libFileTreeHelpers.isContextClick)(event)) {
        if (!this.props.node.isSelected) {
          getActions().setSelectedNode(this.props.node.rootUri, this.props.node.uri);
        }
      }
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
})(_reactForAtom.React.Component);

exports.FileTreeEntryComponent = FileTreeEntryComponent;