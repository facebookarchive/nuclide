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

import {AtomInput} from '../../nuclide-ui/lib/AtomInput';
import featureConfig from '../../nuclide-feature-config';
import {React} from 'react-for-atom';

type Props = SettingsPropsDefault & {
  type: string;
  value: (number | string | Array<any>);
};

export default class SettingsInput extends React.Component {
  props: Props;
  _ignoreInputCallback: boolean;

  constructor(props: Object) {
    super(props);
    this._ignoreInputCallback = false;

    (this: any)._onChanged = this._onChanged.bind(this);
    (this: any)._onFocus = this._onFocus.bind(this);
    (this: any)._onBlur = this._onBlur.bind(this);
  }

  _updateInput(input: AtomInput, newValue: string) {
    this._ignoreInputCallback = true;
    input.setText(newValue);
    this._ignoreInputCallback = false;
  }

  _onChanged(newValue: string) {
    if (this._ignoreInputCallback) {
      return;
    }

    newValue = parseValue(this.props.type, newValue);
    this.props.onChanged({
      keyPath: this.props.keyPath,
      newValue,
    });
  }

  _onFocus() {
    const keyPath = this.props.keyPath;
    const input = this.refs[keyPath];
    if (isDefaultConfigValue(keyPath)) {
      const defaultValue = getDefaultConfigValueString(keyPath);
      this._updateInput(input, defaultValue);
    }
  }

  _onBlur() {
    const keyPath = this.props.keyPath;
    const input = this.refs[keyPath];
    if (isDefaultConfigValue(keyPath, input.getText())) {
      this._updateInput(input, '');
    }
  }

  _getValue(): string {
    let value = valueToString(this.props.value);

    const defaultValue = getDefaultConfigValueString(this.props.keyPath);
    if (defaultValue === value) {
      value = '';
    }

    return value;
  }

  _getPlaceholder(): string {
    const defaultValue = getDefaultConfigValueString(this.props.keyPath);
    return (defaultValue ? 'Default: ' + defaultValue : '');
  }

  // $FlowIgnore: This method requires declaring State's type
  componentDidUpdate(prevProps: Object, prevState: Object): void {
    const input = this.refs[this.props.keyPath];
    const value = this._getValue();
    if (prevProps.value !== this.props.value && input.getText() !== value) {
      this._updateInput(input, value);
    }
  }

  render(): React.Element {
    const keyPath = this.props.keyPath;
    const title = this.props.title;
    const description = this.props.description;
    const value = this._getValue();
    const placeholder = this._getPlaceholder();

    return (
      <div>
        <label className="control-label">
          <div className="setting-title">{title}</div>
          <div className="setting-description">{description}</div>
        </label>
        <div className="controls">
          <div className="editor-container">
            <subview>
              <AtomInput
                initialValue={value}
                onDidChange={this._onChanged}
                onFocus={this._onFocus}
                onBlur={this._onBlur}
                placeholderText={placeholder}
                ref={keyPath}
                text={value}
              />
            </subview>
          </div>
        </div>
      </div>
    );
  }
}

function getConfigValueString(keyPath: string): string {
  const value = featureConfig.get(keyPath);
  return valueToString(value);
}

function isDefaultConfigValue(keyPath: string, value: ?any): boolean {
  const defaultValue = getDefaultConfigValueString(keyPath);
  if (value) {
    value = valueToString(value);
  } else {
    value = getConfigValueString(keyPath);
  }
  return !value || defaultValue === value;
}

function getDefaultConfigValueString(keyPath: string): string {
  const params = {excludeSources: [atom.config.getUserConfigPath()]};
  return valueToString(featureConfig.get(keyPath, params));
}

function parseValue(type: string, value: any): any {
  let result = value;
  if (type === 'number') {
    const floatValue = parseFloat(value);
    if (!isNaN(floatValue)) {
      result = floatValue;
    }
  } else if (type === 'array') {
    const arrayValue = (value ? value : '').split(',');
    result = arrayValue.filter(item => Boolean(item)).map(item => item.trim());
  }
  return result;
}

function valueToString(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  } else {
    return value != null ? value.toString() : '';
  }
}
