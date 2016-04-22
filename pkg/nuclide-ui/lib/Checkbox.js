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

var Checkbox = (function (_React$Component) {
  _inherits(Checkbox, _React$Component);

  _createClass(Checkbox, null, [{
    key: 'defaultProps',
    value: {
      disabled: false,
      indeterminate: false,
      label: '',
      onClick: function onClick(event) {}
    },
    enumerable: true
  }]);

  function Checkbox(props) {
    _classCallCheck(this, Checkbox);

    _get(Object.getPrototypeOf(Checkbox.prototype), 'constructor', this).call(this, props);
    this._onChange = this._onChange.bind(this);
  }

  _createClass(Checkbox, [{
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

  return Checkbox;
})(_reactForAtom.React.Component);

exports.Checkbox = Checkbox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoZWNrYm94LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWVPLGdCQUFnQjs7Ozs7OztJQWVWLFFBQVE7WUFBUixRQUFROztlQUFSLFFBQVE7O1dBR0c7QUFDcEIsY0FBUSxFQUFFLEtBQUs7QUFDZixtQkFBYSxFQUFFLEtBQUs7QUFDcEIsV0FBSyxFQUFFLEVBQUU7QUFDVCxhQUFPLEVBQUEsaUJBQUMsS0FBSyxFQUFFLEVBQUU7S0FDbEI7Ozs7QUFFVSxXQVZBLFFBQVEsQ0FVUCxLQUFhLEVBQUU7MEJBVmhCLFFBQVE7O0FBV2pCLCtCQVhTLFFBQVEsNkNBV1gsS0FBSyxFQUFFO0FBQ2IsQUFBQyxRQUFJLENBQU8sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ25EOztlQWJVLFFBQVE7O1dBZUYsNkJBQUc7QUFDbEIsVUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7S0FDMUI7OztXQUVvQiwrQkFBQyxTQUFpQixFQUFFLFNBQWUsRUFBVztBQUNqRSxhQUFPLDhCQUFnQixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUMvRTs7O1dBRWlCLDhCQUFHO0FBQ25CLFVBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0tBQzFCOzs7V0FFUSxtQkFBQyxLQUFxQixFQUFFO0FBQy9CLFVBQU0sU0FBUyxHQUFHLEFBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBMEIsT0FBTyxDQUFDO0FBQ2xFLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDM0M7Ozs7Ozs7Ozs7V0FRZ0IsNkJBQVM7QUFDeEIsNkJBQVMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7S0FDbkY7OztXQUVLLGtCQUFrQjtBQUN0QixhQUNFOztVQUFPLFNBQVMsRUFBQywyQkFBMkIsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7UUFDdkU7QUFDRSxpQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxBQUFDO0FBQzVCLG1CQUFTLEVBQUMscUJBQXFCO0FBQy9CLGtCQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEFBQUM7QUFDOUIsa0JBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxBQUFDO0FBQ3pCLGFBQUcsRUFBQyxPQUFPO0FBQ1gsY0FBSSxFQUFDLFVBQVU7VUFDZjtRQUNELEdBQUc7UUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7T0FDaEIsQ0FDUjtLQUNIOzs7U0F4RFUsUUFBUTtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiQ2hlY2tib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICBjaGVja2VkOiBib29sZWFuO1xuICBkaXNhYmxlZDogYm9vbGVhbjtcbiAgaW5kZXRlcm1pbmF0ZTogYm9vbGVhbjtcbiAgbGFiZWw6IHN0cmluZztcbiAgb25DaGFuZ2U6IChpc0NoZWNrZWQ6IGJvb2xlYW4pID0+IG1peGVkO1xuICBvbkNsaWNrOiAoZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KSA9PiBtaXhlZDtcbn07XG5cbi8qKlxuICogQSBjaGVja2JveCBjb21wb25lbnQgd2l0aCBhbiBpbnB1dCBjaGVja2JveCBhbmQgYSBsYWJlbC4gV2UgcmVzdHJpY3QgdGhlIGxhYmVsIHRvIGEgc3RyaW5nXG4gKiB0byBlbnN1cmUgdGhpcyBjb21wb25lbnQgaXMgcHVyZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENoZWNrYm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgIGluZGV0ZXJtaW5hdGU6IGZhbHNlLFxuICAgIGxhYmVsOiAnJyxcbiAgICBvbkNsaWNrKGV2ZW50KSB7fSxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9vbkNoYW5nZSA9IHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLl9zZXRJbmRldGVybWluYXRlKCk7XG4gIH1cblxuICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBPYmplY3QsIG5leHRTdGF0ZTogdm9pZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBQdXJlUmVuZGVyTWl4aW4uc2hvdWxkQ29tcG9uZW50VXBkYXRlLmNhbGwodGhpcywgbmV4dFByb3BzLCBuZXh0U3RhdGUpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIHRoaXMuX3NldEluZGV0ZXJtaW5hdGUoKTtcbiAgfVxuXG4gIF9vbkNoYW5nZShldmVudDogU3ludGhldGljRXZlbnQpIHtcbiAgICBjb25zdCBpc0NoZWNrZWQgPSAoKGV2ZW50LnRhcmdldDogYW55KTogSFRNTElucHV0RWxlbWVudCkuY2hlY2tlZDtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlLmNhbGwobnVsbCwgaXNDaGVja2VkKTtcbiAgfVxuXG4gIC8qXG4gICAqIFN5bmNzIHRoZSBgaW5kZXRlcm1pbmF0ZWAgcHJvcCB0byB0aGUgdW5kZXJseWluZyBgPGlucHV0PmAuIGBpbmRldGVybWluYXRlYCBpcyBpbnRlbnRpb25hbGx5XG4gICAqIG5vdCBzZXR0YWJsZSB2aWEgSFRNTDsgaXQgbXVzdCBiZSBkb25lIG9uIHRoZSBgSFRNTElucHV0RWxlbWVudGAgaW5zdGFuY2UgaW4gc2NyaXB0LlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9mb3Jtcy5odG1sI3RoZS1pbnB1dC1lbGVtZW50XG4gICAqL1xuICBfc2V0SW5kZXRlcm1pbmF0ZSgpOiB2b2lkIHtcbiAgICBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2lucHV0J10pLmluZGV0ZXJtaW5hdGUgPSB0aGlzLnByb3BzLmluZGV0ZXJtaW5hdGU7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJudWNsaWRlLXVpLWNoZWNrYm94LWxhYmVsXCIgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrfT5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgY2hlY2tlZD17dGhpcy5wcm9wcy5jaGVja2VkfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtdWktY2hlY2tib3hcIlxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkNoYW5nZX1cbiAgICAgICAgICByZWY9XCJpbnB1dFwiXG4gICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgLz5cbiAgICAgICAgeycgJ317dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgIDwvbGFiZWw+XG4gICAgKTtcbiAgfVxufVxuIl19