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

var _libFileTreeHelpers = require('../lib/FileTreeHelpers');

var _nuclideUiLibCheckbox = require('../../nuclide-ui/lib/Checkbox');

var _nuclideHgRepositoryBaseLibHgConstants = require('../../nuclide-hg-repository-base/lib/hg-constants');

var getActions = _libFileTreeActions2['default'].getInstance;

var FileEntryComponent = (function (_React$Component) {
  _inherits(FileEntryComponent, _React$Component);

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
      return this.props.node !== nextProps.node;
    }
  }, {
    key: 'scrollTrackedIntoView',
    value: function scrollTrackedIntoView() {
      var _this = this;

      if (this.props.node.isTracked) {
        if (this._animationFrameRequestId != null) {
          return;
        }

        this._animationFrameRequestId = window.requestAnimationFrame(function () {
          _reactForAtom.ReactDOM.findDOMNode(_this).scrollIntoViewIfNeeded();
          _this._animationFrameRequestId = null;
        });
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
      var outerClassName = (0, _classnames2['default'])('entry file list-item', {
        'selected': this.props.node.isSelected,
        'nuclide-file-tree-softened': this.props.node.shouldBeSoftened
      });

      var statusClass = undefined;
      if (!this.props.node.conf.isEditingWorkingSet) {
        var vcsStatusCode = this.props.node.vcsStatusCode;
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
        switch (this.props.node.checkedStatus) {
          case 'checked':
            statusClass = 'status-added';
            break;
          default:
            statusClass = '';
            break;
        }
      }

      return _reactForAtom.React.createElement(
        'li',
        {
          className: outerClassName + ' ' + statusClass,
          onClick: this._onClick,
          onMouseDown: this._onMouseDown,
          onDoubleClick: this._onDoubleClick },
        _reactForAtom.React.createElement(
          'span',
          {
            className: 'icon name ' + (0, _nuclideAtomHelpers.fileTypeClass)(this.props.node.name),
            'data-name': this.props.node.name,
            'data-path': this.props.node.uri },
          this._renderCheckbox(),
          _reactForAtom.React.createElement(
            'span',
            {
              'data-name': this.props.node.name,
              'data-path': this.props.node.uri },
            this.props.node.name
          )
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
        onChange: this._checkboxOnChange,
        onClick: this._checkboxOnClick
      });
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      event.stopPropagation();

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
        if (this.props.node.conf.usePreviewTabs) {
          getActions().confirmNode(this.props.node.rootUri, this.props.node.uri);
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
    key: '_onDoubleClick',
    value: function _onDoubleClick(event) {
      event.stopPropagation();

      if (this.props.node.conf.usePreviewTabs) {
        getActions().keepPreviewTab();
      } else {
        getActions().confirmNode(this.props.node.rootUri, this.props.node.uri);
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

  return FileEntryComponent;
})(_reactForAtom.React.Component);

exports.FileEntryComponent = FileEntryComponent;
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDeEU7S0FDRjs7O1dBRWUsMEJBQUMsS0FBWSxFQUFRO0FBQ25DLFdBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztLQUN6Qjs7O1NBdkpVLGtCQUFrQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiRmlsZUVudHJ5Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IEZpbGVUcmVlQWN0aW9ucyBmcm9tICcuLi9saWIvRmlsZVRyZWVBY3Rpb25zJztcbmltcG9ydCB7UmVhY3QsIFJlYWN0RE9NfSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7ZmlsZVR5cGVDbGFzc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuaW1wb3J0IHtpc0NvbnRleHRDbGlja30gZnJvbSAnLi4vbGliL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQge0NoZWNrYm94fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9DaGVja2JveCc7XG5pbXBvcnQge1N0YXR1c0NvZGVOdW1iZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHR5cGUge0ZpbGVUcmVlTm9kZX0gZnJvbSAnLi4vbGliL0ZpbGVUcmVlTm9kZSc7XG5cbmNvbnN0IGdldEFjdGlvbnMgPSBGaWxlVHJlZUFjdGlvbnMuZ2V0SW5zdGFuY2U7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIG5vZGU6IEZpbGVUcmVlTm9kZTtcbn07XG5cbmV4cG9ydCBjbGFzcyBGaWxlRW50cnlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIF9hbmltYXRpb25GcmFtZVJlcXVlc3RJZDogP251bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2NoZWNrYm94T25DaGFuZ2UgPSB0aGlzLl9jaGVja2JveE9uQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2NoZWNrYm94T25DbGljayA9IHRoaXMuX2NoZWNrYm94T25DbGljay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbk1vdXNlRG93biA9IHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uRG91YmxlQ2xpY2sgPSB0aGlzLl9vbkRvdWJsZUNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBQcm9wcywgbmV4dFN0YXRlOiB2b2lkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMubm9kZSAhPT0gbmV4dFByb3BzLm5vZGU7XG4gIH1cblxuICBzY3JvbGxUcmFja2VkSW50b1ZpZXcoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucHJvcHMubm9kZS5pc1RyYWNrZWQpIHtcbiAgICAgIGlmICh0aGlzLl9hbmltYXRpb25GcmFtZVJlcXVlc3RJZCAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYW5pbWF0aW9uRnJhbWVSZXF1ZXN0SWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcykuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCgpO1xuICAgICAgICB0aGlzLl9hbmltYXRpb25GcmFtZVJlcXVlc3RJZCA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYW5pbWF0aW9uRnJhbWVSZXF1ZXN0SWQgIT0gbnVsbCkge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX2FuaW1hdGlvbkZyYW1lUmVxdWVzdElkKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBvdXRlckNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ2VudHJ5IGZpbGUgbGlzdC1pdGVtJywge1xuICAgICAgJ3NlbGVjdGVkJzogdGhpcy5wcm9wcy5ub2RlLmlzU2VsZWN0ZWQsXG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWUtc29mdGVuZWQnOiB0aGlzLnByb3BzLm5vZGUuc2hvdWxkQmVTb2Z0ZW5lZCxcbiAgICB9KTtcblxuICAgIGxldCBzdGF0dXNDbGFzcztcbiAgICBpZiAoIXRoaXMucHJvcHMubm9kZS5jb25mLmlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIGNvbnN0IHZjc1N0YXR1c0NvZGUgPSB0aGlzLnByb3BzLm5vZGUudmNzU3RhdHVzQ29kZTtcbiAgICAgIGlmICh2Y3NTdGF0dXNDb2RlID09PSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEKSB7XG4gICAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1tb2RpZmllZCc7XG4gICAgICB9IGVsc2UgaWYgKHZjc1N0YXR1c0NvZGUgPT09IFN0YXR1c0NvZGVOdW1iZXIuQURERUQpIHtcbiAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLWFkZGVkJztcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5ub2RlLmlzSWdub3JlZCkge1xuICAgICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtaWdub3JlZCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0dXNDbGFzcyA9ICcnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKHRoaXMucHJvcHMubm9kZS5jaGVja2VkU3RhdHVzKSB7XG4gICAgICAgIGNhc2UgJ2NoZWNrZWQnOlxuICAgICAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1hZGRlZCc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgc3RhdHVzQ2xhc3MgPSAnJztcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGxpXG4gICAgICAgIGNsYXNzTmFtZT17YCR7b3V0ZXJDbGFzc05hbWV9ICR7c3RhdHVzQ2xhc3N9YH1cbiAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja31cbiAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX29uTW91c2VEb3dufVxuICAgICAgICBvbkRvdWJsZUNsaWNrPXt0aGlzLl9vbkRvdWJsZUNsaWNrfT5cbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBjbGFzc05hbWU9e2BpY29uIG5hbWUgJHtmaWxlVHlwZUNsYXNzKHRoaXMucHJvcHMubm9kZS5uYW1lKX1gfVxuICAgICAgICAgIGRhdGEtbmFtZT17dGhpcy5wcm9wcy5ub2RlLm5hbWV9XG4gICAgICAgICAgZGF0YS1wYXRoPXt0aGlzLnByb3BzLm5vZGUudXJpfT5cbiAgICAgICAgICB7dGhpcy5fcmVuZGVyQ2hlY2tib3goKX1cbiAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgZGF0YS1uYW1lPXt0aGlzLnByb3BzLm5vZGUubmFtZX1cbiAgICAgICAgICAgIGRhdGEtcGF0aD17dGhpcy5wcm9wcy5ub2RlLnVyaX0+XG4gICAgICAgICAgICB7dGhpcy5wcm9wcy5ub2RlLm5hbWV9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2xpPlxuICAgICk7XG4gIH1cblxuICBfcmVuZGVyQ2hlY2tib3goKTogP1JlYWN0LkVsZW1lbnQge1xuICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmNvbmYuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8Q2hlY2tib3hcbiAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5ub2RlLmNoZWNrZWRTdGF0dXMgPT09ICdjaGVja2VkJ31cbiAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2NoZWNrYm94T25DaGFuZ2V9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX2NoZWNrYm94T25DbGlja31cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNsaWNrKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KSB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBjb25zdCBtb2RpZnlTZWxlY3Rpb24gPSBldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXk7XG4gICAgaWYgKG1vZGlmeVNlbGVjdGlvbikge1xuICAgICAgaWYgKHRoaXMucHJvcHMubm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS51bnNlbGVjdE5vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmFkZFNlbGVjdGVkTm9kZSh0aGlzLnByb3BzLm5vZGUucm9vdFVyaSwgdGhpcy5wcm9wcy5ub2RlLnVyaSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLnNldFNlbGVjdGVkTm9kZSh0aGlzLnByb3BzLm5vZGUucm9vdFVyaSwgdGhpcy5wcm9wcy5ub2RlLnVyaSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wcm9wcy5ub2RlLmNvbmYudXNlUHJldmlld1RhYnMpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmNvbmZpcm1Ob2RlKHRoaXMucHJvcHMubm9kZS5yb290VXJpLCB0aGlzLnByb3BzLm5vZGUudXJpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfb25Nb3VzZURvd24oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIC8vIFNlbGVjdCBub2RlIG9uIHJpZ2h0LWNsaWNrIChpbiBvcmRlciBmb3IgY29udGV4dCBtZW51IHRvIGJlaGF2ZSBjb3JyZWN0bHkpLlxuICAgIGlmIChpc0NvbnRleHRDbGljayhldmVudCkpIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5ub2RlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLnNldFNlbGVjdGVkTm9kZSh0aGlzLnByb3BzLm5vZGUucm9vdFVyaSwgdGhpcy5wcm9wcy5ub2RlLnVyaSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX29uRG91YmxlQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgIGlmICh0aGlzLnByb3BzLm5vZGUuY29uZi51c2VQcmV2aWV3VGFicykge1xuICAgICAgZ2V0QWN0aW9ucygpLmtlZXBQcmV2aWV3VGFiKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdldEFjdGlvbnMoKS5jb25maXJtTm9kZSh0aGlzLnByb3BzLm5vZGUucm9vdFVyaSwgdGhpcy5wcm9wcy5ub2RlLnVyaSk7XG4gICAgfVxuICB9XG5cbiAgX2NoZWNrYm94T25DaGFuZ2UoaXNDaGVja2VkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKGlzQ2hlY2tlZCkge1xuICAgICAgZ2V0QWN0aW9ucygpLmNoZWNrTm9kZSh0aGlzLnByb3BzLm5vZGUucm9vdFVyaSwgdGhpcy5wcm9wcy5ub2RlLnVyaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdldEFjdGlvbnMoKS51bmNoZWNrTm9kZSh0aGlzLnByb3BzLm5vZGUucm9vdFVyaSwgdGhpcy5wcm9wcy5ub2RlLnVyaSk7XG4gICAgfVxuICB9XG5cbiAgX2NoZWNrYm94T25DbGljayhldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxufVxuIl19