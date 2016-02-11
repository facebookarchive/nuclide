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

var DATATIP_ACTIONS = {
  PIN: 'PIN',
  CLOSE: 'CLOSE'
};

exports.DATATIP_ACTIONS = DATATIP_ACTIONS;
var IconsForAction = (_IconsForAction = {}, _defineProperty(_IconsForAction, DATATIP_ACTIONS.PIN, 'pin'), _defineProperty(_IconsForAction, DATATIP_ACTIONS.CLOSE, 'x'), _IconsForAction);

/* eslint-disable react/prop-types */

var DatatipComponent = (function (_React$Component) {
  _inherits(DatatipComponent, _React$Component);

  function DatatipComponent(props) {
    _classCallCheck(this, DatatipComponent);

    _get(Object.getPrototypeOf(DatatipComponent.prototype), 'constructor', this).call(this, props);
    this.handleActionClick = this.handleActionClick.bind(this);
  }

  /* eslint-enable react/prop-types */

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGF0aXBDb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOztBQUU3QixJQUFNLGVBQWUsR0FBRztBQUM3QixLQUFHLEVBQUUsS0FBSztBQUNWLE9BQUssRUFBRSxPQUFPO0NBQ2YsQ0FBQzs7O0FBRUYsSUFBTSxjQUFjLDJEQUNqQixlQUFlLENBQUMsR0FBRyxFQUFHLEtBQUssb0NBQzNCLGVBQWUsQ0FBQyxLQUFLLEVBQUcsR0FBRyxtQkFDN0IsQ0FBQzs7OztJQVNXLGdCQUFnQjtZQUFoQixnQkFBZ0I7O0FBRWhCLFdBRkEsZ0JBQWdCLENBRWYsS0FBNEIsRUFBRTswQkFGL0IsZ0JBQWdCOztBQUd6QiwrQkFIUyxnQkFBZ0IsNkNBR25CLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzVEOzs7O2VBTFUsZ0JBQWdCOztXQU9WLDJCQUFDLEtBQXFCLEVBQVE7QUFDN0MsVUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUM1Qjs7O1dBRUssa0JBQWlCO21CQU9qQixJQUFJLENBQUMsS0FBSztVQUxaLFNBQVMsVUFBVCxTQUFTO1VBQ1QsUUFBUSxVQUFSLFFBQVE7VUFDUixNQUFNLFVBQU4sTUFBTTtVQUNOLFdBQVcsVUFBWCxXQUFXOztVQUNSLEtBQUs7O0FBRVYsVUFBSSxZQUFZLFlBQUEsQ0FBQztBQUNqQixVQUFJLE1BQU0sSUFBSSxJQUFJLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtBQUNwRCxZQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUMsb0JBQVksR0FDVjtBQUNFLG1CQUFTLHVDQUFxQyxVQUFVLEFBQUc7QUFDM0QsaUJBQU8sRUFBRSxJQUFJLENBQUMsaUJBQWlCLEFBQUM7QUFDaEMsZUFBSyxFQUFFLFdBQVcsQUFBQztVQUNuQixBQUNILENBQUM7T0FDSDtBQUNELGFBQ0U7OztBQUNFLG1CQUFTLEVBQUssU0FBUywrQkFBNkI7V0FDaEQsS0FBSztRQUNUOztZQUFLLFNBQVMsRUFBQyx5QkFBeUI7VUFDckMsUUFBUTtTQUNMO1FBQ0wsWUFBWTtPQUNULENBQ047S0FDSDs7O1NBeENVLGdCQUFnQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiRGF0YXRpcENvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuZXhwb3J0IGNvbnN0IERBVEFUSVBfQUNUSU9OUyA9IHtcbiAgUElOOiAnUElOJyxcbiAgQ0xPU0U6ICdDTE9TRScsXG59O1xuXG5jb25zdCBJY29uc0ZvckFjdGlvbiA9IHtcbiAgW0RBVEFUSVBfQUNUSU9OUy5QSU5dOiAncGluJyxcbiAgW0RBVEFUSVBfQUNUSU9OUy5DTE9TRV06ICd4Jyxcbn07XG5cbnR5cGUgRGF0YXRpcENvbXBvbmVudFByb3BzID0ge1xuICBhY3Rpb246IHN0cmluZztcbiAgYWN0aW9uVGl0bGU6IHN0cmluZztcbiAgb25BY3Rpb25DbGljazogRnVuY3Rpb247XG59XG5cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBjbGFzcyBEYXRhdGlwQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogRGF0YXRpcENvbXBvbmVudFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuaGFuZGxlQWN0aW9uQ2xpY2sgPSB0aGlzLmhhbmRsZUFjdGlvbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBoYW5kbGVBY3Rpb25DbGljayhldmVudDogU3ludGhldGljRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uQWN0aW9uQ2xpY2soKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtcbiAgICAgIGNsYXNzTmFtZSxcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgYWN0aW9uLFxuICAgICAgYWN0aW9uVGl0bGUsXG4gICAgICAuLi5wcm9wcyxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBsZXQgYWN0aW9uQnV0dG9uO1xuICAgIGlmIChhY3Rpb24gIT0gbnVsbCAmJiBJY29uc0ZvckFjdGlvblthY3Rpb25dICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGFjdGlvbkljb24gPSBJY29uc0ZvckFjdGlvblthY3Rpb25dO1xuICAgICAgYWN0aW9uQnV0dG9uID0gKFxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtgbnVjbGlkZS1kYXRhdGlwLXBpbi1idXR0b24gaWNvbi0ke2FjdGlvbkljb259YH1cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZUFjdGlvbkNsaWNrfVxuICAgICAgICAgIHRpdGxlPXthY3Rpb25UaXRsZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17YCR7Y2xhc3NOYW1lfSBudWNsaWRlLWRhdGF0aXAtY29udGFpbmVyYH1cbiAgICAgICAgey4uLnByb3BzfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRhdGF0aXAtY29udGVudFwiPlxuICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHthY3Rpb25CdXR0b259XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==