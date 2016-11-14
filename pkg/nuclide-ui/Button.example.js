'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ButtonExamples = undefined;

var _reactForAtom = require('react-for-atom');

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('./ButtonGroup');
}

var _ButtonToolbar;

function _load_ButtonToolbar() {
  return _ButtonToolbar = require('./ButtonToolbar');
}

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('./Dropdown');
}

var _ModalMultiSelect;

function _load_ModalMultiSelect() {
  return _ModalMultiSelect = require('./ModalMultiSelect');
}

var _SplitButtonDropdown;

function _load_SplitButtonDropdown() {
  return _SplitButtonDropdown = require('./SplitButtonDropdown');
}

const ButtonSizeExample = () => _reactForAtom.React.createElement(
  (_Block || _load_Block()).Block,
  null,
  _reactForAtom.React.createElement(
    (_Button || _load_Button()).Button,
    { className: 'inline-block', size: 'EXTRA_SMALL' },
    'extra_small'
  ),
  _reactForAtom.React.createElement(
    (_Button || _load_Button()).Button,
    { className: 'inline-block', size: 'SMALL' },
    'small'
  ),
  _reactForAtom.React.createElement(
    (_Button || _load_Button()).Button,
    { className: 'inline-block' },
    'regular'
  ),
  _reactForAtom.React.createElement(
    (_Button || _load_Button()).Button,
    { className: 'inline-block', size: 'LARGE' },
    'large'
  )
);

const ButtonDisabledExample = () => _reactForAtom.React.createElement(
  (_Block || _load_Block()).Block,
  null,
  _reactForAtom.React.createElement(
    (_Button || _load_Button()).Button,
    { className: 'inline-block' },
    'enabled'
  ),
  _reactForAtom.React.createElement(
    (_Button || _load_Button()).Button,
    { className: 'inline-block', disabled: true },
    'disabled'
  )
);

const ButtonColorExample = () => _reactForAtom.React.createElement(
  'div',
  null,
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      null,
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { buttonType: 'PRIMARY' },
        'primary'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { buttonType: 'INFO' },
        'info'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { buttonType: 'SUCCESS' },
        'success'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { buttonType: 'WARNING' },
        'warning'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { buttonType: 'ERROR' },
        'error'
      )
    )
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement(
      'p',
      null,
      'selected:'
    ),
    _reactForAtom.React.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      null,
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { selected: true, buttonType: 'PRIMARY' },
        'primary'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { selected: true, buttonType: 'INFO' },
        'info'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { selected: true, buttonType: 'SUCCESS' },
        'success'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { selected: true, buttonType: 'WARNING' },
        'warning'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { selected: true, buttonType: 'ERROR' },
        'error'
      )
    )
  )
);

const ButtonIconExample = () => _reactForAtom.React.createElement(
  (_Block || _load_Block()).Block,
  null,
  _reactForAtom.React.createElement(
    (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
    null,
    _reactForAtom.React.createElement((_Button || _load_Button()).Button, { icon: 'gear' }),
    _reactForAtom.React.createElement((_Button || _load_Button()).Button, { icon: 'cloud-download' }),
    _reactForAtom.React.createElement((_Button || _load_Button()).Button, { icon: 'code' }),
    _reactForAtom.React.createElement((_Button || _load_Button()).Button, { icon: 'check' }),
    _reactForAtom.React.createElement((_Button || _load_Button()).Button, { icon: 'device-mobile' }),
    _reactForAtom.React.createElement((_Button || _load_Button()).Button, { icon: 'alert' })
  )
);

const ButtonGroupExample = () => _reactForAtom.React.createElement(
  'div',
  null,
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      { size: 'EXTRA_SMALL' },
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { buttonType: 'SUCCESS' },
        'extra small'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        null,
        'button'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        null,
        'group'
      )
    )
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      { size: 'SMALL' },
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { buttonType: 'SUCCESS' },
        'small'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        null,
        'button'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        null,
        'group'
      )
    )
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      null,
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { buttonType: 'SUCCESS' },
        'regular'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        null,
        'button'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        null,
        'group'
      )
    )
  ),
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      { size: 'LARGE' },
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        { buttonType: 'SUCCESS' },
        'large'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        null,
        'button'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        null,
        'group'
      )
    )
  )
);

const ButtonToolbarExample = () => _reactForAtom.React.createElement(
  'div',
  null,
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement(
      (_ButtonToolbar || _load_ButtonToolbar()).ButtonToolbar,
      null,
      _reactForAtom.React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'ButtonGroup'
        ),
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'in a'
        ),
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'toolbar'
        )
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        null,
        'single buttons'
      ),
      _reactForAtom.React.createElement(
        (_Button || _load_Button()).Button,
        null,
        'in toolbar'
      )
    )
  )
);

const DropdownExample = (() => {
  const options = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }, { value: 3, label: 'Three' }, { value: 4, label: 'Four' }];
  return () => _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
      options: options,
      value: 2
    })
  );
})();

const SplitButtonDropdownExample = (() => {
  const options = [{ value: 1, label: 'Build', icon: 'tools' }, { value: 2, label: 'Run', icon: 'triangle-right', selectedLabel: 'Run It!' }, { value: 3, label: 'Rocket', icon: 'rocket' }, { type: 'separator' }, { value: 4, label: 'Squirrel', icon: 'squirrel' }, { value: 5, label: 'Beaker', icon: 'telescope', disabled: true }];
  return () => _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement((_SplitButtonDropdown || _load_SplitButtonDropdown()).SplitButtonDropdown, {
      options: options,
      value: 2,
      onConfirm:
      // eslint-disable-next-line no-alert
      x => window.alert(`You selected ${ x }!`)
    })
  );
})();

let ModalMultiSelectExample = class ModalMultiSelectExample extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = { value: [2] };
  }

  render() {
    const options = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }, { value: 3, label: 'Three' }, { value: 4, label: 'Four' }];
    return _reactForAtom.React.createElement((_ModalMultiSelect || _load_ModalMultiSelect()).ModalMultiSelect, {
      options: options,
      onChange: value => {
        this.setState({ value: value });
      },
      value: this.state.value
    });
  }
};
const ButtonExamples = exports.ButtonExamples = {
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
  }, {
    title: 'Modal Multi-Select',
    component: ModalMultiSelectExample
  }]
};