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

var _OutputTable = require('./OutputTable');

var _OutputTable2 = _interopRequireDefault(_OutputTable);

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
          return _this.setState(state);
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
        return _reactForAtom.React.createElement(_OutputTable2['default'], {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU91dHB1dEdhZGdldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7cUJBeUJ3QixrQkFBa0I7Ozs7Ozs7OzJCQVBsQixlQUFlOzs7OzRCQUNuQixnQkFBZ0I7O0FBTXJCLFNBQVMsa0JBQWtCLENBQ3hDLE1BQStCLEVBQy9CLFFBQWtCLEVBQ1Y7TUFFRixZQUFZO2NBQVosWUFBWTs7aUJBQVosWUFBWTs7YUFFRSxnQkFBZ0I7Ozs7YUFDVCxRQUFROzs7O0FBSXRCLGFBUFAsWUFBWSxDQU9KLEtBQVksRUFBRTs0QkFQdEIsWUFBWTs7QUFRZCxpQ0FSRSxZQUFZLDZDQVFSLEtBQUssRUFBRTtBQUNiLFVBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxlQUFPLEVBQUUsRUFBRTtPQUNaLENBQUM7S0FDSDs7aUJBWkcsWUFBWTs7YUFjUixvQkFBVztBQUNqQixlQUFPLFFBQVEsQ0FBQztPQUNqQjs7O2FBRWlCLDhCQUFHOzs7QUFDbkIsWUFBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBQSxLQUFLO2lCQUFJLE1BQUssUUFBUSxDQUFDLEtBQUssQ0FBQztTQUFBLENBQUMsQ0FBQztPQUM1RTs7O2FBRW1CLGdDQUFHO0FBQ3JCLFlBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNwQzs7O2FBRUssa0JBQWtCO0FBQ3RCLGVBQ0U7QUFDRSxzQkFBWSxFQUFFO21CQUFNLFFBQVEsQ0FBQyxZQUFZLEVBQUU7V0FBQSxBQUFDO0FBQzVDLGlCQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7VUFDNUIsQ0FDRjtPQUNIOzs7V0FqQ0csWUFBWTtLQUFTLG9CQUFNLFNBQVM7O0FBcUMxQyxTQUFTLFlBQVksQ0FBZ0I7Q0FDdEMiLCJmaWxlIjoiY3JlYXRlT3V0cHV0R2FkZ2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQgdHlwZSBDb21tYW5kcyBmcm9tICcuL0NvbW1hbmRzJztcbmltcG9ydCB0eXBlIHtHYWRnZXR9IGZyb20gJy4uLy4uL2dhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7QXBwU3RhdGUsIFJlY29yZH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBSeCBmcm9tICdyeCc7XG5cbmltcG9ydCBPdXRwdXRUYWJsZSBmcm9tICcuL091dHB1dFRhYmxlJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBTdGF0ZSA9IHtcbiAgcmVjb3JkczogQXJyYXk8UmVjb3JkPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZU91dHB1dEdhZGdldChcbiAgc3RhdGUkOiBSeC5PYnNlcnZhYmxlPEFwcFN0YXRlPixcbiAgY29tbWFuZHM6IENvbW1hbmRzLFxuKTogR2FkZ2V0IHtcblxuICBjbGFzcyBPdXRwdXRHYWRnZXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgdm9pZCwgU3RhdGU+IHtcblxuICAgIHN0YXRpYyBnYWRnZXRJZCA9ICdudWNsaWRlLW91dHB1dCc7XG4gICAgc3RhdGljIGRlZmF1bHRMb2NhdGlvbiA9ICdib3R0b20nO1xuXG4gICAgX3N0YXRlJFN1YnNjcmlwdGlvbjogcngkSURpc3Bvc2FibGU7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogbWl4ZWQpIHtcbiAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgIHJlY29yZHM6IFtdLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdPdXRwdXQnO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgIHRoaXMuX3N0YXRlJFN1YnNjcmlwdGlvbiA9IHN0YXRlJC5zdWJzY3JpYmUoc3RhdGUgPT4gdGhpcy5zZXRTdGF0ZShzdGF0ZSkpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgdGhpcy5fc3RhdGUkU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8T3V0cHV0VGFibGVcbiAgICAgICAgICBjbGVhclJlY29yZHM9eygpID0+IGNvbW1hbmRzLmNsZWFyUmVjb3JkcygpfVxuICAgICAgICAgIHJlY29yZHM9e3RoaXMuc3RhdGUucmVjb3Jkc31cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gIH1cblxuICByZXR1cm4gKChPdXRwdXRHYWRnZXQ6IGFueSk6IEdhZGdldCk7XG59XG4iXX0=