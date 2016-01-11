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

var HealthStatusBarComponent = (function (_React$Component) {
  _inherits(HealthStatusBarComponent, _React$Component);

  function HealthStatusBarComponent() {
    _classCallCheck(this, HealthStatusBarComponent);

    _get(Object.getPrototypeOf(HealthStatusBarComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(HealthStatusBarComponent, [{
    key: 'render',
    value: function render() {
      var stats = [];

      if (this.props.hasOwnProperty('cpuPercentage')) {
        stats.push('CPU: ' + this.props.cpuPercentage.toFixed(0) + '%');
      }

      if (this.props.hasOwnProperty('heapPercentage')) {
        stats.push('Heap: ' + this.props.heapPercentage.toFixed(1) + '%');
      }

      if (this.props.hasOwnProperty('memory')) {
        stats.push('Memory: ' + Math.floor(this.props.memory / 1024 / 1024) + 'MB');
      }

      if (this.props.hasOwnProperty('lastKeyLatency')) {
        stats.push('Key: ' + this.props.lastKeyLatency + 'ms');
      }

      if (this.props.hasOwnProperty('activeHandles')) {
        stats.push('Handles: ' + this.props.activeHandles);
      }

      if (this.props.hasOwnProperty('activeRequests')) {
        stats.push('Event loop: ' + this.props.activeRequests);
      }

      return _reactForAtom2['default'].createElement(
        'div',
        null,
        _reactForAtom2['default'].createElement('span', {
          className: 'icon icon-dashboard nuclide-health-icon',
          onClick: this.props.onClickIcon
        }),
        stats.map(function (stat) {
          return _reactForAtom2['default'].createElement(
            'span',
            { className: 'nuclide-health-stat' },
            stat
          );
        })
      );
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return _reactForAtom2['default'].addons.PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
    }
  }], [{
    key: 'propTypes',
    value: {
      onClickIcon: PropTypes.func.isRequired,
      cpuPercentage: PropTypes.number,
      memory: PropTypes.number,
      heapPercentage: PropTypes.number,
      lastKeyLatency: PropTypes.number,
      activeHandles: PropTypes.number,
      activeRequests: PropTypes.number
    },
    enumerable: true
  }]);

  return HealthStatusBarComponent;
})(_reactForAtom2['default'].Component);

exports['default'] = HealthStatusBarComponent;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhlYWx0aFN0YXR1c0JhckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdrQixnQkFBZ0I7Ozs7SUFDM0IsU0FBUyw2QkFBVCxTQUFTOztJQUVLLHdCQUF3QjtZQUF4Qix3QkFBd0I7O1dBQXhCLHdCQUF3QjswQkFBeEIsd0JBQXdCOzsrQkFBeEIsd0JBQXdCOzs7ZUFBeEIsd0JBQXdCOztXQVlyQyxrQkFBUztBQUNiLFVBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQzs7QUFFakIsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUM5QyxhQUFLLENBQUMsSUFBSSxXQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBSSxDQUFDO09BQzVEOztBQUVELFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtBQUMvQyxhQUFLLENBQUMsSUFBSSxZQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBSSxDQUFDO09BQzlEOztBQUVELFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDdkMsYUFBSyxDQUFDLElBQUksY0FBWSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsUUFBSyxDQUFDO09BQ3hFOztBQUVELFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtBQUMvQyxhQUFLLENBQUMsSUFBSSxXQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxRQUFLLENBQUM7T0FDbkQ7O0FBRUQsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUM5QyxhQUFLLENBQUMsSUFBSSxlQUFhLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFHLENBQUM7T0FDcEQ7O0FBRUQsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO0FBQy9DLGFBQUssQ0FBQyxJQUFJLGtCQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBRyxDQUFDO09BQ3hEOztBQUVELGFBQ0U7OztRQUNFO0FBQ0UsbUJBQVMsRUFBQyx5Q0FBeUM7QUFDbkQsaUJBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQUFBQztVQUNoQztRQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO2lCQUNiOztjQUFNLFNBQVMsRUFBQyxxQkFBcUI7WUFBRSxJQUFJO1dBQVE7U0FBQSxDQUNwRDtPQUNHLENBQ047S0FDSDs7O1dBRW9CLCtCQUFDLFNBQWlCLEVBQUUsU0FBaUIsRUFBVztBQUNuRSxhQUFPLDBCQUFNLE1BQU0sQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDNUY7OztXQXBEa0I7QUFDakIsaUJBQVcsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDdEMsbUJBQWEsRUFBRSxTQUFTLENBQUMsTUFBTTtBQUMvQixZQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDeEIsb0JBQWMsRUFBRSxTQUFTLENBQUMsTUFBTTtBQUNoQyxvQkFBYyxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQ2hDLG1CQUFhLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDL0Isb0JBQWMsRUFBRSxTQUFTLENBQUMsTUFBTTtLQUNqQzs7OztTQVZrQix3QkFBd0I7R0FBUywwQkFBTSxTQUFTOztxQkFBaEQsd0JBQXdCIiwiZmlsZSI6IkhlYWx0aFN0YXR1c0JhckNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZWFsdGhTdGF0dXNCYXJDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgb25DbGlja0ljb246IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgY3B1UGVyY2VudGFnZTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtZW1vcnk6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgaGVhcFBlcmNlbnRhZ2U6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgbGFzdEtleUxhdGVuY3k6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgYWN0aXZlSGFuZGxlczogUHJvcFR5cGVzLm51bWJlcixcbiAgICBhY3RpdmVSZXF1ZXN0czogUHJvcFR5cGVzLm51bWJlcixcbiAgfTtcblxuICByZW5kZXIoKTogdm9pZCB7XG4gICAgY29uc3Qgc3RhdHMgPSBbXTtcblxuICAgIGlmICh0aGlzLnByb3BzLmhhc093blByb3BlcnR5KCdjcHVQZXJjZW50YWdlJykpIHtcbiAgICAgIHN0YXRzLnB1c2goYENQVTogJHt0aGlzLnByb3BzLmNwdVBlcmNlbnRhZ2UudG9GaXhlZCgwKX0lYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMuaGFzT3duUHJvcGVydHkoJ2hlYXBQZXJjZW50YWdlJykpIHtcbiAgICAgIHN0YXRzLnB1c2goYEhlYXA6ICR7dGhpcy5wcm9wcy5oZWFwUGVyY2VudGFnZS50b0ZpeGVkKDEpfSVgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5oYXNPd25Qcm9wZXJ0eSgnbWVtb3J5JykpIHtcbiAgICAgIHN0YXRzLnB1c2goYE1lbW9yeTogJHtNYXRoLmZsb29yKHRoaXMucHJvcHMubWVtb3J5IC8gMTAyNCAvIDEwMjQpfU1CYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMuaGFzT3duUHJvcGVydHkoJ2xhc3RLZXlMYXRlbmN5JykpIHtcbiAgICAgIHN0YXRzLnB1c2goYEtleTogJHt0aGlzLnByb3BzLmxhc3RLZXlMYXRlbmN5fW1zYCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMuaGFzT3duUHJvcGVydHkoJ2FjdGl2ZUhhbmRsZXMnKSkge1xuICAgICAgc3RhdHMucHVzaChgSGFuZGxlczogJHt0aGlzLnByb3BzLmFjdGl2ZUhhbmRsZXN9YCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMuaGFzT3duUHJvcGVydHkoJ2FjdGl2ZVJlcXVlc3RzJykpIHtcbiAgICAgIHN0YXRzLnB1c2goYEV2ZW50IGxvb3A6ICR7dGhpcy5wcm9wcy5hY3RpdmVSZXF1ZXN0c31gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBjbGFzc05hbWU9XCJpY29uIGljb24tZGFzaGJvYXJkIG51Y2xpZGUtaGVhbHRoLWljb25cIlxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja0ljb259XG4gICAgICAgIC8+XG4gICAgICAgIHtzdGF0cy5tYXAoc3RhdCA9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtaGVhbHRoLXN0YXRcIj57c3RhdH08L3NwYW4+XG4gICAgICAgICl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wczogT2JqZWN0LCBuZXh0U3RhdGU6IE9iamVjdCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBSZWFjdC5hZGRvbnMuUHVyZVJlbmRlck1peGluLnNob3VsZENvbXBvbmVudFVwZGF0ZS5jYWxsKHRoaXMsIG5leHRQcm9wcywgbmV4dFN0YXRlKTtcbiAgfVxuXG59XG4iXX0=