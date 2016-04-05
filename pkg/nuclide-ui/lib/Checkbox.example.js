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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoZWNrYm94LmV4YW1wbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O3FCQUNoQixTQUFTOzt3QkFDTixZQUFZOztBQUVuQyxJQUFNLElBQUksR0FBRyxTQUFQLElBQUksR0FBUyxFQUFFLENBQUM7O0FBRXRCLElBQU0sZUFBZSxHQUFHLFNBQWxCLGVBQWU7U0FDbkI7OztJQUNFOzs7TUFDRTtBQUNFLGVBQU8sRUFBRSxLQUFLLEFBQUM7QUFDZixlQUFPLEVBQUUsSUFBSSxBQUFDO0FBQ2QsZ0JBQVEsRUFBRSxJQUFJLEFBQUM7QUFDZixhQUFLLEVBQUMsYUFBYTtRQUNuQjtLQUNJO0lBQ1I7OztNQUNFO0FBQ0UsZUFBTyxFQUFFLElBQUksQUFBQztBQUNkLGdCQUFRLEVBQUUsSUFBSSxBQUFDO0FBQ2YsZUFBTyxFQUFFLElBQUksQUFBQztBQUNkLGFBQUssRUFBQyxxQkFBcUI7UUFDM0I7S0FDSTtJQUNSOzs7TUFDRTtBQUNFLGVBQU8sRUFBRSxJQUFJLEFBQUM7QUFDZCxnQkFBUSxFQUFFLElBQUksQUFBQztBQUNmLGdCQUFRLEVBQUUsSUFBSSxBQUFDO0FBQ2YsZUFBTyxFQUFFLEtBQUssQUFBQztBQUNmLGFBQUssRUFBQyxzQkFBc0I7UUFDNUI7S0FDSTtJQUNSOzs7TUFDRTtBQUNFLGVBQU8sRUFBRSxJQUFJLEFBQUM7QUFDZCxnQkFBUSxFQUFFLElBQUksQUFBQztBQUNmLGVBQU8sRUFBRSxJQUFJLEFBQUM7QUFDZCxnQkFBUSxFQUFFLElBQUksQUFBQztBQUNmLGFBQUssRUFBQywrQkFBK0I7UUFDckM7S0FDSTtJQUNSOzs7TUFDRTtBQUNFLGVBQU8sRUFBRSxJQUFJLEFBQUM7QUFDZCxnQkFBUSxFQUFFLElBQUksQUFBQztBQUNmLHFCQUFhLEVBQUUsSUFBSSxBQUFDO0FBQ3BCLGVBQU8sRUFBRSxLQUFLLEFBQUM7QUFDZixhQUFLLEVBQUMsNEJBQTRCO1FBQ2xDO0tBQ0k7R0FDSjtDQUNQLENBQUM7O0FBRUssSUFBTSxnQkFBZ0IsR0FBRztBQUM5QixhQUFXLEVBQUUsVUFBVTtBQUN2QixhQUFXLEVBQUUsRUFBRTtBQUNmLFVBQVEsRUFBRSxDQUNSO0FBQ0UsU0FBSyxFQUFFLEVBQUU7QUFDVCxhQUFTLEVBQUUsZUFBZTtHQUMzQixDQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJDaGVja2JveC5leGFtcGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtCbG9ja30gZnJvbSAnLi9CbG9jayc7XG5pbXBvcnQge0NoZWNrYm94fSBmcm9tICcuL0NoZWNrYm94JztcblxuY29uc3QgTk9PUCA9ICgpID0+IHt9O1xuXG5jb25zdCBDaGVja2JveEV4YW1wbGUgPSAoKTogUmVhY3RFbGVtZW50ID0+IChcbiAgPGRpdj5cbiAgICA8QmxvY2s+XG4gICAgICA8Q2hlY2tib3hcbiAgICAgICAgY2hlY2tlZD17ZmFsc2V9XG4gICAgICAgIG9uQ2xpY2s9e05PT1B9XG4gICAgICAgIG9uQ2hhbmdlPXtOT09QfVxuICAgICAgICBsYWJlbD1cIkEgQ2hlY2tib3guXCJcbiAgICAgIC8+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8Q2hlY2tib3hcbiAgICAgICAgb25DbGljaz17Tk9PUH1cbiAgICAgICAgb25DaGFuZ2U9e05PT1B9XG4gICAgICAgIGNoZWNrZWQ9e3RydWV9XG4gICAgICAgIGxhYmVsPVwiQSBjaGVja2VkIENoZWNrYm94LlwiXG4gICAgICAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPENoZWNrYm94XG4gICAgICAgIG9uQ2xpY2s9e05PT1B9XG4gICAgICAgIG9uQ2hhbmdlPXtOT09QfVxuICAgICAgICBkaXNhYmxlZD17dHJ1ZX1cbiAgICAgICAgY2hlY2tlZD17ZmFsc2V9XG4gICAgICAgIGxhYmVsPVwiQSBkaXNhYmxlZCBDaGVja2JveC5cIlxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxDaGVja2JveFxuICAgICAgICBvbkNsaWNrPXtOT09QfVxuICAgICAgICBvbkNoYW5nZT17Tk9PUH1cbiAgICAgICAgY2hlY2tlZD17dHJ1ZX1cbiAgICAgICAgZGlzYWJsZWQ9e3RydWV9XG4gICAgICAgIGxhYmVsPVwiQSBkaXNhYmxlZCwgY2hlY2tlZCBDaGVja2JveC5cIlxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxDaGVja2JveFxuICAgICAgICBvbkNsaWNrPXtOT09QfVxuICAgICAgICBvbkNoYW5nZT17Tk9PUH1cbiAgICAgICAgaW5kZXRlcm1pbmF0ZT17dHJ1ZX1cbiAgICAgICAgY2hlY2tlZD17ZmFsc2V9XG4gICAgICAgIGxhYmVsPVwiQW4gaW5kZXRlcm1pbmF0ZSBDaGVja2JveC5cIlxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICA8L2Rpdj5cbik7XG5cbmV4cG9ydCBjb25zdCBDaGVja2JveEV4YW1wbGVzID0ge1xuICBzZWN0aW9uTmFtZTogJ0NoZWNrYm94JyxcbiAgZGVzY3JpcHRpb246ICcnLFxuICBleGFtcGxlczogW1xuICAgIHtcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIGNvbXBvbmVudDogQ2hlY2tib3hFeGFtcGxlLFxuICAgIH0sXG4gIF0sXG59O1xuIl19