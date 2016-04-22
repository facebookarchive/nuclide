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
//# sourceMappingURL=data:application/json;base64,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LFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNuRSxZQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNqRCxNQUFNO0FBQ0wsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDNUM7S0FDRjs7O1dBRWEsd0JBQUMsS0FBMEIsRUFBUTtBQUMvQyxVQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNsRDs7O1dBRVcsc0JBQUMsS0FBMEIsRUFBUTtBQUM3QyxVQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNoRDs7O1NBaEdVLGlCQUFpQjtHQUFTLEtBQUssQ0FBQyxTQUFTIiwiZmlsZSI6IlRyZWVOb2RlQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0xhenlUcmVlTm9kZX0gPSByZXF1aXJlKCcuL0xhenlUcmVlTm9kZScpO1xuY29uc3Qge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3QgY2xhc3NuYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY29uc3QgSU5ERU5UX0lOX1BYID0gMTA7XG5jb25zdCBJTkRFTlRfUEVSX0xFVkVMX0lOX1BYID0gMTU7XG5jb25zdCBET1dOX0FSUk9XID0gJ1xcdUYwQTMnO1xuY29uc3QgUklHSFRfQVJST1cgPSAnXFx1RjA3OCc7XG5jb25zdCBTUElOTkVSID0gJ1xcdUYwODcnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgb25lIGVudHJ5IGluIGEgVHJlZUNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFRyZWVOb2RlQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGU6IHZvaWQ7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBkZXB0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGlzQ29udGFpbmVyOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGlzRXhwYW5kZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNMb2FkaW5nOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIGlzU2VsZWN0ZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgbGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBsYWJlbENsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG5vZGU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKExhenlUcmVlTm9kZSkuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrQXJyb3c6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25DbGljazogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkRvdWJsZUNsaWNrOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uTW91c2VEb3duOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHBhdGg6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICByb3dDbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25DbGljayA9IHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Eb3VibGVDbGljayA9IHRoaXMuX29uRG91YmxlQ2xpY2suYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fb25Nb3VzZURvd24gPSB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogT2JqZWN0LCBuZXh0U3RhdGU6IHZvaWQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gUHVyZVJlbmRlck1peGluLnNob3VsZENvbXBvbmVudFVwZGF0ZS5jYWxsKHRoaXMsIG5leHRQcm9wcywgbmV4dFN0YXRlKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBjb25zdCByb3dDbGFzc05hbWVPYmo6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHtcbiAgICAgIC8vIFN1cHBvcnQgZm9yIHNlbGVjdG9ycyBpbiB0aGUgXCJmaWxlLWljb25zXCIgcGFja2FnZS5cbiAgICAgIC8vIEBzZWUge0BsaW5rIGh0dHBzOi8vYXRvbS5pby9wYWNrYWdlcy9maWxlLWljb25zfGZpbGUtaWNvbnN9XG4gICAgICAnZW50cnkgZmlsZSBsaXN0LWl0ZW0nOiB0cnVlLFxuICAgICAgJ251Y2xpZGUtdHJlZS1jb21wb25lbnQtaXRlbSc6IHRydWUsXG4gICAgICAnbnVjbGlkZS10cmVlLWNvbXBvbmVudC1zZWxlY3RlZCc6IHRoaXMucHJvcHMuaXNTZWxlY3RlZCxcbiAgICB9O1xuICAgIGlmICh0aGlzLnByb3BzLnJvd0NsYXNzTmFtZSkge1xuICAgICAgcm93Q2xhc3NOYW1lT2JqW3RoaXMucHJvcHMucm93Q2xhc3NOYW1lXSA9IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgaXRlbVN0eWxlID0ge1xuICAgICAgcGFkZGluZ0xlZnQ6IElOREVOVF9JTl9QWCArIHRoaXMucHJvcHMuZGVwdGggKiBJTkRFTlRfUEVSX0xFVkVMX0lOX1BYLFxuICAgIH07XG5cbiAgICBsZXQgYXJyb3c7XG4gICAgaWYgKHRoaXMucHJvcHMuaXNDb250YWluZXIpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLmlzRXhwYW5kZWQpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgYXJyb3cgPSA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLXRyZWUtY29tcG9uZW50LWl0ZW0tYXJyb3ctc3Bpbm5lclwiPntTUElOTkVSfTwvc3Bhbj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJyb3cgPSBET1dOX0FSUk9XO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcnJvdyA9IFJJR0hUX0FSUk9XO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhyb3dDbGFzc05hbWVPYmopfVxuICAgICAgICBzdHlsZT17aXRlbVN0eWxlfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrfVxuICAgICAgICBvbkRvdWJsZUNsaWNrPXt0aGlzLl9vbkRvdWJsZUNsaWNrfVxuICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5fb25Nb3VzZURvd259PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLXRyZWUtY29tcG9uZW50LWl0ZW0tYXJyb3dcIiByZWY9XCJhcnJvd1wiPlxuICAgICAgICAgIHthcnJvd31cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhblxuICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5sYWJlbENsYXNzTmFtZX1cbiAgICAgICAgICAvLyBgZGF0YS1uYW1lYCBpcyBzdXBwb3J0IGZvciBzZWxlY3RvcnMgaW4gdGhlIFwiZmlsZS1pY29uc1wiIHBhY2thZ2UuXG4gICAgICAgICAgLy8gQHNlZSB7QGxpbmsgaHR0cHM6Ly9hdG9tLmlvL3BhY2thZ2VzL2ZpbGUtaWNvbnN8ZmlsZS1pY29uc31cbiAgICAgICAgICBkYXRhLW5hbWU9e3RoaXMucHJvcHMubGFiZWx9XG4gICAgICAgICAgZGF0YS1wYXRoPXt0aGlzLnByb3BzLnBhdGh9PlxuICAgICAgICAgIHt0aGlzLnByb3BzLmxhYmVsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX29uQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydhcnJvdyddKS5jb250YWlucyhldmVudC50YXJnZXQpKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ2xpY2tBcnJvdyhldmVudCwgdGhpcy5wcm9wcy5ub2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKGV2ZW50LCB0aGlzLnByb3BzLm5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkRvdWJsZUNsaWNrKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vbkRvdWJsZUNsaWNrKGV2ZW50LCB0aGlzLnByb3BzLm5vZGUpO1xuICB9XG5cbiAgX29uTW91c2VEb3duKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vbk1vdXNlRG93bihldmVudCwgdGhpcy5wcm9wcy5ub2RlKTtcbiAgfVxufVxuIl19