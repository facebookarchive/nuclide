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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _Button2;

function _Button() {
  return _Button2 = require('./Button');
}

var _ButtonGroup2;

function _ButtonGroup() {
  return _ButtonGroup2 = require('./ButtonGroup');
}

var _ButtonToolbar2;

function _ButtonToolbar() {
  return _ButtonToolbar2 = require('./ButtonToolbar');
}

var _Block2;

function _Block() {
  return _Block2 = require('./Block');
}

var _Dropdown2;

function _Dropdown() {
  return _Dropdown2 = require('./Dropdown');
}

var _SplitButtonDropdown2;

function _SplitButtonDropdown() {
  return _SplitButtonDropdown2 = require('./SplitButtonDropdown');
}

var ButtonSizeExample = function ButtonSizeExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Block2 || _Block()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Button2 || _Button()).Button,
      { className: 'inline-block', size: 'EXTRA_SMALL' },
      'extra_small'
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Button2 || _Button()).Button,
      { className: 'inline-block', size: 'SMALL' },
      'small'
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Button2 || _Button()).Button,
      { className: 'inline-block' },
      'regular'
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Button2 || _Button()).Button,
      { className: 'inline-block', size: 'LARGE' },
      'large'
    )
  );
};

var ButtonDisabledExample = function ButtonDisabledExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Block2 || _Block()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Button2 || _Button()).Button,
      { className: 'inline-block' },
      'enabled'
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Button2 || _Button()).Button,
      { className: 'inline-block', disabled: true },
      'disabled'
    )
  );
};

var ButtonColorExample = function ButtonColorExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ButtonGroup2 || _ButtonGroup()).ButtonGroup,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { buttonType: 'PRIMARY' },
          'primary'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { buttonType: 'INFO' },
          'info'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { buttonType: 'SUCCESS' },
          'success'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { buttonType: 'WARNING' },
          'warning'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { buttonType: 'ERROR' },
          'error'
        )
      )
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'p',
        null,
        'selected:'
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ButtonGroup2 || _ButtonGroup()).ButtonGroup,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { selected: true, buttonType: 'PRIMARY' },
          'primary'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { selected: true, buttonType: 'INFO' },
          'info'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { selected: true, buttonType: 'SUCCESS' },
          'success'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { selected: true, buttonType: 'WARNING' },
          'warning'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { selected: true, buttonType: 'ERROR' },
          'error'
        )
      )
    )
  );
};

var ButtonIconExample = function ButtonIconExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Block2 || _Block()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_ButtonGroup2 || _ButtonGroup()).ButtonGroup,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Button2 || _Button()).Button, { icon: 'gear' }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Button2 || _Button()).Button, { icon: 'cloud-download' }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Button2 || _Button()).Button, { icon: 'code' }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Button2 || _Button()).Button, { icon: 'check' }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Button2 || _Button()).Button, { icon: 'device-mobile' }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Button2 || _Button()).Button, { icon: 'alert' })
    )
  );
};

var ButtonGroupExample = function ButtonGroupExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ButtonGroup2 || _ButtonGroup()).ButtonGroup,
        { size: 'EXTRA_SMALL' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { buttonType: 'SUCCESS' },
          'extra small'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          null,
          'button'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          null,
          'group'
        )
      )
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ButtonGroup2 || _ButtonGroup()).ButtonGroup,
        { size: 'SMALL' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { buttonType: 'SUCCESS' },
          'small'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          null,
          'button'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          null,
          'group'
        )
      )
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ButtonGroup2 || _ButtonGroup()).ButtonGroup,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { buttonType: 'SUCCESS' },
          'regular'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          null,
          'button'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          null,
          'group'
        )
      )
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ButtonGroup2 || _ButtonGroup()).ButtonGroup,
        { size: 'LARGE' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          { buttonType: 'SUCCESS' },
          'large'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          null,
          'button'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          null,
          'group'
        )
      )
    )
  );
};

var ButtonToolbarExample = function ButtonToolbarExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ButtonToolbar2 || _ButtonToolbar()).ButtonToolbar,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_ButtonGroup2 || _ButtonGroup()).ButtonGroup,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Button2 || _Button()).Button,
            null,
            'ButtonGroup'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Button2 || _Button()).Button,
            null,
            'in a'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Button2 || _Button()).Button,
            null,
            'toolbar'
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
          null,
          'single buttons'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Button2 || _Button()).Button,
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
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Dropdown2 || _Dropdown()).Dropdown, {
        options: options,
        value: 2
      })
    );
  };
})();

var SplitButtonDropdownExample = (function () {
  var options = [{ value: 1, label: 'Build', icon: 'tools' }, { value: 2, label: 'Run', icon: 'triangle-right' }, { value: 3, label: 'Rocket', icon: 'rocket' }, { value: 4, label: 'Squirrel', icon: 'squirrel' }];
  return function () {
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement((_SplitButtonDropdown2 || _SplitButtonDropdown()).SplitButtonDropdown, {
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