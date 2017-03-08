'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Checkbox = undefined;

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('./add-tooltip'));
}

var _ignoreTextSelectionEvents;

function _load_ignoreTextSelectionEvents() {
  return _ignoreTextSelectionEvents = _interopRequireDefault(require('./ignoreTextSelectionEvents'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A checkbox component with an input checkbox and a label. We restrict the label to a string
 * to ensure this component is pure.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class Checkbox extends _reactForAtom.React.PureComponent {

  constructor(props) {
    super(props);
    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    this._setIndeterminate();
  }

  componentDidUpdate() {
    this._setIndeterminate();
  }

  _onChange(event) {
    const isChecked = event.target.checked;
    this.props.onChange.call(null, isChecked);
  }

  /*
   * Syncs the `indeterminate` prop to the underlying `<input>`. `indeterminate` is intentionally
   * not settable via HTML; it must be done on the `HTMLInputElement` instance in script.
   *
   * @see https://www.w3.org/TR/html5/forms.html#the-input-element
   */
  _setIndeterminate() {
    // $FlowFixMe
    _reactForAtom.ReactDOM.findDOMNode(this.refs.input).indeterminate = this.props.indeterminate;
  }

  render() {
    const {
      checked,
      className,
      disabled,
      // eslint-disable-next-line no-unused-vars
      indeterminate, // exclude `indeterminate` from `remainingProps`
      label,
      onClick,
      tooltip,
      title
    } = this.props;

    const ref = tooltip ? (0, (_addTooltip || _load_addTooltip()).default)(tooltip) : null;
    const text = label === '' ? null : _reactForAtom.React.createElement(
      'span',
      { className: 'nuclide-ui-checkbox-label-text' },
      ' ',
      label
    );
    return _reactForAtom.React.createElement(
      'label',
      {
        className: (0, (_classnames || _load_classnames()).default)(className, 'nuclide-ui-checkbox-label', {
          'nuclide-ui-checkbox-disabled': disabled
        }),
        ref: ref,
        onClick: onClick && (0, (_ignoreTextSelectionEvents || _load_ignoreTextSelectionEvents()).default)(onClick),
        title: title },
      _reactForAtom.React.createElement('input', {
        checked: checked,
        className: 'input-checkbox nuclide-ui-checkbox',
        disabled: disabled,
        onChange: this._onChange,
        ref: 'input',
        type: 'checkbox'
      }),
      text
    );
  }
}
exports.Checkbox = Checkbox;
Checkbox.defaultProps = {
  disabled: false,
  indeterminate: false,
  label: '',
  onClick(event) {}
};