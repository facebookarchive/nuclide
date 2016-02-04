Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _sectionsBasicStatsSectionComponent = require('./sections/BasicStatsSectionComponent');

var _sectionsBasicStatsSectionComponent2 = _interopRequireDefault(_sectionsBasicStatsSectionComponent);

var _sectionsActiveHandlesSectionComponent = require('./sections/ActiveHandlesSectionComponent');

var _sectionsActiveHandlesSectionComponent2 = _interopRequireDefault(_sectionsActiveHandlesSectionComponent);

var PropTypes = _reactForAtom.React.PropTypes;

var HealthPaneItemComponent = (function (_React$Component) {
  _inherits(HealthPaneItemComponent, _React$Component);

  function HealthPaneItemComponent() {
    _classCallCheck(this, HealthPaneItemComponent);

    _get(Object.getPrototypeOf(HealthPaneItemComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(HealthPaneItemComponent, [{
    key: 'render',
    value: function render() {

      var sections = {
        'Stats': _reactForAtom.React.createElement(_sectionsBasicStatsSectionComponent2['default'], this.props),
        'Handles': _reactForAtom.React.createElement(_sectionsActiveHandlesSectionComponent2['default'], { activeHandleObjects: this.props.activeHandleObjects })
      };

      // For each section, we use settings-view to get a familiar look for table cells.
      return _reactForAtom.React.createElement(
        'div',
        null,
        Object.keys(sections).map(function (title, s) {
          return _reactForAtom.React.createElement(
            'div',
            { className: 'nuclide-health-pane-item-section', key: s },
            _reactForAtom.React.createElement(
              'h2',
              null,
              title
            ),
            _reactForAtom.React.createElement(
              'div',
              { className: 'settings-view' },
              sections[title]
            )
          );
        })
      );
    }
  }], [{
    key: 'propTypes',
    value: {
      cpuPercentage: PropTypes.number.isRequired,
      memory: PropTypes.number.isRequired,
      heapPercentage: PropTypes.number.isRequired,
      lastKeyLatency: PropTypes.number.isRequired,
      activeHandles: PropTypes.number.isRequired,
      activeRequests: PropTypes.number.isRequired,
      activeHandleObjects: PropTypes.arrayOf(PropTypes.object).isRequired
    },
    enumerable: true
  }]);

  return HealthPaneItemComponent;
})(_reactForAtom.React.Component);

exports['default'] = HealthPaneItemComponent;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhlYWx0aFBhbmVJdGVtQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBV29CLGdCQUFnQjs7a0RBR0csdUNBQXVDOzs7O3FEQUNwQywwQ0FBMEM7Ozs7SUFIN0UsU0FBUyx1QkFBVCxTQUFTOztJQUtLLHVCQUF1QjtZQUF2Qix1QkFBdUI7O1dBQXZCLHVCQUF1QjswQkFBdkIsdUJBQXVCOzsrQkFBdkIsdUJBQXVCOzs7ZUFBdkIsdUJBQXVCOztXQVlwQyxrQkFBaUI7O0FBRXJCLFVBQU0sUUFBUSxHQUFHO0FBQ2YsZUFBTyxFQUNMLG1GQUFnQyxJQUFJLENBQUMsS0FBSyxDQUFJO0FBQ2hELGlCQUFTLEVBQ1Asd0ZBQStCLG1CQUFtQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEFBQUMsR0FBRztPQUN6RixDQUFDOzs7QUFHRixhQUNFOzs7UUFDRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUssRUFBRSxDQUFDO2lCQUNsQzs7Y0FBSyxTQUFTLEVBQUMsa0NBQWtDLEVBQUMsR0FBRyxFQUFFLENBQUMsQUFBQztZQUN2RDs7O2NBQUssS0FBSzthQUFNO1lBQ2hCOztnQkFBSyxTQUFTLEVBQUMsZUFBZTtjQUMzQixRQUFRLENBQUMsS0FBSyxDQUFDO2FBQ1o7V0FDRjtTQUFBLENBQ1A7T0FDRyxDQUNOO0tBQ0g7OztXQWhDa0I7QUFDakIsbUJBQWEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDMUMsWUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNuQyxvQkFBYyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMzQyxvQkFBYyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMzQyxtQkFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMxQyxvQkFBYyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMzQyx5QkFBbUIsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVO0tBQ3BFOzs7O1NBVmtCLHVCQUF1QjtHQUFTLG9CQUFNLFNBQVM7O3FCQUEvQyx1QkFBdUIiLCJmaWxlIjoiSGVhbHRoUGFuZUl0ZW1Db21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5pbXBvcnQgQmFzaWNTdGF0c1NlY3Rpb25Db21wb25lbnQgZnJvbSAnLi9zZWN0aW9ucy9CYXNpY1N0YXRzU2VjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQgQWN0aXZlSGFuZGxlc1NlY3Rpb25Db21wb25lbnQgZnJvbSAnLi9zZWN0aW9ucy9BY3RpdmVIYW5kbGVzU2VjdGlvbkNvbXBvbmVudCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhlYWx0aFBhbmVJdGVtQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNwdVBlcmNlbnRhZ2U6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBtZW1vcnk6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBoZWFwUGVyY2VudGFnZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGxhc3RLZXlMYXRlbmN5OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgYWN0aXZlSGFuZGxlczogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGFjdGl2ZVJlcXVlc3RzOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgYWN0aXZlSGFuZGxlT2JqZWN0czogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCkuaXNSZXF1aXJlZCxcbiAgfTtcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcblxuICAgIGNvbnN0IHNlY3Rpb25zID0ge1xuICAgICAgJ1N0YXRzJzpcbiAgICAgICAgPEJhc2ljU3RhdHNTZWN0aW9uQ29tcG9uZW50IHsuLi50aGlzLnByb3BzfSAvPixcbiAgICAgICdIYW5kbGVzJzpcbiAgICAgICAgPEFjdGl2ZUhhbmRsZXNTZWN0aW9uQ29tcG9uZW50IGFjdGl2ZUhhbmRsZU9iamVjdHM9e3RoaXMucHJvcHMuYWN0aXZlSGFuZGxlT2JqZWN0c30gLz4sXG4gICAgfTtcblxuICAgIC8vIEZvciBlYWNoIHNlY3Rpb24sIHdlIHVzZSBzZXR0aW5ncy12aWV3IHRvIGdldCBhIGZhbWlsaWFyIGxvb2sgZm9yIHRhYmxlIGNlbGxzLlxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7T2JqZWN0LmtleXMoc2VjdGlvbnMpLm1hcCgodGl0bGUsIHMpID0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWhlYWx0aC1wYW5lLWl0ZW0tc2VjdGlvblwiIGtleT17c30+XG4gICAgICAgICAgICA8aDI+e3RpdGxlfTwvaDI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNldHRpbmdzLXZpZXdcIj5cbiAgICAgICAgICAgICAge3NlY3Rpb25zW3RpdGxlXX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl19