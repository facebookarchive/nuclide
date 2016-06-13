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

    const children = Object.keys(this.props.packages).sort().map(pkgName => {
      const pkgData = this.props.packages[pkgName];
      const settingsArray = getSortedSettingsArray(pkgData.settings, pkgName);
      const elements = settingsArray.map(settingName => {
        const settingData = pkgData.settings[settingName];
        const settingElement = renderSetting(pkgName, settingData);
        return (
          <ControlGroup key={settingName}>{settingElement}</ControlGroup>
        );
      });
      // We create a control group for the whole group of controls and then another for each
      // individual one. Why? Because that's what Atom does in its settings view.
      return (
        <ControlGroup key={pkgName}>
          <section className="sub-section">
            {/* Package title. */}
            <h2 className="sub-section-heading">{pkgData.title}</h2>
            <div className="sub-section-body">
              {elements}
            </div>
          </section>
        </ControlGroup>
      );
    });

    return (
      <section className="section settings-panel">
        {/* Category Title */}
        <h1 className="block section-heading icon icon-gear">{this.props.name} Settings</h1>
        {children}
      </section>
    );
  }

}

function ControlGroup(props: {children?: React.Children}): React.Element<any> {
  return (
    <div className="control-group">
      <div className="controls">
        {props.children}
      </div>
    </div>
  );
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
