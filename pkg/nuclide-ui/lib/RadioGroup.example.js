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

var _RadioGroup = require('./RadioGroup');

var labels = ['choose', 'from', 'one of', 'several', 'options'];

var RadioGroupExample = (function (_React$Component) {
  _inherits(RadioGroupExample, _React$Component);

  function RadioGroupExample(props) {
    _classCallCheck(this, RadioGroupExample);

    _get(Object.getPrototypeOf(RadioGroupExample.prototype), 'constructor', this).call(this, props);
    this.onSelectedChange = this.onSelectedChange.bind(this);
    this.state = {
      selectedIndex: 0
    };
  }

  _createClass(RadioGroupExample, [{
    key: 'onSelectedChange',
    value: function onSelectedChange(selectedIndex) {
      this.setState({
        selectedIndex: selectedIndex
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        _Block.Block,
        null,
        _reactForAtom.React.createElement(_RadioGroup.RadioGroup, {
          selectedIndex: this.state.selectedIndex,
          optionLabels: labels,
          onSelectedChange: this.onSelectedChange
        })
      );
    }
  }]);

  return RadioGroupExample;
})(_reactForAtom.React.Component);

var RadioGroupExamples = {
  sectionName: 'RadioGroup',
  description: '',
  examples: [{
    title: '',
    // $FlowIssue
    component: RadioGroupExample
  }]
};
exports.RadioGroupExamples = RadioGroupExamples;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJhZGlvR3JvdXAuZXhhbXBsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOztxQkFDaEIsU0FBUzs7MEJBQ0osY0FBYzs7QUFFdkMsSUFBTSxNQUFNLEdBQUcsQ0FDYixRQUFRLEVBQ1IsTUFBTSxFQUNOLFFBQVEsRUFDUixTQUFTLEVBQ1QsU0FBUyxDQUNWLENBQUM7O0lBRUksaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHVixXQUhQLGlCQUFpQixDQUdULEtBQVUsRUFBRTswQkFIcEIsaUJBQWlCOztBQUluQiwrQkFKRSxpQkFBaUIsNkNBSWIsS0FBSyxFQUFFO0FBQ2IsQUFBQyxRQUFJLENBQU8sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRSxRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsbUJBQWEsRUFBRSxDQUFDO0tBQ2pCLENBQUM7R0FDSDs7ZUFURyxpQkFBaUI7O1dBV0wsMEJBQUMsYUFBcUIsRUFBUTtBQUM1QyxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1oscUJBQWEsRUFBYixhQUFhO09BQ2QsQ0FBQyxDQUFDO0tBQ0o7OztXQUVLLGtCQUFrQjtBQUN0QixhQUNFOzs7UUFDRTtBQUNFLHVCQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEFBQUM7QUFDeEMsc0JBQVksRUFBRSxNQUFNLEFBQUM7QUFDckIsMEJBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixBQUFDO1VBQ3hDO09BQ0ksQ0FDUjtLQUNIOzs7U0EzQkcsaUJBQWlCO0dBQVMsb0JBQU0sU0FBUzs7QUE4QnhDLElBQU0sa0JBQWtCLEdBQUc7QUFDaEMsYUFBVyxFQUFFLFlBQVk7QUFDekIsYUFBVyxFQUFFLEVBQUU7QUFDZixVQUFRLEVBQUUsQ0FDUjtBQUNFLFNBQUssRUFBRSxFQUFFOztBQUVULGFBQVMsRUFBRSxpQkFBaUI7R0FDN0IsQ0FDRjtDQUNGLENBQUMiLCJmaWxlIjoiUmFkaW9Hcm91cC5leGFtcGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtCbG9ja30gZnJvbSAnLi9CbG9jayc7XG5pbXBvcnQge1JhZGlvR3JvdXB9IGZyb20gJy4vUmFkaW9Hcm91cCc7XG5cbmNvbnN0IGxhYmVscyA9IFtcbiAgJ2Nob29zZScsXG4gICdmcm9tJyxcbiAgJ29uZSBvZicsXG4gICdzZXZlcmFsJyxcbiAgJ29wdGlvbnMnLFxuXTtcblxuY2xhc3MgUmFkaW9Hcm91cEV4YW1wbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0ZToge3NlbGVjdGVkSW5kZXg6IG51bWJlcn07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IGFueSkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5vblNlbGVjdGVkQ2hhbmdlID0gdGhpcy5vblNlbGVjdGVkQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHNlbGVjdGVkSW5kZXg6IDAsXG4gICAgfTtcbiAgfVxuXG4gIG9uU2VsZWN0ZWRDaGFuZ2Uoc2VsZWN0ZWRJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZEluZGV4LFxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8QmxvY2s+XG4gICAgICAgIDxSYWRpb0dyb3VwXG4gICAgICAgICAgc2VsZWN0ZWRJbmRleD17dGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4fVxuICAgICAgICAgIG9wdGlvbkxhYmVscz17bGFiZWxzfVxuICAgICAgICAgIG9uU2VsZWN0ZWRDaGFuZ2U9e3RoaXMub25TZWxlY3RlZENoYW5nZX1cbiAgICAgICAgLz5cbiAgICAgIDwvQmxvY2s+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgUmFkaW9Hcm91cEV4YW1wbGVzID0ge1xuICBzZWN0aW9uTmFtZTogJ1JhZGlvR3JvdXAnLFxuICBkZXNjcmlwdGlvbjogJycsXG4gIGV4YW1wbGVzOiBbXG4gICAge1xuICAgICAgdGl0bGU6ICcnLFxuICAgICAgLy8gJEZsb3dJc3N1ZVxuICAgICAgY29tcG9uZW50OiBSYWRpb0dyb3VwRXhhbXBsZSxcbiAgICB9LFxuICBdLFxufTtcbiJdfQ==