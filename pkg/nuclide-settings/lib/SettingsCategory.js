'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import featureConfig from '../../nuclide-feature-config';
import invariant from 'assert';
import {React} from 'react-for-atom';
import SettingsCheckbox from './SettingsCheckbox';
import SettingsInput from './SettingsInput';
import SettingsSelect from './SettingsSelect';

type Props = {
  name: string;
  packages: Object;
};

export default class SettingsCategory extends React.Component {
  props: Props;

  render(): React.Element<any> {
    const elements = [];

    // Category title.
    elements.push(<h1>{this.props.name}</h1>);

    Object.keys(this.props.packages).sort().forEach(pkgName => {
      const pkgData = this.props.packages[pkgName];

      // Package title.
      elements.push(<h2>{pkgData.title}</h2>);

      const settingsArray = getSortedSettingsArray(pkgData.settings, pkgName);
      settingsArray.forEach(settingName => {
        const settingData = pkgData.settings[settingName];
        const settingElement = renderSetting(pkgName, settingData);
        elements.push(
          <div className="control-group">
            <div className="controls">
              {settingElement}
            </div>
          </div>
        );
      });
    });

    return (<div>{elements}</div>);
  }
}

function getSortedSettingsArray(settings: Object, pkgName: string): Array<string> {
  // Sort the package's settings by name, then by order.
  const settingsArray = Object.keys(settings);
  settingsArray
    .sort()
    .sort((a, b) => settings[a].order - settings[b].order);
  return settingsArray;
}

function renderSetting(packageName: string, settingData: Object): ?React.Element<any> {
  const {description, keyPath, name, onChanged, title, value} = settingData;
  invariant(keyPath === (packageName + '.' + name));
  const schema = featureConfig.getSchema(keyPath);

  if (schema) {
    if (schema.enum) {
      return (
        <SettingsSelect
          description={description}
          keyPath={keyPath}
          onChanged={onChanged}
          title={title}
          value={value}
        />
      );
    } else if (schema.type === 'color') {
      invariant(false); // Not implemented.
    } else if (isBoolean(value) || schema.type === 'boolean') {
      return (
        <SettingsCheckbox
          description={description}
          keyPath={keyPath}
          onChanged={onChanged}
          title={title}
          value={value}
        />
      );
    } else if (Array.isArray(value) || schema.type === 'array') {
      if (isEditableArray(value)) {
        return (
          <SettingsInput
            description={description}
            keyPath={keyPath}
            onChanged={onChanged}
            title={title}
            value={value}
            type="array"
          />
        );
      }
    } else if (isObject(value) || schema.type === 'object') {
      invariant(false); // Not implemented.
    } else {
      const type = isNumber(value) ? 'number' : 'string';
      return (
        <SettingsInput
          description={description}
          keyPath={keyPath}
          onChanged={onChanged}
          title={title}
          value={value}
          type={type}
        />
      );
    }
  }

  return null;
}

function isBoolean(obj) {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
}

function isNumber(obj) {
  return toString.call(obj) === '[object Number]';
}

function isObject(obj) {
  const type = typeof obj;
  return type === 'function' || type === 'object' && Boolean(obj);
}

function isEditableArray(array): boolean {
  for (let i = 0, len = array.length; i < len; i++) {
    const item = array[i];
    if (typeof item !== 'string') {
      return false;
    }
  }
  return true;
}
