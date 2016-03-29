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

var StatusCodeNumber = require('../../nuclide-hg-repository-base').hgConstants.StatusCodeNumber;

var classnames = require('classnames');

var _require2 = require('../lib/FileTreeHelpers');

var getDisplayTitle = _require2.getDisplayTitle;

var _require3 = require('../lib/FileTreeHelpers');

var isContextClick = _require3.isContextClick;

var _require4 = require('../../nuclide-ui/lib/NuclideCheckbox');

var NuclideCheckbox = _require4.NuclideCheckbox;
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
    this._checkboxOnChange = this._checkboxOnChange.bind(this);
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
      var outerClassName = classnames('directory entry list-nested-item', {
        'current-working-directory': this.props.isCwd,
        'collapsed': !this.props.isExpanded,
        'expanded': this.props.isExpanded,
        'project-root': this.props.isRoot,
        'selected': this.props.isSelected,
        'nuclide-file-tree-softened': this.props.soften
      });
      var listItemClassName = classnames('header list-item', {
        'loading': this.props.isLoading
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
          case 'partial':
            statusClass = 'status-modified';
            break;
          default:
            statusClass = '';
            break;
        }
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

      return React.createElement(NuclideCheckbox, {
        checked: this.props.checkedStatus === 'checked',
        indeterminate: this.props.checkedStatus === 'partial',
        onChange: this._checkboxOnChange,
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

  return DirectoryEntryComponent;
})(React.Component);

module.exports = DirectoryEntryComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQzs7ZUFLdEQsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUgzQixlQUFlLFlBQWYsZUFBZTtJQUNmLEtBQUssWUFBTCxLQUFLO0lBQ0wsUUFBUSxZQUFSLFFBQVE7O0lBRUgsZ0JBQWdCLEdBQUksT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsV0FBVyxDQUEzRSxnQkFBZ0I7O0FBQ3ZCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7Z0JBQ2YsT0FBTyxDQUFDLHdCQUF3QixDQUFDOztJQUFwRCxlQUFlLGFBQWYsZUFBZTs7Z0JBQ0csT0FBTyxDQUFDLHdCQUF3QixDQUFDOztJQUFuRCxjQUFjLGFBQWQsY0FBYzs7Z0JBQ0ssT0FBTyxDQUFDLHNDQUFzQyxDQUFDOztJQUFsRSxlQUFlLGFBQWYsZUFBZTtJQUVmLFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0FBRWhCLElBQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxXQUFXLENBQUM7OztBQUcvQyxJQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQzs7SUFFdEIsdUJBQXVCO1lBQXZCLHVCQUF1Qjs7ZUFBdkIsdUJBQXVCOztXQUNSO0FBQ2pCLGlCQUFXLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3hDLFdBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDaEMsZ0JBQVUsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDckMsZUFBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNwQyxZQUFNLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ2pDLGdCQUFVLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FB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QUNyRSxNQUFNO0FBQ0wsb0JBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2pFO09BQ0Y7S0FDRjs7O1dBRWdCLDJCQUFDLFNBQWtCLEVBQVE7QUFDMUMsVUFBSSxTQUFTLEVBQUU7QUFDYixrQkFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDaEUsTUFBTTtBQUNMLGtCQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNsRTtLQUNGOzs7V0FFZSwwQkFBQyxLQUFZLEVBQVE7QUFDbkMsV0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO0tBQ3pCOzs7U0FwTEcsdUJBQXVCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBdUxyRCxNQUFNLENBQUMsT0FBTyxHQUFHLHVCQUF1QixDQUFDIiwiZmlsZSI6IkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRmlsZVRyZWVBY3Rpb25zID0gcmVxdWlyZSgnLi4vbGliL0ZpbGVUcmVlQWN0aW9ucycpO1xuY29uc3Qge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1N0YXR1c0NvZGVOdW1iZXJ9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UnKS5oZ0NvbnN0YW50cztcbmNvbnN0IGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5jb25zdCB7Z2V0RGlzcGxheVRpdGxlfSA9IHJlcXVpcmUoJy4uL2xpYi9GaWxlVHJlZUhlbHBlcnMnKTtcbmNvbnN0IHtpc0NvbnRleHRDbGlja30gPSByZXF1aXJlKCcuLi9saWIvRmlsZVRyZWVIZWxwZXJzJyk7XG5jb25zdCB7TnVjbGlkZUNoZWNrYm94fSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWkvbGliL051Y2xpZGVDaGVja2JveCcpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCBnZXRBY3Rpb25zID0gRmlsZVRyZWVBY3Rpb25zLmdldEluc3RhbmNlO1xuXG4vLyBBZGRpdGlvbmFsIGluZGVudCBmb3IgbmVzdGVkIHRyZWUgbm9kZXNcbmNvbnN0IElOREVOVF9QRVJfTEVWRUwgPSAxNztcblxuY2xhc3MgRGlyZWN0b3J5RW50cnlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGluZGVudExldmVsOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgaXNDd2Q6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNFeHBhbmRlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBpc0xvYWRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNSb290OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGlzU2VsZWN0ZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdXNlUHJldmlld1RhYnM6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgbm9kZUtleTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG5vZGVOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgbm9kZVBhdGg6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICByb290S2V5OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgdmNzU3RhdHVzQ29kZTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBjaGVja2VkU3RhdHVzOiBQcm9wVHlwZXMub25lT2YoWydwYXJ0aWFsJywgJ2NoZWNrZWQnLCAnY2xlYXInLCAnJ10pLmlzUmVxdWlyZWQsXG4gICAgc29mdGVuOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uTW91c2VEb3duID0gdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tib3hPbkNoYW5nZSA9IHRoaXMuX2NoZWNrYm94T25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tib3hPbkNsaWNrID0gdGhpcy5fY2hlY2tib3hPbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogdm9pZCkge1xuICAgIHJldHVybiBQdXJlUmVuZGVyTWl4aW4uc2hvdWxkQ29tcG9uZW50VXBkYXRlLmNhbGwodGhpcywgbmV4dFByb3BzLCBuZXh0U3RhdGUpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgb3V0ZXJDbGFzc05hbWUgPSBjbGFzc25hbWVzKCdkaXJlY3RvcnkgZW50cnkgbGlzdC1uZXN0ZWQtaXRlbScsIHtcbiAgICAgICdjdXJyZW50LXdvcmtpbmctZGlyZWN0b3J5JzogdGhpcy5wcm9wcy5pc0N3ZCxcbiAgICAgICdjb2xsYXBzZWQnOiAhdGhpcy5wcm9wcy5pc0V4cGFuZGVkLFxuICAgICAgJ2V4cGFuZGVkJzogdGhpcy5wcm9wcy5pc0V4cGFuZGVkLFxuICAgICAgJ3Byb2plY3Qtcm9vdCc6IHRoaXMucHJvcHMuaXNSb290LFxuICAgICAgJ3NlbGVjdGVkJzogdGhpcy5wcm9wcy5pc1NlbGVjdGVkLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLXNvZnRlbmVkJzogdGhpcy5wcm9wcy5zb2Z0ZW4sXG4gICAgfSk7XG4gICAgY29uc3QgbGlzdEl0ZW1DbGFzc05hbWUgPSBjbGFzc25hbWVzKCdoZWFkZXIgbGlzdC1pdGVtJywge1xuICAgICAgJ2xvYWRpbmcnOiB0aGlzLnByb3BzLmlzTG9hZGluZyxcbiAgICB9KTtcblxuICAgIGxldCBzdGF0dXNDbGFzcztcbiAgICBpZiAodGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAnJykge1xuICAgICAgY29uc3Qge3Zjc1N0YXR1c0NvZGV9ID0gdGhpcy5wcm9wcztcbiAgICAgIGlmICh2Y3NTdGF0dXNDb2RlID09PSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEKSB7XG4gICAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1tb2RpZmllZCc7XG4gICAgICB9IGVsc2UgaWYgKHZjc1N0YXR1c0NvZGUgPT09IFN0YXR1c0NvZGVOdW1iZXIuQURERUQpIHtcbiAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLWFkZGVkJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXR1c0NsYXNzID0gJyc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXRjaCAodGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzKSB7XG4gICAgICAgIGNhc2UgJ2NoZWNrZWQnOlxuICAgICAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1hZGRlZCc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3BhcnRpYWwnOlxuICAgICAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1tb2RpZmllZCc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgc3RhdHVzQ2xhc3MgPSAnJztcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpY29uTmFtZSA9IHRoaXMucHJvcHMuaXNDd2QgPyAnYnJpZWZjYXNlJyA6ICdmaWxlLWRpcmVjdG9yeSc7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGxpXG4gICAgICAgIGNsYXNzTmFtZT17YCR7b3V0ZXJDbGFzc05hbWV9ICR7c3RhdHVzQ2xhc3N9YH1cbiAgICAgICAgc3R5bGU9e3twYWRkaW5nTGVmdDogdGhpcy5wcm9wcy5pbmRlbnRMZXZlbCAqIElOREVOVF9QRVJfTEVWRUx9fVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrfVxuICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5fb25Nb3VzZURvd259PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17bGlzdEl0ZW1DbGFzc05hbWV9IHJlZj1cImFycm93Q29udGFpbmVyXCI+XG4gICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgIGNsYXNzTmFtZT17YGljb24gbmFtZSBpY29uLSR7aWNvbk5hbWV9YH1cbiAgICAgICAgICAgIHJlZj1cInBhdGhDb250YWluZXJcIlxuICAgICAgICAgICAgZGF0YS1uYW1lPXt0aGlzLnByb3BzLm5vZGVOYW1lfVxuICAgICAgICAgICAgZGF0YS1wYXRoPXt0aGlzLnByb3BzLm5vZGVQYXRofT5cbiAgICAgICAgICAgIHt0aGlzLl9yZW5kZXJDaGVja2JveCgpfVxuICAgICAgICAgICAge3RoaXMucHJvcHMubm9kZU5hbWV9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIHt0aGlzLl9yZW5kZXJDb25uZWN0aW9uVGl0bGUoKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2xpPlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyQ2hlY2tib3goKTogP1JlYWN0LkVsZW1lbnQge1xuICAgIGlmICh0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMgPT09ICcnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxOdWNsaWRlQ2hlY2tib3hcbiAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAnY2hlY2tlZCd9XG4gICAgICAgIGluZGV0ZXJtaW5hdGU9e3RoaXMucHJvcHMuY2hlY2tlZFN0YXR1cyA9PT0gJ3BhcnRpYWwnfVxuICAgICAgICBvbkNoYW5nZT17dGhpcy5fY2hlY2tib3hPbkNoYW5nZX1cbiAgICAgICAgb25DbGljaz17dGhpcy5fY2hlY2tib3hPbkNsaWNrfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckNvbm5lY3Rpb25UaXRsZSgpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgaWYgKCF0aGlzLnByb3BzLmlzUm9vdCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHRpdGxlID0gZ2V0RGlzcGxheVRpdGxlKHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgaWYgKCF0aXRsZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlLWNvbm5lY3Rpb24tdGl0bGUgaGlnaGxpZ2h0XCI+XG4gICAgICAgIHt0aXRsZX1cbiAgICAgIDwvc3Bhbj5cbiAgICApO1xuICB9XG5cbiAgX29uQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpIHtcbiAgICBjb25zdCBkZWVwID0gZXZlbnQuYWx0S2V5O1xuICAgIGlmIChcbiAgICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snYXJyb3dDb250YWluZXInXSkuY29udGFpbnMoZXZlbnQudGFyZ2V0KVxuICAgICAgJiYgZXZlbnQuY2xpZW50WCA8IFJlYWN0RE9NLmZpbmRET01Ob2RlKFxuICAgICAgICB0aGlzLnJlZnNbJ3BhdGhDb250YWluZXInXSkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdFxuICAgICkge1xuICAgICAgdGhpcy5fdG9nZ2xlTm9kZUV4cGFuZGVkKGRlZXApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1vZGlmeVNlbGVjdGlvbiA9IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleTtcbiAgICBpZiAobW9kaWZ5U2VsZWN0aW9uKSB7XG4gICAgICBnZXRBY3Rpb25zKCkudG9nZ2xlU2VsZWN0Tm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5zZWxlY3RTaW5nbGVOb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnByb3BzLmlzU2VsZWN0ZWQgfHwgdGhpcy5wcm9wcy51c2VQcmV2aWV3VGFicykge1xuICAgICAgICB0aGlzLl90b2dnbGVOb2RlRXhwYW5kZWQoZGVlcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VEb3duKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KSB7XG4gICAgLy8gU2VsZWN0IG5vZGUgb24gcmlnaHQtY2xpY2sgKGluIG9yZGVyIGZvciBjb250ZXh0IG1lbnUgdG8gYmVoYXZlIGNvcnJlY3RseSkuXG4gICAgaWYgKGlzQ29udGV4dENsaWNrKGV2ZW50KSkge1xuICAgICAgaWYgKCF0aGlzLnByb3BzLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLnNlbGVjdFNpbmdsZU5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF90b2dnbGVOb2RlRXhwYW5kZWQoZGVlcDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLmlzRXhwYW5kZWQpIHtcbiAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5jb2xsYXBzZU5vZGVEZWVwKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5jb2xsYXBzZU5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZGVlcCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkuZXhwYW5kTm9kZURlZXAodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmV4cGFuZE5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9jaGVja2JveE9uQ2hhbmdlKGlzQ2hlY2tlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChpc0NoZWNrZWQpIHtcbiAgICAgIGdldEFjdGlvbnMoKS5jaGVja05vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZXRBY3Rpb25zKCkudW5jaGVja05vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgIH1cbiAgfVxuXG4gIF9jaGVja2JveE9uQ2xpY2soZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaXJlY3RvcnlFbnRyeUNvbXBvbmVudDtcbiJdfQ==