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

var _Block = require('./Block');

var _Tabs = require('./Tabs');

var tabs = [{
  name: 'one',
  tabContent: _reactForAtom.React.createElement(
    'div',
    null,
    'One'
  )
}, {
  name: 'two',
  tabContent: _reactForAtom.React.createElement(
    'div',
    null,
    'Two'
  )
}, {
  name: 'three',
  tabContent: _reactForAtom.React.createElement(
    'div',
    null,
    'Three'
  )
}, {
  name: 'four',
  tabContent: _reactForAtom.React.createElement(
    'div',
    null,
    'Four'
  )
}, {
  name: 'five',
  tabContent: _reactForAtom.React.createElement(
    'div',
    null,
    'Five'
  )
}];

var TabExample = (function (_React$Component) {
  _inherits(TabExample, _React$Component);

  function TabExample(props) {
    _classCallCheck(this, TabExample);

    _get(Object.getPrototypeOf(TabExample.prototype), 'constructor', this).call(this, props);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.state = {
      activeTabName: 'one'
    };
  }

  _createClass(TabExample, [{
    key: 'handleTabChange',
    value: function handleTabChange(newTabName) {
      this.setState({
        activeTabName: newTabName.name
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var activeTabName = this.state.activeTabName;

      return _reactForAtom.React.createElement(
        _Block.Block,
        null,
        _reactForAtom.React.createElement(_Tabs.Tabs, {
          tabs: tabs,
          activeTabName: activeTabName,
          triggeringEvent: 'onClick',
          onActiveTabChange: this.handleTabChange
        }),
        _reactForAtom.React.createElement(
          'div',
          { style: { padding: '2em 0 2em 0' } },
          'Showing content for tab "',
          activeTabName,
          '".'
        )
      );
    }
  }]);

  return TabExample;
})(_reactForAtom.React.Component);

var TabExamples = {
  sectionName: 'Tabs',
  description: '',
  examples: [{
    title: '',
    // $FlowIssue
    component: TabExample
  }]
};
exports.TabExamples = TabExamples;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRhYnMuZXhhbXBsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOztxQkFDaEIsU0FBUzs7b0JBQ1YsUUFBUTs7QUFFM0IsSUFBTSxJQUFJLEdBQUcsQ0FDWDtBQUNFLE1BQUksRUFBRSxLQUFLO0FBQ1gsWUFBVSxFQUFFOzs7O0dBQWM7Q0FDM0IsRUFDRDtBQUNFLE1BQUksRUFBRSxLQUFLO0FBQ1gsWUFBVSxFQUFFOzs7O0dBQWM7Q0FDM0IsRUFDRDtBQUNFLE1BQUksRUFBRSxPQUFPO0FBQ2IsWUFBVSxFQUFFOzs7O0dBQWdCO0NBQzdCLEVBQ0Q7QUFDRSxNQUFJLEVBQUUsTUFBTTtBQUNaLFlBQVUsRUFBRTs7OztHQUFlO0NBQzVCLEVBQ0Q7QUFDRSxNQUFJLEVBQUUsTUFBTTtBQUNaLFlBQVUsRUFBRTs7OztHQUFlO0NBQzVCLENBQ0YsQ0FBQzs7SUFFSSxVQUFVO1lBQVYsVUFBVTs7QUFHSCxXQUhQLFVBQVUsQ0FHRixLQUFVLEVBQUU7MEJBSHBCLFVBQVU7O0FBSVosK0JBSkUsVUFBVSw2Q0FJTixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUQsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLG1CQUFhLEVBQUUsS0FBSztLQUNyQixDQUFDO0dBQ0g7O2VBVEcsVUFBVTs7V0FXQyx5QkFBQyxVQUFzRCxFQUFRO0FBQzVFLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixxQkFBYSxFQUFFLFVBQVUsQ0FBQyxJQUFJO09BQy9CLENBQUMsQ0FBQztLQUNKOzs7V0FFSyxrQkFBa0I7VUFDZixhQUFhLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBM0IsYUFBYTs7QUFDcEIsYUFDRTs7O1FBQ0U7QUFDRSxjQUFJLEVBQUUsSUFBSSxBQUFDO0FBQ1gsdUJBQWEsRUFBRSxhQUFhLEFBQUM7QUFDN0IseUJBQWUsRUFBQyxTQUFTO0FBQ3pCLDJCQUFpQixFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUM7VUFDeEM7UUFDRjs7WUFBSyxLQUFLLEVBQUUsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFDLEFBQUM7O1VBQ1QsYUFBYTs7U0FDbkM7T0FDQSxDQUNSO0tBQ0g7OztTQWhDRyxVQUFVO0dBQVMsb0JBQU0sU0FBUzs7QUFtQ2pDLElBQU0sV0FBVyxHQUFHO0FBQ3pCLGFBQVcsRUFBRSxNQUFNO0FBQ25CLGFBQVcsRUFBRSxFQUFFO0FBQ2YsVUFBUSxFQUFFLENBQ1I7QUFDRSxTQUFLLEVBQUUsRUFBRTs7QUFFVCxhQUFTLEVBQUUsVUFBVTtHQUN0QixDQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJUYWJzLmV4YW1wbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0Jsb2NrfSBmcm9tICcuL0Jsb2NrJztcbmltcG9ydCB7VGFic30gZnJvbSAnLi9UYWJzJztcblxuY29uc3QgdGFicyA9IFtcbiAge1xuICAgIG5hbWU6ICdvbmUnLFxuICAgIHRhYkNvbnRlbnQ6IDxkaXY+T25lPC9kaXY+LFxuICB9LFxuICB7XG4gICAgbmFtZTogJ3R3bycsXG4gICAgdGFiQ29udGVudDogPGRpdj5Ud288L2Rpdj4sXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAndGhyZWUnLFxuICAgIHRhYkNvbnRlbnQ6IDxkaXY+VGhyZWU8L2Rpdj4sXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnZm91cicsXG4gICAgdGFiQ29udGVudDogPGRpdj5Gb3VyPC9kaXY+LFxuICB9LFxuICB7XG4gICAgbmFtZTogJ2ZpdmUnLFxuICAgIHRhYkNvbnRlbnQ6IDxkaXY+Rml2ZTwvZGl2PixcbiAgfSxcbl07XG5cbmNsYXNzIFRhYkV4YW1wbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZToge2FjdGl2ZVRhYk5hbWU6IHN0cmluZ307XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IGFueSkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5oYW5kbGVUYWJDaGFuZ2UgPSB0aGlzLmhhbmRsZVRhYkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBhY3RpdmVUYWJOYW1lOiAnb25lJyxcbiAgICB9O1xuICB9XG5cbiAgaGFuZGxlVGFiQ2hhbmdlKG5ld1RhYk5hbWU6IHtuYW1lOiBzdHJpbmc7IHRhYkNvbnRlbnQ6IFJlYWN0LkVsZW1lbnQ7fSk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYWN0aXZlVGFiTmFtZTogbmV3VGFiTmFtZS5uYW1lLFxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IHthY3RpdmVUYWJOYW1lfSA9IHRoaXMuc3RhdGU7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCbG9jaz5cbiAgICAgICAgPFRhYnNcbiAgICAgICAgICB0YWJzPXt0YWJzfVxuICAgICAgICAgIGFjdGl2ZVRhYk5hbWU9e2FjdGl2ZVRhYk5hbWV9XG4gICAgICAgICAgdHJpZ2dlcmluZ0V2ZW50PVwib25DbGlja1wiXG4gICAgICAgICAgb25BY3RpdmVUYWJDaGFuZ2U9e3RoaXMuaGFuZGxlVGFiQ2hhbmdlfVxuICAgICAgICAvPlxuICAgICAgICA8ZGl2IHN0eWxlPXt7cGFkZGluZzogJzJlbSAwIDJlbSAwJ319PlxuICAgICAgICAgIFNob3dpbmcgY29udGVudCBmb3IgdGFiIFwie2FjdGl2ZVRhYk5hbWV9XCIuXG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9CbG9jaz5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBUYWJFeGFtcGxlcyA9IHtcbiAgc2VjdGlvbk5hbWU6ICdUYWJzJyxcbiAgZGVzY3JpcHRpb246ICcnLFxuICBleGFtcGxlczogW1xuICAgIHtcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIC8vICRGbG93SXNzdWVcbiAgICAgIGNvbXBvbmVudDogVGFiRXhhbXBsZSxcbiAgICB9LFxuICBdLFxufTtcbiJdfQ==