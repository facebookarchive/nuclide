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

var _NuclideCheckbox = require('./NuclideCheckbox');

var NOOP = function NOOP() {};

var CheckboxExample = function CheckboxExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_NuclideCheckbox.NuclideCheckbox, {
        checked: false,
        onClick: NOOP,
        onChange: NOOP,
        label: 'A Checkbox.'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_NuclideCheckbox.NuclideCheckbox, {
        onClick: NOOP,
        onChange: NOOP,
        checked: true,
        label: 'A checked Checkbox.'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_NuclideCheckbox.NuclideCheckbox, {
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
      _reactForAtom.React.createElement(_NuclideCheckbox.NuclideCheckbox, {
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
      _reactForAtom.React.createElement(_NuclideCheckbox.NuclideCheckbox, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoZWNrYm94LmV4YW1wbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O3FCQUNoQixTQUFTOzsrQkFDQyxtQkFBbUI7O0FBRWpELElBQU0sSUFBSSxHQUFHLFNBQVAsSUFBSSxHQUFTLEVBQUUsQ0FBQzs7QUFFdEIsSUFBTSxlQUFlLEdBQUcsU0FBbEIsZUFBZTtTQUNuQjs7O0lBQ0U7OztNQUNFO0FBQ0UsZUFBTyxFQUFFLEtBQUssQUFBQztBQUNmLGVBQU8sRUFBRSxJQUFJLEFBQUM7QUFDZCxnQkFBUSxFQUFFLElBQUksQUFBQztBQUNmLGFBQUssRUFBQyxhQUFhO1FBQ25CO0tBQ0k7SUFDUjs7O01BQ0U7QUFDRSxlQUFPLEVBQUUsSUFBSSxBQUFDO0FBQ2QsZ0JBQVEsRUFBRSxJQUFJLEFBQUM7QUFDZixlQUFPLEVBQUUsSUFBSSxBQUFDO0FBQ2QsYUFBSyxFQUFDLHFCQUFxQjtRQUMzQjtLQUNJO0lBQ1I7OztNQUNFO0FBQ0UsZUFBTyxFQUFFLElBQUksQUFBQztBQUNkLGdCQUFRLEVBQUUsSUFBSSxBQUFDO0FBQ2YsZ0JBQVEsRUFBRSxJQUFJLEFBQUM7QUFDZixlQUFPLEVBQUUsS0FBSyxBQUFDO0FBQ2YsYUFBSyxFQUFDLHNCQUFzQjtRQUM1QjtLQUNJO0lBQ1I7OztNQUNFO0FBQ0UsZUFBTyxFQUFFLElBQUksQUFBQztBQUNkLGdCQUFRLEVBQUUsSUFBSSxBQUFDO0FBQ2YsZUFBTyxFQUFFLElBQUksQUFBQztBQUNkLGdCQUFRLEVBQUUsSUFBSSxBQUFDO0FBQ2YsYUFBSyxFQUFDLCtCQUErQjtRQUNyQztLQUNJO0lBQ1I7OztNQUNFO0FBQ0UsZUFBTyxFQUFFLElBQUksQUFBQztBQUNkLGdCQUFRLEVBQUUsSUFBSSxBQUFDO0FBQ2YscUJBQWEsRUFBRSxJQUFJLEFBQUM7QUFDcEIsZUFBTyxFQUFFLEtBQUssQUFBQztBQUNmLGFBQUssRUFBQyw0QkFBNEI7UUFDbEM7S0FDSTtHQUNKO0NBQ1AsQ0FBQzs7QUFFSyxJQUFNLGdCQUFnQixHQUFHO0FBQzlCLGFBQVcsRUFBRSxVQUFVO0FBQ3ZCLGFBQVcsRUFBRSxFQUFFO0FBQ2YsVUFBUSxFQUFFLENBQ1I7QUFDRSxTQUFLLEVBQUUsRUFBRTtBQUNULGFBQVMsRUFBRSxlQUFlO0dBQzNCLENBQ0Y7Q0FDRixDQUFDIiwiZmlsZSI6IkNoZWNrYm94LmV4YW1wbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0Jsb2NrfSBmcm9tICcuL0Jsb2NrJztcbmltcG9ydCB7TnVjbGlkZUNoZWNrYm94fSBmcm9tICcuL051Y2xpZGVDaGVja2JveCc7XG5cbmNvbnN0IE5PT1AgPSAoKSA9PiB7fTtcblxuY29uc3QgQ2hlY2tib3hFeGFtcGxlID0gKCk6IFJlYWN0RWxlbWVudCA9PiAoXG4gIDxkaXY+XG4gICAgPEJsb2NrPlxuICAgICAgPE51Y2xpZGVDaGVja2JveFxuICAgICAgICBjaGVja2VkPXtmYWxzZX1cbiAgICAgICAgb25DbGljaz17Tk9PUH1cbiAgICAgICAgb25DaGFuZ2U9e05PT1B9XG4gICAgICAgIGxhYmVsPVwiQSBDaGVja2JveC5cIlxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxOdWNsaWRlQ2hlY2tib3hcbiAgICAgICAgb25DbGljaz17Tk9PUH1cbiAgICAgICAgb25DaGFuZ2U9e05PT1B9XG4gICAgICAgIGNoZWNrZWQ9e3RydWV9XG4gICAgICAgIGxhYmVsPVwiQSBjaGVja2VkIENoZWNrYm94LlwiXG4gICAgICAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPE51Y2xpZGVDaGVja2JveFxuICAgICAgICBvbkNsaWNrPXtOT09QfVxuICAgICAgICBvbkNoYW5nZT17Tk9PUH1cbiAgICAgICAgZGlzYWJsZWQ9e3RydWV9XG4gICAgICAgIGNoZWNrZWQ9e2ZhbHNlfVxuICAgICAgICBsYWJlbD1cIkEgZGlzYWJsZWQgQ2hlY2tib3guXCJcbiAgICAgIC8+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8TnVjbGlkZUNoZWNrYm94XG4gICAgICAgIG9uQ2xpY2s9e05PT1B9XG4gICAgICAgIG9uQ2hhbmdlPXtOT09QfVxuICAgICAgICBjaGVja2VkPXt0cnVlfVxuICAgICAgICBkaXNhYmxlZD17dHJ1ZX1cbiAgICAgICAgbGFiZWw9XCJBIGRpc2FibGVkLCBjaGVja2VkIENoZWNrYm94LlwiXG4gICAgICAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPE51Y2xpZGVDaGVja2JveFxuICAgICAgICBvbkNsaWNrPXtOT09QfVxuICAgICAgICBvbkNoYW5nZT17Tk9PUH1cbiAgICAgICAgaW5kZXRlcm1pbmF0ZT17dHJ1ZX1cbiAgICAgICAgY2hlY2tlZD17ZmFsc2V9XG4gICAgICAgIGxhYmVsPVwiQW4gaW5kZXRlcm1pbmF0ZSBDaGVja2JveC5cIlxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICA8L2Rpdj5cbik7XG5cbmV4cG9ydCBjb25zdCBDaGVja2JveEV4YW1wbGVzID0ge1xuICBzZWN0aW9uTmFtZTogJ0NoZWNrYm94JyxcbiAgZGVzY3JpcHRpb246ICcnLFxuICBleGFtcGxlczogW1xuICAgIHtcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIGNvbXBvbmVudDogQ2hlY2tib3hFeGFtcGxlLFxuICAgIH0sXG4gIF0sXG59O1xuIl19