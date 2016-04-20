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
      var node = this.props.node;
      var outerClassName = (0, _classnames2['default'])('entry file list-item', {
        'selected': node.isSelected,
        'nuclide-file-tree-softened': node.shouldBeSoftened
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
          default:
            statusClass = '';
            break;
        }
      }

      var name = (0, _libFileTreeFilterHelper.filterName)(node.name, node.highlightedText, node.isSelected);

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
            className: 'icon name ' + (0, _nuclideAtomHelpers.fileTypeClass)(node.name),
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
//# sourceMappingURL=data:application/json;base64,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ekI7OztTQTVKVSxrQkFBa0I7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkZpbGVFbnRyeUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBGaWxlVHJlZUFjdGlvbnMgZnJvbSAnLi4vbGliL0ZpbGVUcmVlQWN0aW9ucyc7XG5pbXBvcnQge1JlYWN0LCBSZWFjdERPTX0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge2ZpbGVUeXBlQ2xhc3N9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7ZmlsdGVyTmFtZX0gZnJvbSAnLi4vbGliL0ZpbGVUcmVlRmlsdGVySGVscGVyJztcbmltcG9ydCB7aXNDb250ZXh0Q2xpY2t9IGZyb20gJy4uL2xpYi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IHtDaGVja2JveH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQ2hlY2tib3gnO1xuaW1wb3J0IHtTdGF0dXNDb2RlTnVtYmVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcbmltcG9ydCB0eXBlIHtGaWxlVHJlZU5vZGV9IGZyb20gJy4uL2xpYi9GaWxlVHJlZU5vZGUnO1xuXG5jb25zdCBnZXRBY3Rpb25zID0gRmlsZVRyZWVBY3Rpb25zLmdldEluc3RhbmNlO1xuXG50eXBlIFByb3BzID0ge1xuICBub2RlOiBGaWxlVHJlZU5vZGU7XG59O1xuXG5leHBvcnQgY2xhc3MgRmlsZUVudHJ5Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBfYW5pbWF0aW9uRnJhbWVSZXF1ZXN0SWQ6ID9udW1iZXI7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNsaWNrID0gdGhpcy5fb25DbGljay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9jaGVja2JveE9uQ2hhbmdlID0gdGhpcy5fY2hlY2tib3hPbkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9jaGVja2JveE9uQ2xpY2sgPSB0aGlzLl9jaGVja2JveE9uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Nb3VzZURvd24gPSB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkRvdWJsZUNsaWNrID0gdGhpcy5fb25Eb3VibGVDbGljay5iaW5kKHRoaXMpO1xuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogUHJvcHMsIG5leHRTdGF0ZTogdm9pZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnByb3BzLm5vZGUgIT09IG5leHRQcm9wcy5ub2RlO1xuICB9XG5cbiAgc2Nyb2xsVHJhY2tlZEludG9WaWV3KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLm5vZGUuaXNUcmFja2VkKSB7XG4gICAgICBpZiAodGhpcy5fYW5pbWF0aW9uRnJhbWVSZXF1ZXN0SWQgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2FuaW1hdGlvbkZyYW1lUmVxdWVzdElkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoKTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRnJhbWVSZXF1ZXN0SWQgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FuaW1hdGlvbkZyYW1lUmVxdWVzdElkICE9IG51bGwpIHtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRpb25GcmFtZVJlcXVlc3RJZCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgY29uc3Qgb3V0ZXJDbGFzc05hbWUgPSBjbGFzc25hbWVzKCdlbnRyeSBmaWxlIGxpc3QtaXRlbScsIHtcbiAgICAgICdzZWxlY3RlZCc6IG5vZGUuaXNTZWxlY3RlZCxcbiAgICAgICdudWNsaWRlLWZpbGUtdHJlZS1zb2Z0ZW5lZCc6IG5vZGUuc2hvdWxkQmVTb2Z0ZW5lZCxcbiAgICB9KTtcblxuICAgIGxldCBzdGF0dXNDbGFzcztcbiAgICBpZiAoIW5vZGUuY29uZi5pc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICBjb25zdCB2Y3NTdGF0dXNDb2RlID0gbm9kZS52Y3NTdGF0dXNDb2RlO1xuICAgICAgaWYgKHZjc1N0YXR1c0NvZGUgPT09IFN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQpIHtcbiAgICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLW1vZGlmaWVkJztcbiAgICAgIH0gZWxzZSBpZiAodmNzU3RhdHVzQ29kZSA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCkge1xuICAgICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtYWRkZWQnO1xuICAgICAgfSBlbHNlIGlmIChub2RlLmlzSWdub3JlZCkge1xuICAgICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtaWdub3JlZCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0dXNDbGFzcyA9ICcnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKG5vZGUuY2hlY2tlZFN0YXR1cykge1xuICAgICAgICBjYXNlICdjaGVja2VkJzpcbiAgICAgICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtYWRkZWQnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHN0YXR1c0NsYXNzID0gJyc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG5cblxuICAgIGNvbnN0IG5hbWUgPSBmaWx0ZXJOYW1lKG5vZGUubmFtZSwgbm9kZS5oaWdobGlnaHRlZFRleHQsIG5vZGUuaXNTZWxlY3RlZCk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGxpXG4gICAgICAgIGNsYXNzTmFtZT17YCR7b3V0ZXJDbGFzc05hbWV9ICR7c3RhdHVzQ2xhc3N9YH1cbiAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja31cbiAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX29uTW91c2VEb3dufVxuICAgICAgICBvbkRvdWJsZUNsaWNrPXt0aGlzLl9vbkRvdWJsZUNsaWNrfT5cbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBjbGFzc05hbWU9e2BpY29uIG5hbWUgJHtmaWxlVHlwZUNsYXNzKG5vZGUubmFtZSl9YH1cbiAgICAgICAgICBkYXRhLW5hbWU9e25vZGUubmFtZX1cbiAgICAgICAgICBkYXRhLXBhdGg9e25vZGUudXJpfT5cbiAgICAgICAgICB7dGhpcy5fcmVuZGVyQ2hlY2tib3goKX1cbiAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgZGF0YS1uYW1lPXtub2RlLm5hbWV9XG4gICAgICAgICAgICBkYXRhLXBhdGg9e25vZGUudXJpfT5cbiAgICAgICAgICAgIHtuYW1lfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG5cbiAgX3JlbmRlckNoZWNrYm94KCk6ID9SZWFjdC5FbGVtZW50IHtcbiAgICBpZiAoIXRoaXMucHJvcHMubm9kZS5jb25mLmlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPENoZWNrYm94XG4gICAgICAgIGNoZWNrZWQ9e3RoaXMucHJvcHMubm9kZS5jaGVja2VkU3RhdHVzID09PSAnY2hlY2tlZCd9XG4gICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9jaGVja2JveE9uQ2hhbmdlfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9jaGVja2JveE9uQ2xpY2t9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfb25DbGljayhldmVudDogU3ludGhldGljTW91c2VFdmVudCkge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgY29uc3QgbW9kaWZ5U2VsZWN0aW9uID0gZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5O1xuICAgIGlmIChtb2RpZnlTZWxlY3Rpb24pIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLm5vZGUuaXNTZWxlY3RlZCkge1xuICAgICAgICBnZXRBY3Rpb25zKCkudW5zZWxlY3ROb2RlKHRoaXMucHJvcHMubm9kZS5yb290VXJpLCB0aGlzLnByb3BzLm5vZGUudXJpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5hZGRTZWxlY3RlZE5vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMubm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5zZXRTZWxlY3RlZE5vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucHJvcHMubm9kZS5jb25mLnVzZVByZXZpZXdUYWJzKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5jb25maXJtTm9kZSh0aGlzLnByb3BzLm5vZGUucm9vdFVyaSwgdGhpcy5wcm9wcy5ub2RlLnVyaSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VEb3duKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KSB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAvLyBTZWxlY3Qgbm9kZSBvbiByaWdodC1jbGljayAoaW4gb3JkZXIgZm9yIGNvbnRleHQgbWVudSB0byBiZWhhdmUgY29ycmVjdGx5KS5cbiAgICBpZiAoaXNDb250ZXh0Q2xpY2soZXZlbnQpKSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMubm9kZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5zZXRTZWxlY3RlZE5vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9vbkRvdWJsZUNsaWNrKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KSB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5ub2RlLmNvbmYudXNlUHJldmlld1RhYnMpIHtcbiAgICAgIGdldEFjdGlvbnMoKS5rZWVwUHJldmlld1RhYigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZXRBY3Rpb25zKCkuY29uZmlybU5vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgIH1cbiAgfVxuXG4gIF9jaGVja2JveE9uQ2hhbmdlKGlzQ2hlY2tlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChpc0NoZWNrZWQpIHtcbiAgICAgIGdldEFjdGlvbnMoKS5jaGVja05vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZXRBY3Rpb25zKCkudW5jaGVja05vZGUodGhpcy5wcm9wcy5ub2RlLnJvb3RVcmksIHRoaXMucHJvcHMubm9kZS51cmkpO1xuICAgIH1cbiAgfVxuXG4gIF9jaGVja2JveE9uQ2xpY2soZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn1cbiJdfQ==