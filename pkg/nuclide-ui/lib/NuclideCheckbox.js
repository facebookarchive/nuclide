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

exports.NuclideCheckbox = NuclideCheckbox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVDaGVja2JveC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFlTyxnQkFBZ0I7Ozs7Ozs7SUFlVixlQUFlO1lBQWYsZUFBZTs7ZUFBZixlQUFlOztXQUdKO0FBQ3BCLGNBQVEsRUFBRSxLQUFLO0FBQ2YsbUJBQWEsRUFBRSxLQUFLO0FBQ3BCLFdBQUssRUFBRSxFQUFFO0FBQ1QsYUFBTyxFQUFBLGlCQUFDLEtBQUssRUFBRSxFQUFFO0tBQ2xCOzs7O0FBRVUsV0FWQSxlQUFlLENBVWQsS0FBYSxFQUFFOzBCQVZoQixlQUFlOztBQVd4QiwrQkFYUyxlQUFlLDZDQVdsQixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDbkQ7O2VBYlUsZUFBZTs7V0FlVCw2QkFBRztBQUNsQixVQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUMxQjs7O1dBRW9CLCtCQUFDLFNBQWlCLEVBQUUsU0FBZSxFQUFXO0FBQ2pFLGFBQU8sOEJBQWdCLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQy9FOzs7V0FFaUIsOEJBQUc7QUFDbkIsVUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7S0FDMUI7OztXQUVRLG1CQUFDLEtBQXFCLEVBQUU7QUFDL0IsVUFBTSxTQUFTLEdBQUcsQUFBRSxLQUFLLENBQUMsTUFBTSxDQUEwQixPQUFPLENBQUM7QUFDbEUsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztLQUMzQzs7Ozs7Ozs7OztXQVFnQiw2QkFBUztBQUN4Qiw2QkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQztLQUNuRjs7O1dBRUssa0JBQWlCO0FBQ3JCLGFBQ0U7O1VBQU8sU0FBUyxFQUFDLDJCQUEyQixFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQUFBQztRQUN2RTtBQUNFLGlCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7QUFDNUIsbUJBQVMsRUFBQyxxQkFBcUI7QUFDL0Isa0JBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQUFBQztBQUM5QixrQkFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEFBQUM7QUFDekIsYUFBRyxFQUFDLE9BQU87QUFDWCxjQUFJLEVBQUMsVUFBVTtVQUNmO1FBQ0QsR0FBRztRQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztPQUNoQixDQUNSO0tBQ0g7OztTQXhEVSxlQUFlO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJOdWNsaWRlQ2hlY2tib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICBjaGVja2VkOiBib29sZWFuO1xuICBkaXNhYmxlZDogYm9vbGVhbjtcbiAgaW5kZXRlcm1pbmF0ZTogYm9vbGVhbjtcbiAgbGFiZWw6IHN0cmluZztcbiAgb25DaGFuZ2U6IChpc0NoZWNrZWQ6IGJvb2xlYW4pID0+IG1peGVkO1xuICBvbkNsaWNrOiAoZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KSA9PiBtaXhlZDtcbn07XG5cbi8qKlxuICogQSBjaGVja2JveCBjb21wb25lbnQgd2l0aCBhbiBpbnB1dCBjaGVja2JveCBhbmQgYSBsYWJlbC4gV2UgcmVzdHJpY3QgdGhlIGxhYmVsIHRvIGEgc3RyaW5nXG4gKiB0byBlbnN1cmUgdGhpcyBjb21wb25lbnQgaXMgcHVyZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE51Y2xpZGVDaGVja2JveCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICBpbmRldGVybWluYXRlOiBmYWxzZSxcbiAgICBsYWJlbDogJycsXG4gICAgb25DbGljayhldmVudCkge30sXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fb25DaGFuZ2UgPSB0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5fc2V0SW5kZXRlcm1pbmF0ZSgpO1xuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogT2JqZWN0LCBuZXh0U3RhdGU6IHZvaWQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gUHVyZVJlbmRlck1peGluLnNob3VsZENvbXBvbmVudFVwZGF0ZS5jYWxsKHRoaXMsIG5leHRQcm9wcywgbmV4dFN0YXRlKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICB0aGlzLl9zZXRJbmRldGVybWluYXRlKCk7XG4gIH1cblxuICBfb25DaGFuZ2UoZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KSB7XG4gICAgY29uc3QgaXNDaGVja2VkID0gKChldmVudC50YXJnZXQ6IGFueSk6IEhUTUxJbnB1dEVsZW1lbnQpLmNoZWNrZWQ7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZS5jYWxsKG51bGwsIGlzQ2hlY2tlZCk7XG4gIH1cblxuICAvKlxuICAgKiBTeW5jcyB0aGUgYGluZGV0ZXJtaW5hdGVgIHByb3AgdG8gdGhlIHVuZGVybHlpbmcgYDxpbnB1dD5gLiBgaW5kZXRlcm1pbmF0ZWAgaXMgaW50ZW50aW9uYWxseVxuICAgKiBub3Qgc2V0dGFibGUgdmlhIEhUTUw7IGl0IG11c3QgYmUgZG9uZSBvbiB0aGUgYEhUTUxJbnB1dEVsZW1lbnRgIGluc3RhbmNlIGluIHNjcmlwdC5cbiAgICpcbiAgICogQHNlZSBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvZm9ybXMuaHRtbCN0aGUtaW5wdXQtZWxlbWVudFxuICAgKi9cbiAgX3NldEluZGV0ZXJtaW5hdGUoKTogdm9pZCB7XG4gICAgUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydpbnB1dCddKS5pbmRldGVybWluYXRlID0gdGhpcy5wcm9wcy5pbmRldGVybWluYXRlO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJudWNsaWRlLXVpLWNoZWNrYm94LWxhYmVsXCIgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrfT5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5jaGVja2VkfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtdWktY2hlY2tib3hcIlxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkNoYW5nZX1cbiAgICAgICAgICByZWY9XCJpbnB1dFwiXG4gICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgLz5cbiAgICAgICAgeycgJ317dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgIDwvbGFiZWw+XG4gICAgKTtcbiAgfVxufVxuIl19