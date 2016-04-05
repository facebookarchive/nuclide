Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _require = require('./LazyTreeNode');

var LazyTreeNode = _require.LazyTreeNode;

var _require2 = require('react-for-atom');

var PureRenderMixin = _require2.PureRenderMixin;
var React = _require2.React;
var ReactDOM = _require2.ReactDOM;

var classnames = require('classnames');

var PropTypes = React.PropTypes;

var INDENT_IN_PX = 10;
var INDENT_PER_LEVEL_IN_PX = 15;
var DOWN_ARROW = '';
var RIGHT_ARROW = '';
var SPINNER = '';

/**
 * Represents one entry in a TreeComponent.
 */

var TreeNodeComponent = (function (_React$Component) {
  _inherits(TreeNodeComponent, _React$Component);

  _createClass(TreeNodeComponent, null, [{
    key: 'propTypes',
    value: {
      depth: PropTypes.number.isRequired,
      isContainer: PropTypes.bool.isRequired,
      isExpanded: PropTypes.bool.isRequired,
      isLoading: PropTypes.bool.isRequired,
      isSelected: PropTypes.bool.isRequired,
      label: PropTypes.string.isRequired,
      labelClassName: PropTypes.string.isRequired,
      node: PropTypes.instanceOf(LazyTreeNode).isRequired,
      onClickArrow: PropTypes.func.isRequired,
      onClick: PropTypes.func.isRequired,
      onDoubleClick: PropTypes.func.isRequired,
      onMouseDown: PropTypes.func.isRequired,
      path: PropTypes.string.isRequired,
      rowClassName: PropTypes.string
    },
    enumerable: true
  }]);

  function TreeNodeComponent(props) {
    _classCallCheck(this, TreeNodeComponent);

    _get(Object.getPrototypeOf(TreeNodeComponent.prototype), 'constructor', this).call(this, props);
    this._onClick = this._onClick.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
  }

  _createClass(TreeNodeComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
    }
  }, {
    key: 'render',
    value: function render() {
      var rowClassNameObj = {
        // Support for selectors in the "file-icons" package.
        // @see {@link https://atom.io/packages/file-icons|file-icons}
        'entry file list-item': true,
        'nuclide-tree-component-item': true,
        'nuclide-tree-component-selected': this.props.isSelected
      };
      if (this.props.rowClassName) {
        rowClassNameObj[this.props.rowClassName] = true;
      }

      var itemStyle = {
        paddingLeft: INDENT_IN_PX + this.props.depth * INDENT_PER_LEVEL_IN_PX
      };

      var arrow = undefined;
      if (this.props.isContainer) {
        if (this.props.isExpanded) {
          if (this.props.isLoading) {
            arrow = React.createElement(
              'span',
              { className: 'nuclide-tree-component-item-arrow-spinner' },
              SPINNER
            );
          } else {
            arrow = DOWN_ARROW;
          }
        } else {
          arrow = RIGHT_ARROW;
        }
      }

      return React.createElement(
        'div',
        {
          className: classnames(rowClassNameObj),
          style: itemStyle,
          onClick: this._onClick,
          onDoubleClick: this._onDoubleClick,
          onMouseDown: this._onMouseDown },
        React.createElement(
          'span',
          { className: 'nuclide-tree-component-item-arrow', ref: 'arrow' },
          arrow
        ),
        React.createElement(
          'span',
          {
            className: this.props.labelClassName,
            // `data-name` is support for selectors in the "file-icons" package.
            // @see {@link https://atom.io/packages/file-icons|file-icons}
            'data-name': this.props.label,
            'data-path': this.props.path },
          this.props.label
        )
      );
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      if (ReactDOM.findDOMNode(this.refs['arrow']).contains(event.target)) {
        this.props.onClickArrow(event, this.props.node);
      } else {
        this.props.onClick(event, this.props.node);
      }
    }
  }, {
    key: '_onDoubleClick',
    value: function _onDoubleClick(event) {
      this.props.onDoubleClick(event, this.props.node);
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(event) {
      this.props.onMouseDown(event, this.props.node);
    }
  }]);

  return TreeNodeComponent;
})(React.Component);

exports.TreeNodeComponent = TreeNodeComponent;
//# sourceMappingURL=data:application/json;base64,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LFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNuRSxZQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNqRCxNQUFNO0FBQ0wsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDNUM7S0FDRjs7O1dBRWEsd0JBQUMsS0FBMEIsRUFBUTtBQUMvQyxVQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNsRDs7O1dBRVcsc0JBQUMsS0FBMEIsRUFBUTtBQUM3QyxVQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNoRDs7O1NBaEdVLGlCQUFpQjtHQUFTLEtBQUssQ0FBQyxTQUFTIiwiZmlsZSI6IlRyZWVOb2RlQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0xhenlUcmVlTm9kZX0gPSByZXF1aXJlKCcuL0xhenlUcmVlTm9kZScpO1xuY29uc3Qge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3QgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgSU5ERU5UX0lOX1BYID0gMTA7XG5jb25zdCBJTkRFTlRfUEVSX0xFVkVMX0lOX1BYID0gMTU7XG5jb25zdCBET1dOX0FSUk9XID0gJ1xcdUYwQTMnO1xuY29uc3QgUklHSFRfQVJST1cgPSAnXFx1RjA3OCc7XG5jb25zdCBTUElOTkVSID0gJ1xcdUYwODcnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgb25lIGVudHJ5IGluIGEgVHJlZUNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFRyZWVOb2RlQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGU6IHZvaWQ7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBkZXB0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGlzQ29udGFpbmVyOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGlzRXhwYW5kZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNMb2FkaW5nOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGlzU2VsZWN0ZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgbGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBsYWJlbENsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG5vZGU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKExhenlUcmVlTm9kZSkuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrQXJyb3c6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25DbGljazogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkRvdWJsZUNsaWNrOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uTW91c2VEb3duOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHBhdGg6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICByb3dDbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25DbGljayA9IHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Eb3VibGVDbGljayA9IHRoaXMuX29uRG91YmxlQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Nb3VzZURvd24gPSB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogT2JqZWN0LCBuZXh0U3RhdGU6IHZvaWQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gUHVyZVJlbmRlck1peGluLnNob3VsZENvbXBvbmVudFVwZGF0ZS5jYWxsKHRoaXMsIG5leHRQcm9wcywgbmV4dFN0YXRlKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHJvd0NsYXNzTmFtZU9iajoge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge1xuICAgICAgLy8gU3VwcG9ydCBmb3Igc2VsZWN0b3JzIGluIHRoZSBcImZpbGUtaWNvbnNcIiBwYWNrYWdlLlxuICAgICAgLy8gQHNlZSB7QGxpbmsgaHR0cHM6Ly9hdG9tLmlvL3BhY2thZ2VzL2ZpbGUtaWNvbnN8ZmlsZS1pY29uc31cbiAgICAgICdlbnRyeSBmaWxlIGxpc3QtaXRlbSc6IHRydWUsXG4gICAgICAnbnVjbGlkZS10cmVlLWNvbXBvbmVudC1pdGVtJzogdHJ1ZSxcbiAgICAgICdudWNsaWRlLXRyZWUtY29tcG9uZW50LXNlbGVjdGVkJzogdGhpcy5wcm9wcy5pc1NlbGVjdGVkLFxuICAgIH07XG4gICAgaWYgKHRoaXMucHJvcHMucm93Q2xhc3NOYW1lKSB7XG4gICAgICByb3dDbGFzc05hbWVPYmpbdGhpcy5wcm9wcy5yb3dDbGFzc05hbWVdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBpdGVtU3R5bGUgPSB7XG4gICAgICBwYWRkaW5nTGVmdDogSU5ERU5UX0lOX1BYICsgdGhpcy5wcm9wcy5kZXB0aCAqIElOREVOVF9QRVJfTEVWRUxfSU5fUFgsXG4gICAgfTtcblxuICAgIGxldCBhcnJvdztcbiAgICBpZiAodGhpcy5wcm9wcy5pc0NvbnRhaW5lcikge1xuICAgICAgaWYgKHRoaXMucHJvcHMuaXNFeHBhbmRlZCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICBhcnJvdyA9IDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtdHJlZS1jb21wb25lbnQtaXRlbS1hcnJvdy1zcGlubmVyXCI+e1NQSU5ORVJ9PC9zcGFuPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhcnJvdyA9IERPV05fQVJST1c7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFycm93ID0gUklHSFRfQVJST1c7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHJvd0NsYXNzTmFtZU9iail9XG4gICAgICAgIHN0eWxlPXtpdGVtU3R5bGV9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9XG4gICAgICAgIG9uRG91YmxlQ2xpY2s9e3RoaXMuX29uRG91YmxlQ2xpY2t9XG4gICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9vbk1vdXNlRG93bn0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtdHJlZS1jb21wb25lbnQtaXRlbS1hcnJvd1wiIHJlZj1cImFycm93XCI+XG4gICAgICAgICAge2Fycm93fVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuXG4gICAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmxhYmVsQ2xhc3NOYW1lfVxuICAgICAgICAgIC8vIGBkYXRhLW5hbWVgIGlzIHN1cHBvcnQgZm9yIHNlbGVjdG9ycyBpbiB0aGUgXCJmaWxlLWljb25zXCIgcGFja2FnZS5cbiAgICAgICAgICAvLyBAc2VlIHtAbGluayBodHRwczovL2F0b20uaW8vcGFja2FnZXMvZmlsZS1pY29uc3xmaWxlLWljb25zfVxuICAgICAgICAgIGRhdGEtbmFtZT17dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgICBkYXRhLXBhdGg9e3RoaXMucHJvcHMucGF0aH0+XG4gICAgICAgICAge3RoaXMucHJvcHMubGFiZWx9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfb25DbGljayhldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmIChSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2Fycm93J10pLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHtcbiAgICAgIHRoaXMucHJvcHMub25DbGlja0Fycm93KGV2ZW50LCB0aGlzLnByb3BzLm5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ2xpY2soZXZlbnQsIHRoaXMucHJvcHMubm9kZSk7XG4gICAgfVxuICB9XG5cbiAgX29uRG91YmxlQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uRG91YmxlQ2xpY2soZXZlbnQsIHRoaXMucHJvcHMubm9kZSk7XG4gIH1cblxuICBfb25Nb3VzZURvd24oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uTW91c2VEb3duKGV2ZW50LCB0aGlzLnByb3BzLm5vZGUpO1xuICB9XG59XG4iXX0=