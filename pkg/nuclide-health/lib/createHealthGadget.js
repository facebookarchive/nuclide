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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports['default'] = createHealthGadget;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _uiHealthPaneItemComponent = require('./ui/HealthPaneItemComponent');

var _uiHealthPaneItemComponent2 = _interopRequireDefault(_uiHealthPaneItemComponent);

var _reactForAtom = require('react-for-atom');

function createHealthGadget(state$) {

  return (function (_React$Component) {
    _inherits(HealthPaneItem, _React$Component);

    _createClass(HealthPaneItem, null, [{
      key: 'gadgetId',
      value: 'nuclide-health',
      enumerable: true
    }]);

    function HealthPaneItem() {
      _classCallCheck(this, HealthPaneItem);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _get(Object.getPrototypeOf(HealthPaneItem.prototype), 'constructor', this).apply(this, args);
      this.state = {};
    }

    _createClass(HealthPaneItem, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this = this;

        this._stateSubscription = state$.forEach(function (state) {
          return _this.setState(state || {});
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this._stateSubscription.dispose();
      }
    }, {
      key: 'getTitle',
      value: function getTitle() {
        return 'Health';
      }
    }, {
      key: 'getIconName',
      value: function getIconName() {
        return 'dashboard';
      }

      // Return false to prevent the tab getting split (since we only update a singleton health pane).
    }, {
      key: 'copy',
      value: function copy() {
        return false;
      }
    }, {
      key: 'render',
      value: function render() {
        var _state = this.state;
        var stats = _state.stats;
        var activeHandleObjects = _state.activeHandleObjects;

        if (stats == null || activeHandleObjects == null) {
          return _reactForAtom.React.createElement('div', null);
        }

        return _reactForAtom.React.createElement(
          'div',
          { className: 'pane-item padded nuclide-health-pane-item' },
          _reactForAtom.React.createElement(_uiHealthPaneItemComponent2['default'], {
            cpuPercentage: stats.cpuPercentage,
            heapPercentage: stats.heapPercentage,
            memory: stats.rss,
            lastKeyLatency: stats.lastKeyLatency,
            activeHandles: activeHandleObjects.length,
            activeHandleObjects: activeHandleObjects,
            activeRequests: stats.activeRequests
          })
        );
      }
    }]);

    return HealthPaneItem;
  })(_reactForAtom.React.Component);
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUhlYWx0aEdhZGdldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3FCQXNCd0Isa0JBQWtCOzs7Ozs7Ozt5Q0FSTiw4QkFBOEI7Ozs7NEJBQzlDLGdCQUFnQjs7QUFPckIsU0FBUyxrQkFBa0IsQ0FBQyxNQUE2QixFQUFjOztBQUVwRjtjQUFhLGNBQWM7O2lCQUFkLGNBQWM7O2FBRVAsZ0JBQWdCOzs7O0FBTXZCLGFBUkEsY0FBYyxHQVFKOzRCQVJWLGNBQWM7O3dDQVFWLElBQUk7QUFBSixZQUFJOzs7QUFDakIsaUNBVFMsY0FBYyw4Q0FTZCxJQUFJLEVBQUU7QUFDZixVQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztLQUNqQjs7aUJBWFUsY0FBYzs7YUFhUiw2QkFBRzs7O0FBQ2xCLFlBQUksQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSztpQkFBSSxNQUFLLFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1NBQUEsQ0FBQyxDQUFDO09BQy9FOzs7YUFFbUIsZ0NBQUc7QUFDckIsWUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ25DOzs7YUFFTyxvQkFBVztBQUNqQixlQUFPLFFBQVEsQ0FBQztPQUNqQjs7O2FBRVUsdUJBQVc7QUFDcEIsZUFBTyxXQUFXLENBQUM7T0FDcEI7Ozs7O2FBR0csZ0JBQVk7QUFDZCxlQUFPLEtBQUssQ0FBQztPQUNkOzs7YUFFSyxrQkFBRztxQkFDOEIsSUFBSSxDQUFDLEtBQUs7WUFBeEMsS0FBSyxVQUFMLEtBQUs7WUFBRSxtQkFBbUIsVUFBbkIsbUJBQW1COztBQUVqQyxZQUFJLEtBQUssSUFBSSxJQUFJLElBQUksbUJBQW1CLElBQUksSUFBSSxFQUFFO0FBQ2hELGlCQUFPLDhDQUFPLENBQUM7U0FDaEI7O0FBRUQsZUFDRTs7WUFBSyxTQUFTLEVBQUMsMkNBQTJDO1VBQ3hEO0FBQ0UseUJBQWEsRUFBRSxLQUFLLENBQUMsYUFBYSxBQUFDO0FBQ25DLDBCQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsQUFBQztBQUNyQyxrQkFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLEFBQUM7QUFDbEIsMEJBQWMsRUFBRSxLQUFLLENBQUMsY0FBYyxBQUFDO0FBQ3JDLHlCQUFhLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxBQUFDO0FBQzFDLCtCQUFtQixFQUFFLG1CQUFtQixBQUFDO0FBQ3pDLDBCQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsQUFBQztZQUNyQztTQUNFLENBQ047T0FDSDs7O1dBdERVLGNBQWM7S0FBUyxvQkFBTSxTQUFTLEVBd0RqRDtDQUVIIiwiZmlsZSI6ImNyZWF0ZUhlYWx0aEdhZGdldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZWFsdGhTdGF0c30gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBSeCBmcm9tICdyeCc7XG5cbmltcG9ydCBIZWFsdGhQYW5lSXRlbUNvbXBvbmVudCBmcm9tICcuL3VpL0hlYWx0aFBhbmVJdGVtQ29tcG9uZW50JztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBTdGF0ZSA9IHtcbiAgYWN0aXZlSGFuZGxlT2JqZWN0cz86IEFycmF5PE9iamVjdD47XG4gIHN0YXRzPzogSGVhbHRoU3RhdHM7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVIZWFsdGhHYWRnZXQoc3RhdGUkOiBSeC5PYnNlcnZhYmxlPD9TdGF0ZT4pOiBDbGFzczxhbnk+IHtcblxuICByZXR1cm4gY2xhc3MgSGVhbHRoUGFuZUl0ZW0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgdm9pZCwgU3RhdGU+IHtcblxuICAgIHN0YXRpYyBnYWRnZXRJZCA9ICdudWNsaWRlLWhlYWx0aCc7XG5cbiAgICBzdGF0ZTogU3RhdGU7XG5cbiAgICBfc3RhdGVTdWJzY3JpcHRpb246IElEaXNwb3NhYmxlO1xuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICB0aGlzLnN0YXRlID0ge307XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICB0aGlzLl9zdGF0ZVN1YnNjcmlwdGlvbiA9IHN0YXRlJC5mb3JFYWNoKHN0YXRlID0+IHRoaXMuc2V0U3RhdGUoc3RhdGUgfHwge30pKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgIHRoaXMuX3N0YXRlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdIZWFsdGgnO1xuICAgIH1cblxuICAgIGdldEljb25OYW1lKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gJ2Rhc2hib2FyZCc7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGZhbHNlIHRvIHByZXZlbnQgdGhlIHRhYiBnZXR0aW5nIHNwbGl0IChzaW5jZSB3ZSBvbmx5IHVwZGF0ZSBhIHNpbmdsZXRvbiBoZWFsdGggcGFuZSkuXG4gICAgY29weSgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICBjb25zdCB7c3RhdHMsIGFjdGl2ZUhhbmRsZU9iamVjdHN9ID0gdGhpcy5zdGF0ZTtcblxuICAgICAgaWYgKHN0YXRzID09IG51bGwgfHwgYWN0aXZlSGFuZGxlT2JqZWN0cyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiA8ZGl2IC8+O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmUtaXRlbSBwYWRkZWQgbnVjbGlkZS1oZWFsdGgtcGFuZS1pdGVtXCI+XG4gICAgICAgICAgPEhlYWx0aFBhbmVJdGVtQ29tcG9uZW50XG4gICAgICAgICAgICBjcHVQZXJjZW50YWdlPXtzdGF0cy5jcHVQZXJjZW50YWdlfVxuICAgICAgICAgICAgaGVhcFBlcmNlbnRhZ2U9e3N0YXRzLmhlYXBQZXJjZW50YWdlfVxuICAgICAgICAgICAgbWVtb3J5PXtzdGF0cy5yc3N9XG4gICAgICAgICAgICBsYXN0S2V5TGF0ZW5jeT17c3RhdHMubGFzdEtleUxhdGVuY3l9XG4gICAgICAgICAgICBhY3RpdmVIYW5kbGVzPXthY3RpdmVIYW5kbGVPYmplY3RzLmxlbmd0aH1cbiAgICAgICAgICAgIGFjdGl2ZUhhbmRsZU9iamVjdHM9e2FjdGl2ZUhhbmRsZU9iamVjdHN9XG4gICAgICAgICAgICBhY3RpdmVSZXF1ZXN0cz17c3RhdHMuYWN0aXZlUmVxdWVzdHN9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgIH1cblxuICB9O1xuXG59XG4iXX0=