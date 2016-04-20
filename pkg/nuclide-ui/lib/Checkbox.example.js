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

var _reactForAtom = require('react-for-atom');

var _Block = require('./Block');

var _Checkbox = require('./Checkbox');

var NOOP = function NOOP() {};

var CheckboxExample = function CheckboxExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_Checkbox.Checkbox, {
        checked: false,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_Checkbox.Checkbox, {
        onClick: NOOP,
        onChange: NOOP,
        checked: true,
        label: 'A checked Checkbox.'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_Checkbox.Checkbox, {
        onClick: NOOP,
        onChange: NOOP,
        disabled: true,
        checked: false,
        label: 'A disabled Checkbox.'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_Checkbox.Checkbox, {
        onClick: NOOP,
        onChange: NOOP,
        checked: true,
        disabled: true,
        label: 'A disabled, checked Checkbox.'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_Checkbox.Checkbox, {
        onClick: NOOP,
        onChange: NOOP,
        indeterminate: true,
        checked: false,
        label: 'An indeterminate Checkbox.'
      })
    )
  );
};

var CheckboxExamples = {
  sectionName: 'Checkbox',
  description: '',
  examples: [{
    title: '',
    component: CheckboxExample
  }]
};
exports.CheckboxExamples = CheckboxExamples;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoZWNrYm94LmV4YW1wbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O3FCQUNoQixTQUFTOzt3QkFDTixZQUFZOztBQUVuQyxJQUFNLElBQUksR0FBRyxTQUFQLElBQUksR0FBUyxFQUFFLENBQUM7O0FBRXRCLElBQU0sZUFBZSxHQUFHLFNBQWxCLGVBQWU7U0FDbkI7OztJQUNFOzs7TUFDRTtBQUNFLGVBQU8sRUFBRSxLQUFLLEFBQUM7QUFDZixlQUFPLEVBQUUsSUFBSSxBQUFDO0FBQ2QsZ0JBQVEsRUFBRSxJQUFJLEFBQUM7QUFDZixhQUFLLEVBQUMsYUFBYTtRQUNuQjtLQUNJO0lBQ1I7OztNQUNFO0FBQ0UsZUFBTyxFQUFFLElBQUksQUFBQztBQUNkLGdCQUFRLEVBQUUsSUFBSSxBQUFDO0FBQ2YsZUFBTyxFQUFFLElBQUksQUFBQztBQUNkLGFBQUssRUFBQyxxQkFBcUI7UUFDM0I7S0FDSTtJQUNSOzs7TUFDRTtBQUNFLGVBQU8sRUFBRSxJQUFJLEFBQUM7QUFDZCxnQkFBUSxFQUFFLElBQUksQUFBQztBQUNmLGdCQUFRLEVBQUUsSUFBSSxBQUFDO0FBQ2YsZUFBTyxFQUFFLEtBQUssQUFBQztBQUNmLGFBQUssRUFBQyxzQkFBc0I7UUFDNUI7S0FDSTtJQUNSOzs7TUFDRTtBQUNFLGVBQU8sRUFBRSxJQUFJLEFBQUM7QUFDZCxnQkFBUSxFQUFFLElBQUksQUFBQztBQUNmLGVBQU8sRUFBRSxJQUFJLEFBQUM7QUFDZCxnQkFBUSxFQUFFLElBQUksQUFBQztBQUNmLGFBQUssRUFBQywrQkFBK0I7UUFDckM7S0FDSTtJQUNSOzs7TUFDRTtBQUNFLGVBQU8sRUFBRSxJQUFJLEFBQUM7QUFDZCxnQkFBUSxFQUFFLElBQUksQUFBQztBQUNmLHFCQUFhLEVBQUUsSUFBSSxBQUFDO0FBQ3BCLGVBQU8sRUFBRSxLQUFLLEFBQUM7QUFDZixhQUFLLEVBQUMsNEJBQTRCO1FBQ2xDO0tBQ0k7R0FDSjtDQUNQLENBQUM7O0FBRUssSUFBTSxnQkFBZ0IsR0FBRztBQUM5QixhQUFXLEVBQUUsVUFBVTtBQUN2QixhQUFXLEVBQUUsRUFBRTtBQUNmLFVBQVEsRUFBRSxDQUNSO0FBQ0UsU0FBSyxFQUFFLEVBQUU7QUFDVCxhQUFTLEVBQUUsZUFBZTtHQUMzQixDQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJDaGVja2JveC5leGFtcGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtCbG9ja30gZnJvbSAnLi9CbG9jayc7XG5pbXBvcnQge0NoZWNrYm94fSBmcm9tICcuL0NoZWNrYm94JztcblxuY29uc3QgTk9PUCA9ICgpID0+IHt9O1xuXG5jb25zdCBDaGVja2JveEV4YW1wbGUgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxkaXY+XG4gICAgPEJsb2NrPlxuICAgICAgPENoZWNrYm94XG4gICAgICAgIGNoZWNrZWQ9e2ZhbHNlfVxuICAgICAgICBvbkNsaWNrPXtOT09QfVxuICAgICAgICBvbkNoYW5nZT17Tk9PUH1cbiAgICAgICAgbGFiZWw9XCJBIENoZWNrYm94LlwiXG4gICAgICAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPENoZWNrYm94XG4gICAgICAgIG9uQ2xpY2s9e05PT1B9XG4gICAgICAgIG9uQ2hhbmdlPXtOT09QfVxuICAgICAgICBjaGVja2VkPXt0cnVlfVxuICAgICAgICBsYWJlbD1cIkEgY2hlY2tlZCBDaGVja2JveC5cIlxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxDaGVja2JveFxuICAgICAgICBvbkNsaWNrPXtOT09QfVxuICAgICAgICBvbkNoYW5nZT17Tk9PUH1cbiAgICAgICAgZGlzYWJsZWQ9e3RydWV9XG4gICAgICAgIGNoZWNrZWQ9e2ZhbHNlfVxuICAgICAgICBsYWJlbD1cIkEgZGlzYWJsZWQgQ2hlY2tib3guXCJcbiAgICAgIC8+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8Q2hlY2tib3hcbiAgICAgICAgb25DbGljaz17Tk9PUH1cbiAgICAgICAgb25DaGFuZ2U9e05PT1B9XG4gICAgICAgIGNoZWNrZWQ9e3RydWV9XG4gICAgICAgIGRpc2FibGVkPXt0cnVlfVxuICAgICAgICBsYWJlbD1cIkEgZGlzYWJsZWQsIGNoZWNrZWQgQ2hlY2tib3guXCJcbiAgICAgIC8+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8Q2hlY2tib3hcbiAgICAgICAgb25DbGljaz17Tk9PUH1cbiAgICAgICAgb25DaGFuZ2U9e05PT1B9XG4gICAgICAgIGluZGV0ZXJtaW5hdGU9e3RydWV9XG4gICAgICAgIGNoZWNrZWQ9e2ZhbHNlfVxuICAgICAgICBsYWJlbD1cIkFuIGluZGV0ZXJtaW5hdGUgQ2hlY2tib3guXCJcbiAgICAgIC8+XG4gICAgPC9CbG9jaz5cbiAgPC9kaXY+XG4pO1xuXG5leHBvcnQgY29uc3QgQ2hlY2tib3hFeGFtcGxlcyA9IHtcbiAgc2VjdGlvbk5hbWU6ICdDaGVja2JveCcsXG4gIGRlc2NyaXB0aW9uOiAnJyxcbiAgZXhhbXBsZXM6IFtcbiAgICB7XG4gICAgICB0aXRsZTogJycsXG4gICAgICBjb21wb25lbnQ6IENoZWNrYm94RXhhbXBsZSxcbiAgICB9LFxuICBdLFxufTtcbiJdfQ==