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
              node.name
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpcmVjdG9yeUVudHJ5Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0NBYzRCLHdCQUF3Qjs7Ozs0QkFJN0MsZ0JBQWdCOzswQkFDQyxZQUFZOzs7O2tDQUNQLHdCQUF3Qjs7b0NBQzlCLCtCQUErQjs7cURBQ3ZCLG1EQUFtRDs7a0NBRWpELHNCQUFzQjs7QUFFdkQsSUFBTSxVQUFVLEdBQUcsZ0NBQWdCLFdBQVcsQ0FBQzs7SUFPbEMsdUJBQXVCO1lBQXZCLHVCQUF1Qjs7QUFJdkIsV0FKQSx1QkFBdUIsQ0FJdEIsS0FBWSxFQUFFOzBCQUpmLHVCQUF1Qjs7QUFLaEMsK0JBTFMsdUJBQXVCLDZDQUsxQixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEQsQUFBQyxRQUFJLENBQU8sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hELEFBQUMsUUFBSSxDQUFPLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEUsQUFBQyxRQUFJLENBQU8sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNqRTs7ZUFWVSx1QkFBdUI7O1dBWWIsK0JBQUMsU0FBaUIsRUFBRSxTQUFlLEVBQVc7QUFDakUsYUFBTyxTQUFTLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0tBQzNDOzs7V0FFb0IsaUNBQVM7OztBQUM1QixVQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7QUFDeEMsZUFBTztPQUNSOztBQUVELFVBQUksSUFBSSxDQUFDLEtBQUss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SyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMzRSxNQUFNO0FBQ0wsb0JBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdkU7T0FDRjtLQUNGOzs7V0FFZ0IsMkJBQUMsU0FBa0IsRUFBUTtBQUMxQyxVQUFJLFNBQVMsRUFBRTtBQUNiLGtCQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3RFLE1BQU07QUFDTCxrQkFBVSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUN4RTtLQUNGOzs7V0FFZSwwQkFBQyxLQUFZLEVBQVE7QUFDbkMsV0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO0tBQ3pCOzs7U0FuUFUsdUJBQXVCO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJEaXJlY3RvcnlFbnRyeUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuaW1wb3J0IHR5cGUge0ZpbGVUcmVlTm9kZX0gZnJvbSAnLi4vbGliL0ZpbGVUcmVlTm9kZSc7XG5cbmltcG9ydCBGaWxlVHJlZUFjdGlvbnMgZnJvbSAnLi4vbGliL0ZpbGVUcmVlQWN0aW9ucyc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gICdjbGFzc25hbWVzJztcbmltcG9ydCB7aXNDb250ZXh0Q2xpY2t9IGZyb20gJy4uL2xpYi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IHtDaGVja2JveH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQ2hlY2tib3gnO1xuaW1wb3J0IHtTdGF0dXNDb2RlTnVtYmVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuaW1wb3J0IHtGaWxlRW50cnlDb21wb25lbnR9IGZyb20gJy4vRmlsZUVudHJ5Q29tcG9uZW50JztcblxuY29uc3QgZ2V0QWN0aW9ucyA9IEZpbGVUcmVlQWN0aW9ucy5nZXRJbnN0YW5jZTtcblxuXG50eXBlIFByb3BzID0ge1xuICBub2RlOiBGaWxlVHJlZU5vZGU7XG59O1xuXG5leHBvcnQgY2xhc3MgRGlyZWN0b3J5RW50cnlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIF9hbmltYXRpb25GcmFtZVJlcXVlc3RJZDogP251bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uTW91c2VEb3duID0gdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tib3hPbkNoYW5nZSA9IHRoaXMuX2NoZWNrYm94T25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tib3hPbkNsaWNrID0gdGhpcy5fY2hlY2tib3hPbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogdm9pZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBuZXh0UHJvcHMubm9kZSAhPT0gdGhpcy5wcm9wcy5ub2RlO1xuICB9XG5cbiAgc2Nyb2xsVHJhY2tlZEludG9WaWV3KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmNvbnRhaW5zVHJhY2tlZE5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5ub2RlLmlzVHJhY2tlZCkge1xuICAgICAgaWYgKHRoaXMuX2FuaW1hdGlvbkZyYW1lUmVxdWVzdElkICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9hbmltYXRpb25GcmFtZVJlcXVlc3RJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2Fycm93Q29udGFpbmVyJ10pLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoKTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRnJhbWVSZXF1ZXN0SWQgPSBudWxsO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdHJhY2tlZENoaWxkID0gdGhpcy5yZWZzWyd0cmFja2VkJ107XG4gICAgaWYgKHRyYWNrZWRDaGlsZCAhPSBudWxsKSB7XG4gICAgICB0cmFja2VkQ2hpbGQuc2Nyb2xsVHJhY2tlZEludG9WaWV3KCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FuaW1hdGlvbkZyYW1lUmVxdWVzdElkICE9IG51bGwpIHtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRpb25GcmFtZVJlcXVlc3RJZCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMucHJvcHMubm9kZTtcblxuICAgIGNvbnN0IG91dGVyQ2xhc3NOYW1lID0gY2xhc3NuYW1lcygnZGlyZWN0b3J5IGVudHJ5IGxpc3QtbmVzdGVkLWl0ZW0nLCB7XG4gICAgICAnY3VycmVudC13b3JraW5nLWRpcmVjdG9yeSc6IG5vZGUuaXNDd2QsXG4gICAgICAnY29sbGFwc2VkJzogIW5vZGUuaXNFeHBhbmRlZCxcbiAgICAgICdleHBhbmRlZCc6IG5vZGUuaXNFeHBhbmRlZCxcbiAgICAgICdwcm9qZWN0LXJvb3QnOiBub2RlLmlzUm9vdCxcbiAgICAgICdzZWxlY3RlZCc6IG5vZGUuaXNTZWxlY3RlZCxcbiAgICB9KTtcbiAgICBjb25zdCBsaXN0SXRlbUNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ2hlYWRlciBsaXN0LWl0ZW0nLCB7XG4gICAgICAnbG9hZGluZyc6IG5vZGUuaXNMb2FkaW5nLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLXNvZnRlbmVkJzogbm9kZS5zaG91bGRCZVNvZnRlbmVkLFxuICAgIH0pO1xuXG4gICAgbGV0IHN0YXR1c0NsYXNzO1xuICAgIGlmICghbm9kZS5jb25mLmlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIGNvbnN0IHZjc1N0YXR1c0NvZGUgPSBub2RlLnZjc1N0YXR1c0NvZGU7XG4gICAgICBpZiAodmNzU3RhdHVzQ29kZSA9PT0gU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRCkge1xuICAgICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtbW9kaWZpZWQnO1xuICAgICAgfSBlbHNlIGlmICh2Y3NTdGF0dXNDb2RlID09PSBTdGF0dXNDb2RlTnVtYmVyLkFEREVEKSB7XG4gICAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1hZGRlZCc7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMubm9kZS5pc0lnbm9yZWQpIHtcbiAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLWlnbm9yZWQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdHVzQ2xhc3MgPSAnJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoIChub2RlLmNoZWNrZWRTdGF0dXMpIHtcbiAgICAgICAgY2FzZSAnY2hlY2tlZCc6XG4gICAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLWFkZGVkJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGFydGlhbCc6XG4gICAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLW1vZGlmaWVkJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBzdGF0dXNDbGFzcyA9ICcnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGljb25OYW1lID0gbm9kZS5pc0N3ZCA/ICdicmllZmNhc2UnIDogJ2ZpbGUtZGlyZWN0b3J5JztcblxuICAgIHJldHVybiAoXG4gICAgICA8bGlcbiAgICAgICAgY2xhc3NOYW1lPXtgJHtvdXRlckNsYXNzTmFtZX0gJHtzdGF0dXNDbGFzc31gfT5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzTmFtZT17bGlzdEl0ZW1DbGFzc05hbWV9XG4gICAgICAgICAgcmVmPVwiYXJyb3dDb250YWluZXJcIlxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9XG4gICAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX29uTW91c2VEb3dufT5cbiAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgaWNvbiBuYW1lIGljb24tJHtpY29uTmFtZX1gfVxuICAgICAgICAgICAgcmVmPVwicGF0aENvbnRhaW5lclwiXG4gICAgICAgICAgICBkYXRhLW5hbWU9e25vZGUubmFtZX1cbiAgICAgICAgICAgIGRhdGEtcGF0aD17bm9kZS51cml9PlxuICAgICAgICAgICAge3RoaXMuX3JlbmRlckNoZWNrYm94KCl9XG4gICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICBkYXRhLW5hbWU9e25vZGUubmFtZX1cbiAgICAgICAgICAgICAgZGF0YS1wYXRoPXtub2RlLnVyaX0+XG4gICAgICAgICAgICAgIHtub2RlLm5hbWV9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIHt0aGlzLl9yZW5kZXJDb25uZWN0aW9uVGl0bGUoKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHt0aGlzLl9yZW5kZXJDaGlsZHJlbigpfVxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckNoZWNrYm94KCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBpZiAoIXRoaXMucHJvcHMubm9kZS5jb25mLmlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPENoZWNrYm94XG4gICAgICAgIGNoZWNrZWQ9e3RoaXMucHJvcHMubm9kZS5jaGVja2VkU3RhdHVzID09PSAnY2hlY2tlZCd9XG4gICAgICAgIGluZGV0ZXJtaW5hdGU9e3RoaXMucHJvcHMubm9kZS5jaGVja2VkU3RhdHVzID09PSAncGFydGlhbCd9XG4gICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9jaGVja2JveE9uQ2hhbmdlfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9jaGVja2JveE9uQ2xpY2t9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyQ29ubmVjdGlvblRpdGxlKCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBpZiAoIXRoaXMucHJvcHMubm9kZS5pc1Jvb3QpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0aXRsZSA9IHRoaXMucHJvcHMubm9kZS5jb25uZWN0aW9uVGl0bGU7XG4gICAgaWYgKHRpdGxlID09PSAnJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlLWNvbm5lY3Rpb24tdGl0bGUgaGlnaGxpZ2h0XCI+XG4gICAgICAgIHt0aXRsZX1cbiAgICAgIDwvc3Bhbj5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckNoaWxkcmVuKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmlzRXhwYW5kZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMucHJvcHMubm9kZS5jaGlsZHJlbi50b0FycmF5KClcbiAgICAuZmlsdGVyKGNoaWxkTm9kZSA9PiBjaGlsZE5vZGUuc2hvdWxkQmVTaG93bilcbiAgICAubWFwKGNoaWxkTm9kZSA9PiB7XG4gICAgICBpZiAoY2hpbGROb2RlLmlzQ29udGFpbmVyKSB7XG4gICAgICAgIGlmIChjaGlsZE5vZGUuY29udGFpbnNUcmFja2VkTm9kZSkge1xuICAgICAgICAgIHJldHVybiA8RGlyZWN0b3J5RW50cnlDb21wb25lbnQgbm9kZT17Y2hpbGROb2RlfSBrZXk9e2NoaWxkTm9kZS5uYW1lfSByZWY9XCJ0cmFja2VkXCIgLz47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIDxEaXJlY3RvcnlFbnRyeUNvbXBvbmVudCBub2RlPXtjaGlsZE5vZGV9IGtleT17Y2hpbGROb2RlLm5hbWV9IC8+O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjaGlsZE5vZGUuY29udGFpbnNUcmFja2VkTm9kZSkge1xuICAgICAgICByZXR1cm4gPEZpbGVFbnRyeUNvbXBvbmVudCBub2RlPXtjaGlsZE5vZGV9IGtleT17Y2hpbGROb2RlLm5hbWV9IHJlZj1cInRyYWNrZWRcIiAvPjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiA8RmlsZUVudHJ5Q29tcG9uZW50IG5vZGU9e2NoaWxkTm9kZX0ga2V5PXtjaGlsZE5vZGUubmFtZX0gLz47XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtdHJlZVwiPlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH1cblxuICBfb25DbGljayhldmVudDogU3ludGhldGljTW91c2VFdmVudCkge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgY29uc3QgZGVlcCA9IGV2ZW50LmFsdEtleTtcbiAgICBpZiAoXG4gICAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2Fycm93Q29udGFpbmVyJ10pLmNvbnRhaW5zKGV2ZW50LnRhcmdldClcbiAgICAgICYmIGV2ZW50LmNsaWVudFggPCBSZWFjdERPTS5maW5kRE9NTm9kZShcbiAgICAgICAgdGhpcy5yZWZzWydwYXRoQ29udGFpbmVyJ10pLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnRcbiAgICApIHtcbiAgICAgIHRoaXMuX3RvZ2dsZU5vZGVFeHBhbmRlZChkZWVwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtb2RpZnlTZWxlY3Rpb24gPSBldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXk7XG4gICAgaWYgKG1vZGlmeVNlbGVjdGlvbikge1xuICAgICAgaWYgKHRoaXMucHJvcHMubm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS51bnNlbGVjdE5vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmFkZFNlbGVjdGVkTm9kZSh0aGlzLnByb3BzLm5vZGUucm9vdFVyaSwgdGhpcy5wcm9wcy5ub2RlLnVyaSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLnNldFNlbGVjdGVkTm9kZSh0aGlzLnByb3BzLm5vZGUucm9vdFVyaSwgdGhpcy5wcm9wcy5ub2RlLnVyaSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wcm9wcy5ub2RlLmlzU2VsZWN0ZWQgfHwgdGhpcy5wcm9wcy5ub2RlLmNvbmYudXNlUHJldmlld1RhYnMpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlTm9kZUV4cGFuZGVkKGRlZXApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9vbk1vdXNlRG93bihldmVudDogU3ludGhldGljTW91c2VFdmVudCkge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgLy8gU2VsZWN0IG5vZGUgb24gcmlnaHQtY2xpY2sgKGluIG9yZGVyIGZvciBjb250ZXh0IG1lbnUgdG8gYmVoYXZlIGNvcnJlY3RseSkuXG4gICAgaWYgKGlzQ29udGV4dENsaWNrKGV2ZW50KSkge1xuICAgICAgaWYgKCF0aGlzLnByb3BzLm5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkuc2V0U2VsZWN0ZWROb2RlKHRoaXMucHJvcHMubm9kZS5yb290VXJpLCB0aGlzLnByb3BzLm5vZGUudXJpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdG9nZ2xlTm9kZUV4cGFuZGVkKGRlZXA6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wcm9wcy5ub2RlLmlzRXhwYW5kZWQpIHtcbiAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5jb2xsYXBzZU5vZGVEZWVwKHRoaXMucHJvcHMubm9kZS5yb290VXJpLCB0aGlzLnByb3BzLm5vZGUudXJpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5jb2xsYXBzZU5vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZGVlcCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkuZXhwYW5kTm9kZURlZXAodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmV4cGFuZE5vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9jaGVja2JveE9uQ2hhbmdlKGlzQ2hlY2tlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChpc0NoZWNrZWQpIHtcbiAgICAgIGdldEFjdGlvbnMoKS5jaGVja05vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZXRBY3Rpb25zKCkudW5jaGVja05vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgIH1cbiAgfVxuXG4gIF9jaGVja2JveE9uQ2xpY2soZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn1cbiJdfQ==