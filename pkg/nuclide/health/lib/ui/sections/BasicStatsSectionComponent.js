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

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var PropTypes = _reactForAtom2['default'].PropTypes;

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

      return _reactForAtom2['default'].createElement(
        'table',
        { className: 'table' },
        _reactForAtom2['default'].createElement(
          'thead',
          null,
          _reactForAtom2['default'].createElement(
            'tr',
            null,
            _reactForAtom2['default'].createElement(
              'th',
              null,
              'Metric'
            ),
            _reactForAtom2['default'].createElement(
              'th',
              null,
              'Value'
            )
          )
        ),
        _reactForAtom2['default'].createElement(
          'tbody',
          null,
          stats.map(function (stat, s) {
            return _reactForAtom2['default'].createElement(
              'tr',
              { key: s },
              _reactForAtom2['default'].createElement(
                'th',
                null,
                stat.name
              ),
              _reactForAtom2['default'].createElement(
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
})(_reactForAtom2['default'].Component);

exports['default'] = BasicStatsSectionComponent;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJhc2ljU3RhdHNTZWN0aW9uQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBV2tCLGdCQUFnQjs7OztJQUMzQixTQUFTLDZCQUFULFNBQVM7O0lBRUssMEJBQTBCO1lBQTFCLDBCQUEwQjs7V0FBMUIsMEJBQTBCOzBCQUExQiwwQkFBMEI7OytCQUExQiwwQkFBMEI7OztlQUExQiwwQkFBMEI7O1dBV3ZDLGtCQUFpQjtBQUNyQixVQUFNLEtBQUssR0FBRyxDQUNaO0FBQ0UsWUFBSSxFQUFFLEtBQUs7QUFDWCxhQUFLLEVBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFHO09BQ2pELEVBQUU7QUFDRCxZQUFJLEVBQUUsTUFBTTtBQUNaLGFBQUssRUFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQUc7T0FDbEQsRUFBRTtBQUNELFlBQUksRUFBRSxRQUFRO0FBQ2QsYUFBSyxFQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFJO09BQzFELEVBQUU7QUFDRCxZQUFJLEVBQUUsYUFBYTtBQUNuQixhQUFLLEVBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLE9BQUk7T0FDeEMsRUFBRTtBQUNELFlBQUksRUFBRSxTQUFTO0FBQ2YsYUFBSyxPQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxBQUFFO09BQ3JDLEVBQUU7QUFDRCxZQUFJLEVBQUUsWUFBWTtBQUNsQixhQUFLLE9BQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEFBQUU7T0FDdEMsQ0FDRixDQUFDOztBQUVGLGFBQ0U7O1VBQU8sU0FBUyxFQUFDLE9BQU87UUFDdEI7OztVQUNFOzs7WUFDRTs7OzthQUFlO1lBQ2Y7Ozs7YUFBYztXQUNYO1NBQ0M7UUFDUjs7O1VBQ0csS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUksRUFBRSxDQUFDO21CQUNqQjs7Z0JBQUksR0FBRyxFQUFFLENBQUMsQUFBQztjQUNUOzs7Z0JBQUssSUFBSSxDQUFDLElBQUk7ZUFBTTtjQUNwQjs7O2dCQUFLLElBQUksQ0FBQyxLQUFLO2VBQU07YUFDbEI7V0FBQSxDQUNOO1NBQ0s7T0FDRixDQUNSO0tBQ0g7OztXQWxEa0I7QUFDakIsbUJBQWEsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDMUMsWUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUNuQyxvQkFBYyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMzQyxvQkFBYyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMzQyxtQkFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMxQyxvQkFBYyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtLQUM1Qzs7OztTQVRrQiwwQkFBMEI7R0FBUywwQkFBTSxTQUFTOztxQkFBbEQsMEJBQTBCIiwiZmlsZSI6IkJhc2ljU3RhdHNTZWN0aW9uQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2ljU3RhdHNTZWN0aW9uQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNwdVBlcmNlbnRhZ2U6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBtZW1vcnk6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBoZWFwUGVyY2VudGFnZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGxhc3RLZXlMYXRlbmN5OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgYWN0aXZlSGFuZGxlczogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIGFjdGl2ZVJlcXVlc3RzOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qgc3RhdHMgPSBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdDUFUnLFxuICAgICAgICB2YWx1ZTogYCR7dGhpcy5wcm9wcy5jcHVQZXJjZW50YWdlLnRvRml4ZWQoMCl9JWAsXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdIZWFwJyxcbiAgICAgICAgdmFsdWU6IGAke3RoaXMucHJvcHMuaGVhcFBlcmNlbnRhZ2UudG9GaXhlZCgxKX0lYCxcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ01lbW9yeScsXG4gICAgICAgIHZhbHVlOiBgJHtNYXRoLmZsb29yKHRoaXMucHJvcHMubWVtb3J5IC8gMTAyNCAvIDEwMjQpfU1CYCxcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0tleSBsYXRlbmN5JyxcbiAgICAgICAgdmFsdWU6IGAke3RoaXMucHJvcHMubGFzdEtleUxhdGVuY3l9bXNgLFxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnSGFuZGxlcycsXG4gICAgICAgIHZhbHVlOiBgJHt0aGlzLnByb3BzLmFjdGl2ZUhhbmRsZXN9YCxcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0V2ZW50IGxvb3AnLFxuICAgICAgICB2YWx1ZTogYCR7dGhpcy5wcm9wcy5hY3RpdmVSZXF1ZXN0c31gLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJ0YWJsZVwiPlxuICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRoPk1ldHJpYzwvdGg+XG4gICAgICAgICAgICA8dGg+VmFsdWU8L3RoPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGhlYWQ+XG4gICAgICAgIDx0Ym9keT5cbiAgICAgICAgICB7c3RhdHMubWFwKChzdGF0LCBzKSA9PlxuICAgICAgICAgICAgPHRyIGtleT17c30+XG4gICAgICAgICAgICAgIDx0aD57c3RhdC5uYW1lfTwvdGg+XG4gICAgICAgICAgICAgIDx0ZD57c3RhdC52YWx1ZX08L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICApfVxuICAgICAgICA8L3Rib2R5PlxuICAgICAgPC90YWJsZT5cbiAgICApO1xuICB9XG59XG4iXX0=