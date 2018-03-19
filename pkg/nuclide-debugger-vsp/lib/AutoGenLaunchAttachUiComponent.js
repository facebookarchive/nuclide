/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  HandleDebugButtonClick,
  AutoGenProperty,
  AutoGenLaunchOrAttachConfig,
} from './types';

import idx from 'idx';
import {Checkbox} from 'nuclide-commons-ui/Checkbox';
import RadioGroup from 'nuclide-commons-ui/RadioGroup';
import * as React from 'react';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {capitalize} from 'nuclide-commons/string';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from 'nuclide-debugger-common';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getActiveScriptPath} from './utils';

type Props = {|
  +targetUri: NuclideUri,
  +configIsValidChanged: (valid: boolean) => void,
  +config: AutoGenLaunchOrAttachConfig,
  +handleDebugButtonClick: HandleDebugButtonClick,
  +debuggerTypeName: string,
|};

type State = {
  enumValues: Map<string, string>,
  booleanValues: Map<string, boolean>,
  stringValues: Map<string, string>,
};

export default class AutoGenLaunchAttachUiComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      stringValues: new Map(),
      booleanValues: new Map(),
      enumValues: new Map(),
    };
  }

  _getConfigurationProperties(): AutoGenProperty[] {
    const {config} = this.props;
    return config.properties;
  }

  _populateDefaultValues(
    config: AutoGenLaunchOrAttachConfig,
    stringValues: Map<string, string>,
    booleanValues: Map<string, boolean>,
    enumValues: Map<string, string>,
  ): void {
    config.properties.map(property => {
      const {name, type} = property;
      const itemType = idx(property, _ => _.itemType);
      if (
        type === 'string' ||
        (type === 'array' && itemType === 'string') ||
        type === 'object' ||
        type === 'number'
      ) {
        const existingValue = stringValues.get(name);
        if (
          existingValue == null &&
          typeof property.defaultValue !== 'undefined'
        ) {
          // String(propertyDescription.default) deals with both strings and numbers
          const defaultValue =
            type === 'string' || type === 'number'
              ? String(property.defaultValue)
              : '';
          stringValues.set(name, defaultValue);
        }
      } else if (type === 'boolean') {
        const existingValue = booleanValues.get(name);
        if (
          existingValue == null &&
          typeof property.defaultValue !== 'undefined' &&
          property.defaultValue != null &&
          typeof property.defaultValue === 'boolean'
        ) {
          booleanValues.set(name, property.defaultValue);
        } else {
          booleanValues.set(name, false);
        }
      } else if (type === 'enum' && property.enums != null) {
        const existingValue = enumValues.get(name);
        if (
          existingValue == null &&
          typeof property.defaultValue !== 'undefined' &&
          property.defaultValue != null &&
          typeof property.defaultValue === 'string'
        ) {
          enumValues.set(name, property.defaultValue);
        }
      }
    });
  }

  _getSerializationArgs(props: Props) {
    const {targetUri, config, debuggerTypeName} = props;
    const args = [
      nuclideUri.isRemote(targetUri)
        ? nuclideUri.getHostname(targetUri)
        : 'local',
      config.launch ? 'launch' : 'attach',
      debuggerTypeName,
    ];
    return args;
  }

  _deserializeDebuggerConfig(props: Props): void {
    deserializeDebuggerConfig(
      ...this._getSerializationArgs(props),
      (transientSettings, savedSettings) => {
        const stringValues = new Map(savedSettings.stringValues || []);
        const {config} = props;
        if (config.launch) {
          const scriptPath =
            stringValues.get(config.scriptPropertyName) ||
            getActiveScriptPath(config.scriptExtension);
          if (scriptPath !== '') {
            stringValues.set(config.scriptPropertyName, scriptPath);
          }
          const cwd =
            stringValues.get(config.cwdPropertyName) ||
            (scriptPath.length > 0 ? nuclideUri.dirname(scriptPath) : '');
          if (cwd !== '') {
            stringValues.set(config.cwdPropertyName, cwd);
          }
        }
        const numberValues = new Map(savedSettings.numberValues || []);
        numberValues.forEach((value, key) => {
          if (value != null) {
            stringValues.set(key, String(value));
          }
        });
        const booleanValues = new Map(savedSettings.booleanValues || []);
        const enumValues = new Map(savedSettings.enumValues || []);
        this._populateDefaultValues(
          config,
          stringValues,
          booleanValues,
          enumValues,
        );
        this.setState(
          {
            stringValues,
            booleanValues,
            enumValues,
          },
          () => props.configIsValidChanged(this._debugButtonShouldEnable()),
        );
      },
    );
    props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.debuggerTypeName !== this.props.debuggerTypeName) {
      this._deserializeDebuggerConfig(nextProps);
    }
  }

  componentWillMount(): void {
    this._deserializeDebuggerConfig(this.props);
  }

  componentDidMount(): void {
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'core:confirm': async () => {
          if (this._debugButtonShouldEnable()) {
            await this._handleDebugButtonClick();
          }
        },
      }),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _valueExists(property: AutoGenProperty): boolean {
    const {name, type} = property;
    if (type === 'string') {
      const value = this.state.stringValues.get(name);
      return value != null && value !== '';
    } else if (type === 'number') {
      const value = this.state.stringValues.get(name);
      return value != null && !isNaN(value);
    }
    return false;
  }

  _debugButtonShouldEnable(): boolean {
    return this._getConfigurationProperties()
      .filter(p => p.required)
      .every(p => this._valueExists(p));
  }

  _getComponentForProperty(property: AutoGenProperty): React.Node {
    const {name, type, description, required} = property;
    const formattedName =
      capitalize(name).replace(/([a-z])([A-Z])/, '$1 $2') +
      (required ? ' (Required)' : '');
    const nameLabel = <label>{formattedName}:</label>;
    const itemType = idx(property, _ => _.itemType);
    if (
      type === 'string' ||
      (type === 'array' && itemType === 'string') ||
      type === 'object' ||
      type === 'number'
    ) {
      const value = this.state.stringValues.get(name) || '';
      return (
        <div>
          {nameLabel}
          <AtomInput
            key={this.props.debuggerTypeName + ':' + name}
            placeholderText={description}
            value={value}
            onDidChange={newValue => {
              this.state.stringValues.set(name, newValue);
              this.props.configIsValidChanged(this._debugButtonShouldEnable());
            }}
          />
        </div>
      );
    } else if (type === 'boolean') {
      const checked = this.state.booleanValues.get(name) || false;
      return (
        <div>
          <div>{nameLabel}</div>
          <Checkbox
            checked={checked}
            label={description}
            onChange={newValue => {
              this.state.booleanValues.set(name, newValue);
              this.props.configIsValidChanged(this._debugButtonShouldEnable());
            }}
          />
        </div>
      );
    } else if (type === 'enum' && property.enums != null) {
      const enums = property.enums;
      const selectedValue = this.state.enumValues.get(name) || '';
      return (
        <div>
          {nameLabel}
          <RadioGroup
            selectedIndex={enums.indexOf(selectedValue)}
            optionLabels={enums.map((enumValue, i) => (
              <label key={i}>{enumValue}</label>
            ))}
            onSelectedChange={index => {
              this.state.enumValues.set(name, enums[index]);
              this.props.configIsValidChanged(this._debugButtonShouldEnable());
            }}
          />
        </div>
      );
    }
    return (
      <div>
        <label>NO TRANSLATION YET FOR: {capitalize(name)}</label>
        <hr />
      </div>
    );
  }

  _renderHeader(): ?React.Node {
    const {config} = this.props;
    return config.header != null ? config.header : null;
  }

  render(): React.Node {
    return (
      <div className="block">
        {this._renderHeader()}
        {this._getConfigurationProperties().map(property =>
          this._getComponentForProperty(property),
        )}
      </div>
    );
  }

  _handleDebugButtonClick = async (): Promise<void> => {
    const numberValues = new Map();
    this._getConfigurationProperties()
      .filter(property => property.type === 'number')
      .forEach(property => {
        const {name} = property;
        numberValues.set(name, Number(this.state.stringValues.get(name)));
        this.state.stringValues.delete(name);
      });
    await this.props.handleDebugButtonClick(
      this.props.targetUri,
      this.state.stringValues,
      this.state.booleanValues,
      this.state.enumValues,
      numberValues,
    );

    serializeDebuggerConfig(...this._getSerializationArgs(this.props), {
      stringValues: Array.from(this.state.stringValues.entries()),
      booleanValues: Array.from(this.state.booleanValues.entries()),
      enumValues: Array.from(this.state.enumValues.entries()),
      numberValues: Array.from(numberValues),
    });
  };
}
