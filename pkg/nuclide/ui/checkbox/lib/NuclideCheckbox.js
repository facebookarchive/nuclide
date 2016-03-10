'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  PureRenderMixin,
  React,
  ReactDOM,
} from 'react-for-atom';

type Props = {
  checked: boolean;
  disabled: boolean;
  indeterminate: boolean;
  label: string;
  onChange: (isChecked: boolean) => mixed;
  onClick: (event: SyntheticEvent) => mixed;
};

/**
 * A checkbox component with an input checkbox and a label. We restrict the label to a string
 * to ensure this component is pure.
 */
export default class NuclideCheckbox extends React.Component {
  props: Props;

  static defaultProps = {
    disabled: false,
    indeterminate: false,
    label: '',
    onClick(event) {},
  };

  constructor(props: Object) {
    super(props);
    (this: any)._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    this._setIndeterminate();
  }

  shouldComponentUpdate(nextProps: Object, nextState: void): boolean {
    return PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
  }

  componentDidUpdate() {
    this._setIndeterminate();
  }

  _onChange(event: SyntheticEvent) {
    const isChecked = ((event.target: any): HTMLInputElement).checked;
    this.props.onChange.call(null, isChecked);
  }

  /*
   * Syncs the `indeterminate` prop to the underlying `<input>`. `indeterminate` is intentionally
   * not settable via HTML; it must be done on the `HTMLInputElement` instance in script.
   *
   * @see https://www.w3.org/TR/html5/forms.html#the-input-element
   */
  _setIndeterminate(): void {
    ReactDOM.findDOMNode(this.refs['input']).indeterminate = this.props.indeterminate;
  }

  render(): ReactElement {
    return (
      <label className="nuclide-ui-checkbox-label" onClick={this.props.onClick}>
        <input
          checked={this.props.checked}
          className="nuclide-ui-checkbox"
          disabled={this.props.disabled}
          onChange={this._onChange}
          ref="input"
          type="checkbox"
        />
        {' '}{this.props.label}
      </label>
    );
  }
}
