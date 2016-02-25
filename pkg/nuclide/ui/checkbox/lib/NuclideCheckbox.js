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

var _reactForAtom = require('react-for-atom');

var PropTypes = _reactForAtom.React.PropTypes;

/**
 * A checkbox component with an input checkbox and a label. We restrict the label to a string
 * to ensure this component is pure.
 */

var NuclideCheckbox = (function (_React$Component) {
  _inherits(NuclideCheckbox, _React$Component);

  _createClass(NuclideCheckbox, null, [{
    key: 'propTypes',
    value: {
      checked: PropTypes.bool.isRequired,
      label: PropTypes.string.isRequired,
      onChange: PropTypes.func.isRequired
    },
    enumerable: true
  }]);

  function NuclideCheckbox(props) {
    _classCallCheck(this, NuclideCheckbox);

    _get(Object.getPrototypeOf(NuclideCheckbox.prototype), 'constructor', this).call(this, props);
    this._onChange = this._onChange.bind(this);
  }

  _createClass(NuclideCheckbox, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return _reactForAtom.PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'label',
        { className: 'nuclide-ui-checkbox-label' },
        _reactForAtom.React.createElement('input', {
          type: 'checkbox',
          checked: this.props.checked,
          onChange: this._onChange
        }),
        ' ',
        this.props.label
      );
    }
  }, {
    key: '_onChange',
    value: function _onChange(event) {
      var isChecked = event.target.checked;
      this.props.onChange.call(null, isChecked);
    }
  }]);

  return NuclideCheckbox;
})(_reactForAtom.React.Component);

exports['default'] = NuclideCheckbox;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVDaGVja2JveC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFjTyxnQkFBZ0I7O0lBRWhCLFNBQVMsdUJBQVQsU0FBUzs7Ozs7OztJQU1LLGVBQWU7WUFBZixlQUFlOztlQUFmLGVBQWU7O1dBR2Y7QUFDakIsYUFBTyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNsQyxXQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2xDLGNBQVEsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7S0FDcEM7Ozs7QUFFVSxXQVRRLGVBQWUsQ0FTdEIsS0FBYSxFQUFFOzBCQVRSLGVBQWU7O0FBVWhDLCtCQVZpQixlQUFlLDZDQVUxQixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDbkQ7O2VBWmtCLGVBQWU7O1dBY2IsK0JBQUMsU0FBaUIsRUFBRSxTQUFlLEVBQVc7QUFDakUsYUFBTyw4QkFBZ0IscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDL0U7OztXQUVLLGtCQUFpQjtBQUNyQixhQUNFOztVQUFPLFNBQVMsRUFBQywyQkFBMkI7UUFDMUM7QUFDRSxjQUFJLEVBQUMsVUFBVTtBQUNmLGlCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7QUFDNUIsa0JBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxBQUFDO1VBQ3pCO1FBQ0QsR0FBRztRQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztPQUNoQixDQUNSO0tBQ0g7OztXQUVRLG1CQUFDLEtBQXFCLEVBQUU7QUFDL0IsVUFBTSxTQUFTLEdBQUcsQUFBRSxLQUFLLENBQUMsTUFBTSxDQUEwQixPQUFPLENBQUM7QUFDbEUsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUMzQzs7O1NBbENrQixlQUFlO0dBQVMsb0JBQU0sU0FBUzs7cUJBQXZDLGVBQWUiLCJmaWxlIjoiTnVjbGlkZUNoZWNrYm94LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtcbiAgUHVyZVJlbmRlck1peGluLFxuICBSZWFjdCxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG4vKipcbiAqIEEgY2hlY2tib3ggY29tcG9uZW50IHdpdGggYW4gaW5wdXQgY2hlY2tib3ggYW5kIGEgbGFiZWwuIFdlIHJlc3RyaWN0IHRoZSBsYWJlbCB0byBhIHN0cmluZ1xuICogdG8gZW5zdXJlIHRoaXMgY29tcG9uZW50IGlzIHB1cmUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE51Y2xpZGVDaGVja2JveCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlOiB2b2lkO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY2hlY2tlZDogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICBsYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2hhbmdlID0gdGhpcy5fb25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IE9iamVjdCwgbmV4dFN0YXRlOiB2b2lkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFB1cmVSZW5kZXJNaXhpbi5zaG91bGRDb21wb25lbnRVcGRhdGUuY2FsbCh0aGlzLCBuZXh0UHJvcHMsIG5leHRTdGF0ZSk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIm51Y2xpZGUtdWktY2hlY2tib3gtbGFiZWxcIj5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLmNoZWNrZWR9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfVxuICAgICAgICAvPlxuICAgICAgICB7JyAnfXt0aGlzLnByb3BzLmxhYmVsfVxuICAgICAgPC9sYWJlbD5cbiAgICApO1xuICB9XG5cbiAgX29uQ2hhbmdlKGV2ZW50OiBTeW50aGV0aWNFdmVudCkge1xuICAgIGNvbnN0IGlzQ2hlY2tlZCA9ICgoZXZlbnQudGFyZ2V0OiBhbnkpOiBIVE1MSW5wdXRFbGVtZW50KS5jaGVja2VkO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UuY2FsbChudWxsLCBpc0NoZWNrZWQpO1xuICB9XG59XG4iXX0=