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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUhlYWx0aEdhZGdldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3FCQXNCd0Isa0JBQWtCOzs7Ozs7Ozt5Q0FSTiw4QkFBOEI7Ozs7NEJBQzlDLGdCQUFnQjs7QUFPckIsU0FBUyxrQkFBa0IsQ0FBQyxNQUE2QixFQUEwQjs7QUFFaEc7Y0FBYSxjQUFjOztpQkFBZCxjQUFjOzthQUVQLGdCQUFnQjs7OztBQUl2QixhQU5BLGNBQWMsR0FNSjs0QkFOVixjQUFjOzt3Q0FNVixJQUFJO0FBQUosWUFBSTs7O0FBQ2pCLGlDQVBTLGNBQWMsOENBT2QsSUFBSSxFQUFFO0FBQ2YsVUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7S0FDakI7O2lCQVRVLGNBQWM7O2FBV1IsNkJBQUc7OztBQUNsQixZQUFJLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7aUJBQUksTUFBSyxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztTQUFBLENBQUMsQ0FBQztPQUMvRTs7O2FBRW1CLGdDQUFHO0FBQ3JCLFlBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNuQzs7O2FBRU8sb0JBQVc7QUFDakIsZUFBTyxRQUFRLENBQUM7T0FDakI7OzthQUVVLHVCQUFXO0FBQ3BCLGVBQU8sV0FBVyxDQUFDO09BQ3BCOzs7OzthQUdHLGdCQUFZO0FBQ2QsZUFBTyxLQUFLLENBQUM7T0FDZDs7O2FBRUssa0JBQUc7cUJBQzhCLElBQUksQ0FBQyxLQUFLO1lBQXhDLEtBQUssVUFBTCxLQUFLO1lBQUUsbUJBQW1CLFVBQW5CLG1CQUFtQjs7QUFFakMsWUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLG1CQUFtQixJQUFJLElBQUksRUFBRTtBQUNoRCxpQkFBTyw4Q0FBTyxDQUFDO1NBQ2hCOztBQUVELGVBQ0U7O1lBQUssU0FBUyxFQUFDLDJDQUEyQztVQUN4RDtBQUNFLHlCQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWEsQUFBQztBQUNuQywwQkFBYyxFQUFFLEtBQUssQ0FBQyxjQUFjLEFBQUM7QUFDckMsa0JBQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxBQUFDO0FBQ2xCLDBCQUFjLEVBQUUsS0FBSyxDQUFDLGNBQWMsQUFBQztBQUNyQyx5QkFBYSxFQUFFLG1CQUFtQixDQUFDLE1BQU0sQUFBQztBQUMxQywrQkFBbUIsRUFBRSxtQkFBbUIsQUFBQztBQUN6QywwQkFBYyxFQUFFLEtBQUssQ0FBQyxjQUFjLEFBQUM7WUFDckM7U0FDRSxDQUNOO09BQ0g7OztXQXBEVSxjQUFjO0tBQVMsb0JBQU0sU0FBUyxFQXNEakQ7Q0FFSCIsImZpbGUiOiJjcmVhdGVIZWFsdGhHYWRnZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SGVhbHRoU3RhdHN9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUgUnggZnJvbSAncngnO1xuXG5pbXBvcnQgSGVhbHRoUGFuZUl0ZW1Db21wb25lbnQgZnJvbSAnLi91aS9IZWFsdGhQYW5lSXRlbUNvbXBvbmVudCc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHN0YXRzOiBIZWFsdGhTdGF0cyxcbiAgYWN0aXZlSGFuZGxlT2JqZWN0czogQXJyYXk8T2JqZWN0Pixcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUhlYWx0aEdhZGdldChzdGF0ZSQ6IFJ4Lk9ic2VydmFibGU8P1N0YXRlPik6IHR5cGVvZiBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJldHVybiBjbGFzcyBIZWFsdGhQYW5lSXRlbSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgICBzdGF0aWMgZ2FkZ2V0SWQgPSAnbnVjbGlkZS1oZWFsdGgnO1xuXG4gICAgX3N0YXRlU3Vic2NyaXB0aW9uOiByeCRJRGlzcG9zYWJsZTtcblxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcbiAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgdGhpcy5fc3RhdGVTdWJzY3JpcHRpb24gPSBzdGF0ZSQuZm9yRWFjaChzdGF0ZSA9PiB0aGlzLnNldFN0YXRlKHN0YXRlIHx8IHt9KSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICB0aGlzLl9zdGF0ZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiAnSGVhbHRoJztcbiAgICB9XG5cbiAgICBnZXRJY29uTmFtZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuICdkYXNoYm9hcmQnO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBmYWxzZSB0byBwcmV2ZW50IHRoZSB0YWIgZ2V0dGluZyBzcGxpdCAoc2luY2Ugd2Ugb25seSB1cGRhdGUgYSBzaW5nbGV0b24gaGVhbHRoIHBhbmUpLlxuICAgIGNvcHkoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgY29uc3Qge3N0YXRzLCBhY3RpdmVIYW5kbGVPYmplY3RzfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgIGlmIChzdGF0cyA9PSBudWxsIHx8IGFjdGl2ZUhhbmRsZU9iamVjdHMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gPGRpdiAvPjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lLWl0ZW0gcGFkZGVkIG51Y2xpZGUtaGVhbHRoLXBhbmUtaXRlbVwiPlxuICAgICAgICAgIDxIZWFsdGhQYW5lSXRlbUNvbXBvbmVudFxuICAgICAgICAgICAgY3B1UGVyY2VudGFnZT17c3RhdHMuY3B1UGVyY2VudGFnZX1cbiAgICAgICAgICAgIGhlYXBQZXJjZW50YWdlPXtzdGF0cy5oZWFwUGVyY2VudGFnZX1cbiAgICAgICAgICAgIG1lbW9yeT17c3RhdHMucnNzfVxuICAgICAgICAgICAgbGFzdEtleUxhdGVuY3k9e3N0YXRzLmxhc3RLZXlMYXRlbmN5fVxuICAgICAgICAgICAgYWN0aXZlSGFuZGxlcz17YWN0aXZlSGFuZGxlT2JqZWN0cy5sZW5ndGh9XG4gICAgICAgICAgICBhY3RpdmVIYW5kbGVPYmplY3RzPXthY3RpdmVIYW5kbGVPYmplY3RzfVxuICAgICAgICAgICAgYWN0aXZlUmVxdWVzdHM9e3N0YXRzLmFjdGl2ZVJlcXVlc3RzfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgfTtcblxufVxuIl19