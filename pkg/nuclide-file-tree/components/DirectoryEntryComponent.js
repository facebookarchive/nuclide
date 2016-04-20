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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _libFileTreeActions = require('../lib/FileTreeActions');

var _libFileTreeActions2 = _interopRequireDefault(_libFileTreeActions);

var _reactForAtom = require('react-for-atom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _libFileTreeFilterHelper = require('../lib/FileTreeFilterHelper');

var _libFileTreeHelpers = require('../lib/FileTreeHelpers');

var _nuclideUiLibCheckbox = require('../../nuclide-ui/lib/Checkbox');

var _nuclideHgRepositoryBaseLibHgConstants = require('../../nuclide-hg-repository-base/lib/hg-constants');

var _FileEntryComponent = require('./FileEntryComponent');

var getActions = _libFileTreeActions2['default'].getInstance;

var DirectoryEntryComponent = (function (_React$Component) {
  _inherits(DirectoryEntryComponent, _React$Component);

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
      return nextProps.node !== this.props.node;
    }
  }, {
    key: 'scrollTrackedIntoView',
    value: function scrollTrackedIntoView() {
      var _this = this;

      if (!this.props.node.containsTrackedNode) {
        return;
      }

      if (this.props.node.isTracked) {
        if (this._animationFrameRequestId != null) {
          return;
        }

        this._animationFrameRequestId = window.requestAnimationFrame(function () {
          _reactForAtom.ReactDOM.findDOMNode(_this.refs['arrowContainer']).scrollIntoViewIfNeeded();
          _this._animationFrameRequestId = null;
        });
        return;
      }

      var trackedChild = this.refs['tracked'];
      if (trackedChild != null) {
        trackedChild.scrollTrackedIntoView();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._animationFrameRequestId != null) {
        window.cancelAnimationFrame(this._animationFrameRequestId);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var node = this.props.node;

      var outerClassName = (0, _classnames2['default'])('directory entry list-nested-item', {
        'current-working-directory': node.isCwd,
        'collapsed': !node.isExpanded,
        'expanded': node.isExpanded,
        'project-root': node.isRoot,
        'selected': node.isSelected
      });
      var listItemClassName = (0, _classnames2['default'])('header list-item', {
        'loading': node.isLoading,
        'nuclide-file-tree-softened': node.shouldBeSoftened
      });

      var statusClass = undefined;
      if (!node.conf.isEditingWorkingSet) {
        var vcsStatusCode = node.vcsStatusCode;
        if (vcsStatusCode === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED) {
          statusClass = 'status-modified';
        } else if (vcsStatusCode === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.ADDED) {
          statusClass = 'status-added';
        } else if (this.props.node.isIgnored) {
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

      var iconName = node.isCwd ? 'briefcase' : 'file-directory';
      var name = node.name;
      if (!node.isRoot) {
        name = (0, _libFileTreeFilterHelper.filterName)(name, node.highlightedText, node.isSelected);
      }

      return _reactForAtom.React.createElement(
        'li',
        {
          className: outerClassName + ' ' + statusClass },
        _reactForAtom.React.createElement(
          'div',
          {
            className: listItemClassName,
            ref: 'arrowContainer',
            onClick: this._onClick,
            onMouseDown: this._onMouseDown },
          _reactForAtom.React.createElement(
            'span',
            {
              className: 'icon name icon-' + iconName,
              ref: 'pathContainer',
              'data-name': node.name,
              'data-path': node.uri },
            this._renderCheckbox(),
            _reactForAtom.React.createElement(
              'span',
              {
                'data-name': node.name,
                'data-path': node.uri },
              name
            )
          ),
          this._renderConnectionTitle()
        ),
        this._renderChildren()
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
    key: '_renderChildren',
    value: function _renderChildren() {
      if (!this.props.node.isExpanded) {
        return;
      }

      var children = this.props.node.children.toArray().filter(function (childNode) {
        return childNode.shouldBeShown;
      }).map(function (childNode) {
        if (childNode.isContainer) {
          if (childNode.containsTrackedNode) {
            return _reactForAtom.React.createElement(DirectoryEntryComponent, { node: childNode, key: childNode.name, ref: 'tracked' });
          } else {
            return _reactForAtom.React.createElement(DirectoryEntryComponent, { node: childNode, key: childNode.name });
          }
        }

        if (childNode.containsTrackedNode) {
          return _reactForAtom.React.createElement(_FileEntryComponent.FileEntryComponent, { node: childNode, key: childNode.name, ref: 'tracked' });
        } else {
          return _reactForAtom.React.createElement(_FileEntryComponent.FileEntryComponent, { node: childNode, key: childNode.name });
        }
      });

      return _reactForAtom.React.createElement(
        'ul',
        { className: 'list-tree' },
        children
      );
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      event.stopPropagation();

      var deep = event.altKey;
      if (_reactForAtom.ReactDOM.findDOMNode(this.refs['arrowContainer']).contains(event.target) && event.clientX < _reactForAtom.ReactDOM.findDOMNode(this.refs['pathContainer']).getBoundingClientRect().left) {
        this._toggleNodeExpanded(deep);
        return;
      }

      var modifySelection = event.ctrlKey || event.metaKey;
      if (modifySelection) {
        if (this.props.node.isSelected) {
          getActions().unselectNode(this.props.node.rootUri, this.props.node.uri);
        } else {
          getActions().addSelectedNode(this.props.node.rootUri, this.props.node.uri);
        }
      } else {
        if (!this.props.node.isSelected) {
          getActions().setSelectedNode(this.props.node.rootUri, this.props.node.uri);
        }
        if (this.props.node.isSelected || this.props.node.conf.usePreviewTabs) {
          this._toggleNodeExpanded(deep);
        }
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

  return DirectoryEntryComponent;
})(_reactForAtom.React.Component);

exports.DirectoryEntryComponent = DirectoryEntryComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0NBYzRCLHdCQUF3Qjs7Ozs0QkFJN0MsZ0JBQWdCOzswQkFDQyxZQUFZOzs7O3VDQUNYLDZCQUE2Qjs7a0NBQ3pCLHdCQUF3Qjs7b0NBQzlCLCtCQUErQjs7cURBQ3ZCLG1EQUFtRDs7a0NBRWpELHNCQUFzQjs7QUFFdkQsSUFBTSxVQUFVLEdBQUcsZ0NBQWdCLFdBQVcsQ0FBQzs7SUFNbEMsdUJBQXVCO1lBQXZCLHVCQUF1Qjs7QUFJdkIsV0FKQSx1QkFBdUIsQ0FJdEIsS0FBWSxFQUFFOzBCQUpmLHVCQUF1Qjs7QUFLaEMsK0JBTFMsdUJBQXVCLDZDQUsxQixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEQsQUFBQyxRQUFJLENBQU8sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hELEFBQUMsUUFBSSxDQUFPLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEUsQUFBQyxRQUFJLENBQU8sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNqRTs7ZUFWVSx1QkFBdUI7O1dBWWIsK0JBQUMsU0FBaUIsRUFBRSxTQUFlLEVBQVc7QUFDakUsYUFBTyxTQUFTLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0tBQzNDOzs7V0FFb0IsaUNBQVM7OztBQUM1QixVQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7QUFDeEMsZUFBTztPQUNSOztBQUVELFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQzdCLFlBQUksSUFBSSxDQUFDLHdCQUF3QixJQUFJLElBQUksRUFBRTtBQUN6QyxpQkFBTztTQUNSOztBQUVELFlBQUksQ0FBQyx3QkFBd0IsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUMsWUFBTTtBQUNqRSxpQ0FBUyxXQUFXLENBQUMsTUFBSyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDM0UsZ0JBQUssd0JBQXdCLEdBQUcsSUFBSSxDQUFDO1NBQ3RDLENBQUMsQ0FBQztBQUNILGVBQU87T0FDUjs7QUFFRCxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFDLFVBQUksWUFBWSxJQUFJLElBQUksRUFBRTtBQUN4QixvQkFBWSxDQUFDLHFCQUFxQixFQUFFLENBQUM7T0FDdEM7S0FDRjs7O1dBRW1CLGdDQUFTO0FBQzNCLFVBQUksSUFBSSxDQUFDLHdCQUF3QixJQUFJLElBQUksRUFBRTtBQUN6QyxjQUFNLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7T0FDNUQ7S0FDRjs7O1dBRUssa0JBQWtCO0FBQ3RCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDOztBQUU3QixVQUFNLGNBQWMsR0FBRyw2QkFBVyxrQ0FBa0MsRUFBRTtBQUNwRSxtQ0FBMkIsRUFBRSxJQUFJLENBQUMsS0FBSztBQUN2QyxtQkFBVyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDN0Isa0JBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtBQUMzQixzQkFBYyxFQUFFLElBQUksQ0FBQyxNQUFNO0FBQzNCLGtCQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7T0FDNUIsQ0FBQyxDQUFDO0FBQ0gsVUFBTSxpQkFBaUIsR0FBRyw2QkFBVyxrQkFBa0IsRUFBRTtBQUN2RCxpQkFBUyxFQUFFLElBQUksQ0FBQyxTQUFTO0FBQ3pCLG9DQUE0QixFQUFFLElBQUksQ0FBQyxnQkFBZ0I7T0FDcEQsQ0FBQyxDQUFDOztBQUVILFVBQUksV0FBVyxZQUFBLENBQUM7QUFDaEIsVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7QUFDbEMsWUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUN6QyxZQUFJLGFBQWEsS0FBSyx3REFBaUIsUUFBUSxFQUFFO0FBQy9DLHFCQUFXLEdBQUcsaUJBQWlCLENBQUM7U0FDakMsTUFBTSxJQUFJLGFBQWEsS0FBSyx3REFBaUIsS0FBSyxFQUFFO0FBQ25ELHFCQUFXLEdBQUcsY0FBYyxDQUFDO1NBQzlCLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDcEMscUJBQVcsR0FBRyxnQkFBZ0IsQ0FBQztTQUNoQyxNQUFNO0FBQ0wscUJBQVcsR0FBRyxFQUFFLENBQUM7U0FDbEI7T0FDRixNQUFNO0FBQ0wsZ0JBQVEsSUFBSSxDQUFDLGFBQWE7QUFDeEIsZUFBSyxTQUFTO0FBQ1osdUJBQVcsR0FBRyxjQUFjLENBQUM7QUFDN0Isa0JBQU07QUFBQSxBQUNSLGVBQUssU0FBUztBQUNaLHVCQUFXLEdBQUcsaUJBQWlCLENBQUM7QUFDaEMsa0JBQU07QUFBQSxBQUNSO0FBQ0UsdUJBQVcsR0FBRyxFQUFFLENBQUM7QUFDakIsa0JBQU07QUFBQSxTQUNUO09BQ0Y7O0FBRUQsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLEdBQUcsZ0JBQWdCLENBQUM7QUFDN0QsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNyQixVQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNoQixZQUFJLEdBQUcseUNBQVcsSUFBSSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQ2hFOztBQUVELGFBQ0U7OztBQUNFLG1CQUFTLEVBQUssY0FBYyxTQUFJLFdBQVcsQUFBRztRQUM5Qzs7O0FBQ0UscUJBQVMsRUFBRSxpQkFBaUIsQUFBQztBQUM3QixlQUFHLEVBQUMsZ0JBQWdCO0FBQ3BCLG1CQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQUFBQztBQUN2Qix1QkFBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEFBQUM7VUFDL0I7OztBQUNFLHVCQUFTLHNCQUFvQixRQUFRLEFBQUc7QUFDeEMsaUJBQUcsRUFBQyxlQUFlO0FBQ25CLDJCQUFXLElBQUksQ0FBQyxJQUFJLEFBQUM7QUFDckIsMkJBQVcsSUFBSSxDQUFDLEdBQUcsQUFBQztZQUNuQixJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3ZCOzs7QUFDRSw2QkFBVyxJQUFJLENBQUMsSUFBSSxBQUFDO0FBQ3JCLDZCQUFXLElBQUksQ0FBQyxHQUFHLEFBQUM7Y0FDbkIsSUFBSTthQUNBO1dBQ0Y7VUFDTixJQUFJLENBQUMsc0JBQXNCLEVBQUU7U0FDMUI7UUFDTCxJQUFJLENBQUMsZUFBZSxFQUFFO09BQ3BCLENBQ0w7S0FDSDs7O1dBRWMsMkJBQW1CO0FBQ2hDLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7QUFDN0MsZUFBTztPQUNSOztBQUVELGFBQ0U7QUFDRSxlQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVMsQUFBQztBQUNyRCxxQkFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLEFBQUM7QUFDM0QsZ0JBQVEsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEFBQUM7QUFDakMsZUFBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQUFBQztRQUMvQixDQUNGO0tBQ0g7OztXQUVxQixrQ0FBbUI7QUFDdkMsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUMzQixlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO0FBQzlDLFVBQUksS0FBSyxLQUFLLEVBQUUsRUFBRTtBQUNoQixlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELGFBQ0U7O1VBQU0sU0FBUyxFQUFDLDhDQUE4QztRQUMzRCxLQUFLO09BQ0QsQ0FDUDtLQUNIOzs7V0FFYywyQkFBbUI7QUFDaEMsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUMvQixlQUFPO09BQ1I7O0FBRUQsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUNsRCxNQUFNLENBQUMsVUFBQSxTQUFTO2VBQUksU0FBUyxDQUFDLGFBQWE7T0FBQSxDQUFDLENBQzVDLEdBQUcsQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUNoQixZQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUU7QUFDekIsY0FBSSxTQUFTLENBQUMsbUJBQW1CLEVBQUU7QUFDakMsbUJBQU8sa0NBQUMsdUJBQXVCLElBQUMsSUFBSSxFQUFFLFNBQVMsQUFBQyxFQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsSUFBSSxBQUFDLEVBQUMsR0FBRyxFQUFDLFNBQVMsR0FBRyxDQUFDO1dBQ3hGLE1BQU07QUFDTCxtQkFBTyxrQ0FBQyx1QkFBdUIsSUFBQyxJQUFJLEVBQUUsU0FBUyxBQUFDLEVBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxJQUFJLEFBQUMsR0FBRyxDQUFDO1dBQzFFO1NBQ0Y7O0FBRUQsWUFBSSxTQUFTLENBQUMsbUJBQW1CLEVBQUU7QUFDakMsaUJBQU8sNEVBQW9CLElBQUksRUFBRSxTQUFTLEFBQUMsRUFBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLElBQUksQUFBQyxFQUFDLEdBQUcsRUFBQyxTQUFTLEdBQUcsQ0FBQztTQUNuRixNQUFNO0FBQ0wsaUJBQU8sNEVBQW9CLElBQUksRUFBRSxTQUFTLEFBQUMsRUFBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLElBQUksQUFBQyxHQUFHLENBQUM7U0FDckU7T0FDRixDQUFDLENBQUM7O0FBRUgsYUFDRTs7VUFBSSxTQUFTLEVBQUMsV0FBVztRQUN0QixRQUFRO09BQ04sQ0FDTDtLQUNIOzs7V0FFTyxrQkFBQyxLQUEwQixFQUFFO0FBQ25DLFdBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7QUFFeEIsVUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMxQixVQUNFLHVCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUNyRSxLQUFLLENBQUMsT0FBTyxHQUFHLHVCQUFTLFdBQVcsQ0FDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxFQUMxRDtBQUNBLFlBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixlQUFPO09BQ1I7O0FBRUQsVUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ3ZELFVBQUksZUFBZSxFQUFFO0FBQ25CLFlBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQzlCLG9CQUFVLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3pFLE1BQU07QUFDTCxvQkFBVSxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM1RTtPQUNGLE1BQU07QUFDTCxZQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQy9CLG9CQUFVLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzVFO0FBQ0QsWUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNyRSxjQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDaEM7T0FDRjtLQUNGOzs7V0FFVyxzQkFBQyxLQUEwQixFQUFFO0FBQ3ZDLFdBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7O0FBR3hCLFVBQUksd0NBQWUsS0FBSyxDQUFDLEVBQUU7QUFDekIsWUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUMvQixvQkFBVSxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM1RTtPQUNGO0tBQ0Y7OztXQUVrQiw2QkFBQyxJQUFhLEVBQVE7QUFDdkMsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDOUIsWUFBSSxJQUFJLEVBQUU7QUFDUixvQkFBVSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzdFLE1BQU07QUFDTCxvQkFBVSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6RTtPQUNGLE1BQU07QUFDTCxZQUFJLElBQUksRUFBRTtBQUNSLG9CQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzNFLE1BQU07QUFDTCxvQkFBVSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN2RTtPQUNGO0tBQ0Y7OztXQUVnQiwyQkFBQyxTQUFrQixFQUFRO0FBQzFDLFVBQUksU0FBUyxFQUFFO0FBQ2Isa0JBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDdEUsTUFBTTtBQUNMLGtCQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3hFO0tBQ0Y7OztXQUVlLDBCQUFDLEtBQVksRUFBUTtBQUNuQyxXQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7S0FDekI7OztTQXZQVSx1QkFBdUI7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuXG5pbXBvcnQgdHlwZSB7RmlsZVRyZWVOb2RlfSBmcm9tICcuLi9saWIvRmlsZVRyZWVOb2RlJztcblxuaW1wb3J0IEZpbGVUcmVlQWN0aW9ucyBmcm9tICcuLi9saWIvRmlsZVRyZWVBY3Rpb25zJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAgJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtmaWx0ZXJOYW1lfSBmcm9tICcuLi9saWIvRmlsZVRyZWVGaWx0ZXJIZWxwZXInO1xuaW1wb3J0IHtpc0NvbnRleHRDbGlja30gZnJvbSAnLi4vbGliL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQge0NoZWNrYm94fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9DaGVja2JveCc7XG5pbXBvcnQge1N0YXR1c0NvZGVOdW1iZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuXG5pbXBvcnQge0ZpbGVFbnRyeUNvbXBvbmVudH0gZnJvbSAnLi9GaWxlRW50cnlDb21wb25lbnQnO1xuXG5jb25zdCBnZXRBY3Rpb25zID0gRmlsZVRyZWVBY3Rpb25zLmdldEluc3RhbmNlO1xuXG50eXBlIFByb3BzID0ge1xuICBub2RlOiBGaWxlVHJlZU5vZGU7XG59O1xuXG5leHBvcnQgY2xhc3MgRGlyZWN0b3J5RW50cnlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIF9hbmltYXRpb25GcmFtZVJlcXVlc3RJZDogP251bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uTW91c2VEb3duID0gdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tib3hPbkNoYW5nZSA9IHRoaXMuX2NoZWNrYm94T25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tib3hPbkNsaWNrID0gdGhpcy5fY2hlY2tib3hPbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogdm9pZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBuZXh0UHJvcHMubm9kZSAhPT0gdGhpcy5wcm9wcy5ub2RlO1xuICB9XG5cbiAgc2Nyb2xsVHJhY2tlZEludG9WaWV3KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmNvbnRhaW5zVHJhY2tlZE5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5ub2RlLmlzVHJhY2tlZCkge1xuICAgICAgaWYgKHRoaXMuX2FuaW1hdGlvbkZyYW1lUmVxdWVzdElkICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9hbmltYXRpb25GcmFtZVJlcXVlc3RJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2Fycm93Q29udGFpbmVyJ10pLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoKTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRnJhbWVSZXF1ZXN0SWQgPSBudWxsO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdHJhY2tlZENoaWxkID0gdGhpcy5yZWZzWyd0cmFja2VkJ107XG4gICAgaWYgKHRyYWNrZWRDaGlsZCAhPSBudWxsKSB7XG4gICAgICB0cmFja2VkQ2hpbGQuc2Nyb2xsVHJhY2tlZEludG9WaWV3KCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FuaW1hdGlvbkZyYW1lUmVxdWVzdElkICE9IG51bGwpIHtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRpb25GcmFtZVJlcXVlc3RJZCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLnByb3BzLm5vZGU7XG5cbiAgICBjb25zdCBvdXRlckNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ2RpcmVjdG9yeSBlbnRyeSBsaXN0LW5lc3RlZC1pdGVtJywge1xuICAgICAgJ2N1cnJlbnQtd29ya2luZy1kaXJlY3RvcnknOiBub2RlLmlzQ3dkLFxuICAgICAgJ2NvbGxhcHNlZCc6ICFub2RlLmlzRXhwYW5kZWQsXG4gICAgICAnZXhwYW5kZWQnOiBub2RlLmlzRXhwYW5kZWQsXG4gICAgICAncHJvamVjdC1yb290Jzogbm9kZS5pc1Jvb3QsXG4gICAgICAnc2VsZWN0ZWQnOiBub2RlLmlzU2VsZWN0ZWQsXG4gICAgfSk7XG4gICAgY29uc3QgbGlzdEl0ZW1DbGFzc05hbWUgPSBjbGFzc25hbWVzKCdoZWFkZXIgbGlzdC1pdGVtJywge1xuICAgICAgJ2xvYWRpbmcnOiBub2RlLmlzTG9hZGluZyxcbiAgICAgICdudWNsaWRlLWZpbGUtdHJlZS1zb2Z0ZW5lZCc6IG5vZGUuc2hvdWxkQmVTb2Z0ZW5lZCxcbiAgICB9KTtcblxuICAgIGxldCBzdGF0dXNDbGFzcztcbiAgICBpZiAoIW5vZGUuY29uZi5pc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICBjb25zdCB2Y3NTdGF0dXNDb2RlID0gbm9kZS52Y3NTdGF0dXNDb2RlO1xuICAgICAgaWYgKHZjc1N0YXR1c0NvZGUgPT09IFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQpIHtcbiAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLW1vZGlmaWVkJztcbiAgICAgIH0gZWxzZSBpZiAodmNzU3RhdHVzQ29kZSA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCkge1xuICAgICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtYWRkZWQnO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLm5vZGUuaXNJZ25vcmVkKSB7XG4gICAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1pZ25vcmVkJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXR1c0NsYXNzID0gJyc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXRjaCAobm9kZS5jaGVja2VkU3RhdHVzKSB7XG4gICAgICAgIGNhc2UgJ2NoZWNrZWQnOlxuICAgICAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1hZGRlZCc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3BhcnRpYWwnOlxuICAgICAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1tb2RpZmllZCc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgc3RhdHVzQ2xhc3MgPSAnJztcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpY29uTmFtZSA9IG5vZGUuaXNDd2QgPyAnYnJpZWZjYXNlJyA6ICdmaWxlLWRpcmVjdG9yeSc7XG4gICAgbGV0IG5hbWUgPSBub2RlLm5hbWU7XG4gICAgaWYgKCFub2RlLmlzUm9vdCkge1xuICAgICAgbmFtZSA9IGZpbHRlck5hbWUobmFtZSwgbm9kZS5oaWdobGlnaHRlZFRleHQsIG5vZGUuaXNTZWxlY3RlZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxsaVxuICAgICAgICBjbGFzc05hbWU9e2Ake291dGVyQ2xhc3NOYW1lfSAke3N0YXR1c0NsYXNzfWB9PlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtsaXN0SXRlbUNsYXNzTmFtZX1cbiAgICAgICAgICByZWY9XCJhcnJvd0NvbnRhaW5lclwiXG4gICAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja31cbiAgICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5fb25Nb3VzZURvd259PlxuICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICBjbGFzc05hbWU9e2BpY29uIG5hbWUgaWNvbi0ke2ljb25OYW1lfWB9XG4gICAgICAgICAgICByZWY9XCJwYXRoQ29udGFpbmVyXCJcbiAgICAgICAgICAgIGRhdGEtbmFtZT17bm9kZS5uYW1lfVxuICAgICAgICAgICAgZGF0YS1wYXRoPXtub2RlLnVyaX0+XG4gICAgICAgICAgICB7dGhpcy5fcmVuZGVyQ2hlY2tib3goKX1cbiAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgIGRhdGEtbmFtZT17bm9kZS5uYW1lfVxuICAgICAgICAgICAgICBkYXRhLXBhdGg9e25vZGUudXJpfT5cbiAgICAgICAgICAgICAge25hbWV9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIHt0aGlzLl9yZW5kZXJDb25uZWN0aW9uVGl0bGUoKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJDaGlsZHJlbigpfVxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckNoZWNrYm94KCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBpZiAoIXRoaXMucHJvcHMubm9kZS5jb25mLmlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPENoZWNrYm94XG4gICAgICAgIGNoZWNrZWQ9e3RoaXMucHJvcHMubm9kZS5jaGVja2VkU3RhdHVzID09PSAnY2hlY2tlZCd9XG4gICAgICAgIGluZGV0ZXJtaW5hdGU9e3RoaXMucHJvcHMubm9kZS5jaGVja2VkU3RhdHVzID09PSAncGFydGlhbCd9XG4gICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9jaGVja2JveE9uQ2hhbmdlfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9jaGVja2JveE9uQ2xpY2t9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyQ29ubmVjdGlvblRpdGxlKCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBpZiAoIXRoaXMucHJvcHMubm9kZS5pc1Jvb3QpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0aXRsZSA9IHRoaXMucHJvcHMubm9kZS5jb25uZWN0aW9uVGl0bGU7XG4gICAgaWYgKHRpdGxlID09PSAnJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlLWNvbm5lY3Rpb24tdGl0bGUgaGlnaGxpZ2h0XCI+XG4gICAgICAgIHt0aXRsZX1cbiAgICAgIDwvc3Bhbj5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckNoaWxkcmVuKCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBpZiAoIXRoaXMucHJvcHMubm9kZS5pc0V4cGFuZGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnByb3BzLm5vZGUuY2hpbGRyZW4udG9BcnJheSgpXG4gICAgLmZpbHRlcihjaGlsZE5vZGUgPT4gY2hpbGROb2RlLnNob3VsZEJlU2hvd24pXG4gICAgLm1hcChjaGlsZE5vZGUgPT4ge1xuICAgICAgaWYgKGNoaWxkTm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICBpZiAoY2hpbGROb2RlLmNvbnRhaW5zVHJhY2tlZE5vZGUpIHtcbiAgICAgICAgICByZXR1cm4gPERpcmVjdG9yeUVudHJ5Q29tcG9uZW50IG5vZGU9e2NoaWxkTm9kZX0ga2V5PXtjaGlsZE5vZGUubmFtZX0gcmVmPVwidHJhY2tlZFwiIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiA8RGlyZWN0b3J5RW50cnlDb21wb25lbnQgbm9kZT17Y2hpbGROb2RlfSBrZXk9e2NoaWxkTm9kZS5uYW1lfSAvPjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY2hpbGROb2RlLmNvbnRhaW5zVHJhY2tlZE5vZGUpIHtcbiAgICAgICAgcmV0dXJuIDxGaWxlRW50cnlDb21wb25lbnQgbm9kZT17Y2hpbGROb2RlfSBrZXk9e2NoaWxkTm9kZS5uYW1lfSByZWY9XCJ0cmFja2VkXCIgLz47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gPEZpbGVFbnRyeUNvbXBvbmVudCBub2RlPXtjaGlsZE5vZGV9IGtleT17Y2hpbGROb2RlLm5hbWV9IC8+O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG5cbiAgX29uQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIGNvbnN0IGRlZXAgPSBldmVudC5hbHRLZXk7XG4gICAgaWYgKFxuICAgICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydhcnJvd0NvbnRhaW5lciddKS5jb250YWlucyhldmVudC50YXJnZXQpXG4gICAgICAmJiBldmVudC5jbGllbnRYIDwgUmVhY3RET00uZmluZERPTU5vZGUoXG4gICAgICAgIHRoaXMucmVmc1sncGF0aENvbnRhaW5lciddKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0XG4gICAgKSB7XG4gICAgICB0aGlzLl90b2dnbGVOb2RlRXhwYW5kZWQoZGVlcCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbW9kaWZ5U2VsZWN0aW9uID0gZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5O1xuICAgIGlmIChtb2RpZnlTZWxlY3Rpb24pIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkudW5zZWxlY3ROb2RlKHRoaXMucHJvcHMubm9kZS5yb290VXJpLCB0aGlzLnByb3BzLm5vZGUudXJpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5hZGRTZWxlY3RlZE5vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMubm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5zZXRTZWxlY3RlZE5vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucHJvcHMubm9kZS5pc1NlbGVjdGVkIHx8IHRoaXMucHJvcHMubm9kZS5jb25mLnVzZVByZXZpZXdUYWJzKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZU5vZGVFeHBhbmRlZChkZWVwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfb25Nb3VzZURvd24oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIC8vIFNlbGVjdCBub2RlIG9uIHJpZ2h0LWNsaWNrIChpbiBvcmRlciBmb3IgY29udGV4dCBtZW51IHRvIGJlaGF2ZSBjb3JyZWN0bHkpLlxuICAgIGlmIChpc0NvbnRleHRDbGljayhldmVudCkpIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLnNldFNlbGVjdGVkTm9kZSh0aGlzLnByb3BzLm5vZGUucm9vdFVyaSwgdGhpcy5wcm9wcy5ub2RlLnVyaSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3RvZ2dsZU5vZGVFeHBhbmRlZChkZWVwOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMubm9kZS5pc0V4cGFuZGVkKSB7XG4gICAgICBpZiAoZGVlcCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkuY29sbGFwc2VOb2RlRGVlcCh0aGlzLnByb3BzLm5vZGUucm9vdFVyaSwgdGhpcy5wcm9wcy5ub2RlLnVyaSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnZXRBY3Rpb25zKCkuY29sbGFwc2VOb2RlKHRoaXMucHJvcHMubm9kZS5yb290VXJpLCB0aGlzLnByb3BzLm5vZGUudXJpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmV4cGFuZE5vZGVEZWVwKHRoaXMucHJvcHMubm9kZS5yb290VXJpLCB0aGlzLnByb3BzLm5vZGUudXJpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5leHBhbmROb2RlKHRoaXMucHJvcHMubm9kZS5yb290VXJpLCB0aGlzLnByb3BzLm5vZGUudXJpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfY2hlY2tib3hPbkNoYW5nZShpc0NoZWNrZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoaXNDaGVja2VkKSB7XG4gICAgICBnZXRBY3Rpb25zKCkuY2hlY2tOb2RlKHRoaXMucHJvcHMubm9kZS5yb290VXJpLCB0aGlzLnByb3BzLm5vZGUudXJpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2V0QWN0aW9ucygpLnVuY2hlY2tOb2RlKHRoaXMucHJvcHMubm9kZS5yb290VXJpLCB0aGlzLnByb3BzLm5vZGUudXJpKTtcbiAgICB9XG4gIH1cblxuICBfY2hlY2tib3hPbkNsaWNrKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9XG59XG4iXX0=