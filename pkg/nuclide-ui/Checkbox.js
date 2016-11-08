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
exports.Checkbox = undefined;

var _class, _temp;

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A checkbox component with an input checkbox and a label. We restrict the label to a string
 * to ensure this component is pure.
 */
let Checkbox = exports.Checkbox = (_temp = _class = class Checkbox extends _reactForAtom.React.PureComponent {

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
    _reactForAtom.ReactDOM.findDOMNode(this.refs.input).indeterminate = this.props.indeterminate;
  }

  render() {
    var _props = this.props;
    const checked = _props.checked,
          className = _props.className,
          disabled = _props.disabled,
          indeterminate = _props.indeterminate,
          label = _props.label,
          onClick = _props.onClick;

    return _reactForAtom.React.createElement(
      'label',
      {
        className: (0, (_classnames || _load_classnames()).default)(className, 'nuclide-ui-checkbox-label', {
          'nuclide-ui-checkbox-disabled': disabled
        }),
        onClick: onClick },
      _reactForAtom.React.createElement('input', {
        checked: checked,
        className: 'input-checkbox nuclide-ui-checkbox',
        disabled: disabled,
        onChange: this._onChange,
        ref: 'input',
        type: 'checkbox'
      }),
      _reactForAtom.React.createElement(
        'span',
        { className: 'nuclide-ui-checkbox-label-text' },
        ' ',
        label
      )
    );
  }
}, _class.defaultProps = {
  disabled: false,
  indeterminate: false,
  label: '',
  onClick: function (event) {}
}, _temp);