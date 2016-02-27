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

var StatusCodeNumber = require('../../hg-repository-base').hgConstants.StatusCodeNumber;

var classnames = require('classnames');

var _require2 = require('../../atom-helpers');

var fileTypeClass = _require2.fileTypeClass;

var _require3 = require('../lib/FileTreeHelpers');

var isContextClick = _require3.isContextClick;

var _require4 = require('./TriStateCheckboxComponent');

var TriStateCheckboxComponent = _require4.TriStateCheckboxComponent;
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
      var outerClassName = classnames({
        'entry file list-item': true,
        'selected': this.props.isSelected,
        'nuclide-file-tree-checked': this.props.checkedStatus === 'checked',
        'nuclide-file-tree-reset-coloring': this.props.checkedStatus === 'clear',
        'nuclide-file-tree-softened': this.props.soften
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
          onMouseDown: this._onMouseDown,
          onDoubleClick: this._onDoubleClick },
        React.createElement(
          'span',
          {
            className: 'icon name ' + fileTypeClass(this.props.nodeName),
            'data-name': this.props.nodeName,
            'data-path': this.props.nodePath },
          this._renderCheckbox(),
          this.props.nodeName
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
      var modifySelection = event.ctrlKey || event.metaKey;
      if (modifySelection) {
        getActions().toggleSelectNode(this.props.rootKey, this.props.nodeKey);
      } else {
        if (!this.props.isSelected) {
          getActions().selectSingleNode(this.props.rootKey, this.props.nodeKey);
        }
        if (this.props.usePreviewTabs) {
          getActions().confirmNode(this.props.rootKey, this.props.nodeKey);
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
        getActions().keepPreviewTab();
      } else {
        getActions().confirmNode(this.props.rootKey, this.props.nodeKey);
      }
    }
  }, {
    key: '_checkboxOnClick',
    value: function _checkboxOnClick(event) {
      event.stopPropagation();
      if (this.props.checkedStatus === 'checked') {
        getActions().uncheckNode(this.props.rootKey, this.props.nodeKey);
      } else {
        getActions().checkNode(this.props.rootKey, this.props.nodeKey);
      }
    }
  }]);

  return FileEntryComponent;
})(React.Component);

module.exports = FileEntryComponent;
//# sourceMappingURL=data:application/json;base64,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RTtPQUNGO0tBQ0Y7OztXQUVhLDBCQUFTO0FBQ3JCLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUU7QUFDN0Isa0JBQVUsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO09BQy9CLE1BQU07QUFDTCxrQkFBVSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDbEU7S0FDRjs7O1dBRWUsMEJBQUMsS0FBWSxFQUFRO0FBQ25DLFdBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUN4QixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLFNBQVMsRUFBRTtBQUMxQyxrQkFBVSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDbEUsTUFBTTtBQUNMLGtCQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNoRTtLQUNGOzs7U0FuSEcsa0JBQWtCO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBc0hoRCxNQUFNLENBQUMsT0FBTyxHQUFHLGtCQUFrQixDQUFDIiwiZmlsZSI6IkZpbGVFbnRyeUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IEZpbGVUcmVlQWN0aW9ucyA9IHJlcXVpcmUoJy4uL2xpYi9GaWxlVHJlZUFjdGlvbnMnKTtcbmNvbnN0IHtcbiAgUHVyZVJlbmRlck1peGluLFxuICBSZWFjdCxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1N0YXR1c0NvZGVOdW1iZXJ9ID0gcmVxdWlyZSgnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlJykuaGdDb25zdGFudHM7XG5cbmNvbnN0IGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5jb25zdCB7ZmlsZVR5cGVDbGFzc30gPSByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHtpc0NvbnRleHRDbGlja30gPSByZXF1aXJlKCcuLi9saWIvRmlsZVRyZWVIZWxwZXJzJyk7XG5jb25zdCB7VHJpU3RhdGVDaGVja2JveENvbXBvbmVudH0gPSByZXF1aXJlKCcuL1RyaVN0YXRlQ2hlY2tib3hDb21wb25lbnQnKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgZ2V0QWN0aW9ucyA9IEZpbGVUcmVlQWN0aW9ucy5nZXRJbnN0YW5jZTtcblxuLy8gQWRkaXRpb25hbCBpbmRlbnQgZm9yIG5lc3RlZCB0cmVlIG5vZGVzXG5jb25zdCBJTkRFTlRfUEVSX0xFVkVMID0gMTc7XG5cbmNsYXNzIEZpbGVFbnRyeUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaW5kZW50TGV2ZWw6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBpc1NlbGVjdGVkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHVzZVByZXZpZXdUYWJzOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIG5vZGVLZXk6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBub2RlTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG5vZGVQYXRoOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgcm9vdEtleTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHZjc1N0YXR1c0NvZGU6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgY2hlY2tlZFN0YXR1czogUHJvcFR5cGVzLm9uZU9mKFsnY2hlY2tlZCcsICdjbGVhcicsICcnXSkuaXNSZXF1aXJlZCxcbiAgICBzb2Z0ZW46IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25DbGljayA9IHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tib3hPbkNsaWNrID0gdGhpcy5fY2hlY2tib3hPbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uTW91c2VEb3duID0gdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Eb3VibGVDbGljayA9IHRoaXMuX29uRG91YmxlQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IE9iamVjdCwgbmV4dFN0YXRlOiB2b2lkKSB7XG4gICAgcmV0dXJuIFB1cmVSZW5kZXJNaXhpbi5zaG91bGRDb21wb25lbnRVcGRhdGUuY2FsbCh0aGlzLCBuZXh0UHJvcHMsIG5leHRTdGF0ZSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBvdXRlckNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoe1xuICAgICAgJ2VudHJ5IGZpbGUgbGlzdC1pdGVtJzogdHJ1ZSxcbiAgICAgICdzZWxlY3RlZCc6IHRoaXMucHJvcHMuaXNTZWxlY3RlZCxcbiAgICAgICdudWNsaWRlLWZpbGUtdHJlZS1jaGVja2VkJzogdGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzID09PSAnY2hlY2tlZCcsXG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWUtcmVzZXQtY29sb3JpbmcnOiB0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMgPT09ICdjbGVhcicsXG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWUtc29mdGVuZWQnOiB0aGlzLnByb3BzLnNvZnRlbixcbiAgICB9KTtcblxuICAgIGxldCBzdGF0dXNDbGFzcztcbiAgICBjb25zdCB7dmNzU3RhdHVzQ29kZX0gPSB0aGlzLnByb3BzO1xuICAgIGlmICh2Y3NTdGF0dXNDb2RlID09PSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEKSB7XG4gICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtbW9kaWZpZWQnO1xuICAgIH0gZWxzZSBpZiAodmNzU3RhdHVzQ29kZSA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCkge1xuICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLWFkZGVkJztcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdHVzQ2xhc3MgPSAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGxpXG4gICAgICAgIGtleT17dGhpcy5wcm9wcy5ub2RlS2V5fVxuICAgICAgICBjbGFzc05hbWU9e2Ake291dGVyQ2xhc3NOYW1lfSAke3N0YXR1c0NsYXNzfWB9XG4gICAgICAgIHN0eWxlPXt7cGFkZGluZ0xlZnQ6IHRoaXMucHJvcHMuaW5kZW50TGV2ZWwgKiBJTkRFTlRfUEVSX0xFVkVMfX1cbiAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja31cbiAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX29uTW91c2VEb3dufVxuICAgICAgICBvbkRvdWJsZUNsaWNrPXt0aGlzLl9vbkRvdWJsZUNsaWNrfT5cbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBjbGFzc05hbWU9e2BpY29uIG5hbWUgJHtmaWxlVHlwZUNsYXNzKHRoaXMucHJvcHMubm9kZU5hbWUpfWB9XG4gICAgICAgICAgZGF0YS1uYW1lPXt0aGlzLnByb3BzLm5vZGVOYW1lfVxuICAgICAgICAgIGRhdGEtcGF0aD17dGhpcy5wcm9wcy5ub2RlUGF0aH0+XG4gICAgICAgICAge3RoaXMuX3JlbmRlckNoZWNrYm94KCl9XG4gICAgICAgICAge3RoaXMucHJvcHMubm9kZU5hbWV9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvbGk+XG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJDaGVja2JveCgpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgaWYgKHRoaXMucHJvcHMuY2hlY2tlZFN0YXR1cyA9PT0gJycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFRyaVN0YXRlQ2hlY2tib3hDb21wb25lbnRcbiAgICAgICAgY2hlY2tlZFN0YXR1cz17dGhpcy5wcm9wcy5jaGVja2VkU3RhdHVzfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9jaGVja2JveE9uQ2xpY2t9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfb25DbGljayhldmVudDogU3ludGhldGljTW91c2VFdmVudCkge1xuICAgIGNvbnN0IG1vZGlmeVNlbGVjdGlvbiA9IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleTtcbiAgICBpZiAobW9kaWZ5U2VsZWN0aW9uKSB7XG4gICAgICBnZXRBY3Rpb25zKCkudG9nZ2xlU2VsZWN0Tm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5zZWxlY3RTaW5nbGVOb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnByb3BzLnVzZVByZXZpZXdUYWJzKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5jb25maXJtTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VEb3duKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KSB7XG4gICAgLy8gU2VsZWN0IG5vZGUgb24gcmlnaHQtY2xpY2sgKGluIG9yZGVyIGZvciBjb250ZXh0IG1lbnUgdG8gYmVoYXZlIGNvcnJlY3RseSkuXG4gICAgaWYgKGlzQ29udGV4dENsaWNrKGV2ZW50KSkge1xuICAgICAgaWYgKCF0aGlzLnByb3BzLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLnNlbGVjdFNpbmdsZU5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9vbkRvdWJsZUNsaWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnByb3BzLnVzZVByZXZpZXdUYWJzKSB7XG4gICAgICBnZXRBY3Rpb25zKCkua2VlcFByZXZpZXdUYWIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2V0QWN0aW9ucygpLmNvbmZpcm1Ob2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICB9XG4gIH1cblxuICBfY2hlY2tib3hPbkNsaWNrKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGlmICh0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMgPT09ICdjaGVja2VkJykge1xuICAgICAgZ2V0QWN0aW9ucygpLnVuY2hlY2tOb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2V0QWN0aW9ucygpLmNoZWNrTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZUVudHJ5Q29tcG9uZW50O1xuIl19