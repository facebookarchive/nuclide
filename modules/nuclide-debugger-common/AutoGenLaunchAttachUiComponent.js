/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  AutoGenProperty,
  AutoGenLaunchOrAttachConfig,
  AutoGenPropertyType,
  AutoGenPropertyPrimitiveType,
} from './types';
import * as React from 'react';

import idx from 'idx';
import nullthrows from 'nullthrows';
import {Checkbox} from 'nuclide-commons-ui/Checkbox';
import RadioGroup from 'nuclide-commons-ui/RadioGroup';
import {AtomInput} from 'nuclide-commons-ui/AtomInput';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {capitalize, shellParse} from 'nuclide-commons/string';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {getDebuggerService} from 'nuclide-commons-atom/debugger';
import {
  serializeDebuggerConfig,
  deserializeDebuggerConfig,
} from './DebuggerConfigSerializer';
import SelectableFilterableProcessTable from './SelectableFilterableProcessTable';

type Props = {|
  +targetUri: NuclideUri,
  +configIsValidChanged: (valid: boolean) => void,
  +config: AutoGenLaunchOrAttachConfig,
  +debuggerTypeName: string,
|};

type State = {
  enumValues: Map<string, string>,
  booleanValues: Map<string, boolean>,
  atomInputValues: Map<string, string>,
  processTableValues: Map<string, number>,
};

// extension must be a string starting with a '.' like '.js' or '.py'
function getActiveScriptPath(extension: string): string {
  const center = atom.workspace.getCenter
    ? atom.workspace.getCenter()
    : atom.workspace;
  const activeEditor: ?atom$TextEditor = center.getActiveTextEditor();
  if (
    activeEditor == null ||
    !activeEditor.getPath() ||
    !nullthrows(activeEditor.getPath()).endsWith(extension)
  ) {
    return '';
  }
  return nuclideUri.getPath(nullthrows(activeEditor.getPath()));
}

export default class AutoGenLaunchAttachUiComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this._disposables = new UniversalDisposable();
    this.state = {
      atomInputValues: new Map(),
      booleanValues: new Map(),
      enumValues: new Map(),
      processTableValues: new Map(),
    };
  }

  _atomInputType(
    type: AutoGenPropertyType,
    itemType: ?AutoGenPropertyPrimitiveType,
  ): boolean {
    return (
      type === 'string' ||
      (type === 'array' && itemType === 'string') ||
      type === 'object' ||
      type === 'number' ||
      type === 'json'
    );
  }

  _getConfigurationProperties(): AutoGenProperty[] {
    const {config} = this.props;
    return config.properties;
  }

  _populateDefaultValues(
    config: AutoGenLaunchOrAttachConfig,
    atomInputValues: Map<string, string>,
    booleanValues: Map<string, boolean>,
    enumValues: Map<string, string>,
  ): void {
    config.properties.filter(property => property.visible).map(property => {
      const {name, type} = property;
      const itemType = idx(property, _ => _.itemType);
      if (this._atomInputType(type, itemType)) {
        const existingValue = atomInputValues.get(name);
        if (
          existingValue == null &&
          typeof property.defaultValue !== 'undefined'
        ) {
          // String(propertyDescription.default) deals with both strings and numbers and arrays
          // JSON.stringify for JSON
          // empty string otherwise
          const defaultValue =
            type === 'string' || type === 'number' || type === 'array'
              ? String(property.defaultValue)
              : type === 'json'
                ? JSON.stringify(property.defaultValue)
                : '';
          atomInputValues.set(name, defaultValue);
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
        const {config} = props;
        const {
          cwdPropertyName,
          scriptPropertyName,
          launch,
          scriptExtension,
        } = config;
        const atomInputValues = new Map(savedSettings.atomInputValues || []);

        const scriptPath =
          (scriptPropertyName != null &&
            atomInputValues.get(scriptPropertyName)) ||
          (scriptExtension != null && getActiveScriptPath(scriptExtension)) ||
          '';
        if (cwdPropertyName != null) {
          const cwd =
            atomInputValues.get(cwdPropertyName) ||
            (scriptPath !== '' ? nuclideUri.dirname(scriptPath) : '');
          if (cwd !== '') {
            atomInputValues.set(cwdPropertyName, cwd);
          }
        }
        if (launch) {
          if (scriptPath !== '' && scriptPropertyName != null) {
            atomInputValues.set(scriptPropertyName, scriptPath);
          }
        }
        const booleanValues = new Map(savedSettings.booleanValues || []);
        const enumValues = new Map(savedSettings.enumValues || []);
        this._populateDefaultValues(
          config,
          atomInputValues,
          booleanValues,
          enumValues,
        );
        // do not serialize and deserialize processes
        const processTableValues = new Map();
        this.setState({
          atomInputValues,
          booleanValues,
          enumValues,
          processTableValues,
        });
      },
    );
  }

  setState(newState: Object): void {
    super.setState(newState, () =>
      this.props.configIsValidChanged(this._debugButtonShouldEnable()),
    );
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
      const value = this.state.atomInputValues.get(name);
      return value != null && value !== '';
    } else if (type === 'number') {
      const value = this.state.atomInputValues.get(name);
      return value != null && !isNaN(value);
    } else if (type === 'boolean') {
      const value = this.state.booleanValues.get(name);
      return value != null;
    } else if (type === 'enum') {
      const value = this.state.enumValues.get(name);
      return value != null;
    } else if (type === 'process') {
      const value = this.state.processTableValues.get(name);
      return value != null;
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
      capitalize(name.replace(/([A-Z])/g, ' $1')) +
      (required ? ' (Required)' : '');
    const nameLabel = <label>{formattedName}:</label>;
    const itemType = idx(property, _ => _.itemType);
    if (this._atomInputType(type, itemType)) {
      const value = this.state.atomInputValues.get(name) || '';
      return (
        <div>
          {nameLabel}
          <AtomInput
            key={this.props.debuggerTypeName + ':' + name}
            placeholderText={description}
            value={value}
            onDidChange={newValue => {
              this.state.atomInputValues.set(name, newValue);
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
    } else if (type === 'process') {
      return (
        <div>
          {nameLabel}
          <SelectableFilterableProcessTable
            targetUri={this.props.targetUri}
            onSelect={selectedProcess => {
              if (selectedProcess != null) {
                this.state.processTableValues.set(name, selectedProcess.pid);
              } else {
                this.state.processTableValues.delete(name);
              }
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

  render(): React.Node {
    const {debuggerTypeName, config} = this.props;
    return (
      <div className="block">
        {config.header}
        {this._getConfigurationProperties()
          .filter(property => property.visible)
          .map(property => (
            <div key={debuggerTypeName + ':' + property.name}>
              {this._getComponentForProperty(property)}
            </div>
          ))}
      </div>
    );
  }

  _handleDebugButtonClick = async (): Promise<void> => {
    const {targetUri, config} = this.props;
    const {
      atomInputValues,
      booleanValues,
      enumValues,
      processTableValues,
    } = this.state;
    const {launch, vsAdapterType, threads} = config;

    const stringValues = new Map();
    const stringArrayValues = new Map();
    const objectValues = new Map();
    const numberValues = new Map();
    const jsonValues = new Map();
    this._getConfigurationProperties()
      .filter(
        property => property.visible && atomInputValues.has(property.name),
      )
      .forEach(property => {
        const {name, type} = property;
        const itemType = idx(property, _ => _.itemType);
        const value = atomInputValues.get(name) || '';
        if (type === 'string') {
          stringValues.set(name, value);
        } else if (type === 'array' && itemType === 'string') {
          stringArrayValues.set(name, shellParse(value));
        } else if (type === 'object') {
          const objectValue = {};
          shellParse(value).forEach(variable => {
            const [lhs, rhs] = variable.split('=');
            objectValue[lhs] = rhs;
          });
          objectValues.set(name, objectValue);
        } else if (type === 'number') {
          numberValues.set(name, Number(value));
        } else if (type === 'json') {
          jsonValues.set(name, JSON.parse(value));
        }
      });

    const values = {};
    [
      booleanValues,
      enumValues,
      stringValues,
      stringArrayValues,
      objectValues,
      numberValues,
      processTableValues,
      jsonValues,
    ].forEach(map => {
      map.forEach((value, key) => {
        values[key] = value;
      });
    });

    this._getConfigurationProperties()
      .filter(
        property => !property.visible && !atomInputValues.has(property.name),
      )
      .forEach(property => {
        const {name} = property;
        values[name] = idx(property, _ => _.defaultValue);
      });

    const debuggerService = await getDebuggerService();
    debuggerService.startVspDebugging({
      targetUri,
      debugMode: launch ? 'launch' : 'attach',
      adapterType: vsAdapterType,
      adapterExecutable: null,
      config: values,
      capabilities: {threads},
      properties: {
        customControlButtons: [],
        threadsComponentTitle: 'Threads',
      },
    });

    serializeDebuggerConfig(...this._getSerializationArgs(this.props), {
      atomInputValues: Array.from(atomInputValues),
      booleanValues: Array.from(booleanValues),
      enumValues: Array.from(enumValues),
    });
  };
}
