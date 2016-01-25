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
var React = require('react-for-atom');

var StatusCodeNumber = require('../../hg-repository-base').hgConstants.StatusCodeNumber;

var classnames = require('classnames');

var _require = require('../lib/FileTreeHelpers');

var isContextClick = _require.isContextClick;
var addons = React.addons;
var PropTypes = React.PropTypes;

var getActions = FileTreeActions.getInstance;

// Additional indent for nested tree nodes
var INDENT_PER_LEVEL = 17;

var DirectoryEntryComponent = (function (_React$Component) {
  _inherits(DirectoryEntryComponent, _React$Component);

  function DirectoryEntryComponent(props) {
    _classCallCheck(this, DirectoryEntryComponent);

    _get(Object.getPrototypeOf(DirectoryEntryComponent.prototype), 'constructor', this).call(this, props);
    this._onClick = this._onClick.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
  }

  _createClass(DirectoryEntryComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return addons.PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
    }
  }, {
    key: 'render',
    value: function render() {
      var outerClassName = classnames({
        'collapsed': !this.props.isExpanded,
        'directory entry list-nested-item': true,
        'expanded': this.props.isExpanded,
        'project-root': this.props.isRoot,
        'selected': this.props.isSelected
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

      return React.createElement(
        'li',
        {
          key: this.props.nodeKey,
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
              className: 'icon name icon-file-directory',
              ref: 'pathContainer',
              'data-name': this.props.nodeName,
              'data-path': this.props.nodePath },
            this.props.nodeName
          )
        )
      );
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      var deep = event.altKey;
      if (React.findDOMNode(this.refs['arrowContainer']).contains(event.target) && event.clientX < React.findDOMNode(this.refs['pathContainer']).getBoundingClientRect().left) {
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
  }]);

  return DirectoryEntryComponent;
})(React.Component);

DirectoryEntryComponent.propTypes = {
  indentLevel: PropTypes.number.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isRoot: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  usePreviewTabs: PropTypes.bool.isRequired,
  nodeKey: PropTypes.string.isRequired,
  nodeName: PropTypes.string.isRequired,
  nodePath: PropTypes.string.isRequired,
  rootKey: PropTypes.string.isRequired,
  vcsStatusCode: PropTypes.number
};

module.exports = DirectoryEntryComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUMxRCxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7SUFDakMsZ0JBQWdCLEdBQUksT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsV0FBVyxDQUFuRSxnQkFBZ0I7O0FBRXZCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7ZUFDaEIsT0FBTyxDQUFDLHdCQUF3QixDQUFDOztJQUFuRCxjQUFjLFlBQWQsY0FBYztJQUduQixNQUFNLEdBRUosS0FBSyxDQUZQLE1BQU07SUFDTixTQUFTLEdBQ1AsS0FBSyxDQURQLFNBQVM7O0FBR1gsSUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLFdBQVcsQ0FBQzs7O0FBRy9DLElBQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDOztJQUV0Qix1QkFBdUI7WUFBdkIsdUJBQXVCOztBQUNoQixXQURQLHVCQUF1QixDQUNmLEtBQWEsRUFBRTswQkFEdkIsdUJBQXVCOztBQUV6QiwrQkFGRSx1QkFBdUIsNkNBRW5CLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekMsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNsRDs7ZUFMRyx1QkFBdUI7O1dBT04sK0JBQUMsU0FBaUIsRUFBRSxTQUFpQixFQUFFO0FBQzFELGFBQU8sTUFBTSxDQUFDLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUN0Rjs7O1dBRUssa0JBQWlC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QUF1QjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQXVHckQsdUJBQXVCLENBQUMsU0FBUyxHQUFHO0FBQ2xDLGFBQVcsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDeEMsWUFBVSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNyQyxXQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ3BDLFFBQU0sRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDakMsWUFBVSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNyQyxnQkFBYyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUN6QyxTQUFPLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3BDLFVBQVEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDckMsVUFBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNyQyxTQUFPLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3BDLGVBQWEsRUFBRSxTQUFTLENBQUMsTUFBTTtDQUNoQyxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsdUJBQXVCLENBQUMiLCJmaWxlIjoiRGlyZWN0b3J5RW50cnlDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBGaWxlVHJlZUFjdGlvbnMgPSByZXF1aXJlKCcuLi9saWIvRmlsZVRyZWVBY3Rpb25zJyk7XG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7U3RhdHVzQ29kZU51bWJlcn0gPSByZXF1aXJlKCcuLi8uLi9oZy1yZXBvc2l0b3J5LWJhc2UnKS5oZ0NvbnN0YW50cztcblxuY29uc3QgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbmNvbnN0IHtpc0NvbnRleHRDbGlja30gPSByZXF1aXJlKCcuLi9saWIvRmlsZVRyZWVIZWxwZXJzJyk7XG5cbmNvbnN0IHtcbiAgYWRkb25zLFxuICBQcm9wVHlwZXMsXG59ID0gUmVhY3Q7XG5cbmNvbnN0IGdldEFjdGlvbnMgPSBGaWxlVHJlZUFjdGlvbnMuZ2V0SW5zdGFuY2U7XG5cbi8vIEFkZGl0aW9uYWwgaW5kZW50IGZvciBuZXN0ZWQgdHJlZSBub2Rlc1xuY29uc3QgSU5ERU5UX1BFUl9MRVZFTCA9IDE3O1xuXG5jbGFzcyBEaXJlY3RvcnlFbnRyeUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fb25DbGljayA9IHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbk1vdXNlRG93biA9IHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogT2JqZWN0KSB7XG4gICAgcmV0dXJuIGFkZG9ucy5QdXJlUmVuZGVyTWl4aW4uc2hvdWxkQ29tcG9uZW50VXBkYXRlLmNhbGwodGhpcywgbmV4dFByb3BzLCBuZXh0U3RhdGUpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgb3V0ZXJDbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgICdjb2xsYXBzZWQnOiAhdGhpcy5wcm9wcy5pc0V4cGFuZGVkLFxuICAgICAgJ2RpcmVjdG9yeSBlbnRyeSBsaXN0LW5lc3RlZC1pdGVtJzogdHJ1ZSxcbiAgICAgICdleHBhbmRlZCc6IHRoaXMucHJvcHMuaXNFeHBhbmRlZCxcbiAgICAgICdwcm9qZWN0LXJvb3QnOiB0aGlzLnByb3BzLmlzUm9vdCxcbiAgICAgICdzZWxlY3RlZCc6IHRoaXMucHJvcHMuaXNTZWxlY3RlZCxcbiAgICB9KTtcbiAgICBjb25zdCBsaXN0SXRlbUNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoe1xuICAgICAgJ2hlYWRlciBsaXN0LWl0ZW0nOiB0cnVlLFxuICAgICAgJ2xvYWRpbmcnOiB0aGlzLnByb3BzLmlzTG9hZGluZyxcbiAgICB9KTtcblxuICAgIGxldCBzdGF0dXNDbGFzcztcbiAgICBjb25zdCB7dmNzU3RhdHVzQ29kZX0gPSB0aGlzLnByb3BzO1xuICAgIGlmICh2Y3NTdGF0dXNDb2RlID09PSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEKSB7XG4gICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtbW9kaWZpZWQnO1xuICAgIH0gZWxzZSBpZiAodmNzU3RhdHVzQ29kZSA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCkge1xuICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLWFkZGVkJztcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdHVzQ2xhc3MgPSAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGxpXG4gICAgICAgIGtleT17dGhpcy5wcm9wcy5ub2RlS2V5fVxuICAgICAgICBjbGFzc05hbWU9e2Ake291dGVyQ2xhc3NOYW1lfSAke3N0YXR1c0NsYXNzfWB9XG4gICAgICAgIHN0eWxlPXt7cGFkZGluZ0xlZnQ6IHRoaXMucHJvcHMuaW5kZW50TGV2ZWwgKiBJTkRFTlRfUEVSX0xFVkVMfX1cbiAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja31cbiAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX29uTW91c2VEb3dufT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2xpc3RJdGVtQ2xhc3NOYW1lfSByZWY9XCJhcnJvd0NvbnRhaW5lclwiPlxuICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJpY29uIG5hbWUgaWNvbi1maWxlLWRpcmVjdG9yeVwiXG4gICAgICAgICAgICByZWY9XCJwYXRoQ29udGFpbmVyXCJcbiAgICAgICAgICAgIGRhdGEtbmFtZT17dGhpcy5wcm9wcy5ub2RlTmFtZX1cbiAgICAgICAgICAgIGRhdGEtcGF0aD17dGhpcy5wcm9wcy5ub2RlUGF0aH0+XG4gICAgICAgICAgICB7dGhpcy5wcm9wcy5ub2RlTmFtZX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgX29uQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpIHtcbiAgICBjb25zdCBkZWVwID0gZXZlbnQuYWx0S2V5O1xuICAgIGlmIChcbiAgICAgIFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snYXJyb3dDb250YWluZXInXSkuY29udGFpbnMoZXZlbnQudGFyZ2V0KVxuICAgICAgJiYgZXZlbnQuY2xpZW50WCA8IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1sncGF0aENvbnRhaW5lciddKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0XG4gICAgKSB7XG4gICAgICB0aGlzLl90b2dnbGVOb2RlRXhwYW5kZWQoZGVlcCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbW9kaWZ5U2VsZWN0aW9uID0gZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5O1xuICAgIGlmIChtb2RpZnlTZWxlY3Rpb24pIHtcbiAgICAgIGdldEFjdGlvbnMoKS50b2dnbGVTZWxlY3ROb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLnByb3BzLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLnNlbGVjdFNpbmdsZU5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucHJvcHMuaXNTZWxlY3RlZCB8fCB0aGlzLnByb3BzLnVzZVByZXZpZXdUYWJzKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZU5vZGVFeHBhbmRlZChkZWVwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfb25Nb3VzZURvd24oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpIHtcbiAgICAvLyBTZWxlY3Qgbm9kZSBvbiByaWdodC1jbGljayAoaW4gb3JkZXIgZm9yIGNvbnRleHQgbWVudSB0byBiZWhhdmUgY29ycmVjdGx5KS5cbiAgICBpZiAoaXNDb250ZXh0Q2xpY2soZXZlbnQpKSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMuaXNTZWxlY3RlZCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkuc2VsZWN0U2luZ2xlTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3RvZ2dsZU5vZGVFeHBhbmRlZChkZWVwOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMuaXNFeHBhbmRlZCkge1xuICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmNvbGxhcHNlTm9kZURlZXAodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmNvbGxhcHNlTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5leHBhbmROb2RlRGVlcCh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnZXRBY3Rpb25zKCkuZXhwYW5kTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LnByb3BUeXBlcyA9IHtcbiAgaW5kZW50TGV2ZWw6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgaXNFeHBhbmRlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgaXNMb2FkaW5nOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICBpc1Jvb3Q6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gIGlzU2VsZWN0ZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gIHVzZVByZXZpZXdUYWJzOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICBub2RlS2V5OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIG5vZGVOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIG5vZGVQYXRoOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIHJvb3RLZXk6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgdmNzU3RhdHVzQ29kZTogUHJvcFR5cGVzLm51bWJlcixcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGlyZWN0b3J5RW50cnlDb21wb25lbnQ7XG4iXX0=