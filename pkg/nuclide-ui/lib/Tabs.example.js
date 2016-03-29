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

var _NuclideTabs = require('./NuclideTabs');

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
        _reactForAtom.React.createElement(_NuclideTabs.NuclideTabs, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRhYnMuZXhhbXBsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOztxQkFDaEIsU0FBUzs7MkJBQ0ssZUFBZTs7QUFFakQsSUFBTSxJQUFJLEdBQUcsQ0FDWDtBQUNFLE1BQUksRUFBRSxLQUFLO0FBQ1gsWUFBVSxFQUFFOzs7O0dBQWM7Q0FDM0IsRUFDRDtBQUNFLE1BQUksRUFBRSxLQUFLO0FBQ1gsWUFBVSxFQUFFOzs7O0dBQWM7Q0FDM0IsRUFDRDtBQUNFLE1BQUksRUFBRSxPQUFPO0FBQ2IsWUFBVSxFQUFFOzs7O0dBQWdCO0NBQzdCLEVBQ0Q7QUFDRSxNQUFJLEVBQUUsTUFBTTtBQUNaLFlBQVUsRUFBRTs7OztHQUFlO0NBQzVCLEVBQ0Q7QUFDRSxNQUFJLEVBQUUsTUFBTTtBQUNaLFlBQVUsRUFBRTs7OztHQUFlO0NBQzVCLENBQ0YsQ0FBQzs7SUFFSSxVQUFVO1lBQVYsVUFBVTs7QUFHSCxXQUhQLFVBQVUsQ0FHRixLQUFVLEVBQUU7MEJBSHBCLFVBQVU7O0FBSVosK0JBSkUsVUFBVSw2Q0FJTixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUQsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLG1CQUFhLEVBQUUsS0FBSztLQUNyQixDQUFDO0dBQ0g7O2VBVEcsVUFBVTs7V0FXQyx5QkFBQyxVQUFxRCxFQUFRO0FBQzNFLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixxQkFBYSxFQUFFLFVBQVUsQ0FBQyxJQUFJO09BQy9CLENBQUMsQ0FBQztLQUNKOzs7V0FFSyxrQkFBaUI7VUFDZCxhQUFhLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBM0IsYUFBYTs7QUFDcEIsYUFDRTs7O1FBQ0U7QUFDRSxjQUFJLEVBQUUsSUFBSSxBQUFDO0FBQ1gsdUJBQWEsRUFBRSxhQUFhLEFBQUM7QUFDN0IseUJBQWUsRUFBQyxTQUFTO0FBQ3pCLDJCQUFpQixFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUM7VUFDeEM7UUFDRjs7WUFBSyxLQUFLLEVBQUUsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFDLEFBQUM7O1VBQ1QsYUFBYTs7U0FDbkM7T0FDQSxDQUNSO0tBQ0g7OztTQWhDRyxVQUFVO0dBQVMsb0JBQU0sU0FBUzs7QUFtQ2pDLElBQU0sV0FBVyxHQUFHO0FBQ3pCLGFBQVcsRUFBRSxNQUFNO0FBQ25CLGFBQVcsRUFBRSxFQUFFO0FBQ2YsVUFBUSxFQUFFLENBQ1I7QUFDRSxTQUFLLEVBQUUsRUFBRTs7QUFFVCxhQUFTLEVBQUUsVUFBVTtHQUN0QixDQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJUYWJzLmV4YW1wbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0Jsb2NrfSBmcm9tICcuL0Jsb2NrJztcbmltcG9ydCB7TnVjbGlkZVRhYnMgYXMgVGFic30gZnJvbSAnLi9OdWNsaWRlVGFicyc7XG5cbmNvbnN0IHRhYnMgPSBbXG4gIHtcbiAgICBuYW1lOiAnb25lJyxcbiAgICB0YWJDb250ZW50OiA8ZGl2Pk9uZTwvZGl2PixcbiAgfSxcbiAge1xuICAgIG5hbWU6ICd0d28nLFxuICAgIHRhYkNvbnRlbnQ6IDxkaXY+VHdvPC9kaXY+LFxuICB9LFxuICB7XG4gICAgbmFtZTogJ3RocmVlJyxcbiAgICB0YWJDb250ZW50OiA8ZGl2PlRocmVlPC9kaXY+LFxuICB9LFxuICB7XG4gICAgbmFtZTogJ2ZvdXInLFxuICAgIHRhYkNvbnRlbnQ6IDxkaXY+Rm91cjwvZGl2PixcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdmaXZlJyxcbiAgICB0YWJDb250ZW50OiA8ZGl2PkZpdmU8L2Rpdj4sXG4gIH0sXG5dO1xuXG5jbGFzcyBUYWJFeGFtcGxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGU6IHthY3RpdmVUYWJOYW1lOiBzdHJpbmd9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBhbnkpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuaGFuZGxlVGFiQ2hhbmdlID0gdGhpcy5oYW5kbGVUYWJDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgYWN0aXZlVGFiTmFtZTogJ29uZScsXG4gICAgfTtcbiAgfVxuXG4gIGhhbmRsZVRhYkNoYW5nZShuZXdUYWJOYW1lOiB7bmFtZTogc3RyaW5nOyB0YWJDb250ZW50OiBSZWFjdEVsZW1lbnQ7fSk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYWN0aXZlVGFiTmFtZTogbmV3VGFiTmFtZS5uYW1lLFxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge2FjdGl2ZVRhYk5hbWV9ID0gdGhpcy5zdGF0ZTtcbiAgICByZXR1cm4gKFxuICAgICAgPEJsb2NrPlxuICAgICAgICA8VGFic1xuICAgICAgICAgIHRhYnM9e3RhYnN9XG4gICAgICAgICAgYWN0aXZlVGFiTmFtZT17YWN0aXZlVGFiTmFtZX1cbiAgICAgICAgICB0cmlnZ2VyaW5nRXZlbnQ9XCJvbkNsaWNrXCJcbiAgICAgICAgICBvbkFjdGl2ZVRhYkNoYW5nZT17dGhpcy5oYW5kbGVUYWJDaGFuZ2V9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgc3R5bGU9e3twYWRkaW5nOiAnMmVtIDAgMmVtIDAnfX0+XG4gICAgICAgICAgU2hvd2luZyBjb250ZW50IGZvciB0YWIgXCJ7YWN0aXZlVGFiTmFtZX1cIi5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L0Jsb2NrPlxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IFRhYkV4YW1wbGVzID0ge1xuICBzZWN0aW9uTmFtZTogJ1RhYnMnLFxuICBkZXNjcmlwdGlvbjogJycsXG4gIGV4YW1wbGVzOiBbXG4gICAge1xuICAgICAgdGl0bGU6ICcnLFxuICAgICAgLy8gJEZsb3dJc3N1ZVxuICAgICAgY29tcG9uZW50OiBUYWJFeGFtcGxlLFxuICAgIH0sXG4gIF0sXG59O1xuIl19