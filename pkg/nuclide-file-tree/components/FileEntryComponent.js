var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeActions = require('../lib/FileTreeActions');

var _require = require('react-for-atom');

var PureRenderMixin = _require.PureRenderMixin;
var React = _require.React;

var StatusCodeNumber = require('../../nuclide-hg-repository-base').hgConstants.StatusCodeNumber;

var classnames = require('classnames');

var _require2 = require('../../nuclide-atom-helpers');

var fileTypeClass = _require2.fileTypeClass;

var _require3 = require('../lib/FileTreeHelpers');

var isContextClick = _require3.isContextClick;

var _require4 = require('../../nuclide-ui/lib/NuclideCheckbox');

var NuclideCheckbox = _require4.NuclideCheckbox;

var semver = require('semver');

var PropTypes = React.PropTypes;

var getActions = FileTreeActions.getInstance;

// Additional indent for nested tree nodes
var INDENT_PER_LEVEL = 17;

var FileEntryComponent = (function (_React$Component) {
  _inherits(FileEntryComponent, _React$Component);

  _createClass(FileEntryComponent, null, [{
    key: 'propTypes',
    value: {
      indentLevel: PropTypes.number.isRequired,
      isSelected: PropTypes.bool.isRequired,
      usePreviewTabs: PropTypes.bool.isRequired,
      nodeKey: PropTypes.string.isRequired,
      nodeName: PropTypes.string.isRequired,
      nodePath: PropTypes.string.isRequired,
      rootKey: PropTypes.string.isRequired,
      vcsStatusCode: PropTypes.number,
      checkedStatus: PropTypes.oneOf(['checked', 'clear', '']).isRequired,
      soften: PropTypes.bool.isRequired
    },
    enumerable: true
  }]);

  function FileEntryComponent(props) {
    _classCallCheck(this, FileEntryComponent);

    _get(Object.getPrototypeOf(FileEntryComponent.prototype), 'constructor', this).call(this, props);
    this._onClick = this._onClick.bind(this);
    this._checkboxOnChange = this._checkboxOnChange.bind(this);
    this._checkboxOnClick = this._checkboxOnClick.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
  }

  _createClass(FileEntryComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
    }
  }, {
    key: 'render',
    value: function render() {
      var outerClassName = classnames('entry file list-item', {
        'selected': this.props.isSelected,
        'nuclide-file-tree-softened': this.props.soften
      });

      var statusClass = undefined;
      if (this.props.checkedStatus === '') {
        var vcsStatusCode = this.props.vcsStatusCode;

        if (vcsStatusCode === StatusCodeNumber.MODIFIED) {
          statusClass = 'status-modified';
        } else if (vcsStatusCode === StatusCodeNumber.ADDED) {
          statusClass = 'status-added';
        } else {
          statusClass = '';
        }
      } else {
        switch (this.props.checkedStatus) {
          case 'checked':
            statusClass = 'status-added';
            break;
          default:
            statusClass = '';
            break;
        }
      }

      return React.createElement(
        'li',
        {
          className: outerClassName + ' ' + statusClass,
          style: { paddingLeft: this.props.indentLevel * INDENT_PER_LEVEL },
          onClick: this._onClick,
          onMouseDown: this._onMouseDown,
          onDoubleClick: this._onDoubleClick },
        React.createElement(
          'span',
          {
            className: 'icon name ' + fileTypeClass(this.props.nodeName),
            'data-name': this.props.nodeName,
            'data-path': this.props.nodePath },
          this._renderCheckbox(),
          React.createElement(
            'span',
            {
              'data-name': this.props.nodeName,
              'data-path': this.props.nodePath },
            this.props.nodeName
          )
        )
      );
    }
  }, {
    key: '_renderCheckbox',
    value: function _renderCheckbox() {
      if (this.props.checkedStatus === '') {
        return;
      }

      return React.createElement(NuclideCheckbox, {
        checked: this.props.checkedStatus === 'checked',
        onChange: this._checkboxOnChange,
        onClick: this._checkboxOnClick
      });
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      var modifySelection = event.ctrlKey || event.metaKey;
      if (modifySelection) {
        getActions().toggleSelectNode(this.props.rootKey, this.props.nodeKey);
      } else {
        if (!this.props.isSelected) {
          getActions().selectSingleNode(this.props.rootKey, this.props.nodeKey);
        }
        if (this.props.usePreviewTabs) {
          getActions().confirmNode(this.props.rootKey, this.props.nodeKey, /* pending */true);
        }
      }
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(event) {
      // Select node on right-click (in order for context menu to behave correctly).
      if (isContextClick(event)) {
        if (!this.props.isSelected) {
          getActions().selectSingleNode(this.props.rootKey, this.props.nodeKey);
        }
      }
    }
  }, {
    key: '_onDoubleClick',
    value: function _onDoubleClick() {
      if (this.props.usePreviewTabs) {
        // This will no longer be needed once Nuclide will not officially support Atoms < 1.6.0
        if (semver.lt(atom.getVersion(), '1.6.0-beta')) {
          getActions().keepPreviewTab();
        }
      } else {
        getActions().confirmNode(this.props.rootKey, this.props.nodeKey);
      }
    }
  }, {
    key: '_checkboxOnChange',
    value: function _checkboxOnChange(isChecked) {
      if (isChecked) {
        getActions().checkNode(this.props.rootKey, this.props.nodeKey);
      } else {
        getActions().uncheckNode(this.props.rootKey, this.props.nodeKey);
      }
    }
  }, {
    key: '_checkboxOnClick',
    value: function _checkboxOnClick(event) {
      event.stopPropagation();
    }
  }]);

  return FileEntryComponent;
})(React.Component);

module.exports = FileEntryComponent;
//# sourceMappingURL=data:application/json;base64,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QVksRUFBUTtBQUNuQyxXQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7S0FDekI7OztTQXRJRyxrQkFBa0I7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUF5SWhELE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiRmlsZUVudHJ5Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRmlsZVRyZWVBY3Rpb25zID0gcmVxdWlyZSgnLi4vbGliL0ZpbGVUcmVlQWN0aW9ucycpO1xuY29uc3Qge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7U3RhdHVzQ29kZU51bWJlcn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZScpLmhnQ29uc3RhbnRzO1xuXG5jb25zdCBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuY29uc3Qge2ZpbGVUeXBlQ2xhc3N9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHtpc0NvbnRleHRDbGlja30gPSByZXF1aXJlKCcuLi9saWIvRmlsZVRyZWVIZWxwZXJzJyk7XG5jb25zdCB7TnVjbGlkZUNoZWNrYm94fSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWkvbGliL051Y2xpZGVDaGVja2JveCcpO1xuY29uc3Qgc2VtdmVyID0gcmVxdWlyZSgnc2VtdmVyJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IGdldEFjdGlvbnMgPSBGaWxlVHJlZUFjdGlvbnMuZ2V0SW5zdGFuY2U7XG5cbi8vIEFkZGl0aW9uYWwgaW5kZW50IGZvciBuZXN0ZWQgdHJlZSBub2Rlc1xuY29uc3QgSU5ERU5UX1BFUl9MRVZFTCA9IDE3O1xuXG5jbGFzcyBGaWxlRW50cnlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGluZGVudExldmVsOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgaXNTZWxlY3RlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICB1c2VQcmV2aWV3VGFiczogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBub2RlS2V5OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgbm9kZU5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBub2RlUGF0aDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHJvb3RLZXk6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICB2Y3NTdGF0dXNDb2RlOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGNoZWNrZWRTdGF0dXM6IFByb3BUeXBlcy5vbmVPZihbJ2NoZWNrZWQnLCAnY2xlYXInLCAnJ10pLmlzUmVxdWlyZWQsXG4gICAgc29mdGVuOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2NoZWNrYm94T25DaGFuZ2UgPSB0aGlzLl9jaGVja2JveE9uQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2NoZWNrYm94T25DbGljayA9IHRoaXMuX2NoZWNrYm94T25DbGljay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbk1vdXNlRG93biA9IHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uRG91YmxlQ2xpY2sgPSB0aGlzLl9vbkRvdWJsZUNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogdm9pZCkge1xuICAgIHJldHVybiBQdXJlUmVuZGVyTWl4aW4uc2hvdWxkQ29tcG9uZW50VXBkYXRlLmNhbGwodGhpcywgbmV4dFByb3BzLCBuZXh0U3RhdGUpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgb3V0ZXJDbGFzc05hbWUgPSBjbGFzc25hbWVzKCdlbnRyeSBmaWxlIGxpc3QtaXRlbScsIHtcbiAgICAgICdzZWxlY3RlZCc6IHRoaXMucHJvcHMuaXNTZWxlY3RlZCxcbiAgICAgICdudWNsaWRlLWZpbGUtdHJlZS1zb2Z0ZW5lZCc6IHRoaXMucHJvcHMuc29mdGVuLFxuICAgIH0pO1xuXG4gICAgbGV0IHN0YXR1c0NsYXNzO1xuICAgIGlmICh0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMgPT09ICcnKSB7XG4gICAgICBjb25zdCB7dmNzU3RhdHVzQ29kZX0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKHZjc1N0YXR1c0NvZGUgPT09IFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQpIHtcbiAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLW1vZGlmaWVkJztcbiAgICAgIH0gZWxzZSBpZiAodmNzU3RhdHVzQ29kZSA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCkge1xuICAgICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtYWRkZWQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdHVzQ2xhc3MgPSAnJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoICh0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMpIHtcbiAgICAgICAgY2FzZSAnY2hlY2tlZCc6XG4gICAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLWFkZGVkJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBzdGF0dXNDbGFzcyA9ICcnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8bGlcbiAgICAgICAgY2xhc3NOYW1lPXtgJHtvdXRlckNsYXNzTmFtZX0gJHtzdGF0dXNDbGFzc31gfVxuICAgICAgICBzdHlsZT17e3BhZGRpbmdMZWZ0OiB0aGlzLnByb3BzLmluZGVudExldmVsICogSU5ERU5UX1BFUl9MRVZFTH19XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9XG4gICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9vbk1vdXNlRG93bn1cbiAgICAgICAgb25Eb3VibGVDbGljaz17dGhpcy5fb25Eb3VibGVDbGlja30+XG4gICAgICAgIDxzcGFuXG4gICAgICAgICAgY2xhc3NOYW1lPXtgaWNvbiBuYW1lICR7ZmlsZVR5cGVDbGFzcyh0aGlzLnByb3BzLm5vZGVOYW1lKX1gfVxuICAgICAgICAgIGRhdGEtbmFtZT17dGhpcy5wcm9wcy5ub2RlTmFtZX1cbiAgICAgICAgICBkYXRhLXBhdGg9e3RoaXMucHJvcHMubm9kZVBhdGh9PlxuICAgICAgICAgIHt0aGlzLl9yZW5kZXJDaGVja2JveCgpfVxuICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICBkYXRhLW5hbWU9e3RoaXMucHJvcHMubm9kZU5hbWV9XG4gICAgICAgICAgICBkYXRhLXBhdGg9e3RoaXMucHJvcHMubm9kZVBhdGh9PlxuICAgICAgICAgICAge3RoaXMucHJvcHMubm9kZU5hbWV9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2xpPlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyQ2hlY2tib3goKTogP1JlYWN0LkVsZW1lbnQge1xuICAgIGlmICh0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMgPT09ICcnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxOdWNsaWRlQ2hlY2tib3hcbiAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAnY2hlY2tlZCd9XG4gICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9jaGVja2JveE9uQ2hhbmdlfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9jaGVja2JveE9uQ2xpY2t9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfb25DbGljayhldmVudDogU3ludGhldGljTW91c2VFdmVudCkge1xuICAgIGNvbnN0IG1vZGlmeVNlbGVjdGlvbiA9IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleTtcbiAgICBpZiAobW9kaWZ5U2VsZWN0aW9uKSB7XG4gICAgICBnZXRBY3Rpb25zKCkudG9nZ2xlU2VsZWN0Tm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5zZWxlY3RTaW5nbGVOb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnByb3BzLnVzZVByZXZpZXdUYWJzKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5jb25maXJtTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSwgLyogcGVuZGluZyAqLyB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfb25Nb3VzZURvd24oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpIHtcbiAgICAvLyBTZWxlY3Qgbm9kZSBvbiByaWdodC1jbGljayAoaW4gb3JkZXIgZm9yIGNvbnRleHQgbWVudSB0byBiZWhhdmUgY29ycmVjdGx5KS5cbiAgICBpZiAoaXNDb250ZXh0Q2xpY2soZXZlbnQpKSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMuaXNTZWxlY3RlZCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkuc2VsZWN0U2luZ2xlTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX29uRG91YmxlQ2xpY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMudXNlUHJldmlld1RhYnMpIHtcbiAgICAgIC8vIFRoaXMgd2lsbCBubyBsb25nZXIgYmUgbmVlZGVkIG9uY2UgTnVjbGlkZSB3aWxsIG5vdCBvZmZpY2lhbGx5IHN1cHBvcnQgQXRvbXMgPCAxLjYuMFxuICAgICAgaWYgKHNlbXZlci5sdChhdG9tLmdldFZlcnNpb24oKSwgJzEuNi4wLWJldGEnKSkge1xuICAgICAgICBnZXRBY3Rpb25zKCkua2VlcFByZXZpZXdUYWIoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZ2V0QWN0aW9ucygpLmNvbmZpcm1Ob2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICB9XG4gIH1cblxuICBfY2hlY2tib3hPbkNoYW5nZShpc0NoZWNrZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoaXNDaGVja2VkKSB7XG4gICAgICBnZXRBY3Rpb25zKCkuY2hlY2tOb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2V0QWN0aW9ucygpLnVuY2hlY2tOb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICB9XG4gIH1cblxuICBfY2hlY2tib3hPbkNsaWNrKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUVudHJ5Q29tcG9uZW50O1xuIl19