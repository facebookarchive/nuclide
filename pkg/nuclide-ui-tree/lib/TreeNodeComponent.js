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

var _require = require('react-for-atom');

var PureRenderMixin = _require.PureRenderMixin;
var React = _require.React;
var ReactDOM = _require.ReactDOM;

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

module.exports = TreeNodeComponent;
//# sourceMappingURL=data:application/json;base64,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QUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDbkUsWUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDakQsTUFBTTtBQUNMLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzVDO0tBQ0Y7OztXQUVhLHdCQUFDLEtBQTBCLEVBQVE7QUFDL0MsVUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbEQ7OztXQUVXLHNCQUFDLEtBQTBCLEVBQVE7QUFDN0MsVUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEQ7OztTQWhHRyxpQkFBaUI7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUFtRy9DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMiLCJmaWxlIjoiVHJlZU5vZGVDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBMYXp5VHJlZU5vZGUgPSByZXF1aXJlKCcuL0xhenlUcmVlTm9kZScpO1xuY29uc3Qge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3QgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgSU5ERU5UX0lOX1BYID0gMTA7XG5jb25zdCBJTkRFTlRfUEVSX0xFVkVMX0lOX1BYID0gMTU7XG5jb25zdCBET1dOX0FSUk9XID0gJ1xcdUYwQTMnO1xuY29uc3QgUklHSFRfQVJST1cgPSAnXFx1RjA3OCc7XG5jb25zdCBTUElOTkVSID0gJ1xcdUYwODcnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgb25lIGVudHJ5IGluIGEgVHJlZUNvbXBvbmVudC5cbiAqL1xuY2xhc3MgVHJlZU5vZGVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZTogdm9pZDtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGRlcHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgaXNDb250YWluZXI6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNFeHBhbmRlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBpc0xvYWRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNTZWxlY3RlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGxhYmVsQ2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgbm9kZTogUHJvcFR5cGVzLmluc3RhbmNlT2YoTGF6eVRyZWVOb2RlKS5pc1JlcXVpcmVkLFxuICAgIG9uQ2xpY2tBcnJvdzogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uRG91YmxlQ2xpY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25Nb3VzZURvd246IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgcGF0aDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHJvd0NsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNsaWNrID0gdGhpcy5fb25DbGljay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkRvdWJsZUNsaWNrID0gdGhpcy5fb25Eb3VibGVDbGljay5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9vbk1vdXNlRG93biA9IHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogdm9pZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBQdXJlUmVuZGVyTWl4aW4uc2hvdWxkQ29tcG9uZW50VXBkYXRlLmNhbGwodGhpcywgbmV4dFByb3BzLCBuZXh0U3RhdGUpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgcm93Q2xhc3NOYW1lT2JqOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0gPSB7XG4gICAgICAvLyBTdXBwb3J0IGZvciBzZWxlY3RvcnMgaW4gdGhlIFwiZmlsZS1pY29uc1wiIHBhY2thZ2UuXG4gICAgICAvLyBAc2VlIHtAbGluayBodHRwczovL2F0b20uaW8vcGFja2FnZXMvZmlsZS1pY29uc3xmaWxlLWljb25zfVxuICAgICAgJ2VudHJ5IGZpbGUgbGlzdC1pdGVtJzogdHJ1ZSxcbiAgICAgICdudWNsaWRlLXRyZWUtY29tcG9uZW50LWl0ZW0nOiB0cnVlLFxuICAgICAgJ251Y2xpZGUtdHJlZS1jb21wb25lbnQtc2VsZWN0ZWQnOiB0aGlzLnByb3BzLmlzU2VsZWN0ZWQsXG4gICAgfTtcbiAgICBpZiAodGhpcy5wcm9wcy5yb3dDbGFzc05hbWUpIHtcbiAgICAgIHJvd0NsYXNzTmFtZU9ialt0aGlzLnByb3BzLnJvd0NsYXNzTmFtZV0gPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGl0ZW1TdHlsZSA9IHtcbiAgICAgIHBhZGRpbmdMZWZ0OiBJTkRFTlRfSU5fUFggKyB0aGlzLnByb3BzLmRlcHRoICogSU5ERU5UX1BFUl9MRVZFTF9JTl9QWCxcbiAgICB9O1xuXG4gICAgbGV0IGFycm93O1xuICAgIGlmICh0aGlzLnByb3BzLmlzQ29udGFpbmVyKSB7XG4gICAgICBpZiAodGhpcy5wcm9wcy5pc0V4cGFuZGVkKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmlzTG9hZGluZykge1xuICAgICAgICAgIGFycm93ID0gPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS10cmVlLWNvbXBvbmVudC1pdGVtLWFycm93LXNwaW5uZXJcIj57U1BJTk5FUn08L3NwYW4+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFycm93ID0gRE9XTl9BUlJPVztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJyb3cgPSBSSUdIVF9BUlJPVztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMocm93Q2xhc3NOYW1lT2JqKX1cbiAgICAgICAgc3R5bGU9e2l0ZW1TdHlsZX1cbiAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGlja31cbiAgICAgICAgb25Eb3VibGVDbGljaz17dGhpcy5fb25Eb3VibGVDbGlja31cbiAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX29uTW91c2VEb3dufT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS10cmVlLWNvbXBvbmVudC1pdGVtLWFycm93XCIgcmVmPVwiYXJyb3dcIj5cbiAgICAgICAgICB7YXJyb3d9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBjbGFzc05hbWU9e3RoaXMucHJvcHMubGFiZWxDbGFzc05hbWV9XG4gICAgICAgICAgLy8gYGRhdGEtbmFtZWAgaXMgc3VwcG9ydCBmb3Igc2VsZWN0b3JzIGluIHRoZSBcImZpbGUtaWNvbnNcIiBwYWNrYWdlLlxuICAgICAgICAgIC8vIEBzZWUge0BsaW5rIGh0dHBzOi8vYXRvbS5pby9wYWNrYWdlcy9maWxlLWljb25zfGZpbGUtaWNvbnN9XG4gICAgICAgICAgZGF0YS1uYW1lPXt0aGlzLnByb3BzLmxhYmVsfVxuICAgICAgICAgIGRhdGEtcGF0aD17dGhpcy5wcm9wcy5wYXRofT5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNsaWNrKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snYXJyb3cnXSkuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrQXJyb3coZXZlbnQsIHRoaXMucHJvcHMubm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcHMub25DbGljayhldmVudCwgdGhpcy5wcm9wcy5ub2RlKTtcbiAgICB9XG4gIH1cblxuICBfb25Eb3VibGVDbGljayhldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25Eb3VibGVDbGljayhldmVudCwgdGhpcy5wcm9wcy5ub2RlKTtcbiAgfVxuXG4gIF9vbk1vdXNlRG93bihldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25Nb3VzZURvd24oZXZlbnQsIHRoaXMucHJvcHMubm9kZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmVlTm9kZUNvbXBvbmVudDtcbiJdfQ==