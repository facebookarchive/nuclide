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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhdGF0aXBDb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOztBQUU3QixJQUFNLGVBQWUsR0FBRztBQUM3QixLQUFHLEVBQUUsS0FBSztBQUNWLE9BQUssRUFBRSxPQUFPO0NBQ2YsQ0FBQzs7O0FBRUYsSUFBTSxjQUFjLDJEQUNqQixlQUFlLENBQUMsR0FBRyxFQUFHLEtBQUssb0NBQzNCLGVBQWUsQ0FBQyxLQUFLLEVBQUcsR0FBRyxtQkFDN0IsQ0FBQzs7SUFVVyxnQkFBZ0I7WUFBaEIsZ0JBQWdCOztBQUdoQixXQUhBLGdCQUFnQixDQUdmLEtBQTRCLEVBQUU7MEJBSC9CLGdCQUFnQjs7QUFJekIsK0JBSlMsZ0JBQWdCLDZDQUluQixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ25FOztlQU5VLGdCQUFnQjs7V0FRViwyQkFBQyxLQUFxQixFQUFRO0FBQzdDLFVBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDNUI7OztXQUVLLGtCQUFpQjttQkFPakIsSUFBSSxDQUFDLEtBQUs7VUFMWixTQUFTLFVBQVQsU0FBUztVQUNULFFBQVEsVUFBUixRQUFRO1VBQ1IsTUFBTSxVQUFOLE1BQU07VUFDTixXQUFXLFVBQVgsV0FBVzs7VUFDUixLQUFLOztBQUVWLFVBQUksWUFBWSxZQUFBLENBQUM7QUFDakIsVUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDcEQsWUFBTSxVQUFVLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFDLG9CQUFZLEdBQ1Y7QUFDRSxtQkFBUyx1Q0FBcUMsVUFBVSxBQUFHO0FBQzNELGlCQUFPLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixBQUFDO0FBQ2hDLGVBQUssRUFBRSxXQUFXLEFBQUM7VUFDbkIsQUFDSCxDQUFDO09BQ0g7QUFDRCxhQUNFOzs7QUFDRSxtQkFBUyxFQUFLLFNBQVMsK0JBQTZCO1dBQ2hELEtBQUs7UUFDVDs7WUFBSyxTQUFTLEVBQUMseUJBQXlCO1VBQ3JDLFFBQVE7U0FDTDtRQUNMLFlBQVk7T0FDVCxDQUNOO0tBQ0g7OztTQXpDVSxnQkFBZ0I7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkRhdGF0aXBDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmV4cG9ydCBjb25zdCBEQVRBVElQX0FDVElPTlMgPSB7XG4gIFBJTjogJ1BJTicsXG4gIENMT1NFOiAnQ0xPU0UnLFxufTtcblxuY29uc3QgSWNvbnNGb3JBY3Rpb24gPSB7XG4gIFtEQVRBVElQX0FDVElPTlMuUElOXTogJ3BpbicsXG4gIFtEQVRBVElQX0FDVElPTlMuQ0xPU0VdOiAneCcsXG59O1xuXG50eXBlIERhdGF0aXBDb21wb25lbnRQcm9wcyA9IHtcbiAgYWN0aW9uOiBzdHJpbmc7XG4gIGFjdGlvblRpdGxlOiBzdHJpbmc7XG4gIGNoaWxkcmVuPzogYW55O1xuICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gIG9uQWN0aW9uQ2xpY2s6IEZ1bmN0aW9uO1xufTtcblxuZXhwb3J0IGNsYXNzIERhdGF0aXBDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogRGF0YXRpcENvbXBvbmVudFByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBEYXRhdGlwQ29tcG9uZW50UHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuaGFuZGxlQWN0aW9uQ2xpY2sgPSB0aGlzLmhhbmRsZUFjdGlvbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICBoYW5kbGVBY3Rpb25DbGljayhldmVudDogU3ludGhldGljRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uQWN0aW9uQ2xpY2soKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IHtcbiAgICAgIGNsYXNzTmFtZSxcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgYWN0aW9uLFxuICAgICAgYWN0aW9uVGl0bGUsXG4gICAgICAuLi5wcm9wcyxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBsZXQgYWN0aW9uQnV0dG9uO1xuICAgIGlmIChhY3Rpb24gIT0gbnVsbCAmJiBJY29uc0ZvckFjdGlvblthY3Rpb25dICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGFjdGlvbkljb24gPSBJY29uc0ZvckFjdGlvblthY3Rpb25dO1xuICAgICAgYWN0aW9uQnV0dG9uID0gKFxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtgbnVjbGlkZS1kYXRhdGlwLXBpbi1idXR0b24gaWNvbi0ke2FjdGlvbkljb259YH1cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZUFjdGlvbkNsaWNrfVxuICAgICAgICAgIHRpdGxlPXthY3Rpb25UaXRsZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17YCR7Y2xhc3NOYW1lfSBudWNsaWRlLWRhdGF0aXAtY29udGFpbmVyYH1cbiAgICAgICAgey4uLnByb3BzfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWRhdGF0aXAtY29udGVudFwiPlxuICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHthY3Rpb25CdXR0b259XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXX0=