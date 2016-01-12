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

var _require = require('../../atom-helpers');

var fileTypeClass = _require.fileTypeClass;

var _require2 = require('../lib/FileTreeHelpers');

var isContextClick = _require2.isContextClick;
var addons = React.addons;
var PropTypes = React.PropTypes;

var getActions = FileTreeActions.getInstance;

// Additional indent for nested tree nodes
var INDENT_PER_LEVEL = 17;

var FileEntryComponent = (function (_React$Component) {
  _inherits(FileEntryComponent, _React$Component);

  function FileEntryComponent(props) {
    _classCallCheck(this, FileEntryComponent);

    _get(Object.getPrototypeOf(FileEntryComponent.prototype), 'constructor', this).call(this, props);
    this._onClick = this._onClick.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
  }

  _createClass(FileEntryComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return addons.PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
    }
  }, {
    key: 'render',
    value: function render() {
      var outerClassName = classnames({
        'entry file list-item': true,
        'selected': this.props.isSelected
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
          this.props.nodeName
        )
      );
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      var modifySelection = event.ctrlKey || event.metaKey;
      if (modifySelection) {
        getActions().toggleSelectNode(this.props.rootKey, this.props.nodeKey);
      } else if (!this.props.isSelected) {
        getActions().selectSingleNode(this.props.rootKey, this.props.nodeKey);
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
      getActions().confirmNode(this.props.rootKey, this.props.nodeKey);
    }
  }]);

  return FileEntryComponent;
})(React.Component);

FileEntryComponent.propTypes = {
  indentLevel: PropTypes.number.isRequired,
  isSelected: PropTypes.bool.isRequired,
  nodeKey: PropTypes.string.isRequired,
  nodeName: PropTypes.string.isRequired,
  nodePath: PropTypes.string.isRequired,
  rootKey: PropTypes.string.isRequired,
  vcsStatusCode: PropTypes.number
};

module.exports = FileEntryComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVFbnRyeUNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBV0EsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDMUQsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0lBQ2pDLGdCQUFnQixHQUFJLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLFdBQVcsQ0FBbkUsZ0JBQWdCOztBQUV2QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O2VBQ2pCLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQzs7SUFBOUMsYUFBYSxZQUFiLGFBQWE7O2dCQUNLLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQzs7SUFBbkQsY0FBYyxhQUFkLGNBQWM7SUFHbkIsTUFBTSxHQUVKLEtBQUssQ0FGUCxNQUFNO0lBQ04sU0FBUyxHQUNQLEtBQUssQ0FEUCxTQUFTOztBQUdYLElBQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxXQUFXLENBQUM7OztBQUcvQyxJQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQzs7SUFFdEIsa0JBQWtCO1lBQWxCLGtCQUFrQjs7QUFDWCxXQURQLGtCQUFrQixDQUNWLEtBQWEsRUFBRTswQkFEdkIsa0JBQWtCOztBQUVwQiwrQkFGRSxrQkFBa0IsNkNBRWQsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QyxRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pELFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdEQ7O2VBTkcsa0JBQWtCOztXQVFELCtCQUFDLFNBQWlCLEVBQUUsU0FB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LFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNyQyxTQUFPLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3BDLFVBQVEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDckMsVUFBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNyQyxTQUFPLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3BDLGVBQWEsRUFBRSxTQUFTLENBQUMsTUFBTTtDQUNoQyxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiRmlsZUVudHJ5Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgRmlsZVRyZWVBY3Rpb25zID0gcmVxdWlyZSgnLi4vbGliL0ZpbGVUcmVlQWN0aW9ucycpO1xuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1N0YXR1c0NvZGVOdW1iZXJ9ID0gcmVxdWlyZSgnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlJykuaGdDb25zdGFudHM7XG5cbmNvbnN0IGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5jb25zdCB7ZmlsZVR5cGVDbGFzc30gPSByZXF1aXJlKCcuLi8uLi9hdG9tLWhlbHBlcnMnKTtcbmNvbnN0IHtpc0NvbnRleHRDbGlja30gPSByZXF1aXJlKCcuLi9saWIvRmlsZVRyZWVIZWxwZXJzJyk7XG5cbmNvbnN0IHtcbiAgYWRkb25zLFxuICBQcm9wVHlwZXMsXG59ID0gUmVhY3Q7XG5cbmNvbnN0IGdldEFjdGlvbnMgPSBGaWxlVHJlZUFjdGlvbnMuZ2V0SW5zdGFuY2U7XG5cbi8vIEFkZGl0aW9uYWwgaW5kZW50IGZvciBuZXN0ZWQgdHJlZSBub2Rlc1xuY29uc3QgSU5ERU5UX1BFUl9MRVZFTCA9IDE3O1xuXG5jbGFzcyBGaWxlRW50cnlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Nb3VzZURvd24gPSB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uRG91YmxlQ2xpY2sgPSB0aGlzLl9vbkRvdWJsZUNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogT2JqZWN0KSB7XG4gICAgcmV0dXJuIGFkZG9ucy5QdXJlUmVuZGVyTWl4aW4uc2hvdWxkQ29tcG9uZW50VXBkYXRlLmNhbGwodGhpcywgbmV4dFByb3BzLCBuZXh0U3RhdGUpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgb3V0ZXJDbGFzc05hbWUgPSBjbGFzc25hbWVzKHtcbiAgICAgICdlbnRyeSBmaWxlIGxpc3QtaXRlbSc6IHRydWUsXG4gICAgICAnc2VsZWN0ZWQnOiB0aGlzLnByb3BzLmlzU2VsZWN0ZWQsXG4gICAgfSk7XG5cbiAgICBsZXQgc3RhdHVzQ2xhc3M7XG4gICAgY29uc3Qge3Zjc1N0YXR1c0NvZGV9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodmNzU3RhdHVzQ29kZSA9PT0gU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRCkge1xuICAgICAgc3RhdHVzQ2xhc3MgPSAnc3RhdHVzLW1vZGlmaWVkJztcbiAgICB9IGVsc2UgaWYgKHZjc1N0YXR1c0NvZGUgPT09IFN0YXR1c0NvZGVOdW1iZXIuQURERUQpIHtcbiAgICAgIHN0YXR1c0NsYXNzID0gJ3N0YXR1cy1hZGRlZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXR1c0NsYXNzID0gJyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxsaVxuICAgICAgICBrZXk9e3RoaXMucHJvcHMubm9kZUtleX1cbiAgICAgICAgY2xhc3NOYW1lPXtgJHtvdXRlckNsYXNzTmFtZX0gJHtzdGF0dXNDbGFzc31gfVxuICAgICAgICBzdHlsZT17e3BhZGRpbmdMZWZ0OiB0aGlzLnByb3BzLmluZGVudExldmVsICogSU5ERU5UX1BFUl9MRVZFTH19XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9XG4gICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9vbk1vdXNlRG93bn1cbiAgICAgICAgb25Eb3VibGVDbGljaz17dGhpcy5fb25Eb3VibGVDbGlja30+XG4gICAgICAgIDxzcGFuXG4gICAgICAgICAgY2xhc3NOYW1lPXtgaWNvbiBuYW1lICR7ZmlsZVR5cGVDbGFzcyh0aGlzLnByb3BzLm5vZGVOYW1lKX1gfVxuICAgICAgICAgIGRhdGEtbmFtZT17dGhpcy5wcm9wcy5ub2RlTmFtZX1cbiAgICAgICAgICBkYXRhLXBhdGg9e3RoaXMucHJvcHMubm9kZVBhdGh9PlxuICAgICAgICAgIHt0aGlzLnByb3BzLm5vZGVOYW1lfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2xpPlxuICAgICk7XG4gIH1cblxuICBfb25DbGljayhldmVudDogU3ludGhldGljTW91c2VFdmVudCkge1xuICAgIGNvbnN0IG1vZGlmeVNlbGVjdGlvbiA9IGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleTtcbiAgICBpZiAobW9kaWZ5U2VsZWN0aW9uKSB7XG4gICAgICBnZXRBY3Rpb25zKCkudG9nZ2xlU2VsZWN0Tm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5wcm9wcy5pc1NlbGVjdGVkKSB7XG4gICAgICBnZXRBY3Rpb25zKCkuc2VsZWN0U2luZ2xlTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VEb3duKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KSB7XG4gICAgLy8gU2VsZWN0IG5vZGUgb24gcmlnaHQtY2xpY2sgKGluIG9yZGVyIGZvciBjb250ZXh0IG1lbnUgdG8gYmVoYXZlIGNvcnJlY3RseSkuXG4gICAgaWYgKGlzQ29udGV4dENsaWNrKGV2ZW50KSkge1xuICAgICAgaWYgKCF0aGlzLnByb3BzLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgZ2V0QWN0aW9ucygpLnNlbGVjdFNpbmdsZU5vZGUodGhpcy5wcm9wcy5yb290S2V5LCB0aGlzLnByb3BzLm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9vbkRvdWJsZUNsaWNrKCk6IHZvaWQge1xuICAgIGdldEFjdGlvbnMoKS5jb25maXJtTm9kZSh0aGlzLnByb3BzLnJvb3RLZXksIHRoaXMucHJvcHMubm9kZUtleSk7XG4gIH1cbn1cblxuRmlsZUVudHJ5Q29tcG9uZW50LnByb3BUeXBlcyA9IHtcbiAgaW5kZW50TGV2ZWw6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgaXNTZWxlY3RlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgbm9kZUtleTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBub2RlTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBub2RlUGF0aDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICByb290S2V5OiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIHZjc1N0YXR1c0NvZGU6IFByb3BUeXBlcy5udW1iZXIsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVFbnRyeUNvbXBvbmVudDtcblxuIl19