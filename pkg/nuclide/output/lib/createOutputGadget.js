Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable react/prop-types */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports['default'] = createOutputGadget;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Console = require('./Console');

var _Console2 = _interopRequireDefault(_Console);

var _reactForAtom = require('react-for-atom');

function createOutputGadget(state$, commands) {
  var OutputGadget = (function (_React$Component) {
    _inherits(OutputGadget, _React$Component);

    _createClass(OutputGadget, null, [{
      key: 'gadgetId',
      value: 'nuclide-output',
      enumerable: true
    }, {
      key: 'defaultLocation',
      value: 'bottom',
      enumerable: true
    }]);

    function OutputGadget(props) {
      _classCallCheck(this, OutputGadget);

      _get(Object.getPrototypeOf(OutputGadget.prototype), 'constructor', this).call(this, props);
      this.state = {
        records: []
      };
    }

    _createClass(OutputGadget, [{
      key: 'getTitle',
      value: function getTitle() {
        return 'Output';
      }
    }, {
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this = this;

        this._state$Subscription = state$.subscribe(function (state) {
          return _this.setState({ records: state.records });
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this._state$Subscription.dispose();
      }
    }, {
      key: 'render',
      value: function render() {
        return _reactForAtom.React.createElement(_Console2['default'], {
          clearRecords: function () {
            return commands.clearRecords();
          },
          records: this.state.records
        });
      }
    }]);

    return OutputGadget;
  })(_reactForAtom.React.Component);

  return OutputGadget;
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU91dHB1dEdhZGdldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7cUJBeUJ3QixrQkFBa0I7Ozs7Ozs7O3VCQVB0QixXQUFXOzs7OzRCQUNYLGdCQUFnQjs7QUFNckIsU0FBUyxrQkFBa0IsQ0FDeEMsTUFBK0IsRUFDL0IsUUFBa0IsRUFDVjtNQUVGLFlBQVk7Y0FBWixZQUFZOztpQkFBWixZQUFZOzthQUlFLGdCQUFnQjs7OzthQUNULFFBQVE7Ozs7QUFJdEIsYUFUUCxZQUFZLENBU0osS0FBWSxFQUFFOzRCQVR0QixZQUFZOztBQVVkLGlDQVZFLFlBQVksNkNBVVIsS0FBSyxFQUFFO0FBQ2IsVUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLGVBQU8sRUFBRSxFQUFFO09BQ1osQ0FBQztLQUNIOztpQkFkRyxZQUFZOzthQWdCUixvQkFBVztBQUNqQixlQUFPLFFBQVEsQ0FBQztPQUNqQjs7O2FBRWlCLDhCQUFHOzs7QUFDbkIsWUFBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBQSxLQUFLO2lCQUFJLE1BQUssUUFBUSxDQUFDLEVBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUMsQ0FBQztTQUFBLENBQUMsQ0FBQztPQUMvRjs7O2FBRW1CLGdDQUFHO0FBQ3JCLFlBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNwQzs7O2FBRUssa0JBQWtCO0FBQ3RCLGVBQ0U7QUFDRSxzQkFBWSxFQUFFO21CQUFNLFFBQVEsQ0FBQyxZQUFZLEVBQUU7V0FBQSxBQUFDO0FBQzVDLGlCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7VUFDNUIsQ0FDRjtPQUNIOzs7V0FuQ0csWUFBWTtLQUFTLG9CQUFNLFNBQVM7O0FBdUMxQyxTQUFTLFlBQVksQ0FBZ0I7Q0FDdEMiLCJmaWxlIjoiY3JlYXRlT3V0cHV0R2FkZ2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQgdHlwZSBDb21tYW5kcyBmcm9tICcuL0NvbW1hbmRzJztcbmltcG9ydCB0eXBlIHtHYWRnZXR9IGZyb20gJy4uLy4uL2dhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7QXBwU3RhdGUsIFJlY29yZH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBSeCBmcm9tICdyeCc7XG5cbmltcG9ydCBDb25zb2xlIGZyb20gJy4vQ29uc29sZSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHJlY29yZHM6IEFycmF5PFJlY29yZD47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVPdXRwdXRHYWRnZXQoXG4gIHN0YXRlJDogUnguT2JzZXJ2YWJsZTxBcHBTdGF0ZT4sXG4gIGNvbW1hbmRzOiBDb21tYW5kcyxcbik6IEdhZGdldCB7XG5cbiAgY2xhc3MgT3V0cHV0R2FkZ2V0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICAgIHN0YXRlOiBTdGF0ZTtcblxuICAgIHN0YXRpYyBnYWRnZXRJZCA9ICdudWNsaWRlLW91dHB1dCc7XG4gICAgc3RhdGljIGRlZmF1bHRMb2NhdGlvbiA9ICdib3R0b20nO1xuXG4gICAgX3N0YXRlJFN1YnNjcmlwdGlvbjogSURpc3Bvc2FibGU7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogbWl4ZWQpIHtcbiAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHJlY29yZHM6IFtdLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdPdXRwdXQnO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgIHRoaXMuX3N0YXRlJFN1YnNjcmlwdGlvbiA9IHN0YXRlJC5zdWJzY3JpYmUoc3RhdGUgPT4gdGhpcy5zZXRTdGF0ZSh7cmVjb3Jkczogc3RhdGUucmVjb3Jkc30pKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgIHRoaXMuX3N0YXRlJFN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPENvbnNvbGVcbiAgICAgICAgICBjbGVhclJlY29yZHM9eygpID0+IGNvbW1hbmRzLmNsZWFyUmVjb3JkcygpfVxuICAgICAgICAgIHJlY29yZHM9e3RoaXMuc3RhdGUucmVjb3Jkc31cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gIH1cblxuICByZXR1cm4gKChPdXRwdXRHYWRnZXQ6IGFueSk6IEdhZGdldCk7XG59XG4iXX0=