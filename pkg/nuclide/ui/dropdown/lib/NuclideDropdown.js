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

var React = require('react-for-atom');
var emptyfunction = require('emptyfunction');

var PropTypes = React.PropTypes;

var NuclideDropdown = (function (_React$Component) {
  _inherits(NuclideDropdown, _React$Component);

  _createClass(NuclideDropdown, null, [{
    key: 'propTypes',
    value: {
      className: PropTypes.string.isRequired,
      disabled: PropTypes.bool.isRequired,
      menuItems: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.node.isRequired,
        value: PropTypes.any
      })).isRequired,
      selectedIndex: PropTypes.number.isRequired,
      /**
       * A function that gets called with the new selected index on change.
       */
      onSelectedChange: PropTypes.func.isRequired,
      /**
       * Size of dropdown. Sizes match .btn classes in Atom's style guide. Default is medium (which
       * does not have an associated 'size' string).
       */
      size: PropTypes.oneOf(['xs', 'sm', 'lg']),
      title: PropTypes.string.isRequired
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      className: '',
      disabled: false,
      selectedIndex: 0,
      menuItems: [],
      onSelectedChange: emptyfunction,
      title: ''
    },
    enumerable: true
  }]);

  function NuclideDropdown(props) {
    _classCallCheck(this, NuclideDropdown);

    _get(Object.getPrototypeOf(NuclideDropdown.prototype), 'constructor', this).call(this, props);
    this._onChange = this._onChange.bind(this);
  }

  _createClass(NuclideDropdown, [{
    key: 'render',
    value: function render() {
      var options = this.props.menuItems.map(function (item) {
        return React.createElement(
          'option',
          { key: item.value, value: item.value },
          item.label
        );
      });
      var selectClassName = 'btn nuclide-dropdown';
      if (this.props.size) {
        selectClassName = selectClassName + ' btn-' + this.props.size;
      }
      var selectedItem = this.props.menuItems[this.props.selectedIndex];
      var selectedValue = selectedItem && selectedItem.value;
      return React.createElement(
        'div',
        { className: 'nuclide-dropdown-container ' + this.props.className },
        React.createElement(
          'select',
          {
            className: selectClassName,
            disabled: this.props.disabled,
            onChange: this._onChange,
            title: this.props.title,
            value: selectedValue },
          options
        ),
        React.createElement('i', { className: 'icon icon-triangle-down' })
      );
    }
  }, {
    key: '_onChange',
    value: function _onChange(event) {
      if (event.target.selectedIndex != null) {
        var selectedIndex = event.target.selectedIndex;
        this.props.onSelectedChange(selectedIndex);
      }
    }
  }]);

  return NuclideDropdown;
})(React.Component);

module.exports = NuclideDropdown;
//# sourceMappingURL=data:application/json;base64,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RztPQUNyQyxDQUNOO0tBQ0g7OztXQUVRLG1CQUFDLEtBQTBCLEVBQVE7QUFDMUMsVUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsSUFBSSxJQUFJLEVBQUU7QUFDdEMsWUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDakQsWUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztPQUM1QztLQUNGOzs7U0FsRUcsZUFBZTtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQXFFN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiTnVjbGlkZURyb3Bkb3duLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3QgZW1wdHlmdW5jdGlvbiA9IHJlcXVpcmUoJ2VtcHR5ZnVuY3Rpb24nKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuY2xhc3MgTnVjbGlkZURyb3Bkb3duIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIG1lbnVJdGVtczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnNoYXBlKHtcbiAgICAgIGxhYmVsOiBQcm9wVHlwZXMubm9kZS5pc1JlcXVpcmVkLFxuICAgICAgdmFsdWU6IFByb3BUeXBlcy5hbnksXG4gICAgfSkpLmlzUmVxdWlyZWQsXG4gICAgc2VsZWN0ZWRJbmRleDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIC8qKlxuICAgICAqIEEgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCB3aXRoIHRoZSBuZXcgc2VsZWN0ZWQgaW5kZXggb24gY2hhbmdlLlxuICAgICAqL1xuICAgIG9uU2VsZWN0ZWRDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgLyoqXG4gICAgICogU2l6ZSBvZiBkcm9wZG93bi4gU2l6ZXMgbWF0Y2ggLmJ0biBjbGFzc2VzIGluIEF0b20ncyBzdHlsZSBndWlkZS4gRGVmYXVsdCBpcyBtZWRpdW0gKHdoaWNoXG4gICAgICogZG9lcyBub3QgaGF2ZSBhbiBhc3NvY2lhdGVkICdzaXplJyBzdHJpbmcpLlxuICAgICAqL1xuICAgIHNpemU6IFByb3BUeXBlcy5vbmVPZihbJ3hzJywgJ3NtJywgJ2xnJ10pLFxuICAgIHRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBjbGFzc05hbWU6ICcnLFxuICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICBzZWxlY3RlZEluZGV4OiAwLFxuICAgIG1lbnVJdGVtczogW10sXG4gICAgb25TZWxlY3RlZENoYW5nZTogZW1wdHlmdW5jdGlvbixcbiAgICB0aXRsZTogJycsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9vbkNoYW5nZSA9IHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5wcm9wcy5tZW51SXRlbXMubWFwKGl0ZW0gPT5cbiAgICAgIDxvcHRpb24ga2V5PXtpdGVtLnZhbHVlfSB2YWx1ZT17aXRlbS52YWx1ZX0+e2l0ZW0ubGFiZWx9PC9vcHRpb24+XG4gICAgKTtcbiAgICBsZXQgc2VsZWN0Q2xhc3NOYW1lID0gJ2J0biBudWNsaWRlLWRyb3Bkb3duJztcbiAgICBpZiAodGhpcy5wcm9wcy5zaXplKSB7XG4gICAgICBzZWxlY3RDbGFzc05hbWUgPSBgJHtzZWxlY3RDbGFzc05hbWV9IGJ0bi0ke3RoaXMucHJvcHMuc2l6ZX1gO1xuICAgIH1cbiAgICBjb25zdCBzZWxlY3RlZEl0ZW0gPSB0aGlzLnByb3BzLm1lbnVJdGVtc1t0aGlzLnByb3BzLnNlbGVjdGVkSW5kZXhdO1xuICAgIGNvbnN0IHNlbGVjdGVkVmFsdWUgPSBzZWxlY3RlZEl0ZW0gJiYgc2VsZWN0ZWRJdGVtLnZhbHVlO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17J251Y2xpZGUtZHJvcGRvd24tY29udGFpbmVyICcgKyB0aGlzLnByb3BzLmNsYXNzTmFtZX0+XG4gICAgICAgIDxzZWxlY3RcbiAgICAgICAgICBjbGFzc05hbWU9e3NlbGVjdENsYXNzTmFtZX1cbiAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9XG4gICAgICAgICAgdGl0bGU9e3RoaXMucHJvcHMudGl0bGV9XG4gICAgICAgICAgdmFsdWU9e3NlbGVjdGVkVmFsdWV9PlxuICAgICAgICAgIHtvcHRpb25zfVxuICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgPGkgY2xhc3NOYW1lPVwiaWNvbiBpY29uLXRyaWFuZ2xlLWRvd25cIiAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNoYW5nZShldmVudDogU3ludGhldGljTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmIChldmVudC50YXJnZXQuc2VsZWN0ZWRJbmRleCAhPSBudWxsKSB7XG4gICAgICBjb25zdCBzZWxlY3RlZEluZGV4ID0gZXZlbnQudGFyZ2V0LnNlbGVjdGVkSW5kZXg7XG4gICAgICB0aGlzLnByb3BzLm9uU2VsZWN0ZWRDaGFuZ2Uoc2VsZWN0ZWRJbmRleCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTnVjbGlkZURyb3Bkb3duO1xuIl19