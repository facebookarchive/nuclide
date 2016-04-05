Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _IconsForAction;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var DATATIP_ACTIONS = Object.freeze({
  PIN: 'PIN',
  CLOSE: 'CLOSE'
});

exports.DATATIP_ACTIONS = DATATIP_ACTIONS;
var IconsForAction = (_IconsForAction = {}, _defineProperty(_IconsForAction, DATATIP_ACTIONS.PIN, 'pin'), _defineProperty(_IconsForAction, DATATIP_ACTIONS.CLOSE, 'x'), _IconsForAction);

var DatatipComponent = (function (_React$Component) {
  _inherits(DatatipComponent, _React$Component);

  function DatatipComponent(props) {
    _classCallCheck(this, DatatipComponent);

    _get(Object.getPrototypeOf(DatatipComponent.prototype), 'constructor', this).call(this, props);
    this.handleActionClick = this.handleActionClick.bind(this);
  }

  _createClass(DatatipComponent, [{
    key: 'handleActionClick',
    value: function handleActionClick(event) {
      this.props.onActionClick();
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var className = _props.className;
      var children = _props.children;
      var action = _props.action;
      var actionTitle = _props.actionTitle;

      var props = _objectWithoutProperties(_props, ['className', 'children', 'action', 'actionTitle']);

      var actionButton = undefined;
      if (action != null && IconsForAction[action] != null) {
        var actionIcon = IconsForAction[action];
        actionButton = _reactForAtom.React.createElement('div', {
          className: 'nuclide-datatip-pin-button icon-' + actionIcon,
          onClick: this.handleActionClick,
          title: actionTitle
        });
      }
      return _reactForAtom.React.createElement(
        'div',
        _extends({
          className: className + ' nuclide-datatip-container'
        }, props),
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-datatip-content' },
          children
        ),
        actionButton
      );
    }
  }]);

  return DatatipComponent;
})(_reactForAtom.React.Component);

exports.DatatipComponent = DatatipComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGF0aXBDb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOztBQUU3QixJQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzNDLEtBQUcsRUFBRSxLQUFLO0FBQ1YsT0FBSyxFQUFFLE9BQU87Q0FDZixDQUFDLENBQUM7OztBQUVILElBQU0sY0FBYywyREFDakIsZUFBZSxDQUFDLEdBQUcsRUFBRyxLQUFLLG9DQUMzQixlQUFlLENBQUMsS0FBSyxFQUFHLEdBQUcsbUJBQzdCLENBQUM7O0lBVVcsZ0JBQWdCO1lBQWhCLGdCQUFnQjs7QUFHaEIsV0FIQSxnQkFBZ0IsQ0FHZixLQUE0QixFQUFFOzBCQUgvQixnQkFBZ0I7O0FBSXpCLCtCQUpTLGdCQUFnQiw2Q0FJbkIsS0FBSyxFQUFFO0FBQ2IsQUFBQyxRQUFJLENBQU8saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNuRTs7ZUFOVSxnQkFBZ0I7O1dBUVYsMkJBQUMsS0FBcUIsRUFBUTtBQUM3QyxVQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQzVCOzs7V0FFSyxrQkFBaUI7bUJBT2pCLElBQUksQ0FBQyxLQUFLO1VBTFosU0FBUyxVQUFULFNBQVM7VUFDVCxRQUFRLFVBQVIsUUFBUTtVQUNSLE1BQU0sVUFBTixNQUFNO1VBQ04sV0FBVyxVQUFYLFdBQVc7O1VBQ1IsS0FBSzs7QUFFVixVQUFJLFlBQVksWUFBQSxDQUFDO0FBQ2pCLFVBQUksTUFBTSxJQUFJLElBQUksSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFO0FBQ3BELFlBQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxQyxvQkFBWSxHQUNWO0FBQ0UsbUJBQVMsdUNBQXFDLFVBQVUsQUFBRztBQUMzRCxpQkFBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQUFBQztBQUNoQyxlQUFLLEVBQUUsV0FBVyxBQUFDO1VBQ25CLEFBQ0gsQ0FBQztPQUNIO0FBQ0QsYUFDRTs7O0FBQ0UsbUJBQVMsRUFBSyxTQUFTLCtCQUE2QjtXQUNoRCxLQUFLO1FBQ1Q7O1lBQUssU0FBUyxFQUFDLHlCQUF5QjtVQUNyQyxRQUFRO1NBQ0w7UUFDTCxZQUFZO09BQ1QsQ0FDTjtLQUNIOzs7U0F6Q1UsZ0JBQWdCO0dBQVMsb0JBQU0sU0FBUyIsImZpbGUiOiJEYXRhdGlwQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5leHBvcnQgY29uc3QgREFUQVRJUF9BQ1RJT05TID0gT2JqZWN0LmZyZWV6ZSh7XG4gIFBJTjogJ1BJTicsXG4gIENMT1NFOiAnQ0xPU0UnLFxufSk7XG5cbmNvbnN0IEljb25zRm9yQWN0aW9uID0ge1xuICBbREFUQVRJUF9BQ1RJT05TLlBJTl06ICdwaW4nLFxuICBbREFUQVRJUF9BQ1RJT05TLkNMT1NFXTogJ3gnLFxufTtcblxudHlwZSBEYXRhdGlwQ29tcG9uZW50UHJvcHMgPSB7XG4gIGFjdGlvbjogc3RyaW5nO1xuICBhY3Rpb25UaXRsZTogc3RyaW5nO1xuICBjaGlsZHJlbj86IGFueTtcbiAgY2xhc3NOYW1lPzogc3RyaW5nO1xuICBvbkFjdGlvbkNsaWNrOiBGdW5jdGlvbjtcbn07XG5cbmV4cG9ydCBjbGFzcyBEYXRhdGlwQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IERhdGF0aXBDb21wb25lbnRQcm9wcztcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogRGF0YXRpcENvbXBvbmVudFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLmhhbmRsZUFjdGlvbkNsaWNrID0gdGhpcy5oYW5kbGVBY3Rpb25DbGljay5iaW5kKHRoaXMpO1xuICB9XG5cbiAgaGFuZGxlQWN0aW9uQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vbkFjdGlvbkNsaWNrKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7XG4gICAgICBjbGFzc05hbWUsXG4gICAgICBjaGlsZHJlbixcbiAgICAgIGFjdGlvbixcbiAgICAgIGFjdGlvblRpdGxlLFxuICAgICAgLi4ucHJvcHMsXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgbGV0IGFjdGlvbkJ1dHRvbjtcbiAgICBpZiAoYWN0aW9uICE9IG51bGwgJiYgSWNvbnNGb3JBY3Rpb25bYWN0aW9uXSAhPSBudWxsKSB7XG4gICAgICBjb25zdCBhY3Rpb25JY29uID0gSWNvbnNGb3JBY3Rpb25bYWN0aW9uXTtcbiAgICAgIGFjdGlvbkJ1dHRvbiA9IChcbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzTmFtZT17YG51Y2xpZGUtZGF0YXRpcC1waW4tYnV0dG9uIGljb24tJHthY3Rpb25JY29ufWB9XG4gICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVBY3Rpb25DbGlja31cbiAgICAgICAgICB0aXRsZT17YWN0aW9uVGl0bGV9XG4gICAgICAgIC8+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2Ake2NsYXNzTmFtZX0gbnVjbGlkZS1kYXRhdGlwLWNvbnRhaW5lcmB9XG4gICAgICAgIHsuLi5wcm9wc30+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1kYXRhdGlwLWNvbnRlbnRcIj5cbiAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7YWN0aW9uQnV0dG9ufVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuIl19