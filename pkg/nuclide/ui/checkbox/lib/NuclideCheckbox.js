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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVDaGVja2JveC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFjTyxnQkFBZ0I7O0lBRWhCLFNBQVMsdUJBQVQsU0FBUzs7Ozs7OztJQU1LLGVBQWU7WUFBZixlQUFlOztlQUFmLGVBQWU7O1dBRWY7QUFDakIsYUFBTyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUNsQyxXQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2xDLGNBQVEsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7S0FDcEM7Ozs7QUFFVSxXQVJRLGVBQWUsQ0FRdEIsS0FBYSxFQUFFOzBCQVJSLGVBQWU7O0FBU2hDLCtCQVRpQixlQUFlLDZDQVMxQixLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzVDOztlQVhrQixlQUFlOztXQWFiLCtCQUFDLFNBQWlCLEVBQUUsU0FBaUIsRUFBVztBQUNuRSxhQUFPLDhCQUFnQixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUMvRTs7O1dBRUssa0JBQWlCO0FBQ3JCLGFBQ0U7O1VBQU8sU0FBUyxFQUFDLDJCQUEyQjtRQUMxQztBQUNFLGNBQUksRUFBQyxVQUFVO0FBQ2YsaUJBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQUFBQztBQUM1QixrQkFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEFBQUM7VUFDekI7UUFDRCxHQUFHO1FBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO09BQ2hCLENBQ1I7S0FDSDs7O1dBRVEsbUJBQUMsS0FBcUIsRUFBRTtBQUMvQixVQUFNLFNBQVMsR0FBRyxBQUFFLEtBQUssQ0FBQyxNQUFNLENBQTBCLE9BQU8sQ0FBQztBQUNsRSxVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQzNDOzs7U0FqQ2tCLGVBQWU7R0FBUyxvQkFBTSxTQUFTOztxQkFBdkMsZUFBZSIsImZpbGUiOiJOdWNsaWRlQ2hlY2tib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1xuICBQdXJlUmVuZGVyTWl4aW4sXG4gIFJlYWN0LFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbi8qKlxuICogQSBjaGVja2JveCBjb21wb25lbnQgd2l0aCBhbiBpbnB1dCBjaGVja2JveCBhbmQgYSBsYWJlbC4gV2UgcmVzdHJpY3QgdGhlIGxhYmVsIHRvIGEgc3RyaW5nXG4gKiB0byBlbnN1cmUgdGhpcyBjb21wb25lbnQgaXMgcHVyZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTnVjbGlkZUNoZWNrYm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNoZWNrZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgbGFiZWw6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX29uQ2hhbmdlID0gdGhpcy5fb25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IE9iamVjdCwgbmV4dFN0YXRlOiBPYmplY3QpOiBib29sZWFuIHtcbiAgICByZXR1cm4gUHVyZVJlbmRlck1peGluLnNob3VsZENvbXBvbmVudFVwZGF0ZS5jYWxsKHRoaXMsIG5leHRQcm9wcywgbmV4dFN0YXRlKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8bGFiZWwgY2xhc3NOYW1lPVwibnVjbGlkZS11aS1jaGVja2JveC1sYWJlbFwiPlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgIGNoZWNrZWQ9e3RoaXMucHJvcHMuY2hlY2tlZH1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9XG4gICAgICAgIC8+XG4gICAgICAgIHsnICd9e3RoaXMucHJvcHMubGFiZWx9XG4gICAgICA8L2xhYmVsPlxuICAgICk7XG4gIH1cblxuICBfb25DaGFuZ2UoZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KSB7XG4gICAgY29uc3QgaXNDaGVja2VkID0gKChldmVudC50YXJnZXQ6IGFueSk6IEhUTUxJbnB1dEVsZW1lbnQpLmNoZWNrZWQ7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZS5jYWxsKG51bGwsIGlzQ2hlY2tlZCk7XG4gIH1cbn1cbiJdfQ==