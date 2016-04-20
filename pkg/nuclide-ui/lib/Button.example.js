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

var _Button = require('./Button');

var _ButtonGroup = require('./ButtonGroup');

var _ButtonToolbar = require('./ButtonToolbar');

var _Block = require('./Block');

var ButtonSizeExample = function ButtonSizeExample() {
  return _reactForAtom.React.createElement(
    _Block.Block,
    null,
    _reactForAtom.React.createElement(
      _Button.Button,
      { className: 'inline-block', size: 'EXTRA_SMALL' },
      'extra_small'
    ),
    _reactForAtom.React.createElement(
      _Button.Button,
      { className: 'inline-block', size: 'SMALL' },
      'small'
    ),
    _reactForAtom.React.createElement(
      _Button.Button,
      { className: 'inline-block' },
      'regular'
    ),
    _reactForAtom.React.createElement(
      _Button.Button,
      { className: 'inline-block', size: 'LARGE' },
      'large'
    )
  );
};

var ButtonColorExample = function ButtonColorExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(
        _ButtonGroup.ButtonGroup,
        null,
        _reactForAtom.React.createElement(
          _Button.Button,
          { buttonType: 'PRIMARY' },
          'primary'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          { buttonType: 'INFO' },
          'info'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          { buttonType: 'SUCCESS' },
          'success'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          { buttonType: 'WARNING' },
          'warning'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          { buttonType: 'ERROR' },
          'error'
        )
      )
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(
        'p',
        null,
        'selected:'
      ),
      _reactForAtom.React.createElement(
        _ButtonGroup.ButtonGroup,
        null,
        _reactForAtom.React.createElement(
          _Button.Button,
          { selected: true, buttonType: 'PRIMARY' },
          'primary'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          { selected: true, buttonType: 'INFO' },
          'info'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          { selected: true, buttonType: 'SUCCESS' },
          'success'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          { selected: true, buttonType: 'WARNING' },
          'warning'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          { selected: true, buttonType: 'ERROR' },
          'error'
        )
      )
    )
  );
};

var ButtonIconExample = function ButtonIconExample() {
  return _reactForAtom.React.createElement(
    _Block.Block,
    null,
    _reactForAtom.React.createElement(
      _ButtonGroup.ButtonGroup,
      null,
      _reactForAtom.React.createElement(_Button.Button, { icon: 'gear' }),
      _reactForAtom.React.createElement(_Button.Button, { icon: 'cloud-download' }),
      _reactForAtom.React.createElement(_Button.Button, { icon: 'code' }),
      _reactForAtom.React.createElement(_Button.Button, { icon: 'check' }),
      _reactForAtom.React.createElement(_Button.Button, { icon: 'device-mobile' }),
      _reactForAtom.React.createElement(_Button.Button, { icon: 'alert' })
    )
  );
};

var ButtonGroupExample = function ButtonGroupExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(
        _ButtonGroup.ButtonGroup,
        { size: 'EXTRA_SMALL' },
        _reactForAtom.React.createElement(
          _Button.Button,
          { buttonType: 'SUCCESS' },
          'extra small'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          null,
          'button'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          null,
          'group'
        )
      )
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(
        _ButtonGroup.ButtonGroup,
        { size: 'SMALL' },
        _reactForAtom.React.createElement(
          _Button.Button,
          { buttonType: 'SUCCESS' },
          'small'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          null,
          'button'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          null,
          'group'
        )
      )
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(
        _ButtonGroup.ButtonGroup,
        null,
        _reactForAtom.React.createElement(
          _Button.Button,
          { buttonType: 'SUCCESS' },
          'regular'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          null,
          'button'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          null,
          'group'
        )
      )
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(
        _ButtonGroup.ButtonGroup,
        { size: 'LARGE' },
        _reactForAtom.React.createElement(
          _Button.Button,
          { buttonType: 'SUCCESS' },
          'large'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          null,
          'button'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          null,
          'group'
        )
      )
    )
  );
};

var ButtonToolbarExample = function ButtonToolbarExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(
        _ButtonToolbar.ButtonToolbar,
        null,
        _reactForAtom.React.createElement(
          _ButtonGroup.ButtonGroup,
          null,
          _reactForAtom.React.createElement(
            _Button.Button,
            null,
            'ButtonGroup'
          ),
          _reactForAtom.React.createElement(
            _Button.Button,
            null,
            'in a'
          ),
          _reactForAtom.React.createElement(
            _Button.Button,
            null,
            'toolbar'
          )
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          null,
          'single buttons'
        ),
        _reactForAtom.React.createElement(
          _Button.Button,
          null,
          'in toolbar'
        )
      )
    )
  );
};

var ButtonExamples = {
  sectionName: 'Buttons',
  description: 'For clicking things.',
  examples: [{
    title: 'Button sizes',
    component: ButtonSizeExample
  }, {
    title: 'Button colors',
    component: ButtonColorExample
  }, {
    title: 'Buttons with icons',
    component: ButtonIconExample
  }, {
    title: 'Button Group',
    component: ButtonGroupExample
  }, {
    title: 'Button Toolbar',
    component: ButtonToolbarExample
  }]
};
exports.ButtonExamples = ButtonExamples;
//# sourceMappingURL=data:application/json;base64,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V0FBcUI7VUFDckI7Ozs7V0FBd0I7U0FDWjtRQUNkOzs7O1NBQStCO1FBQy9COzs7O1NBQTJCO09BQ2I7S0FDVjtHQUNKO0NBQ1AsQ0FBQzs7QUFFSyxJQUFNLGNBQWMsR0FBRztBQUM1QixhQUFXLEVBQUUsU0FBUztBQUN0QixhQUFXLEVBQUUsc0JBQXNCO0FBQ25DLFVBQVEsRUFBRSxDQUNSO0FBQ0UsU0FBSyxFQUFFLGNBQWM7QUFDckIsYUFBUyxFQUFFLGlCQUFpQjtHQUM3QixFQUNEO0FBQ0UsU0FBSyxFQUFFLGVBQWU7QUFDdEIsYUFBUyxFQUFFLGtCQUFrQjtHQUM5QixFQUNEO0FBQ0UsU0FBSyxFQUFFLG9CQUFvQjtBQUMzQixhQUFTLEVBQUUsaUJBQWlCO0dBQzdCLEVBQ0Q7QUFDRSxTQUFLLEVBQUUsY0FBYztBQUNyQixhQUFTLEVBQUUsa0JBQWtCO0dBQzlCLEVBQ0Q7QUFDRSxTQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLGFBQVMsRUFBRSxvQkFBb0I7R0FDaEMsQ0FDRjtDQUNGLENBQUMiLCJmaWxlIjoiQnV0dG9uLmV4YW1wbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge0J1dHRvbn0gZnJvbSAnLi9CdXR0b24nO1xuaW1wb3J0IHtCdXR0b25Hcm91cH0gZnJvbSAnLi9CdXR0b25Hcm91cCc7XG5pbXBvcnQge0J1dHRvblRvb2xiYXJ9IGZyb20gJy4vQnV0dG9uVG9vbGJhcic7XG5pbXBvcnQge0Jsb2NrfSBmcm9tICcuL0Jsb2NrJztcblxuY29uc3QgQnV0dG9uU2l6ZUV4YW1wbGUgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxCbG9jaz5cbiAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiIHNpemU9XCJFWFRSQV9TTUFMTFwiPmV4dHJhX3NtYWxsPC9CdXR0b24+XG4gICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2tcIiBzaXplPVwiU01BTExcIj5zbWFsbDwvQnV0dG9uPlxuICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+cmVndWxhcjwvQnV0dG9uPlxuICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCIgc2l6ZT1cIkxBUkdFXCI+bGFyZ2U8L0J1dHRvbj5cbiAgPC9CbG9jaz5cbik7XG5cbmNvbnN0IEJ1dHRvbkNvbG9yRXhhbXBsZSA9ICgpOiBSZWFjdC5FbGVtZW50ID0+IChcbiAgPGRpdj5cbiAgICA8QmxvY2s+XG4gICAgICA8QnV0dG9uR3JvdXA+XG4gICAgICAgIDxCdXR0b24gYnV0dG9uVHlwZT1cIlBSSU1BUllcIj5wcmltYXJ5PC9CdXR0b24+XG4gICAgICAgIDxCdXR0b24gYnV0dG9uVHlwZT1cIklORk9cIj5pbmZvPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b24gYnV0dG9uVHlwZT1cIlNVQ0NFU1NcIj5zdWNjZXNzPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b24gYnV0dG9uVHlwZT1cIldBUk5JTkdcIj53YXJuaW5nPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b24gYnV0dG9uVHlwZT1cIkVSUk9SXCI+ZXJyb3I8L0J1dHRvbj5cbiAgICAgIDwvQnV0dG9uR3JvdXA+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8cD5zZWxlY3RlZDo8L3A+XG4gICAgICA8QnV0dG9uR3JvdXA+XG4gICAgICAgIDxCdXR0b24gc2VsZWN0ZWQ9e3RydWV9IGJ1dHRvblR5cGU9XCJQUklNQVJZXCI+cHJpbWFyeTwvQnV0dG9uPlxuICAgICAgICA8QnV0dG9uIHNlbGVjdGVkPXt0cnVlfSBidXR0b25UeXBlPVwiSU5GT1wiPmluZm88L0J1dHRvbj5cbiAgICAgICAgPEJ1dHRvbiBzZWxlY3RlZD17dHJ1ZX0gYnV0dG9uVHlwZT1cIlNVQ0NFU1NcIj5zdWNjZXNzPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b24gc2VsZWN0ZWQ9e3RydWV9IGJ1dHRvblR5cGU9XCJXQVJOSU5HXCI+d2FybmluZzwvQnV0dG9uPlxuICAgICAgICA8QnV0dG9uIHNlbGVjdGVkPXt0cnVlfSBidXR0b25UeXBlPVwiRVJST1JcIj5lcnJvcjwvQnV0dG9uPlxuICAgICAgPC9CdXR0b25Hcm91cD5cbiAgICA8L0Jsb2NrPlxuICA8L2Rpdj5cbik7XG5cbmNvbnN0IEJ1dHRvbkljb25FeGFtcGxlID0gKCk6IFJlYWN0LkVsZW1lbnQgPT4gKFxuICA8QmxvY2s+XG4gICAgPEJ1dHRvbkdyb3VwPlxuICAgICAgPEJ1dHRvbiBpY29uPVwiZ2VhclwiPjwvQnV0dG9uPlxuICAgICAgPEJ1dHRvbiBpY29uPVwiY2xvdWQtZG93bmxvYWRcIj48L0J1dHRvbj5cbiAgICAgIDxCdXR0b24gaWNvbj1cImNvZGVcIj48L0J1dHRvbj5cbiAgICAgIDxCdXR0b24gaWNvbj1cImNoZWNrXCI+PC9CdXR0b24+XG4gICAgICA8QnV0dG9uIGljb249XCJkZXZpY2UtbW9iaWxlXCI+PC9CdXR0b24+XG4gICAgICA8QnV0dG9uIGljb249XCJhbGVydFwiPjwvQnV0dG9uPlxuICAgIDwvQnV0dG9uR3JvdXA+XG4gIDwvQmxvY2s+XG4pO1xuXG5jb25zdCBCdXR0b25Hcm91cEV4YW1wbGUgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxkaXY+XG4gICAgPEJsb2NrPlxuICAgICAgPEJ1dHRvbkdyb3VwIHNpemU9XCJFWFRSQV9TTUFMTFwiPlxuICAgICAgICA8QnV0dG9uIGJ1dHRvblR5cGU9XCJTVUNDRVNTXCI+ZXh0cmEgc21hbGw8L0J1dHRvbj5cbiAgICAgICAgPEJ1dHRvbj5idXR0b248L0J1dHRvbj5cbiAgICAgICAgPEJ1dHRvbj5ncm91cDwvQnV0dG9uPlxuICAgICAgPC9CdXR0b25Hcm91cD5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxCdXR0b25Hcm91cCBzaXplPVwiU01BTExcIj5cbiAgICAgICAgPEJ1dHRvbiBidXR0b25UeXBlPVwiU1VDQ0VTU1wiPnNtYWxsPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b24+YnV0dG9uPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b24+Z3JvdXA8L0J1dHRvbj5cbiAgICAgIDwvQnV0dG9uR3JvdXA+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8QnV0dG9uR3JvdXA+XG4gICAgICAgIDxCdXR0b24gYnV0dG9uVHlwZT1cIlNVQ0NFU1NcIj5yZWd1bGFyPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b24+YnV0dG9uPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b24+Z3JvdXA8L0J1dHRvbj5cbiAgICAgIDwvQnV0dG9uR3JvdXA+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8QnV0dG9uR3JvdXAgc2l6ZT1cIkxBUkdFXCI+XG4gICAgICAgIDxCdXR0b24gYnV0dG9uVHlwZT1cIlNVQ0NFU1NcIj5sYXJnZTwvQnV0dG9uPlxuICAgICAgICA8QnV0dG9uPmJ1dHRvbjwvQnV0dG9uPlxuICAgICAgICA8QnV0dG9uPmdyb3VwPC9CdXR0b24+XG4gICAgICA8L0J1dHRvbkdyb3VwPlxuICAgIDwvQmxvY2s+XG4gIDwvZGl2PlxuKTtcblxuY29uc3QgQnV0dG9uVG9vbGJhckV4YW1wbGUgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxkaXY+XG4gICAgPEJsb2NrPlxuICAgICAgPEJ1dHRvblRvb2xiYXI+XG4gICAgICAgIDxCdXR0b25Hcm91cD5cbiAgICAgICAgICA8QnV0dG9uPkJ1dHRvbkdyb3VwPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbj5pbiBhPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbj50b29sYmFyPC9CdXR0b24+XG4gICAgICAgIDwvQnV0dG9uR3JvdXA+XG4gICAgICAgIDxCdXR0b24+c2luZ2xlIGJ1dHRvbnM8L0J1dHRvbj5cbiAgICAgICAgPEJ1dHRvbj5pbiB0b29sYmFyPC9CdXR0b24+XG4gICAgICA8L0J1dHRvblRvb2xiYXI+XG4gICAgPC9CbG9jaz5cbiAgPC9kaXY+XG4pO1xuXG5leHBvcnQgY29uc3QgQnV0dG9uRXhhbXBsZXMgPSB7XG4gIHNlY3Rpb25OYW1lOiAnQnV0dG9ucycsXG4gIGRlc2NyaXB0aW9uOiAnRm9yIGNsaWNraW5nIHRoaW5ncy4nLFxuICBleGFtcGxlczogW1xuICAgIHtcbiAgICAgIHRpdGxlOiAnQnV0dG9uIHNpemVzJyxcbiAgICAgIGNvbXBvbmVudDogQnV0dG9uU2l6ZUV4YW1wbGUsXG4gICAgfSxcbiAgICB7XG4gICAgICB0aXRsZTogJ0J1dHRvbiBjb2xvcnMnLFxuICAgICAgY29tcG9uZW50OiBCdXR0b25Db2xvckV4YW1wbGUsXG4gICAgfSxcbiAgICB7XG4gICAgICB0aXRsZTogJ0J1dHRvbnMgd2l0aCBpY29ucycsXG4gICAgICBjb21wb25lbnQ6IEJ1dHRvbkljb25FeGFtcGxlLFxuICAgIH0sXG4gICAge1xuICAgICAgdGl0bGU6ICdCdXR0b24gR3JvdXAnLFxuICAgICAgY29tcG9uZW50OiBCdXR0b25Hcm91cEV4YW1wbGUsXG4gICAgfSxcbiAgICB7XG4gICAgICB0aXRsZTogJ0J1dHRvbiBUb29sYmFyJyxcbiAgICAgIGNvbXBvbmVudDogQnV0dG9uVG9vbGJhckV4YW1wbGUsXG4gICAgfSxcbiAgXSxcbn07XG4iXX0=