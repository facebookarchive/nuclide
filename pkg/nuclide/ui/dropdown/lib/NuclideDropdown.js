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

var _require = require('react-for-atom');

var React = _require.React;

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
//# sourceMappingURL=data:application/json;base64,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QUF5QixHQUFHO09BQ3JDLENBQ047S0FDSDs7O1dBRVEsbUJBQUMsS0FBMEIsRUFBUTtBQUMxQyxVQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxJQUFJLElBQUksRUFBRTtBQUN0QyxZQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUNqRCxZQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO09BQzVDO0tBQ0Y7OztTQWxFRyxlQUFlO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBcUU3QyxNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJOdWNsaWRlRHJvcGRvd24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IGVtcHR5ZnVuY3Rpb24gPSByZXF1aXJlKCdlbXB0eWZ1bmN0aW9uJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmNsYXNzIE51Y2xpZGVEcm9wZG93biBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBtZW51SXRlbXM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICBsYWJlbDogUHJvcFR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcbiAgICAgIHZhbHVlOiBQcm9wVHlwZXMuYW55LFxuICAgIH0pKS5pc1JlcXVpcmVkLFxuICAgIHNlbGVjdGVkSW5kZXg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICAvKipcbiAgICAgKiBBIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgd2l0aCB0aGUgbmV3IHNlbGVjdGVkIGluZGV4IG9uIGNoYW5nZS5cbiAgICAgKi9cbiAgICBvblNlbGVjdGVkQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIC8qKlxuICAgICAqIFNpemUgb2YgZHJvcGRvd24uIFNpemVzIG1hdGNoIC5idG4gY2xhc3NlcyBpbiBBdG9tJ3Mgc3R5bGUgZ3VpZGUuIERlZmF1bHQgaXMgbWVkaXVtICh3aGljaFxuICAgICAqIGRvZXMgbm90IGhhdmUgYW4gYXNzb2NpYXRlZCAnc2l6ZScgc3RyaW5nKS5cbiAgICAgKi9cbiAgICBzaXplOiBQcm9wVHlwZXMub25lT2YoWyd4cycsICdzbScsICdsZyddKSxcbiAgICB0aXRsZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgY2xhc3NOYW1lOiAnJyxcbiAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgc2VsZWN0ZWRJbmRleDogMCxcbiAgICBtZW51SXRlbXM6IFtdLFxuICAgIG9uU2VsZWN0ZWRDaGFuZ2U6IGVtcHR5ZnVuY3Rpb24sXG4gICAgdGl0bGU6ICcnLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2hhbmdlID0gdGhpcy5fb25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLnByb3BzLm1lbnVJdGVtcy5tYXAoaXRlbSA9PlxuICAgICAgPG9wdGlvbiBrZXk9e2l0ZW0udmFsdWV9IHZhbHVlPXtpdGVtLnZhbHVlfT57aXRlbS5sYWJlbH08L29wdGlvbj5cbiAgICApO1xuICAgIGxldCBzZWxlY3RDbGFzc05hbWUgPSAnYnRuIG51Y2xpZGUtZHJvcGRvd24nO1xuICAgIGlmICh0aGlzLnByb3BzLnNpemUpIHtcbiAgICAgIHNlbGVjdENsYXNzTmFtZSA9IGAke3NlbGVjdENsYXNzTmFtZX0gYnRuLSR7dGhpcy5wcm9wcy5zaXplfWA7XG4gICAgfVxuICAgIGNvbnN0IHNlbGVjdGVkSXRlbSA9IHRoaXMucHJvcHMubWVudUl0ZW1zW3RoaXMucHJvcHMuc2VsZWN0ZWRJbmRleF07XG4gICAgY29uc3Qgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdGVkSXRlbSAmJiBzZWxlY3RlZEl0ZW0udmFsdWU7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsnbnVjbGlkZS1kcm9wZG93bi1jb250YWluZXIgJyArIHRoaXMucHJvcHMuY2xhc3NOYW1lfT5cbiAgICAgICAgPHNlbGVjdFxuICAgICAgICAgIGNsYXNzTmFtZT17c2VsZWN0Q2xhc3NOYW1lfVxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkNoYW5nZX1cbiAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy50aXRsZX1cbiAgICAgICAgICB2YWx1ZT17c2VsZWN0ZWRWYWx1ZX0+XG4gICAgICAgICAge29wdGlvbnN9XG4gICAgICAgIDwvc2VsZWN0PlxuICAgICAgICA8aSBjbGFzc05hbWU9XCJpY29uIGljb24tdHJpYW5nbGUtZG93blwiIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX29uQ2hhbmdlKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKGV2ZW50LnRhcmdldC5zZWxlY3RlZEluZGV4ICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkSW5kZXggPSBldmVudC50YXJnZXQuc2VsZWN0ZWRJbmRleDtcbiAgICAgIHRoaXMucHJvcHMub25TZWxlY3RlZENoYW5nZShzZWxlY3RlZEluZGV4KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOdWNsaWRlRHJvcGRvd247XG4iXX0=