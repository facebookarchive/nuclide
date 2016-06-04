'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {SettingsPropsDefault} from './types';

import {normalizeIdentifier} from './settings-utils';
import {React} from 'react-for-atom';

type Props = SettingsPropsDefault & {
  value: boolean;
};

export default class SettingsCheckbox extends React.Component {
  props: Props;

  constructor(props: Object) {
    super(props);
    (this: any)._onChanged = this._onChanged.bind(this);
  }

  _onChanged(event: SyntheticEvent) {
    const isChecked = ((event.target: any): HTMLInputElement).checked;
    this.props.onChanged({
      keyPath: this.props.keyPath,
      newValue: isChecked,
    });
  }

  render(): React.Element {
    const keyPath = this.props.keyPath;
    const id = normalizeIdentifier(keyPath);
    const title = this.props.title;
    const description = this.props.description;
    const value = this.props.value;

    return (
      <div className="checkbox">
        <label htmlFor={id}>
          <input
            checked={value}
            id={id}
            onChange={this._onChanged}
            type="checkbox"
          />
          <div className="setting-title">{title}</div>
        </label>
        <div className="setting-description">{description}</div>
      </div>
    );
  }
}
