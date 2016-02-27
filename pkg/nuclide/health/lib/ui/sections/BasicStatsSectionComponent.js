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

var BasicStatsSectionComponent = (function (_React$Component) {
  _inherits(BasicStatsSectionComponent, _React$Component);

  function BasicStatsSectionComponent() {
    _classCallCheck(this, BasicStatsSectionComponent);

    _get(Object.getPrototypeOf(BasicStatsSectionComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(BasicStatsSectionComponent, [{
    key: 'render',
    value: function render() {
      var stats = [{
        name: 'CPU',
        value: this.props.cpuPercentage.toFixed(0) + '%'
      }, {
        name: 'Heap',
        value: this.props.heapPercentage.toFixed(1) + '%'
      }, {
        name: 'Memory',
        value: Math.floor(this.props.memory / 1024 / 1024) + 'MB'
      }, {
        name: 'Key latency',
        value: this.props.lastKeyLatency + 'ms'
      }, {
        name: 'Handles',
        value: '' + this.props.activeHandles
      }, {
        name: 'Event loop',
        value: '' + this.props.activeRequests
      }];

      return _reactForAtom.React.createElement(
        'table',
        { className: 'table' },
        _reactForAtom.React.createElement(
          'thead',
          null,
          _reactForAtom.React.createElement(
            'tr',
            null,
            _reactForAtom.React.createElement(
              'th',
              null,
              'Metric'
            ),
            _reactForAtom.React.createElement(
              'th',
              null,
              'Value'
            )
          )
        ),
        _reactForAtom.React.createElement(
          'tbody',
          null,
          stats.map(function (stat, s) {
            return _reactForAtom.React.createElement(
              'tr',
              { key: s },
              _reactForAtom.React.createElement(
                'th',
                null,
                stat.name
              ),
              _reactForAtom.React.createElement(
                'td',
                null,
                stat.value
              )
            );
          })
        )
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
      activeRequests: PropTypes.number.isRequired
    },
    enumerable: true
  }]);

  return BasicStatsSectionComponent;
})(_reactForAtom.React.Component);

exports['default'] = BasicStatsSectionComponent;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJhc2ljU3RhdHNTZWN0aW9uQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O0lBQzdCLFNBQVMsdUJBQVQsU0FBUzs7SUFFSywwQkFBMEI7WUFBMUIsMEJBQTBCOztXQUExQiwwQkFBMEI7MEJBQTFCLDBCQUEwQjs7K0JBQTFCLDBCQUEwQjs7O2VBQTFCLDBCQUEwQjs7V0FXdkMsa0JBQWlCO0FBQ3JCLFVBQU0sS0FBSyxHQUFHLENBQ1o7QUFDRSxZQUFJLEVBQUUsS0FBSztBQUNYLGFBQUssRUFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQUc7T0FDakQsRUFBRTtBQUNELFlBQUksRUFBRSxNQUFNO0FBQ1osYUFBSyxFQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBRztPQUNsRCxFQUFFO0FBQ0QsWUFBSSxFQUFFLFFBQVE7QUFDZCxhQUFLLEVBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQUk7T0FDMUQsRUFBRTtBQUNELFlBQUksRUFBRSxhQUFhO0FBQ25CLGFBQUssRUFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsT0FBSTtPQUN4QyxFQUFFO0FBQ0QsWUFBSSxFQUFFLFNBQVM7QUFDZixhQUFLLE9BQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEFBQUU7T0FDckMsRUFBRTtBQUNELFlBQUksRUFBRSxZQUFZO0FBQ2xCLGFBQUssT0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQUFBRTtPQUN0QyxDQUNGLENBQUM7O0FBRUYsYUFDRTs7VUFBTyxTQUFTLEVBQUMsT0FBTztRQUN0Qjs7O1VBQ0U7OztZQUNFOzs7O2FBQWU7WUFDZjs7OzthQUFjO1dBQ1g7U0FDQztRQUNSOzs7VUFDRyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUMsSUFBSSxFQUFFLENBQUM7bUJBQ2pCOztnQkFBSSxHQUFHLEVBQUUsQ0FBQyxBQUFDO2NBQ1Q7OztnQkFBSyxJQUFJLENBQUMsSUFBSTtlQUFNO2NBQ3BCOzs7Z0JBQUssSUFBSSxDQUFDLEtBQUs7ZUFBTTthQUNsQjtXQUFBLENBQ047U0FDSztPQUNGLENBQ1I7S0FDSDs7O1dBbERrQjtBQUNqQixtQkFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMxQyxZQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ25DLG9CQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQzNDLG9CQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQzNDLG1CQUFhLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQzFDLG9CQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0tBQzVDOzs7O1NBVGtCLDBCQUEwQjtHQUFTLG9CQUFNLFNBQVM7O3FCQUFsRCwwQkFBMEIiLCJmaWxlIjoiQmFzaWNTdGF0c1NlY3Rpb25Db21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNpY1N0YXRzU2VjdGlvbkNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjcHVQZXJjZW50YWdlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgbWVtb3J5OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgaGVhcFBlcmNlbnRhZ2U6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBsYXN0S2V5TGF0ZW5jeTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGFjdGl2ZUhhbmRsZXM6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBhY3RpdmVSZXF1ZXN0czogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHN0YXRzID0gW1xuICAgICAge1xuICAgICAgICBuYW1lOiAnQ1BVJyxcbiAgICAgICAgdmFsdWU6IGAke3RoaXMucHJvcHMuY3B1UGVyY2VudGFnZS50b0ZpeGVkKDApfSVgLFxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnSGVhcCcsXG4gICAgICAgIHZhbHVlOiBgJHt0aGlzLnByb3BzLmhlYXBQZXJjZW50YWdlLnRvRml4ZWQoMSl9JWAsXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdNZW1vcnknLFxuICAgICAgICB2YWx1ZTogYCR7TWF0aC5mbG9vcih0aGlzLnByb3BzLm1lbW9yeSAvIDEwMjQgLyAxMDI0KX1NQmAsXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdLZXkgbGF0ZW5jeScsXG4gICAgICAgIHZhbHVlOiBgJHt0aGlzLnByb3BzLmxhc3RLZXlMYXRlbmN5fW1zYCxcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0hhbmRsZXMnLFxuICAgICAgICB2YWx1ZTogYCR7dGhpcy5wcm9wcy5hY3RpdmVIYW5kbGVzfWAsXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdFdmVudCBsb29wJyxcbiAgICAgICAgdmFsdWU6IGAke3RoaXMucHJvcHMuYWN0aXZlUmVxdWVzdHN9YCxcbiAgICAgIH0sXG4gICAgXTtcblxuICAgIHJldHVybiAoXG4gICAgICA8dGFibGUgY2xhc3NOYW1lPVwidGFibGVcIj5cbiAgICAgICAgPHRoZWFkPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0aD5NZXRyaWM8L3RoPlxuICAgICAgICAgICAgPHRoPlZhbHVlPC90aD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RoZWFkPlxuICAgICAgICA8dGJvZHk+XG4gICAgICAgICAge3N0YXRzLm1hcCgoc3RhdCwgcykgPT5cbiAgICAgICAgICAgIDx0ciBrZXk9e3N9PlxuICAgICAgICAgICAgICA8dGg+e3N0YXQubmFtZX08L3RoPlxuICAgICAgICAgICAgICA8dGQ+e3N0YXQudmFsdWV9PC90ZD5cbiAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC90Ym9keT5cbiAgICAgIDwvdGFibGU+XG4gICAgKTtcbiAgfVxufVxuIl19