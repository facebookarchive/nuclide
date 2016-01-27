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
//# sourceMappingURL=data:application/json;base64,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QUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNoRSxZQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNqRCxNQUFNO0FBQ0wsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDNUM7S0FDRjs7O1dBRWEsd0JBQUMsS0FBMEIsRUFBUTtBQUMvQyxVQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNsRDs7O1dBRVcsc0JBQUMsS0FBMEIsRUFBUTtBQUM3QyxVQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNoRDs7O1NBL0ZHLGlCQUFpQjtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQWtHL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJUcmVlTm9kZUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IExhenlUcmVlTm9kZSA9IHJlcXVpcmUoJy4vTGF6eVRyZWVOb2RlJyk7XG5jb25zdCB7XG4gIFB1cmVSZW5kZXJNaXhpbixcbiAgUmVhY3QsXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IGNsYXNzbmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNvbnN0IElOREVOVF9JTl9QWCA9IDEwO1xuY29uc3QgSU5ERU5UX1BFUl9MRVZFTF9JTl9QWCA9IDE1O1xuY29uc3QgRE9XTl9BUlJPVyA9ICdcXHVGMEEzJztcbmNvbnN0IFJJR0hUX0FSUk9XID0gJ1xcdUYwNzgnO1xuY29uc3QgU1BJTk5FUiA9ICdcXHVGMDg3JztcblxuLyoqXG4gKiBSZXByZXNlbnRzIG9uZSBlbnRyeSBpbiBhIFRyZWVDb21wb25lbnQuXG4gKi9cbmNsYXNzIFRyZWVOb2RlQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGRlcHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgaXNDb250YWluZXI6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNFeHBhbmRlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBpc0xvYWRpbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgaXNTZWxlY3RlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGxhYmVsQ2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgbm9kZTogUHJvcFR5cGVzLmluc3RhbmNlT2YoTGF6eVRyZWVOb2RlKS5pc1JlcXVpcmVkLFxuICAgIG9uQ2xpY2tBcnJvdzogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkNsaWNrOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uRG91YmxlQ2xpY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25Nb3VzZURvd246IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgcGF0aDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIHJvd0NsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Eb3VibGVDbGljayA9IHRoaXMuX29uRG91YmxlQ2xpY2suYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbk1vdXNlRG93biA9IHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogT2JqZWN0KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFB1cmVSZW5kZXJNaXhpbi5zaG91bGRDb21wb25lbnRVcGRhdGUuY2FsbCh0aGlzLCBuZXh0UHJvcHMsIG5leHRTdGF0ZSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCByb3dDbGFzc05hbWVPYmo6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSA9IHtcbiAgICAgIC8vIFN1cHBvcnQgZm9yIHNlbGVjdG9ycyBpbiB0aGUgXCJmaWxlLWljb25zXCIgcGFja2FnZS5cbiAgICAgIC8vIEBzZWUge0BsaW5rIGh0dHBzOi8vYXRvbS5pby9wYWNrYWdlcy9maWxlLWljb25zfGZpbGUtaWNvbnN9XG4gICAgICAnZW50cnkgZmlsZSBsaXN0LWl0ZW0nOiB0cnVlLFxuICAgICAgJ251Y2xpZGUtdHJlZS1jb21wb25lbnQtaXRlbSc6IHRydWUsXG4gICAgICAnbnVjbGlkZS10cmVlLWNvbXBvbmVudC1zZWxlY3RlZCc6IHRoaXMucHJvcHMuaXNTZWxlY3RlZCxcbiAgICB9O1xuICAgIGlmICh0aGlzLnByb3BzLnJvd0NsYXNzTmFtZSkge1xuICAgICAgcm93Q2xhc3NOYW1lT2JqW3RoaXMucHJvcHMucm93Q2xhc3NOYW1lXSA9IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgaXRlbVN0eWxlID0ge1xuICAgICAgcGFkZGluZ0xlZnQ6IElOREVOVF9JTl9QWCArIHRoaXMucHJvcHMuZGVwdGggKiBJTkRFTlRfUEVSX0xFVkVMX0lOX1BYLFxuICAgIH07XG5cbiAgICBsZXQgYXJyb3c7XG4gICAgaWYgKHRoaXMucHJvcHMuaXNDb250YWluZXIpIHtcbiAgICAgIGlmICh0aGlzLnByb3BzLmlzRXhwYW5kZWQpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgYXJyb3cgPSA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLXRyZWUtY29tcG9uZW50LWl0ZW0tYXJyb3ctc3Bpbm5lclwiPntTUElOTkVSfTwvc3Bhbj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJyb3cgPSBET1dOX0FSUk9XO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcnJvdyA9IFJJR0hUX0FSUk9XO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhyb3dDbGFzc05hbWVPYmopfVxuICAgICAgICBzdHlsZT17aXRlbVN0eWxlfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrfVxuICAgICAgICBvbkRvdWJsZUNsaWNrPXt0aGlzLl9vbkRvdWJsZUNsaWNrfVxuICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5fb25Nb3VzZURvd259PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLXRyZWUtY29tcG9uZW50LWl0ZW0tYXJyb3dcIiByZWY9XCJhcnJvd1wiPlxuICAgICAgICAgIHthcnJvd31cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhblxuICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5sYWJlbENsYXNzTmFtZX1cbiAgICAgICAgICAvLyBgZGF0YS1uYW1lYCBpcyBzdXBwb3J0IGZvciBzZWxlY3RvcnMgaW4gdGhlIFwiZmlsZS1pY29uc1wiIHBhY2thZ2UuXG4gICAgICAgICAgLy8gQHNlZSB7QGxpbmsgaHR0cHM6Ly9hdG9tLmlvL3BhY2thZ2VzL2ZpbGUtaWNvbnN8ZmlsZS1pY29uc31cbiAgICAgICAgICBkYXRhLW5hbWU9e3RoaXMucHJvcHMubGFiZWx9XG4gICAgICAgICAgZGF0YS1wYXRoPXt0aGlzLnByb3BzLnBhdGh9PlxuICAgICAgICAgIHt0aGlzLnByb3BzLmxhYmVsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX29uQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzWydhcnJvdyddKS5jb250YWlucyhldmVudC50YXJnZXQpKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ2xpY2tBcnJvdyhldmVudCwgdGhpcy5wcm9wcy5ub2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKGV2ZW50LCB0aGlzLnByb3BzLm5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkRvdWJsZUNsaWNrKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vbkRvdWJsZUNsaWNrKGV2ZW50LCB0aGlzLnByb3BzLm5vZGUpO1xuICB9XG5cbiAgX29uTW91c2VEb3duKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vbk1vdXNlRG93bihldmVudCwgdGhpcy5wcm9wcy5ub2RlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWVOb2RlQ29tcG9uZW50O1xuIl19