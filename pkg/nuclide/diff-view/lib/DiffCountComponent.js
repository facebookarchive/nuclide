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

/* eslint-disable react/prop-types */

var DiffCountComponent = (function (_React$Component) {
  _inherits(DiffCountComponent, _React$Component);

  function DiffCountComponent(props) {
    _classCallCheck(this, DiffCountComponent);

    _get(Object.getPrototypeOf(DiffCountComponent.prototype), 'constructor', this).call(this, props);
  }

  _createClass(DiffCountComponent, [{
    key: 'render',
    value: function render() {
      var count = this.props.count;

      if (count === 0) {
        return null;
      }
      return _reactForAtom.React.createElement(
        'span',
        null,
        count > 99 ? '99+' : count
      );
    }
  }]);

  return DiffCountComponent;
})(_reactForAtom.React.Component);

module.exports = DiffCountComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpZmZDb3VudENvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7Ozs7SUFPOUIsa0JBQWtCO1lBQWxCLGtCQUFrQjs7QUFFWCxXQUZQLGtCQUFrQixDQUVWLEtBQVksRUFBRTswQkFGdEIsa0JBQWtCOztBQUdwQiwrQkFIRSxrQkFBa0IsNkNBR2QsS0FBSyxFQUFFO0dBQ2Q7O2VBSkcsa0JBQWtCOztXQU1oQixrQkFBa0I7VUFDZixLQUFLLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBbkIsS0FBSzs7QUFDWixVQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDZixlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsYUFDRTs7O1FBQ0csS0FBSyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSztPQUN0QixDQUNQO0tBQ0g7OztTQWhCRyxrQkFBa0I7R0FBUyxvQkFBTSxTQUFTOztBQW1CaEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJEaWZmQ291bnRDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGNvdW50OiBudW1iZXI7XG59O1xuXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5jbGFzcyBEaWZmQ291bnRDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7Y291bnR9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4+XG4gICAgICAgIHtjb3VudCA+IDk5ID8gJzk5KycgOiBjb3VudH1cbiAgICAgIDwvc3Bhbj5cbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGlmZkNvdW50Q29tcG9uZW50O1xuIl19