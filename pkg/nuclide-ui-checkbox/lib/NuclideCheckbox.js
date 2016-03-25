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

/**
 * A checkbox component with an input checkbox and a label. We restrict the label to a string
 * to ensure this component is pure.
 */

var NuclideCheckbox = (function (_React$Component) {
  _inherits(NuclideCheckbox, _React$Component);

  _createClass(NuclideCheckbox, null, [{
    key: 'defaultProps',
    value: {
      disabled: false,
      indeterminate: false,
      label: '',
      onClick: function onClick(event) {}
    },
    enumerable: true
  }]);

  function NuclideCheckbox(props) {
    _classCallCheck(this, NuclideCheckbox);

    _get(Object.getPrototypeOf(NuclideCheckbox.prototype), 'constructor', this).call(this, props);
    this._onChange = this._onChange.bind(this);
  }

  _createClass(NuclideCheckbox, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._setIndeterminate();
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return _reactForAtom.PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._setIndeterminate();
    }
  }, {
    key: '_onChange',
    value: function _onChange(event) {
      var isChecked = event.target.checked;
      this.props.onChange.call(null, isChecked);
    }

    /*
     * Syncs the `indeterminate` prop to the underlying `<input>`. `indeterminate` is intentionally
     * not settable via HTML; it must be done on the `HTMLInputElement` instance in script.
     *
     * @see https://www.w3.org/TR/html5/forms.html#the-input-element
     */
  }, {
    key: '_setIndeterminate',
    value: function _setIndeterminate() {
      _reactForAtom.ReactDOM.findDOMNode(this.refs['input']).indeterminate = this.props.indeterminate;
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'label',
        { className: 'nuclide-ui-checkbox-label', onClick: this.props.onClick },
        _reactForAtom.React.createElement('input', {
          checked: this.props.checked,
          className: 'nuclide-ui-checkbox',
          disabled: this.props.disabled,
          onChange: this._onChange,
          ref: 'input',
          type: 'checkbox'
        }),
        ' ',
        this.props.label
      );
    }
  }]);

  return NuclideCheckbox;
})(_reactForAtom.React.Component);

exports['default'] = NuclideCheckbox;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVDaGVja2JveC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFlTyxnQkFBZ0I7Ozs7Ozs7SUFlRixlQUFlO1lBQWYsZUFBZTs7ZUFBZixlQUFlOztXQUdaO0FBQ3BCLGNBQVEsRUFBRSxLQUFLO0FBQ2YsbUJBQWEsRUFBRSxLQUFLO0FBQ3BCLFdBQUssRUFBRSxFQUFFO0FBQ1QsYUFBTyxFQUFBLGlCQUFDLEtBQUssRUFBRSxFQUFFO0tBQ2xCOzs7O0FBRVUsV0FWUSxlQUFlLENBVXRCLEtBQWEsRUFBRTswQkFWUixlQUFlOztBQVdoQywrQkFYaUIsZUFBZSw2Q0FXMUIsS0FBSyxFQUFFO0FBQ2IsQUFBQyxRQUFJLENBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ25EOztlQWJrQixlQUFlOztXQWVqQiw2QkFBRztBQUNsQixVQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUMxQjs7O1dBRW9CLCtCQUFDLFNBQWlCLEVBQUUsU0FBZSxFQUFXO0FBQ2pFLGFBQU8sOEJBQWdCLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQy9FOzs7V0FFaUIsOEJBQUc7QUFDbkIsVUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7S0FDMUI7OztXQUVRLG1CQUFDLEtBQXFCLEVBQUU7QUFDL0IsVUFBTSxTQUFTLEdBQUcsQUFBRSxLQUFLLENBQUMsTUFBTSxDQUEwQixPQUFPLENBQUM7QUFDbEUsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUMzQzs7Ozs7Ozs7OztXQVFnQiw2QkFBUztBQUN4Qiw2QkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztLQUNuRjs7O1dBRUssa0JBQWlCO0FBQ3JCLGFBQ0U7O1VBQU8sU0FBUyxFQUFDLDJCQUEyQixFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQUFBQztRQUN2RTtBQUNFLGlCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7QUFDNUIsbUJBQVMsRUFBQyxxQkFBcUI7QUFDL0Isa0JBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQUFBQztBQUM5QixrQkFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEFBQUM7QUFDekIsYUFBRyxFQUFDLE9BQU87QUFDWCxjQUFJLEVBQUMsVUFBVTtVQUNmO1FBQ0QsR0FBRztRQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztPQUNoQixDQUNSO0tBQ0g7OztTQXhEa0IsZUFBZTtHQUFTLG9CQUFNLFNBQVM7O3FCQUF2QyxlQUFlIiwiZmlsZSI6Ik51Y2xpZGVDaGVja2JveC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7XG4gIFB1cmVSZW5kZXJNaXhpbixcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGNoZWNrZWQ6IGJvb2xlYW47XG4gIGRpc2FibGVkOiBib29sZWFuO1xuICBpbmRldGVybWluYXRlOiBib29sZWFuO1xuICBsYWJlbDogc3RyaW5nO1xuICBvbkNoYW5nZTogKGlzQ2hlY2tlZDogYm9vbGVhbikgPT4gbWl4ZWQ7XG4gIG9uQ2xpY2s6IChldmVudDogU3ludGhldGljRXZlbnQpID0+IG1peGVkO1xufTtcblxuLyoqXG4gKiBBIGNoZWNrYm94IGNvbXBvbmVudCB3aXRoIGFuIGlucHV0IGNoZWNrYm94IGFuZCBhIGxhYmVsLiBXZSByZXN0cmljdCB0aGUgbGFiZWwgdG8gYSBzdHJpbmdcbiAqIHRvIGVuc3VyZSB0aGlzIGNvbXBvbmVudCBpcyBwdXJlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOdWNsaWRlQ2hlY2tib3ggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgaW5kZXRlcm1pbmF0ZTogZmFsc2UsXG4gICAgbGFiZWw6ICcnLFxuICAgIG9uQ2xpY2soZXZlbnQpIHt9LFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX29uQ2hhbmdlID0gdGhpcy5fb25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuX3NldEluZGV0ZXJtaW5hdGUoKTtcbiAgfVxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IE9iamVjdCwgbmV4dFN0YXRlOiB2b2lkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFB1cmVSZW5kZXJNaXhpbi5zaG91bGRDb21wb25lbnRVcGRhdGUuY2FsbCh0aGlzLCBuZXh0UHJvcHMsIG5leHRTdGF0ZSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgdGhpcy5fc2V0SW5kZXRlcm1pbmF0ZSgpO1xuICB9XG5cbiAgX29uQ2hhbmdlKGV2ZW50OiBTeW50aGV0aWNFdmVudCkge1xuICAgIGNvbnN0IGlzQ2hlY2tlZCA9ICgoZXZlbnQudGFyZ2V0OiBhbnkpOiBIVE1MSW5wdXRFbGVtZW50KS5jaGVja2VkO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UuY2FsbChudWxsLCBpc0NoZWNrZWQpO1xuICB9XG5cbiAgLypcbiAgICogU3luY3MgdGhlIGBpbmRldGVybWluYXRlYCBwcm9wIHRvIHRoZSB1bmRlcmx5aW5nIGA8aW5wdXQ+YC4gYGluZGV0ZXJtaW5hdGVgIGlzIGludGVudGlvbmFsbHlcbiAgICogbm90IHNldHRhYmxlIHZpYSBIVE1MOyBpdCBtdXN0IGJlIGRvbmUgb24gdGhlIGBIVE1MSW5wdXRFbGVtZW50YCBpbnN0YW5jZSBpbiBzY3JpcHQuXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L2Zvcm1zLmh0bWwjdGhlLWlucHV0LWVsZW1lbnRcbiAgICovXG4gIF9zZXRJbmRldGVybWluYXRlKCk6IHZvaWQge1xuICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snaW5wdXQnXSkuaW5kZXRlcm1pbmF0ZSA9IHRoaXMucHJvcHMuaW5kZXRlcm1pbmF0ZTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8bGFiZWwgY2xhc3NOYW1lPVwibnVjbGlkZS11aS1jaGVja2JveC1sYWJlbFwiIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja30+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIGNoZWNrZWQ9e3RoaXMucHJvcHMuY2hlY2tlZH1cbiAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLXVpLWNoZWNrYm94XCJcbiAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9XG4gICAgICAgICAgcmVmPVwiaW5wdXRcIlxuICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgIC8+XG4gICAgICAgIHsnICd9e3RoaXMucHJvcHMubGFiZWx9XG4gICAgICA8L2xhYmVsPlxuICAgICk7XG4gIH1cbn1cbiJdfQ==