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

var StatusCodeNumber = require('../../nuclide-hg-repository-base').hgConstants.StatusCodeNumber;

var classnames = require('classnames');

var _require2 = require('../../nuclide-atom-helpers');

var fileTypeClass = _require2.fileTypeClass;

var _require3 = require('../lib/FileTreeHelpers');

var isContextClick = _require3.isContextClick;

var NuclideCheckbox = require('../../nuclide-ui-checkbox');
var semver = require('semver');

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
    this._checkboxOnChange = this._checkboxOnChange.bind(this);
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
      var outerClassName = classnames('entry file list-item', {
        'selected': this.props.isSelected,
        'nuclide-file-tree-softened': this.props.soften
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
          default:
            statusClass = '';
            break;
        }
      }

      return React.createElement(
        'li',
        {
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
          React.createElement(
            'span',
            {
              'data-name': this.props.nodeName,
              'data-path': this.props.nodePath },
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

      return React.createElement(NuclideCheckbox, {
        checked: this.props.checkedStatus === 'checked',
        onChange: this._checkboxOnChange,
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
          getActions().confirmNode(this.props.rootKey, this.props.nodeKey, /* pending */true);
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
        // This will no longer be needed once Nuclide will not officially support Atoms < 1.6.0
        if (semver.lt(atom.getVersion(), '1.6.0-beta')) {
          getActions().keepPreviewTab();
        }
      } else {
        getActions().confirmNode(this.props.rootKey, this.props.nodeKey);
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

  return FileEntryComponent;
})(React.Component);

module.exports = FileEntryComponent;
//# sourceMappingURL=data:application/json;base64,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RUFBUTtBQUNuQyxXQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7S0FDekI7OztTQXRJRyxrQkFBa0I7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUF5SWhELE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiRmlsZUVudHJ5Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRmlsZVRyZWVBY3Rpb25zID0gcmVxdWlyZSgnLi4vbGliL0ZpbGVUcmVlQWN0aW9ucycpO1xuY29uc3Qge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7U3RhdHVzQ29kZU51bWJlcn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZScpLmhnQ29uc3RhbnRzO1xuXG5jb25zdCBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuY29uc3Qge2ZpbGVUeXBlQ2xhc3N9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHtpc0NvbnRleHRDbGlja30gPSByZXF1aXJlKCcuLi9saWIvRmlsZVRyZWVIZWxwZXJzJyk7XG5jb25zdCBOdWNsaWRlQ2hlY2tib3ggPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVpLWNoZWNrYm94Jyk7XG5jb25zdCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgZ2V0QWN0aW9ucyA9IEZpbGVUcmVlQWN0aW9ucy5nZXRJbnN0YW5jZTtcblxuLy8gQWRkaXRpb25hbCBpbmRlbnQgZm9yIG5lc3RlZCB0cmVlIG5vZGVzXG5jb25zdCBJTkRFTlRfUEVSX0xFVkVMID0gMTc7XG5cbmNsYXNzIEZpbGVFbnRyeUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaW5kZW50TGV2ZWw6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBpc1NlbGVjdGVkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHVzZVByZXZpZXdUYWJzOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIG5vZGVLZXk6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBub2RlTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG5vZGVQYXRoOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgcm9vdEtleTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHZjc1N0YXR1c0NvZGU6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgY2hlY2tlZFN0YXR1czogUHJvcFR5cGVzLm9uZU9mKFsnY2hlY2tlZCcsICdjbGVhcicsICcnXSkuaXNSZXF1aXJlZCxcbiAgICBzb2Z0ZW46IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25DbGljayA9IHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tib3hPbkNoYW5nZSA9IHRoaXMuX2NoZWNrYm94T25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY2hlY2tib3hPbkNsaWNrID0gdGhpcy5fY2hlY2tib3hPbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX29uTW91c2VEb3duID0gdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Eb3VibGVDbGljayA9IHRoaXMuX29uRG91YmxlQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IE9iamVjdCwgbmV4dFN0YXRlOiB2b2lkKSB7XG4gICAgcmV0dXJuIFB1cmVSZW5kZXJNaXhpbi5zaG91bGRDb21wb25lbnRVcGRhdGUuY2FsbCh0aGlzLCBuZXh0UHJvcHMsIG5leHRTdGF0ZSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBvdXRlckNsYXNzTmFtZSA9IGNsYXNzbmFtZXMoJ2VudHJ5IGZpbGUgbGlzdC1pdGVtJywge1xuICAgICAgJ3NlbGVjdGVkJzogdGhpcy5wcm9wcy5pc1NlbGVjdGVkLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLXNvZnRlbmVkJzogdGhpcy5wcm9wcy5zb2Z0ZW4sXG4gICAgfSk7XG5cbiAgICBsZXQgc3RhdHVzQ2xhc3M7XG4gICAgaWYgKHRoaXMucHJvcHMuY2hlY2tlZFN0YXR1cyA9PT0gJycpIHtcbiAgICAgIGNvbnN0IHt2Y3NTdGF0dXNDb2RlfSA9IHRoaXMucHJvcHM7XG4gICAgICBpZiAodmNzU3RhdHVzQ29kZSA9PT0gU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRCkge1xuICAgICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtbW9kaWZpZWQnO1xuICAgICAgfSBlbHNlIGlmICh2Y3NTdGF0dXNDb2RlID09PSBTdGF0dXNDb2RlTnVtYmVyLkFEREVEKSB7XG4gICAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1hZGRlZCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGF0dXNDbGFzcyA9ICcnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKHRoaXMucHJvcHMuY2hlY2tlZFN0YXR1cykge1xuICAgICAgICBjYXNlICdjaGVja2VkJzpcbiAgICAgICAgICBzdGF0dXNDbGFzcyA9ICdzdGF0dXMtYWRkZWQnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHN0YXR1c0NsYXNzID0gJyc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxsaVxuICAgICAgICBjbGFzc05hbWU9e2Ake291dGVyQ2xhc3NOYW1lfSAke3N0YXR1c0NsYXNzfWB9XG4gICAgICAgIHN0eWxlPXt7cGFkZGluZ0xlZnQ6IHRoaXMucHJvcHMuaW5kZW50TGV2ZWwgKiBJTkRFTlRfUEVSX0xFVkVMfX1cbiAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja31cbiAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX29uTW91c2VEb3dufVxuICAgICAgICBvbkRvdWJsZUNsaWNrPXt0aGlzLl9vbkRvdWJsZUNsaWNrfT5cbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBjbGFzc05hbWU9e2BpY29uIG5hbWUgJHtmaWxlVHlwZUNsYXNzKHRoaXMucHJvcHMubm9kZU5hbWUpfWB9XG4gICAgICAgICAgZGF0YS1uYW1lPXt0aGlzLnByb3BzLm5vZGVOYW1lfVxuICAgICAgICAgIGRhdGEtcGF0aD17dGhpcy5wcm9wcy5ub2RlUGF0aH0+XG4gICAgICAgICAge3RoaXMuX3JlbmRlckNoZWNrYm94KCl9XG4gICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgIGRhdGEtbmFtZT17dGhpcy5wcm9wcy5ub2RlTmFtZX1cbiAgICAgICAgICAgIGRhdGEtcGF0aD17dGhpcy5wcm9wcy5ub2RlUGF0aH0+XG4gICAgICAgICAgICB7dGhpcy5wcm9wcy5ub2RlTmFtZX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvbGk+XG4gICAgKTtcbiAgfVxuXG4gIF9yZW5kZXJDaGVja2JveCgpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgaWYgKHRoaXMucHJvcHMuY2hlY2tlZFN0YXR1cyA9PT0gJycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPE51Y2xpZGVDaGVja2JveFxuICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLmNoZWNrZWRTdGF0dXMgPT09ICdjaGVja2VkJ31cbiAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2NoZWNrYm94T25DaGFuZ2V9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX2NoZWNrYm94T25DbGlja31cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNsaWNrKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KSB7XG4gICAgY29uc3QgbW9kaWZ5U2VsZWN0aW9uID0gZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5O1xuICAgIGlmIChtb2RpZnlTZWxlY3Rpb24pIHtcbiAgICAgIGdldEFjdGlvbnMoKS50b2dnbGVTZWxlY3ROb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLnByb3BzLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLnNlbGVjdFNpbmdsZU5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucHJvcHMudXNlUHJldmlld1RhYnMpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLmNvbmZpcm1Ob2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5LCAvKiBwZW5kaW5nICovIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9vbk1vdXNlRG93bihldmVudDogU3ludGhldGljTW91c2VFdmVudCkge1xuICAgIC8vIFNlbGVjdCBub2RlIG9uIHJpZ2h0LWNsaWNrIChpbiBvcmRlciBmb3IgY29udGV4dCBtZW51IHRvIGJlaGF2ZSBjb3JyZWN0bHkpLlxuICAgIGlmIChpc0NvbnRleHRDbGljayhldmVudCkpIHtcbiAgICAgIGlmICghdGhpcy5wcm9wcy5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5zZWxlY3RTaW5nbGVOb2RlKHRoaXMucHJvcHMucm9vdEtleSwgdGhpcy5wcm9wcy5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfb25Eb3VibGVDbGljaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5wcm9wcy51c2VQcmV2aWV3VGFicykge1xuICAgICAgLy8gVGhpcyB3aWxsIG5vIGxvbmdlciBiZSBuZWVkZWQgb25jZSBOdWNsaWRlIHdpbGwgbm90IG9mZmljaWFsbHkgc3VwcG9ydCBBdG9tcyA8IDEuNi4wXG4gICAgICBpZiAoc2VtdmVyLmx0KGF0b20uZ2V0VmVyc2lvbigpLCAnMS42LjAtYmV0YScpKSB7XG4gICAgICAgIGdldEFjdGlvbnMoKS5rZWVwUHJldmlld1RhYigpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBnZXRBY3Rpb25zKCkuY29uZmlybU5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgIH1cbiAgfVxuXG4gIF9jaGVja2JveE9uQ2hhbmdlKGlzQ2hlY2tlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChpc0NoZWNrZWQpIHtcbiAgICAgIGdldEFjdGlvbnMoKS5jaGVja05vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZXRBY3Rpb25zKCkudW5jaGVja05vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgIH1cbiAgfVxuXG4gIF9jaGVja2JveE9uQ2xpY2soZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlRW50cnlDb21wb25lbnQ7XG4iXX0=