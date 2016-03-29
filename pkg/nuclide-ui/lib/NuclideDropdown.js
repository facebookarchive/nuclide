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

var _require = require('react-for-atom');

var React = _require.React;
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
      onSelectedChange: function onSelectedChange(newIndex) {},
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

exports.NuclideDropdown = NuclideDropdown;
//# sourceMappingURL=data:application/json;base64,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OztXQUVRLG1CQUFDLEtBQTBCLEVBQVE7QUFDMUMsVUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsSUFBSSxJQUFJLEVBQUU7QUFDdEMsWUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDakQsWUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztPQUM1QztLQUNGOzs7U0FsRVUsZUFBZTtHQUFTLEtBQUssQ0FBQyxTQUFTIiwiZmlsZSI6Ik51Y2xpZGVEcm9wZG93bi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuZXhwb3J0IGNsYXNzIE51Y2xpZGVEcm9wZG93biBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBtZW51SXRlbXM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zaGFwZSh7XG4gICAgICBsYWJlbDogUHJvcFR5cGVzLm5vZGUuaXNSZXF1aXJlZCxcbiAgICAgIHZhbHVlOiBQcm9wVHlwZXMuYW55LFxuICAgIH0pKS5pc1JlcXVpcmVkLFxuICAgIHNlbGVjdGVkSW5kZXg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICAvKipcbiAgICAgKiBBIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgd2l0aCB0aGUgbmV3IHNlbGVjdGVkIGluZGV4IG9uIGNoYW5nZS5cbiAgICAgKi9cbiAgICBvblNlbGVjdGVkQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIC8qKlxuICAgICAqIFNpemUgb2YgZHJvcGRvd24uIFNpemVzIG1hdGNoIC5idG4gY2xhc3NlcyBpbiBBdG9tJ3Mgc3R5bGUgZ3VpZGUuIERlZmF1bHQgaXMgbWVkaXVtICh3aGljaFxuICAgICAqIGRvZXMgbm90IGhhdmUgYW4gYXNzb2NpYXRlZCAnc2l6ZScgc3RyaW5nKS5cbiAgICAgKi9cbiAgICBzaXplOiBQcm9wVHlwZXMub25lT2YoWyd4cycsICdzbScsICdsZyddKSxcbiAgICB0aXRsZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgY2xhc3NOYW1lOiAnJyxcbiAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgc2VsZWN0ZWRJbmRleDogMCxcbiAgICBtZW51SXRlbXM6IFtdLFxuICAgIG9uU2VsZWN0ZWRDaGFuZ2U6IChuZXdJbmRleDogbnVtYmVyKSA9PiB7fSxcbiAgICB0aXRsZTogJycsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25DaGFuZ2UgPSB0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMucHJvcHMubWVudUl0ZW1zLm1hcChpdGVtID0+XG4gICAgICA8b3B0aW9uIGtleT17aXRlbS52YWx1ZX0gdmFsdWU9e2l0ZW0udmFsdWV9PntpdGVtLmxhYmVsfTwvb3B0aW9uPlxuICAgICk7XG4gICAgbGV0IHNlbGVjdENsYXNzTmFtZSA9ICdidG4gbnVjbGlkZS1kcm9wZG93bic7XG4gICAgaWYgKHRoaXMucHJvcHMuc2l6ZSkge1xuICAgICAgc2VsZWN0Q2xhc3NOYW1lID0gYCR7c2VsZWN0Q2xhc3NOYW1lfSBidG4tJHt0aGlzLnByb3BzLnNpemV9YDtcbiAgICB9XG4gICAgY29uc3Qgc2VsZWN0ZWRJdGVtID0gdGhpcy5wcm9wcy5tZW51SXRlbXNbdGhpcy5wcm9wcy5zZWxlY3RlZEluZGV4XTtcbiAgICBjb25zdCBzZWxlY3RlZFZhbHVlID0gc2VsZWN0ZWRJdGVtICYmIHNlbGVjdGVkSXRlbS52YWx1ZTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9eydudWNsaWRlLWRyb3Bkb3duLWNvbnRhaW5lciAnICsgdGhpcy5wcm9wcy5jbGFzc05hbWV9PlxuICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgY2xhc3NOYW1lPXtzZWxlY3RDbGFzc05hbWV9XG4gICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfVxuICAgICAgICAgIHRpdGxlPXt0aGlzLnByb3BzLnRpdGxlfVxuICAgICAgICAgIHZhbHVlPXtzZWxlY3RlZFZhbHVlfT5cbiAgICAgICAgICB7b3B0aW9uc31cbiAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgIDxpIGNsYXNzTmFtZT1cImljb24gaWNvbi10cmlhbmdsZS1kb3duXCIgLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfb25DaGFuZ2UoZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LnNlbGVjdGVkSW5kZXggIT0gbnVsbCkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRJbmRleCA9IGV2ZW50LnRhcmdldC5zZWxlY3RlZEluZGV4O1xuICAgICAgdGhpcy5wcm9wcy5vblNlbGVjdGVkQ2hhbmdlKHNlbGVjdGVkSW5kZXgpO1xuICAgIH1cbiAgfVxufVxuIl19