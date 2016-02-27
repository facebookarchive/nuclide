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
            this._renderCheckbox(),
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

      return React.createElement(TriStateCheckboxComponent, {
        checkedStatus: this.props.checkedStatus,
        onClick: this._checkboxOnClick
      });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQzs7ZUFLdEQsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUgzQixlQUFlLFlBQWYsZUFBZTtJQUNmLEtBQUssWUFBTCxLQUFLO0lBQ0wsUUFBUSxZQUFSLFFBQVE7O0lBRUgsZ0JBQWdCLEdBQUksT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUMsV0FBVyxDQUFuRSxnQkFBZ0I7O0FBRXZCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7Z0JBQ2hCLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQzs7SUFBbkQsY0FBYyxhQUFkLGNBQWM7O2dCQUNlLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQzs7SUFBbkUseUJBQXlCLGFBQXpCLHlCQUF5QjtJQUV6QixTQUFTLEdBQUksS0FBSyxDQUFsQixTQUFTOztBQUVoQixJQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsV0FBVyxDQUFDOzs7QUFHL0MsSUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7O0lBRXRCLHVCQUF1QjtZQUF2Qix1QkFBdUI7O2VBQXZCLHVCQUF1Qjs7V0FDUjtBQUNqQixpQkFBVyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUN4QyxnQkFBVSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNyQyxlQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ3BDLFlBQU0sRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDakMsZ0JBQVUsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDckMsb0JBQWMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDekMsYUFBTyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNwQyxjQUFRLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3JDLGNBQVEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDckMsYUFBTyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNwQyxtQkFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQy9CLG1CQUFhLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVTtBQUM5RSxZQUFNLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0tBQ2xDOzs7O0FBRVUsV0FqQlAsdUJBQXVCLENBaUJmLEtBQWEsRUFBRTswQkFqQnZCLHVCQUF1Qjs7QUFrQnpCLCtCQWxCRSx1QkFBdUIsNkNBa0JuQixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEQsQUFBQyxRQUFJLENBQU8sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hELEFBQUMsUUFBSSxDQUFPLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDakU7O2VBdEJHLHVCQUF1Qjs7V0F3Qk4sK0JBQUMsU0FBaUIsRUFBRSxTQUFlLEVBQUU7QUFDeEQsYUFBTyxlQUFlLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDL0U7OztXQUVLLGtCQUFpQjtBQUNyQixVQUFNLGNBQWMsR0FBRyxVQUFVLENBQUM7QUFDaEMsbUJBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtBQUNuQywwQ0FBa0MsRUFBRSxJQUFJO0FBQ3hDLGtCQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO0FBQ2pDLHNCQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNO0FBQ2pDLGtCQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO0FBQ2pDLG1DQUEyQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLFNBQVM7QUFDbkUsbUNBQTJCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEtBQUssU0FBUztBQUNuRSwwQ0FBa0MsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsS0FBSyxPQUFPO0FBQ3hFLG9DQUE0QixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtPQUNoRCxDQUFDLENBQUM7QUFDSCxVQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQztBQUNuQywwQkFBa0IsRUFBRSxJQUFJO0FBQ3hCLGlCQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTO09BQ2hDLENBQUMsQ0FBQzs7QUFFSCxVQUFJLFdBQVcsWUFBQSxDQUFDO1VBQ1QsYUFBYSxHQUFJLElBQUksQ0FBQyxLQUFLLENBQTNCLGFBQWE7O0FBQ3BCLFVBQUksYUFBYSxLQUFLLGdCQUFnQixDQUFDLFFBQVEsRUFBRTtBQUMvQyxtQkFBVyxHQUFHLGlCQUFpQixDQUFDO09BQ2pDLE1BQU0sSUFBSSxhQUFhLEtBQUssZ0JBQWdCLENBQUMsS0FBSyxFQUFFO0FBQ25ELG1CQUFXLEdBQUcsY0FBYyxDQUFDO09BQzlCLE1BQU07QUFDTCxtQkFBVyxHQUFHLEVBQUUsQ0FBQztPQUNsQjs7QUFFRCxhQUNFOzs7QUFDRSxhQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7QUFDeEIsbUJBQVMsRUFBSyxjQUFjLFNBQUksV0FBVyxBQUFHO0FBQzlDLGVBQUssRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxnQkFBZ0IsRUFBQyxBQUFDO0FBQ2hFLGlCQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQUFBQztBQUN2QixxQkFBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEFBQUM7UUFDL0I7O1lBQUssU0FBUyxFQUFFLGlCQUFpQixBQUFDLEVBQUMsR0FBRyxFQUFDLGdCQUFnQjtVQUNyRDs7O0FBQ0UsdUJBQVMsRUFBQywrQkFBK0I7QUFDekMsaUJBQUcsRUFBQyxlQUFlO0FBQ25CLDJCQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxBQUFDO0FBQy9CLDJCQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxBQUFDO1lBQzlCLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRO1dBQ2Y7U0FDSDtPQUNILENBQ0w7S0FDSDs7O1dBRWMsMkJBQW1CO0FBQ2hDLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEtBQUssRUFBRSxFQUFFO0FBQ25DLGVBQU87T0FDUjs7QUFFRCxhQUNFLG9CQUFDLHlCQUF5QjtBQUN4QixxQkFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxBQUFDO0FBQ3hDLGVBQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEFBQUM7UUFDL0IsQ0FDRjtLQUNIOzs7V0FHTyxrQkFBQyxLQUEwQixFQUFFO0FBQ25DLFVBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDMUIsVUFDRSxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQ3JFLEtBQUssQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxFQUMxRDtBQUNBLFlBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixlQUFPO09BQ1I7O0FBRUQsVUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ3ZELFVBQUksZUFBZSxFQUFFO0FBQ25CLGtCQUFVLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3ZFLE1BQU07QUFDTCxZQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUU7QUFDMUIsb0JBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdkU7QUFDRCxZQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFO0FBQ3RELGNBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNoQztPQUNGO0tBQ0Y7OztXQUVXLHNCQUFDLEtBQTBCLEVBQUU7O0FBRXZDLFVBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLFlBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRTtBQUMxQixvQkFBVSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN2RTtPQUNGO0tBQ0Y7OztXQUVrQiw2QkFBQyxJQUFhLEVBQVE7QUFDdkMsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRTtBQUN6QixZQUFJLElBQUksRUFBRTtBQUNSLG9CQUFVLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZFLE1BQU07QUFDTCxvQkFBVSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbkU7T0FDRixNQUFNO0FBQ0wsWUFBSSxJQUFJLEVBQUU7QUFDUixvQkFBVSxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDckUsTUFBTTtBQUNMLG9CQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNqRTtPQUNGO0tBQ0Y7OztXQUVlLDBCQUFDLEtBQVksRUFBUTtBQUNuQyxXQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDeEIsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsS0FBSyxPQUFPLEVBQUU7QUFDeEMsa0JBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ2hFLE1BQU07QUFDTCxrQkFBVSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDbEU7S0FDRjs7O1NBbEpHLHVCQUF1QjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQXFKckQsTUFBTSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJEaXJlY3RvcnlFbnRyeUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IEZpbGVUcmVlQWN0aW9ucyA9IHJlcXVpcmUoJy4uL2xpYi9GaWxlVHJlZUFjdGlvbnMnKTtcbmNvbnN0IHtcbiAgUHVyZVJlbmRlck1peGluLFxuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtTdGF0dXNDb2RlTnVtYmVyfSA9IHJlcXVpcmUoJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZScpLmhnQ29uc3RhbnRzO1xuXG5jb25zdCBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuY29uc3Qge2lzQ29udGV4dENsaWNrfSA9IHJlcXVpcmUoJy4uL2xpYi9GaWxlVHJlZUhlbHBlcnMnKTtcbmNvbnN0IHtUcmlTdGF0ZUNoZWNrYm94Q29tcG9uZW50fSA9IHJlcXVpcmUoJy4vVHJpU3RhdGVDaGVja2JveENvbXBvbmVudCcpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jb25zdCBnZXRBY3Rpb25zID0gRmlsZVRyZWVBY3Rpb25zLmdldEluc3RhbmNlO1xuXG4vLyBBZGRpdGlvbmFsIGluZGVudCBmb3IgbmVzdGVkIHRyZWUgbm9kZXNcbmNvbnN0IElOREVOVF9QRVJfTEVWRUwgPSAxNztcblxuY2xhc3MgRGlyZWN0b3J5RW50cnlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGluZGVudExldmVsOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgaXNFeHBhbmRlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBpc0xvYWRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNSb290OiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGlzU2VsZWN0ZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdXNlUHJldmlld1RhYnM6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgbm9kZUtleTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG5vZGVOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgbm9kZVBhdGg6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICByb290S2V5OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgdmNzU3RhdHVzQ29kZTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBjaGVja2VkU3RhdHVzOiBQcm9wVHlwZXMub25lT2YoWydwYXJ0aWFsJywgJ2NoZWNrZWQnLCAnY2xlYXInLCAnJ10pLmlzUmVxdWlyZWQsXG4gICAgc29mdGVuOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uTW91c2VEb3duID0gdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tib3hPbkNsaWNrID0gdGhpcy5fY2hlY2tib3hPbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogdm9pZCkge1xuICAgIHJldHVybiBQdXJlUmVuZGVyTWl4aW4uc2hvdWxkQ29tcG9uZW50VXBkYXRlLmNhbGwodGhpcywgbmV4dFByb3BzLCBuZXh0U3RhdGUpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgb3V0ZXJDbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgICdjb2xsYXBzZWQnOiAhdGhpcy5wcm9wcy5pc0V4cGFuZGVkLFxuICAgICAgJ2RpcmVjdG9yeSBlbnRyeSBsaXN0LW5lc3RlZC1pdGVtJzogdHJ1ZSxcbiAgICAgICdleHBhbmRlZCc6IHRoaXMucHJvcHMuaXNFeHBhbmRlZCxcbiAgICAgICdwcm9qZWN0LXJvb3QnOiB0aGlzLnByb3BzLmlzUm9vdCxcbiAgICAgICdzZWxlY3RlZCc6IHRoaXMucHJvcHMuaXNTZWxlY3RlZCxcbiAgICAgICdudWNsaWRlLWZpbGUtdHJlZS1wYXJ0aWFsJzogdGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAncGFydGlhbCcsXG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWUtY2hlY2tlZCc6IHRoaXMucHJvcHMuY2hlY2tlZFN0YXR1cyA9PT0gJ2NoZWNrZWQnLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLXJlc2V0LWNvbG9yaW5nJzogdGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAnY2xlYXInLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLXNvZnRlbmVkJzogdGhpcy5wcm9wcy5zb2Z0ZW4sXG4gICAgfSk7XG4gICAgY29uc3QgbGlzdEl0ZW1DbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgICdoZWFkZXIgbGlzdC1pdGVtJzogdHJ1ZSxcbiAgICAgICdsb2FkaW5nJzogdGhpcy5wcm9wcy5pc0xvYWRpbmcsXG4gICAgfSk7XG5cbiAgICBsZXQgc3RhdHVzQ2xhc3M7XG4gICAgY29uc3Qge3Zjc1N0YXR1c0NvZGV9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodmNzU3RhdHVzQ29kZSA9PT0gU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRCkge1xuICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLW1vZGlmaWVkJztcbiAgICB9IGVsc2UgaWYgKHZjc1N0YXR1c0NvZGUgPT09IFN0YXR1c0NvZGVOdW1iZXIuQURERUQpIHtcbiAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1hZGRlZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXR1c0NsYXNzID0gJyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxsaVxuICAgICAgICBrZXk9e3RoaXMucHJvcHMubm9kZUtleX1cbiAgICAgICAgY2xhc3NOYW1lPXtgJHtvdXRlckNsYXNzTmFtZX0gJHtzdGF0dXNDbGFzc31gfVxuICAgICAgICBzdHlsZT17e3BhZGRpbmdMZWZ0OiB0aGlzLnByb3BzLmluZGVudExldmVsICogSU5ERU5UX1BFUl9MRVZFTH19XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9XG4gICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9vbk1vdXNlRG93bn0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtsaXN0SXRlbUNsYXNzTmFtZX0gcmVmPVwiYXJyb3dDb250YWluZXJcIj5cbiAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiaWNvbiBuYW1lIGljb24tZmlsZS1kaXJlY3RvcnlcIlxuICAgICAgICAgICAgcmVmPVwicGF0aENvbnRhaW5lclwiXG4gICAgICAgICAgICBkYXRhLW5hbWU9e3RoaXMucHJvcHMubm9kZU5hbWV9XG4gICAgICAgICAgICBkYXRhLXBhdGg9e3RoaXMucHJvcHMubm9kZVBhdGh9PlxuICAgICAgICAgICAge3RoaXMuX3JlbmRlckNoZWNrYm94KCl9XG4gICAgICAgICAgICB7dGhpcy5wcm9wcy5ub2RlTmFtZX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckNoZWNrYm94KCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBpZiAodGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAnJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8VHJpU3RhdGVDaGVja2JveENvbXBvbmVudFxuICAgICAgICBjaGVja2VkU3RhdHVzPXt0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXN9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX2NoZWNrYm94T25DbGlja31cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG5cbiAgX29uQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpIHtcbiAgICBjb25zdCBkZWVwID0gZXZlbnQuYWx0S2V5O1xuICAgIGlmIChcbiAgICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snYXJyb3dDb250YWluZXInXSkuY29udGFpbnMoZXZlbnQudGFyZ2V0KVxuICAgICAgJiYgZXZlbnQuY2xpZW50WCA8IFJlYWN0RE9NLmZpbmRET01Ob2RlKFxuICAgICAgICB0aGlzLnJlZnNbJ3BhdGhDb250YWluZXInXSkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdFxuICAgICkge1xuICAgICAgdGhpcy5fdG9nZ2xlTm9kZUV4cGFuZGVkKGRlZXApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1vZGlmeVNlbGVjdGlvbiA9IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleTtcbiAgICBpZiAobW9kaWZ5U2VsZWN0aW9uKSB7XG4gICAgICBnZXRBY3Rpb25zKCkudG9nZ2xlU2VsZWN0Tm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5zZWxlY3RTaW5nbGVOb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnByb3BzLmlzU2VsZWN0ZWQgfHwgdGhpcy5wcm9wcy51c2VQcmV2aWV3VGFicykge1xuICAgICAgICB0aGlzLl90b2dnbGVOb2RlRXhwYW5kZWQoZGVlcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VEb3duKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KSB7XG4gICAgLy8gU2VsZWN0IG5vZGUgb24gcmlnaHQtY2xpY2sgKGluIG9yZGVyIGZvciBjb250ZXh0IG1lbnUgdG8gYmVoYXZlIGNvcnJlY3RseSkuXG4gICAgaWYgKGlzQ29udGV4dENsaWNrKGV2ZW50KSkge1xuICAgICAgaWYgKCF0aGlzLnByb3BzLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLnNlbGVjdFNpbmdsZU5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF90b2dnbGVOb2RlRXhwYW5kZWQoZGVlcDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLmlzRXhwYW5kZWQpIHtcbiAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5jb2xsYXBzZU5vZGVEZWVwKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5jb2xsYXBzZU5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZGVlcCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkuZXhwYW5kTm9kZURlZXAodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmV4cGFuZE5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9jaGVja2JveE9uQ2xpY2soZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgaWYgKHRoaXMucHJvcHMuY2hlY2tlZFN0YXR1cyA9PT0gJ2NsZWFyJykge1xuICAgICAgZ2V0QWN0aW9ucygpLmNoZWNrTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdldEFjdGlvbnMoKS51bmNoZWNrTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlyZWN0b3J5RW50cnlDb21wb25lbnQ7XG4iXX0=