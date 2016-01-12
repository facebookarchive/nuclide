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

var LazyTreeNode = require('./LazyTreeNode');
var React = require('react-for-atom');

var classnames = require('classnames');

var addons = React.addons;
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
      return addons.PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
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
      if (React.findDOMNode(this.refs['arrow']).contains(event.target)) {
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

module.exports = TreeNodeComponent;
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDaEUsWUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDakQsTUFBTTtBQUNMLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzVDO0tBQ0Y7OztXQUVhLHdCQUFDLEtBQTBCLEVBQVE7QUFDL0MsVUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbEQ7OztXQUVXLHNCQUFDLEtBQTBCLEVBQVE7QUFDN0MsVUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEQ7OztTQS9GRyxpQkFBaUI7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUFrRy9DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiVHJlZU5vZGVDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBMYXp5VHJlZU5vZGUgPSByZXF1aXJlKCcuL0xhenlUcmVlTm9kZScpO1xuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCBjbGFzc25hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5jb25zdCB7XG4gIGFkZG9ucyxcbiAgUHJvcFR5cGVzLFxufSA9IFJlYWN0O1xuXG5jb25zdCBJTkRFTlRfSU5fUFggPSAxMDtcbmNvbnN0IElOREVOVF9QRVJfTEVWRUxfSU5fUFggPSAxNTtcbmNvbnN0IERPV05fQVJST1cgPSAnXFx1RjBBMyc7XG5jb25zdCBSSUdIVF9BUlJPVyA9ICdcXHVGMDc4JztcbmNvbnN0IFNQSU5ORVIgPSAnXFx1RjA4Nyc7XG5cbi8qKlxuICogUmVwcmVzZW50cyBvbmUgZW50cnkgaW4gYSBUcmVlQ29tcG9uZW50LlxuICovXG5jbGFzcyBUcmVlTm9kZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBkZXB0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGlzQ29udGFpbmVyOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGlzRXhwYW5kZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNMb2FkaW5nOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGlzU2VsZWN0ZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgbGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBsYWJlbENsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG5vZGU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKExhenlUcmVlTm9kZSkuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrQXJyb3c6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25DbGljazogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkRvdWJsZUNsaWNrOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uTW91c2VEb3duOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHBhdGg6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICByb3dDbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9vbkNsaWNrID0gdGhpcy5fb25DbGljay5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uRG91YmxlQ2xpY2sgPSB0aGlzLl9vbkRvdWJsZUNsaWNrLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Nb3VzZURvd24gPSB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogT2JqZWN0LCBuZXh0U3RhdGU6IE9iamVjdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhZGRvbnMuUHVyZVJlbmRlck1peGluLnNob3VsZENvbXBvbmVudFVwZGF0ZS5jYWxsKHRoaXMsIG5leHRQcm9wcywgbmV4dFN0YXRlKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHJvd0NsYXNzTmFtZU9iajoge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge1xuICAgICAgLy8gU3VwcG9ydCBmb3Igc2VsZWN0b3JzIGluIHRoZSBcImZpbGUtaWNvbnNcIiBwYWNrYWdlLlxuICAgICAgLy8gQHNlZSB7QGxpbmsgaHR0cHM6Ly9hdG9tLmlvL3BhY2thZ2VzL2ZpbGUtaWNvbnN8ZmlsZS1pY29uc31cbiAgICAgICdlbnRyeSBmaWxlIGxpc3QtaXRlbSc6IHRydWUsXG4gICAgICAnbnVjbGlkZS10cmVlLWNvbXBvbmVudC1pdGVtJzogdHJ1ZSxcbiAgICAgICdudWNsaWRlLXRyZWUtY29tcG9uZW50LXNlbGVjdGVkJzogdGhpcy5wcm9wcy5pc1NlbGVjdGVkLFxuICAgIH07XG4gICAgaWYgKHRoaXMucHJvcHMucm93Q2xhc3NOYW1lKSB7XG4gICAgICByb3dDbGFzc05hbWVPYmpbdGhpcy5wcm9wcy5yb3dDbGFzc05hbWVdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBpdGVtU3R5bGUgPSB7XG4gICAgICBwYWRkaW5nTGVmdDogSU5ERU5UX0lOX1BYICsgdGhpcy5wcm9wcy5kZXB0aCAqIElOREVOVF9QRVJfTEVWRUxfSU5fUFgsXG4gICAgfTtcblxuICAgIGxldCBhcnJvdztcbiAgICBpZiAodGhpcy5wcm9wcy5pc0NvbnRhaW5lcikge1xuICAgICAgaWYgKHRoaXMucHJvcHMuaXNFeHBhbmRlZCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICBhcnJvdyA9IDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtdHJlZS1jb21wb25lbnQtaXRlbS1hcnJvdy1zcGlubmVyXCI+e1NQSU5ORVJ9PC9zcGFuPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhcnJvdyA9IERPV05fQVJST1c7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFycm93ID0gUklHSFRfQVJST1c7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHJvd0NsYXNzTmFtZU9iail9XG4gICAgICAgIHN0eWxlPXtpdGVtU3R5bGV9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9XG4gICAgICAgIG9uRG91YmxlQ2xpY2s9e3RoaXMuX29uRG91YmxlQ2xpY2t9XG4gICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9vbk1vdXNlRG93bn0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtdHJlZS1jb21wb25lbnQtaXRlbS1hcnJvd1wiIHJlZj1cImFycm93XCI+XG4gICAgICAgICAge2Fycm93fVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuXG4gICAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmxhYmVsQ2xhc3NOYW1lfVxuICAgICAgICAgIC8vIGBkYXRhLW5hbWVgIGlzIHN1cHBvcnQgZm9yIHNlbGVjdG9ycyBpbiB0aGUgXCJmaWxlLWljb25zXCIgcGFja2FnZS5cbiAgICAgICAgICAvLyBAc2VlIHtAbGluayBodHRwczovL2F0b20uaW8vcGFja2FnZXMvZmlsZS1pY29uc3xmaWxlLWljb25zfVxuICAgICAgICAgIGRhdGEtbmFtZT17dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgICBkYXRhLXBhdGg9e3RoaXMucHJvcHMucGF0aH0+XG4gICAgICAgICAge3RoaXMucHJvcHMubGFiZWx9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfb25DbGljayhldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmIChSZWFjdC5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2Fycm93J10pLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHtcbiAgICAgIHRoaXMucHJvcHMub25DbGlja0Fycm93KGV2ZW50LCB0aGlzLnByb3BzLm5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ2xpY2soZXZlbnQsIHRoaXMucHJvcHMubm9kZSk7XG4gICAgfVxuICB9XG5cbiAgX29uRG91YmxlQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uRG91YmxlQ2xpY2soZXZlbnQsIHRoaXMucHJvcHMubm9kZSk7XG4gIH1cblxuICBfb25Nb3VzZURvd24oZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uTW91c2VEb3duKGV2ZW50LCB0aGlzLnByb3BzLm5vZGUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJlZU5vZGVDb21wb25lbnQ7XG4iXX0=