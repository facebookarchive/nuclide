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
var ReactDOM = _require.ReactDOM;

var StatusCodeNumber = require('../../hg-repository-base').hgConstants.StatusCodeNumber;

var classnames = require('classnames');

var _require2 = require('../lib/FileTreeHelpers');

var isContextClick = _require2.isContextClick;

var _require3 = require('./TriStateCheckboxComponent');

var TriStateCheckboxComponent = _require3.TriStateCheckboxComponent;

var _require4 = require('../lib/FileTreeHelpers');

var getDisplayTitle = _require4.getDisplayTitle;
var PropTypes = React.PropTypes;

var getActions = FileTreeActions.getInstance;

// Additional indent for nested tree nodes
var INDENT_PER_LEVEL = 17;

var DirectoryEntryComponent = (function (_React$Component) {
  _inherits(DirectoryEntryComponent, _React$Component);

  _createClass(DirectoryEntryComponent, null, [{
    key: 'propTypes',
    value: {
      indentLevel: PropTypes.number.isRequired,
      isCwd: PropTypes.bool.isRequired,
      isExpanded: PropTypes.bool.isRequired,
      isLoading: PropTypes.bool.isRequired,
      isRoot: PropTypes.bool.isRequired,
      isSelected: PropTypes.bool.isRequired,
      usePreviewTabs: PropTypes.bool.isRequired,
      nodeKey: PropTypes.string.isRequired,
      nodeName: PropTypes.string.isRequired,
      nodePath: PropTypes.string.isRequired,
      rootKey: PropTypes.string.isRequired,
      vcsStatusCode: PropTypes.number,
      checkedStatus: PropTypes.oneOf(['partial', 'checked', 'clear', '']).isRequired,
      soften: PropTypes.bool.isRequired
    },
    enumerable: true
  }]);

  function DirectoryEntryComponent(props) {
    _classCallCheck(this, DirectoryEntryComponent);

    _get(Object.getPrototypeOf(DirectoryEntryComponent.prototype), 'constructor', this).call(this, props);
    this._onClick = this._onClick.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._checkboxOnClick = this._checkboxOnClick.bind(this);
  }

  _createClass(DirectoryEntryComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
    }
  }, {
    key: 'render',
    value: function render() {
      var outerClassName = classnames({
        'current-working-directory': this.props.isCwd,
        'collapsed': !this.props.isExpanded,
        'directory entry list-nested-item': true,
        'expanded': this.props.isExpanded,
        'project-root': this.props.isRoot,
        'selected': this.props.isSelected,
        'nuclide-file-tree-partial': this.props.checkedStatus === 'partial',
        'nuclide-file-tree-checked': this.props.checkedStatus === 'checked',
        'nuclide-file-tree-reset-coloring': this.props.checkedStatus === 'clear',
        'nuclide-file-tree-softened': this.props.soften
      });
      var listItemClassName = classnames({
        'header list-item': true,
        'loading': this.props.isLoading
      });

      var statusClass = undefined;
      var vcsStatusCode = this.props.vcsStatusCode;

      if (vcsStatusCode === StatusCodeNumber.MODIFIED) {
        statusClass = 'status-modified';
      } else if (vcsStatusCode === StatusCodeNumber.ADDED) {
        statusClass = 'status-added';
      } else {
        statusClass = '';
      }

      var iconName = this.props.isCwd ? 'briefcase' : 'file-directory';

      return React.createElement(
        'li',
        {
          className: outerClassName + ' ' + statusClass,
          style: { paddingLeft: this.props.indentLevel * INDENT_PER_LEVEL },
          onClick: this._onClick,
          onMouseDown: this._onMouseDown },
        React.createElement(
          'div',
          { className: listItemClassName, ref: 'arrowContainer' },
          React.createElement(
            'span',
            {
              className: 'icon name icon-' + iconName,
              ref: 'pathContainer',
              'data-name': this.props.nodeName,
              'data-path': this.props.nodePath },
            this._renderCheckbox(),
            this.props.nodeName
          ),
          this._renderConnectionTitle()
        )
      );
    }
  }, {
    key: '_renderCheckbox',
    value: function _renderCheckbox() {
      if (this.props.checkedStatus === '') {
        return;
      }

      return React.createElement(TriStateCheckboxComponent, {
        checkedStatus: this.props.checkedStatus,
        onClick: this._checkboxOnClick
      });
    }
  }, {
    key: '_renderConnectionTitle',
    value: function _renderConnectionTitle() {
      if (!this.props.isRoot) {
        return null;
      }
      var title = getDisplayTitle(this.props.nodeKey);
      if (!title) {
        return null;
      }

      return React.createElement(
        'span',
        { className: 'nuclide-file-tree-connection-title highlight' },
        title
      );
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      var deep = event.altKey;
      if (ReactDOM.findDOMNode(this.refs['arrowContainer']).contains(event.target) && event.clientX < ReactDOM.findDOMNode(this.refs['pathContainer']).getBoundingClientRect().left) {
        this._toggleNodeExpanded(deep);
        return;
      }

      var modifySelection = event.ctrlKey || event.metaKey;
      if (modifySelection) {
        getActions().toggleSelectNode(this.props.rootKey, this.props.nodeKey);
      } else {
        if (!this.props.isSelected) {
          getActions().selectSingleNode(this.props.rootKey, this.props.nodeKey);
        }
        if (this.props.isSelected || this.props.usePreviewTabs) {
          this._toggleNodeExpanded(deep);
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
    key: '_toggleNodeExpanded',
    value: function _toggleNodeExpanded(deep) {
      if (this.props.isExpanded) {
        if (deep) {
          getActions().collapseNodeDeep(this.props.rootKey, this.props.nodeKey);
        } else {
          getActions().collapseNode(this.props.rootKey, this.props.nodeKey);
        }
      } else {
        if (deep) {
          getActions().expandNodeDeep(this.props.rootKey, this.props.nodeKey);
        } else {
          getActions().expandNode(this.props.rootKey, this.props.nodeKey);
        }
      }
    }
  }, {
    key: '_checkboxOnClick',
    value: function _checkboxOnClick(event) {
      event.stopPropagation();
      if (this.props.checkedStatus === 'clear') {
        getActions().checkNode(this.props.rootKey, this.props.nodeKey);
      } else {
        getActions().uncheckNode(this.props.rootKey, this.props.nodeKey);
      }
    }
  }]);

  return DirectoryEntryComponent;
})(React.Component);

module.exports = DirectoryEntryComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQzs7ZUFLdEQsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUgzQixlQUFlLFlBQWYsZUFBZTtJQUNmLEtBQUssWUFBTCxLQUFLO0lBQ0wsUUFBUSxZQUFSLFFBQVE7O0lBRUgsZ0JBQWdCLEdBQUksT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsV0FBVyxDQUFuRSxnQkFBZ0I7O0FBRXZCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7Z0JBQ2hCLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQzs7SUFBbkQsY0FBYyxhQUFkLGNBQWM7O2dCQUNlLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQzs7SUFBbkUseUJBQXlCLGFBQXpCLHlCQUF5Qjs7Z0JBRU4sT0FBTyxDQUFDLHdCQUF3QixDQUFDOztJQUFwRCxlQUFlLGFBQWYsZUFBZTtJQUVmLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0FBRWhCLElBQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxXQUFXLENBQUM7OztBQUcvQyxJQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQzs7SUFFdEIsdUJBQXVCO1lBQXZCLHVCQUF1Qjs7ZUFBdkIsdUJBQXVCOztXQUNSO0FBQ2pCLGlCQUFXLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3hDLFdBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDaEMsZ0JBQVUsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDckMsZUFBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNwQyxZQUFNLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ2pDLGdCQUFVLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxV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QUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDaEUsTUFBTTtBQUNMLGtCQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNsRTtLQUNGOzs7U0FyS0csdUJBQXVCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBd0tyRCxNQUFNLENBQUMsT0FBTyxHQUFHLHVCQUF1QixDQUFDIiwiZmlsZSI6IkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRmlsZVRyZWVBY3Rpb25zID0gcmVxdWlyZSgnLi4vbGliL0ZpbGVUcmVlQWN0aW9ucycpO1xuY29uc3Qge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1N0YXR1c0NvZGVOdW1iZXJ9ID0gcmVxdWlyZSgnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlJykuaGdDb25zdGFudHM7XG5cbmNvbnN0IGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5jb25zdCB7aXNDb250ZXh0Q2xpY2t9ID0gcmVxdWlyZSgnLi4vbGliL0ZpbGVUcmVlSGVscGVycycpO1xuY29uc3Qge1RyaVN0YXRlQ2hlY2tib3hDb21wb25lbnR9ID0gcmVxdWlyZSgnLi9UcmlTdGF0ZUNoZWNrYm94Q29tcG9uZW50Jyk7XG5cbmNvbnN0IHtnZXREaXNwbGF5VGl0bGV9ID0gcmVxdWlyZSgnLi4vbGliL0ZpbGVUcmVlSGVscGVycycpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCBnZXRBY3Rpb25zID0gRmlsZVRyZWVBY3Rpb25zLmdldEluc3RhbmNlO1xuXG4vLyBBZGRpdGlvbmFsIGluZGVudCBmb3IgbmVzdGVkIHRyZWUgbm9kZXNcbmNvbnN0IElOREVOVF9QRVJfTEVWRUwgPSAxNztcblxuY2xhc3MgRGlyZWN0b3J5RW50cnlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGluZGVudExldmVsOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgaXNDd2Q6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNFeHBhbmRlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBpc0xvYWRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNSb290OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGlzU2VsZWN0ZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdXNlUHJldmlld1RhYnM6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgbm9kZUtleTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG5vZGVOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgbm9kZVBhdGg6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICByb290S2V5OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgdmNzU3RhdHVzQ29kZTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBjaGVja2VkU3RhdHVzOiBQcm9wVHlwZXMub25lT2YoWydwYXJ0aWFsJywgJ2NoZWNrZWQnLCAnY2xlYXInLCAnJ10pLmlzUmVxdWlyZWQsXG4gICAgc29mdGVuOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uTW91c2VEb3duID0gdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tib3hPbkNsaWNrID0gdGhpcy5fY2hlY2tib3hPbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogdm9pZCkge1xuICAgIHJldHVybiBQdXJlUmVuZGVyTWl4aW4uc2hvdWxkQ29tcG9uZW50VXBkYXRlLmNhbGwodGhpcywgbmV4dFByb3BzLCBuZXh0U3RhdGUpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgb3V0ZXJDbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgICdjdXJyZW50LXdvcmtpbmctZGlyZWN0b3J5JzogdGhpcy5wcm9wcy5pc0N3ZCxcbiAgICAgICdjb2xsYXBzZWQnOiAhdGhpcy5wcm9wcy5pc0V4cGFuZGVkLFxuICAgICAgJ2RpcmVjdG9yeSBlbnRyeSBsaXN0LW5lc3RlZC1pdGVtJzogdHJ1ZSxcbiAgICAgICdleHBhbmRlZCc6IHRoaXMucHJvcHMuaXNFeHBhbmRlZCxcbiAgICAgICdwcm9qZWN0LXJvb3QnOiB0aGlzLnByb3BzLmlzUm9vdCxcbiAgICAgICdzZWxlY3RlZCc6IHRoaXMucHJvcHMuaXNTZWxlY3RlZCxcbiAgICAgICdudWNsaWRlLWZpbGUtdHJlZS1wYXJ0aWFsJzogdGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAncGFydGlhbCcsXG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWUtY2hlY2tlZCc6IHRoaXMucHJvcHMuY2hlY2tlZFN0YXR1cyA9PT0gJ2NoZWNrZWQnLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLXJlc2V0LWNvbG9yaW5nJzogdGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAnY2xlYXInLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLXNvZnRlbmVkJzogdGhpcy5wcm9wcy5zb2Z0ZW4sXG4gICAgfSk7XG4gICAgY29uc3QgbGlzdEl0ZW1DbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgICdoZWFkZXIgbGlzdC1pdGVtJzogdHJ1ZSxcbiAgICAgICdsb2FkaW5nJzogdGhpcy5wcm9wcy5pc0xvYWRpbmcsXG4gICAgfSk7XG5cbiAgICBsZXQgc3RhdHVzQ2xhc3M7XG4gICAgY29uc3Qge3Zjc1N0YXR1c0NvZGV9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodmNzU3RhdHVzQ29kZSA9PT0gU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRCkge1xuICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLW1vZGlmaWVkJztcbiAgICB9IGVsc2UgaWYgKHZjc1N0YXR1c0NvZGUgPT09IFN0YXR1c0NvZGVOdW1iZXIuQURERUQpIHtcbiAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1hZGRlZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXR1c0NsYXNzID0gJyc7XG4gICAgfVxuXG4gICAgY29uc3QgaWNvbk5hbWUgPSB0aGlzLnByb3BzLmlzQ3dkID8gJ2JyaWVmY2FzZScgOiAnZmlsZS1kaXJlY3RvcnknO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxsaVxuICAgICAgICBjbGFzc05hbWU9e2Ake291dGVyQ2xhc3NOYW1lfSAke3N0YXR1c0NsYXNzfWB9XG4gICAgICAgIHN0eWxlPXt7cGFkZGluZ0xlZnQ6IHRoaXMucHJvcHMuaW5kZW50TGV2ZWwgKiBJTkRFTlRfUEVSX0xFVkVMfX1cbiAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja31cbiAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX29uTW91c2VEb3dufT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2xpc3RJdGVtQ2xhc3NOYW1lfSByZWY9XCJhcnJvd0NvbnRhaW5lclwiPlxuICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICBjbGFzc05hbWU9e2BpY29uIG5hbWUgaWNvbi0ke2ljb25OYW1lfWB9XG4gICAgICAgICAgICByZWY9XCJwYXRoQ29udGFpbmVyXCJcbiAgICAgICAgICAgIGRhdGEtbmFtZT17dGhpcy5wcm9wcy5ub2RlTmFtZX1cbiAgICAgICAgICAgIGRhdGEtcGF0aD17dGhpcy5wcm9wcy5ub2RlUGF0aH0+XG4gICAgICAgICAgICB7dGhpcy5fcmVuZGVyQ2hlY2tib3goKX1cbiAgICAgICAgICAgIHt0aGlzLnByb3BzLm5vZGVOYW1lfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICB7dGhpcy5fcmVuZGVyQ29ubmVjdGlvblRpdGxlKCl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckNoZWNrYm94KCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBpZiAodGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAnJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8VHJpU3RhdGVDaGVja2JveENvbXBvbmVudFxuICAgICAgICBjaGVja2VkU3RhdHVzPXt0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXN9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX2NoZWNrYm94T25DbGlja31cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJDb25uZWN0aW9uVGl0bGUoKTogP1JlYWN0LkVsZW1lbnQge1xuICAgIGlmICghdGhpcy5wcm9wcy5pc1Jvb3QpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0aXRsZSA9IGdldERpc3BsYXlUaXRsZSh0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgIGlmICghdGl0bGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWZpbGUtdHJlZS1jb25uZWN0aW9uLXRpdGxlIGhpZ2hsaWdodFwiPlxuICAgICAgICB7dGl0bGV9XG4gICAgICA8L3NwYW4+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNsaWNrKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KSB7XG4gICAgY29uc3QgZGVlcCA9IGV2ZW50LmFsdEtleTtcbiAgICBpZiAoXG4gICAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2Fycm93Q29udGFpbmVyJ10pLmNvbnRhaW5zKGV2ZW50LnRhcmdldClcbiAgICAgICYmIGV2ZW50LmNsaWVudFggPCBSZWFjdERPTS5maW5kRE9NTm9kZShcbiAgICAgICAgdGhpcy5yZWZzWydwYXRoQ29udGFpbmVyJ10pLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnRcbiAgICApIHtcbiAgICAgIHRoaXMuX3RvZ2dsZU5vZGVFeHBhbmRlZChkZWVwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtb2RpZnlTZWxlY3Rpb24gPSBldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXk7XG4gICAgaWYgKG1vZGlmeVNlbGVjdGlvbikge1xuICAgICAgZ2V0QWN0aW9ucygpLnRvZ2dsZVNlbGVjdE5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMuaXNTZWxlY3RlZCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkuc2VsZWN0U2luZ2xlTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wcm9wcy5pc1NlbGVjdGVkIHx8IHRoaXMucHJvcHMudXNlUHJldmlld1RhYnMpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlTm9kZUV4cGFuZGVkKGRlZXApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9vbk1vdXNlRG93bihldmVudDogU3ludGhldGljTW91c2VFdmVudCkge1xuICAgIC8vIFNlbGVjdCBub2RlIG9uIHJpZ2h0LWNsaWNrIChpbiBvcmRlciBmb3IgY29udGV4dCBtZW51IHRvIGJlaGF2ZSBjb3JyZWN0bHkpLlxuICAgIGlmIChpc0NvbnRleHRDbGljayhldmVudCkpIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5zZWxlY3RTaW5nbGVOb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdG9nZ2xlTm9kZUV4cGFuZGVkKGRlZXA6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wcm9wcy5pc0V4cGFuZGVkKSB7XG4gICAgICBpZiAoZGVlcCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkuY29sbGFwc2VOb2RlRGVlcCh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnZXRBY3Rpb25zKCkuY29sbGFwc2VOb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmV4cGFuZE5vZGVEZWVwKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5leHBhbmROb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfY2hlY2tib3hPbkNsaWNrKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGlmICh0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMgPT09ICdjbGVhcicpIHtcbiAgICAgIGdldEFjdGlvbnMoKS5jaGVja05vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZXRBY3Rpb25zKCkudW5jaGVja05vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpcmVjdG9yeUVudHJ5Q29tcG9uZW50O1xuIl19