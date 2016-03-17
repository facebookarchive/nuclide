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

var NuclideCheckbox = require('../../nuclide-ui-checkbox');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQzs7ZUFLdEQsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUgzQixlQUFlLFlBQWYsZUFBZTtJQUNmLEtBQUssWUFBTCxLQUFLO0lBQ0wsUUFBUSxZQUFSLFFBQVE7O0lBRUgsZ0JBQWdCLEdBQUksT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsV0FBVyxDQUEzRSxnQkFBZ0I7O0FBQ3ZCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7Z0JBQ2YsT0FBTyxDQUFDLHdCQUF3QixDQUFDOztJQUFwRCxlQUFlLGFBQWYsZUFBZTs7Z0JBQ0csT0FBTyxDQUFDLHdCQUF3QixDQUFDOztJQUFuRCxjQUFjLGFBQWQsY0FBYzs7QUFDckIsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7O0lBRXRELFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7O0FBRWhCLElBQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxXQUFXLENBQUM7OztBQUcvQyxJQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQzs7SUFFdEIsdUJBQXVCO1lBQXZCLHVCQUF1Qjs7ZUFBdkIsdUJBQXVCOztXQUNSO0FBQ2pCLGlCQUFXLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3hDLFdBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDaEMsZ0JBQVUsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDckMsZUFBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNwQyxZQUFNLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ2pDLGdCQUFVLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FB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QUNyRSxNQUFNO0FBQ0wsb0JBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2pFO09BQ0Y7S0FDRjs7O1dBRWdCLDJCQUFDLFNBQWtCLEVBQVE7QUFDMUMsVUFBSSxTQUFTLEVBQUU7QUFDYixrQkFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDaEUsTUFBTTtBQUNMLGtCQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNsRTtLQUNGOzs7V0FFZSwwQkFBQyxLQUFZLEVBQVE7QUFDbkMsV0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO0tBQ3pCOzs7U0FwTEcsdUJBQXVCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBdUxyRCxNQUFNLENBQUMsT0FBTyxHQUFHLHVCQUF1QixDQUFDIiwiZmlsZSI6IkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRmlsZVRyZWVBY3Rpb25zID0gcmVxdWlyZSgnLi4vbGliL0ZpbGVUcmVlQWN0aW9ucycpO1xuY29uc3Qge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1N0YXR1c0NvZGVOdW1iZXJ9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UnKS5oZ0NvbnN0YW50cztcbmNvbnN0IGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5jb25zdCB7Z2V0RGlzcGxheVRpdGxlfSA9IHJlcXVpcmUoJy4uL2xpYi9GaWxlVHJlZUhlbHBlcnMnKTtcbmNvbnN0IHtpc0NvbnRleHRDbGlja30gPSByZXF1aXJlKCcuLi9saWIvRmlsZVRyZWVIZWxwZXJzJyk7XG5jb25zdCBOdWNsaWRlQ2hlY2tib3ggPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpLWNoZWNrYm94Jyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IGdldEFjdGlvbnMgPSBGaWxlVHJlZUFjdGlvbnMuZ2V0SW5zdGFuY2U7XG5cbi8vIEFkZGl0aW9uYWwgaW5kZW50IGZvciBuZXN0ZWQgdHJlZSBub2Rlc1xuY29uc3QgSU5ERU5UX1BFUl9MRVZFTCA9IDE3O1xuXG5jbGFzcyBEaXJlY3RvcnlFbnRyeUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaW5kZW50TGV2ZWw6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBpc0N3ZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBpc0V4cGFuZGVkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGlzTG9hZGluZzogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBpc1Jvb3Q6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNTZWxlY3RlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICB1c2VQcmV2aWV3VGFiczogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBub2RlS2V5OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgbm9kZU5hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBub2RlUGF0aDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHJvb3RLZXk6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICB2Y3NTdGF0dXNDb2RlOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGNoZWNrZWRTdGF0dXM6IFByb3BUeXBlcy5vbmVPZihbJ3BhcnRpYWwnLCAnY2hlY2tlZCcsICdjbGVhcicsICcnXSkuaXNSZXF1aXJlZCxcbiAgICBzb2Z0ZW46IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25DbGljayA9IHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Nb3VzZURvd24gPSB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9jaGVja2JveE9uQ2hhbmdlID0gdGhpcy5fY2hlY2tib3hPbkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9jaGVja2JveE9uQ2xpY2sgPSB0aGlzLl9jaGVja2JveE9uQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IE9iamVjdCwgbmV4dFN0YXRlOiB2b2lkKSB7XG4gICAgcmV0dXJuIFB1cmVSZW5kZXJNaXhpbi5zaG91bGRDb21wb25lbnRVcGRhdGUuY2FsbCh0aGlzLCBuZXh0UHJvcHMsIG5leHRTdGF0ZSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBvdXRlckNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ2RpcmVjdG9yeSBlbnRyeSBsaXN0LW5lc3RlZC1pdGVtJywge1xuICAgICAgJ2N1cnJlbnQtd29ya2luZy1kaXJlY3RvcnknOiB0aGlzLnByb3BzLmlzQ3dkLFxuICAgICAgJ2NvbGxhcHNlZCc6ICF0aGlzLnByb3BzLmlzRXhwYW5kZWQsXG4gICAgICAnZXhwYW5kZWQnOiB0aGlzLnByb3BzLmlzRXhwYW5kZWQsXG4gICAgICAncHJvamVjdC1yb290JzogdGhpcy5wcm9wcy5pc1Jvb3QsXG4gICAgICAnc2VsZWN0ZWQnOiB0aGlzLnByb3BzLmlzU2VsZWN0ZWQsXG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWUtc29mdGVuZWQnOiB0aGlzLnByb3BzLnNvZnRlbixcbiAgICB9KTtcbiAgICBjb25zdCBsaXN0SXRlbUNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ2hlYWRlciBsaXN0LWl0ZW0nLCB7XG4gICAgICAnbG9hZGluZyc6IHRoaXMucHJvcHMuaXNMb2FkaW5nLFxuICAgIH0pO1xuXG4gICAgbGV0IHN0YXR1c0NsYXNzO1xuICAgIGlmICh0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMgPT09ICcnKSB7XG4gICAgICBjb25zdCB7dmNzU3RhdHVzQ29kZX0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKHZjc1N0YXR1c0NvZGUgPT09IFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQpIHtcbiAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLW1vZGlmaWVkJztcbiAgICAgIH0gZWxzZSBpZiAodmNzU3RhdHVzQ29kZSA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCkge1xuICAgICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtYWRkZWQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdHVzQ2xhc3MgPSAnJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoICh0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMpIHtcbiAgICAgICAgY2FzZSAnY2hlY2tlZCc6XG4gICAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLWFkZGVkJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGFydGlhbCc6XG4gICAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLW1vZGlmaWVkJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBzdGF0dXNDbGFzcyA9ICcnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGljb25OYW1lID0gdGhpcy5wcm9wcy5pc0N3ZCA/ICdicmllZmNhc2UnIDogJ2ZpbGUtZGlyZWN0b3J5JztcblxuICAgIHJldHVybiAoXG4gICAgICA8bGlcbiAgICAgICAgY2xhc3NOYW1lPXtgJHtvdXRlckNsYXNzTmFtZX0gJHtzdGF0dXNDbGFzc31gfVxuICAgICAgICBzdHlsZT17e3BhZGRpbmdMZWZ0OiB0aGlzLnByb3BzLmluZGVudExldmVsICogSU5ERU5UX1BFUl9MRVZFTH19XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9XG4gICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9vbk1vdXNlRG93bn0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtsaXN0SXRlbUNsYXNzTmFtZX0gcmVmPVwiYXJyb3dDb250YWluZXJcIj5cbiAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgaWNvbiBuYW1lIGljb24tJHtpY29uTmFtZX1gfVxuICAgICAgICAgICAgcmVmPVwicGF0aENvbnRhaW5lclwiXG4gICAgICAgICAgICBkYXRhLW5hbWU9e3RoaXMucHJvcHMubm9kZU5hbWV9XG4gICAgICAgICAgICBkYXRhLXBhdGg9e3RoaXMucHJvcHMubm9kZVBhdGh9PlxuICAgICAgICAgICAge3RoaXMuX3JlbmRlckNoZWNrYm94KCl9XG4gICAgICAgICAgICB7dGhpcy5wcm9wcy5ub2RlTmFtZX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAge3RoaXMuX3JlbmRlckNvbm5lY3Rpb25UaXRsZSgpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbGk+XG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJDaGVja2JveCgpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgaWYgKHRoaXMucHJvcHMuY2hlY2tlZFN0YXR1cyA9PT0gJycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPE51Y2xpZGVDaGVja2JveFxuICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMgPT09ICdjaGVja2VkJ31cbiAgICAgICAgaW5kZXRlcm1pbmF0ZT17dGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAncGFydGlhbCd9XG4gICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9jaGVja2JveE9uQ2hhbmdlfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9jaGVja2JveE9uQ2xpY2t9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyQ29ubmVjdGlvblRpdGxlKCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBpZiAoIXRoaXMucHJvcHMuaXNSb290KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdGl0bGUgPSBnZXREaXNwbGF5VGl0bGUodGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICBpZiAoIXRpdGxlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS1maWxlLXRyZWUtY29ubmVjdGlvbi10aXRsZSBoaWdobGlnaHRcIj5cbiAgICAgICAge3RpdGxlfVxuICAgICAgPC9zcGFuPlxuICAgICk7XG4gIH1cblxuICBfb25DbGljayhldmVudDogU3ludGhldGljTW91c2VFdmVudCkge1xuICAgIGNvbnN0IGRlZXAgPSBldmVudC5hbHRLZXk7XG4gICAgaWYgKFxuICAgICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydhcnJvd0NvbnRhaW5lciddKS5jb250YWlucyhldmVudC50YXJnZXQpXG4gICAgICAmJiBldmVudC5jbGllbnRYIDwgUmVhY3RET00uZmluZERPTU5vZGUoXG4gICAgICAgIHRoaXMucmVmc1sncGF0aENvbnRhaW5lciddKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0XG4gICAgKSB7XG4gICAgICB0aGlzLl90b2dnbGVOb2RlRXhwYW5kZWQoZGVlcCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbW9kaWZ5U2VsZWN0aW9uID0gZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5O1xuICAgIGlmIChtb2RpZnlTZWxlY3Rpb24pIHtcbiAgICAgIGdldEFjdGlvbnMoKS50b2dnbGVTZWxlY3ROb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLnByb3BzLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLnNlbGVjdFNpbmdsZU5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucHJvcHMuaXNTZWxlY3RlZCB8fCB0aGlzLnByb3BzLnVzZVByZXZpZXdUYWJzKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZU5vZGVFeHBhbmRlZChkZWVwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfb25Nb3VzZURvd24oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpIHtcbiAgICAvLyBTZWxlY3Qgbm9kZSBvbiByaWdodC1jbGljayAoaW4gb3JkZXIgZm9yIGNvbnRleHQgbWVudSB0byBiZWhhdmUgY29ycmVjdGx5KS5cbiAgICBpZiAoaXNDb250ZXh0Q2xpY2soZXZlbnQpKSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMuaXNTZWxlY3RlZCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkuc2VsZWN0U2luZ2xlTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3RvZ2dsZU5vZGVFeHBhbmRlZChkZWVwOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMuaXNFeHBhbmRlZCkge1xuICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmNvbGxhcHNlTm9kZURlZXAodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmNvbGxhcHNlTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5leHBhbmROb2RlRGVlcCh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnZXRBY3Rpb25zKCkuZXhwYW5kTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2NoZWNrYm94T25DaGFuZ2UoaXNDaGVja2VkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKGlzQ2hlY2tlZCkge1xuICAgICAgZ2V0QWN0aW9ucygpLmNoZWNrTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdldEFjdGlvbnMoKS51bmNoZWNrTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgfVxuICB9XG5cbiAgX2NoZWNrYm94T25DbGljayhldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERpcmVjdG9yeUVudHJ5Q29tcG9uZW50O1xuIl19