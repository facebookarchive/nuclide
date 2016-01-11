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

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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
          return _reactForAtom2['default'].createElement('div', null);
        }

        return _reactForAtom2['default'].createElement(
          'div',
          { className: 'pane-item padded nuclide-health-pane-item' },
          _reactForAtom2['default'].createElement(_uiHealthPaneItemComponent2['default'], {
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
  })(_reactForAtom2['default'].Component);
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUhlYWx0aEdhZGdldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3FCQXNCd0Isa0JBQWtCOzs7Ozs7Ozt5Q0FSTiw4QkFBOEI7Ozs7NEJBQ2hELGdCQUFnQjs7OztBQU9uQixTQUFTLGtCQUFrQixDQUFDLE1BQTZCLEVBQTBCOztBQUVoRztjQUFhLGNBQWM7O2lCQUFkLGNBQWM7O2FBRVAsZ0JBQWdCOzs7O0FBSXZCLGFBTkEsY0FBYyxHQU1KOzRCQU5WLGNBQWM7O3dDQU1WLElBQUk7QUFBSixZQUFJOzs7QUFDakIsaUNBUFMsY0FBYyw4Q0FPZCxJQUFJLEVBQUU7QUFDZixVQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztLQUNqQjs7aUJBVFUsY0FBYzs7YUFXUiw2QkFBRzs7O0FBQ2xCLFlBQUksQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSztpQkFBSSxNQUFLLFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1NBQUEsQ0FBQyxDQUFDO09BQy9FOzs7YUFFbUIsZ0NBQUc7QUFDckIsWUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ25DOzs7YUFFTyxvQkFBVztBQUNqQixlQUFPLFFBQVEsQ0FBQztPQUNqQjs7O2FBRVUsdUJBQVc7QUFDcEIsZUFBTyxXQUFXLENBQUM7T0FDcEI7Ozs7O2FBR0csZ0JBQVk7QUFDZCxlQUFPLEtBQUssQ0FBQztPQUNkOzs7YUFFSyxrQkFBRztxQkFDOEIsSUFBSSxDQUFDLEtBQUs7WUFBeEMsS0FBSyxVQUFMLEtBQUs7WUFBRSxtQkFBbUIsVUFBbkIsbUJBQW1COztBQUVqQyxZQUFJLEtBQUssSUFBSSxJQUFJLElBQUksbUJBQW1CLElBQUksSUFBSSxFQUFFO0FBQ2hELGlCQUFPLG9EQUFPLENBQUM7U0FDaEI7O0FBRUQsZUFDRTs7WUFBSyxTQUFTLEVBQUMsMkNBQTJDO1VBQ3hEO0FBQ0UseUJBQWEsRUFBRSxLQUFLLENBQUMsYUFBYSxBQUFDO0FBQ25DLDBCQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsQUFBQztBQUNyQyxrQkFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLEFBQUM7QUFDbEIsMEJBQWMsRUFBRSxLQUFLLENBQUMsY0FBYyxBQUFDO0FBQ3JDLHlCQUFhLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxBQUFDO0FBQzFDLCtCQUFtQixFQUFFLG1CQUFtQixBQUFDO0FBQ3pDLDBCQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsQUFBQztZQUNyQztTQUNFLENBQ047T0FDSDs7O1dBcERVLGNBQWM7S0FBUywwQkFBTSxTQUFTLEVBc0RqRDtDQUVIIiwiZmlsZSI6ImNyZWF0ZUhlYWx0aEdhZGdldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIZWFsdGhTdGF0c30gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSBSeCBmcm9tICdyeCc7XG5cbmltcG9ydCBIZWFsdGhQYW5lSXRlbUNvbXBvbmVudCBmcm9tICcuL3VpL0hlYWx0aFBhbmVJdGVtQ29tcG9uZW50JztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHN0YXRzOiBIZWFsdGhTdGF0cyxcbiAgYWN0aXZlSGFuZGxlT2JqZWN0czogQXJyYXk8T2JqZWN0Pixcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUhlYWx0aEdhZGdldChzdGF0ZSQ6IFJ4Lk9ic2VydmFibGU8P1N0YXRlPik6IHR5cGVvZiBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJldHVybiBjbGFzcyBIZWFsdGhQYW5lSXRlbSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBzdGF0aWMgZ2FkZ2V0SWQgPSAnbnVjbGlkZS1oZWFsdGgnO1xuXG4gICAgX3N0YXRlU3Vic2NyaXB0aW9uOiByeCRJRGlzcG9zYWJsZTtcblxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgdGhpcy5fc3RhdGVTdWJzY3JpcHRpb24gPSBzdGF0ZSQuZm9yRWFjaChzdGF0ZSA9PiB0aGlzLnNldFN0YXRlKHN0YXRlIHx8IHt9KSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB0aGlzLl9zdGF0ZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAnSGVhbHRoJztcbiAgICB9XG5cbiAgICBnZXRJY29uTmFtZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdkYXNoYm9hcmQnO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBmYWxzZSB0byBwcmV2ZW50IHRoZSB0YWIgZ2V0dGluZyBzcGxpdCAoc2luY2Ugd2Ugb25seSB1cGRhdGUgYSBzaW5nbGV0b24gaGVhbHRoIHBhbmUpLlxuICAgIGNvcHkoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge3N0YXRzLCBhY3RpdmVIYW5kbGVPYmplY3RzfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgIGlmIChzdGF0cyA9PSBudWxsIHx8IGFjdGl2ZUhhbmRsZU9iamVjdHMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gPGRpdiAvPjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lLWl0ZW0gcGFkZGVkIG51Y2xpZGUtaGVhbHRoLXBhbmUtaXRlbVwiPlxuICAgICAgICAgIDxIZWFsdGhQYW5lSXRlbUNvbXBvbmVudFxuICAgICAgICAgICAgY3B1UGVyY2VudGFnZT17c3RhdHMuY3B1UGVyY2VudGFnZX1cbiAgICAgICAgICAgIGhlYXBQZXJjZW50YWdlPXtzdGF0cy5oZWFwUGVyY2VudGFnZX1cbiAgICAgICAgICAgIG1lbW9yeT17c3RhdHMucnNzfVxuICAgICAgICAgICAgbGFzdEtleUxhdGVuY3k9e3N0YXRzLmxhc3RLZXlMYXRlbmN5fVxuICAgICAgICAgICAgYWN0aXZlSGFuZGxlcz17YWN0aXZlSGFuZGxlT2JqZWN0cy5sZW5ndGh9XG4gICAgICAgICAgICBhY3RpdmVIYW5kbGVPYmplY3RzPXthY3RpdmVIYW5kbGVPYmplY3RzfVxuICAgICAgICAgICAgYWN0aXZlUmVxdWVzdHM9e3N0YXRzLmFjdGl2ZVJlcXVlc3RzfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgfTtcblxufVxuIl19