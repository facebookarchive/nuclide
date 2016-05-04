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

var _Dropdown = require('./Dropdown');

var _SplitButtonDropdown = require('./SplitButtonDropdown');

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

var ButtonDisabledExample = function ButtonDisabledExample() {
  return _reactForAtom.React.createElement(
    _Block.Block,
    null,
    _reactForAtom.React.createElement(
      _Button.Button,
      { className: 'inline-block' },
      'enabled'
    ),
    _reactForAtom.React.createElement(
      _Button.Button,
      { className: 'inline-block', disabled: true },
      'disabled'
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

var DropdownExample = (function () {
  var options = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }, { value: 3, label: 'Three' }, { value: 4, label: 'Four' }];
  return function () {
    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(_Dropdown.Dropdown, {
        menuItems: options,
        value: 2
      })
    );
  };
})();

var SplitButtonDropdownExample = (function () {
  var options = [{ value: 1, label: 'Build', icon: 'tools' }, { value: 2, label: 'Run', icon: 'triangle-right' }, { value: 3, label: 'Rocket', icon: 'rocket' }, { value: 4, label: 'Squirrel', icon: 'squirrel' }];
  return function () {
    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(_SplitButtonDropdown.SplitButtonDropdown, {
        options: options,
        value: 2
      })
    );
  };
})();

var ButtonExamples = {
  sectionName: 'Buttons',
  description: 'For clicking things.',
  examples: [{
    title: 'Button sizes',
    component: ButtonSizeExample
  }, {
    title: 'Disabled/enabled',
    component: ButtonDisabledExample
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
  }, {
    title: 'Dropdown',
    component: DropdownExample
  }, {
    title: 'Split Button Dropdown',
    component: SplitButtonDropdownExample
  }]
};
exports.ButtonExamples = ButtonExamples;