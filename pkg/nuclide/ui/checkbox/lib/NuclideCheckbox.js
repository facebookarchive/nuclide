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
      indeterminate: false
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
          checked: this.props.checked,
          className: 'nuclide-ui-checkbox',
          disabled: this.props.disabled,
          indeterminate: this.props.indeterminate,
          onChange: this._onChange,
          type: 'checkbox'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVDaGVja2JveC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFjTyxnQkFBZ0I7Ozs7Ozs7SUFjRixlQUFlO1lBQWYsZUFBZTs7ZUFBZixlQUFlOztXQUdaO0FBQ3BCLGNBQVEsRUFBRSxLQUFLO0FBQ2YsbUJBQWEsRUFBRSxLQUFLO0tBQ3JCOzs7O0FBRVUsV0FSUSxlQUFlLENBUXRCLEtBQWEsRUFBRTswQkFSUixlQUFlOztBQVNoQywrQkFUaUIsZUFBZSw2Q0FTMUIsS0FBSyxFQUFFO0FBQ2IsQUFBQyxRQUFJLENBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ25EOztlQVhrQixlQUFlOztXQWFiLCtCQUFDLFNBQWlCLEVBQUUsU0FBZSxFQUFXO0FBQ2pFLGFBQU8sOEJBQWdCLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQy9FOzs7V0FFSyxrQkFBaUI7QUFDckIsYUFDRTs7VUFBTyxTQUFTLEVBQUMsMkJBQTJCO1FBQzFDO0FBQ0UsaUJBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQUFBQztBQUM1QixtQkFBUyxFQUFDLHFCQUFxQjtBQUMvQixrQkFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxBQUFDO0FBQzlCLHVCQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEFBQUM7QUFDeEMsa0JBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxBQUFDO0FBQ3pCLGNBQUksRUFBQyxVQUFVO1VBQ2Y7UUFDRCxHQUFHO1FBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO09BQ2hCLENBQ1I7S0FDSDs7O1dBRVEsbUJBQUMsS0FBcUIsRUFBRTtBQUMvQixVQUFNLFNBQVMsR0FBRyxBQUFFLEtBQUssQ0FBQyxNQUFNLENBQTBCLE9BQU8sQ0FBQztBQUNsRSxVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQzNDOzs7U0FwQ2tCLGVBQWU7R0FBUyxvQkFBTSxTQUFTOztxQkFBdkMsZUFBZSIsImZpbGUiOiJOdWNsaWRlQ2hlY2tib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGNoZWNrZWQ6IGJvb2xlYW47XG4gIGRpc2FibGVkOiBib29sZWFuO1xuICBpbmRldGVybWluYXRlOiBib29sZWFuO1xuICBsYWJlbDogc3RyaW5nO1xuICBvbkNoYW5nZTogKGlzQ2hlY2tlZDogYm9vbGVhbikgPT4gbWl4ZWQ7XG59O1xuXG4vKipcbiAqIEEgY2hlY2tib3ggY29tcG9uZW50IHdpdGggYW4gaW5wdXQgY2hlY2tib3ggYW5kIGEgbGFiZWwuIFdlIHJlc3RyaWN0IHRoZSBsYWJlbCB0byBhIHN0cmluZ1xuICogdG8gZW5zdXJlIHRoaXMgY29tcG9uZW50IGlzIHB1cmUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE51Y2xpZGVDaGVja2JveCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICBpbmRldGVybWluYXRlOiBmYWxzZSxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNoYW5nZSA9IHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogdm9pZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBQdXJlUmVuZGVyTWl4aW4uc2hvdWxkQ29tcG9uZW50VXBkYXRlLmNhbGwodGhpcywgbmV4dFByb3BzLCBuZXh0U3RhdGUpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJudWNsaWRlLXVpLWNoZWNrYm94LWxhYmVsXCI+XG4gICAgICAgIDxpbnB1dFxuICAgICAgICAgIGNoZWNrZWQ9e3RoaXMucHJvcHMuY2hlY2tlZH1cbiAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLXVpLWNoZWNrYm94XCJcbiAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICBpbmRldGVybWluYXRlPXt0aGlzLnByb3BzLmluZGV0ZXJtaW5hdGV9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfVxuICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgIC8+XG4gICAgICAgIHsnICd9e3RoaXMucHJvcHMubGFiZWx9XG4gICAgICA8L2xhYmVsPlxuICAgICk7XG4gIH1cblxuICBfb25DaGFuZ2UoZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KSB7XG4gICAgY29uc3QgaXNDaGVja2VkID0gKChldmVudC50YXJnZXQ6IGFueSk6IEhUTUxJbnB1dEVsZW1lbnQpLmNoZWNrZWQ7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZS5jYWxsKG51bGwsIGlzQ2hlY2tlZCk7XG4gIH1cbn1cbiJdfQ==