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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

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

var ButtonSizeExample = function ButtonSizeExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    (_Block || _load_Block()).Block,
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Button || _load_Button()).Button,
      { className: 'inline-block', size: 'EXTRA_SMALL' },
      'extra_small'
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Button || _load_Button()).Button,
      { className: 'inline-block', size: 'SMALL' },
      'small'
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Button || _load_Button()).Button,
      { className: 'inline-block' },
      'regular'
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Button || _load_Button()).Button,
      { className: 'inline-block', size: 'LARGE' },
      'large'
    )
  );
};

var ButtonDisabledExample = function ButtonDisabledExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    (_Block || _load_Block()).Block,
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Button || _load_Button()).Button,
      { className: 'inline-block' },
      'enabled'
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Button || _load_Button()).Button,
      { className: 'inline-block', disabled: true },
      'disabled'
    )
  );
};

var ButtonColorExample = function ButtonColorExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { buttonType: 'PRIMARY' },
          'primary'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { buttonType: 'INFO' },
          'info'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { buttonType: 'SUCCESS' },
          'success'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { buttonType: 'WARNING' },
          'warning'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { buttonType: 'ERROR' },
          'error'
        )
      )
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'p',
        null,
        'selected:'
      ),
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { selected: true, buttonType: 'PRIMARY' },
          'primary'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { selected: true, buttonType: 'INFO' },
          'info'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { selected: true, buttonType: 'SUCCESS' },
          'success'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { selected: true, buttonType: 'WARNING' },
          'warning'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { selected: true, buttonType: 'ERROR' },
          'error'
        )
      )
    )
  );
};

var ButtonIconExample = function ButtonIconExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    (_Block || _load_Block()).Block,
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Button || _load_Button()).Button, { icon: 'gear' }),
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Button || _load_Button()).Button, { icon: 'cloud-download' }),
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Button || _load_Button()).Button, { icon: 'code' }),
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Button || _load_Button()).Button, { icon: 'check' }),
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Button || _load_Button()).Button, { icon: 'device-mobile' }),
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Button || _load_Button()).Button, { icon: 'alert' })
    )
  );
};

var ButtonGroupExample = function ButtonGroupExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { size: 'EXTRA_SMALL' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { buttonType: 'SUCCESS' },
          'extra small'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'button'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'group'
        )
      )
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { size: 'SMALL' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { buttonType: 'SUCCESS' },
          'small'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'button'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'group'
        )
      )
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { buttonType: 'SUCCESS' },
          'regular'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'button'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'group'
        )
      )
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { size: 'LARGE' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          { buttonType: 'SUCCESS' },
          'large'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'button'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'group'
        )
      )
    )
  );
};

var ButtonToolbarExample = function ButtonToolbarExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_ButtonToolbar || _load_ButtonToolbar()).ButtonToolbar,
        null,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_Button || _load_Button()).Button,
            null,
            'ButtonGroup'
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_Button || _load_Button()).Button,
            null,
            'in a'
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_Button || _load_Button()).Button,
            null,
            'toolbar'
          )
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
          null,
          'single buttons'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Button || _load_Button()).Button,
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
    return (_reactForAtom || _load_reactForAtom()).React.createElement(
      'div',
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        options: options,
        value: 2
      })
    );
  };
})();

var SplitButtonDropdownExample = (function () {
  var options = [{ value: 1, label: 'Build', icon: 'tools' }, { value: 2, label: 'Run', icon: 'triangle-right', selectedLabel: 'Run It!' }, { value: 3, label: 'Rocket', icon: 'rocket' }, { type: 'separator' }, { value: 4, label: 'Squirrel', icon: 'squirrel' }, { value: 5, label: 'Beaker', icon: 'telescope', disabled: true }];
  return function () {
    return (_reactForAtom || _load_reactForAtom()).React.createElement(
      'div',
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_SplitButtonDropdown || _load_SplitButtonDropdown()).SplitButtonDropdown, {
        options: options,
        value: 2,
        onConfirm:
        // eslint-disable-next-line no-alert
        function (x) {
          return window.alert('You selected ' + x + '!');
        }
      })
    );
  };
})();

var ModalMultiSelectExample = (function (_React$Component) {
  _inherits(ModalMultiSelectExample, _React$Component);

  function ModalMultiSelectExample(props) {
    _classCallCheck(this, ModalMultiSelectExample);

    _get(Object.getPrototypeOf(ModalMultiSelectExample.prototype), 'constructor', this).call(this, props);
    this.state = { value: [2] };
  }

  _createClass(ModalMultiSelectExample, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var options = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }, { value: 3, label: 'Three' }, { value: 4, label: 'Four' }];
      return (_reactForAtom || _load_reactForAtom()).React.createElement((_ModalMultiSelect || _load_ModalMultiSelect()).ModalMultiSelect, {
        options: options,
        onChange: function (value) {
          _this.setState({ value: value });
        },
        value: this.state.value
      });
    }
  }]);

  return ModalMultiSelectExample;
})((_reactForAtom || _load_reactForAtom()).React.Component);

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
  }, {
    title: 'Modal Multi-Select',
    component: ModalMultiSelectExample
  }]
};
exports.ButtonExamples = ButtonExamples;