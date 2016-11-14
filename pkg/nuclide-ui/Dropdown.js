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
exports.ButtonSizes = exports.Dropdown = undefined;

var _class, _temp;

exports.DropdownButton = DropdownButton;

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _electron = _interopRequireDefault(require('electron'));

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const remote = _electron.default.remote;

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

// For backwards compat, we have to do some conversion here.


let Dropdown = exports.Dropdown = (_temp = _class = class Dropdown extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleDropdownClick = this._handleDropdownClick.bind(this);
  }

  render() {
    const selectedOption = this.props.options.find(option => option.type !== 'separator' && option.value === this.props.value) || this.props.options[0];

    return _reactForAtom.React.createElement(
      DropdownButton,
      {
        className: this.props.className,
        disabled: this.props.disabled,
        isFlat: this.props.isFlat,
        title: this.props.title,
        buttonComponent: this.props.buttonComponent,
        onExpand: this._handleDropdownClick,
        size: this.props.size,
        tooltip: this.props.tooltip },
      this._renderSelectedLabel(selectedOption)
    );
  }

  _renderSelectedLabel(option) {
    let text = null;
    if (option == null) {
      text = '';
    } else if (typeof option.selectedLabel === 'string') {
      text = option.selectedLabel;
    } else if (typeof option.label === 'string') {
      text = option.label;
    }

    if (text == null || text === '') {
      return null;
    }
    return text;
  }

  _handleDropdownClick(event) {
    const currentWindow = remote.getCurrentWindow();
    const menu = new remote.Menu();
    this.props.options.forEach(option => {
      if (option.type === 'separator') {
        menu.append(new remote.MenuItem({ type: 'separator' }));
        return;
      }
      menu.append(new remote.MenuItem({
        type: 'checkbox',
        checked: this.props.value === option.value,
        label: option.label,
        enabled: option.disabled !== true,
        click: () => {
          if (this.props.onChange != null) {
            this.props.onChange(option.value);
          }
        }
      }));
    });
    menu.popup(currentWindow, event.clientX, event.clientY);
  }

}, _class.defaultProps = {
  className: '',
  disabled: false,
  isFlat: false,
  options: [],
  value: null,
  title: ''
}, _temp);


const noop = () => {};

/**
 * Just the button part. This is useful for when you want to customize the dropdown behavior (e.g.)
 * show it asynchronously.
 */
function DropdownButton(props) {
  const ButtonComponent = props.buttonComponent || (_Button || _load_Button()).Button;
  const className = (0, (_classnames || _load_classnames()).default)('nuclide-ui-dropdown', props.className, {
    'nuclide-ui-dropdown-flat': props.isFlat === true
  });

  const label = props.children == null ? null : _reactForAtom.React.createElement(
    'span',
    { className: 'nuclide-dropdown-label-text-wrapper' },
    props.children
  );

  return _reactForAtom.React.createElement(
    ButtonComponent,
    {
      tooltip: props.tooltip,
      size: getButtonSize(props.size),
      className: className,
      disabled: props.disabled === true,
      onClick: props.onExpand || noop },
    label,
    _reactForAtom.React.createElement((_Icon || _load_Icon()).Icon, {
      icon: 'triangle-down',
      className: 'nuclide-ui-dropdown-icon'
    })
  );
}

function getButtonSize(size) {
  switch (size) {
    case 'xs':
      return 'EXTRA_SMALL';
    case 'sm':
      return 'SMALL';
    case 'lg':
      return 'LARGE';
    default:
      return 'SMALL';
  }
}

exports.ButtonSizes = (_Button || _load_Button()).ButtonSizes;