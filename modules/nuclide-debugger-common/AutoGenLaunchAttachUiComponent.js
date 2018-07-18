"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("../nuclide-commons-ui/Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function _RadioGroup() {
  const data = _interopRequireDefault(require("../nuclide-commons-ui/RadioGroup"));

  _RadioGroup = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _debugger() {
  const data = require("../nuclide-commons-atom/debugger");

  _debugger = function () {
    return data;
  };

  return data;
}

function _DebuggerConfigSerializer() {
  const data = require("./DebuggerConfigSerializer");

  _DebuggerConfigSerializer = function () {
    return data;
  };

  return data;
}

function _DeviceAndPackage() {
  const data = require("./DeviceAndPackage");

  _DeviceAndPackage = function () {
    return data;
  };

  return data;
}

function _DeviceAndProcess() {
  const data = require("./DeviceAndProcess");

  _DeviceAndProcess = function () {
    return data;
  };

  return data;
}

function _SelectableFilterableProcessTable() {
  const data = _interopRequireDefault(require("./SelectableFilterableProcessTable"));

  _SelectableFilterableProcessTable = function () {
    return data;
  };

  return data;
}

function _SourceSelector() {
  const data = require("./SourceSelector");

  _SourceSelector = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// extension must be a string starting with a '.' like '.js' or '.py'
function getActiveScriptPath(extension) {
  const center = atom.workspace.getCenter ? atom.workspace.getCenter() : atom.workspace;
  const activeEditor = center.getActiveTextEditor();

  if (activeEditor == null || !activeEditor.getPath() || !(0, _nullthrows().default)(activeEditor.getPath()).endsWith(extension)) {
    return '';
  }

  return _nuclideUri().default.getPath((0, _nullthrows().default)(activeEditor.getPath()));
}

class AutoGenLaunchAttachUiComponent extends React.Component {
  constructor(props) {
    super(props);

    this._handleDebugButtonClick = async () => {
      const {
        targetUri,
        config
      } = this.props;
      const {
        atomInputValues,
        booleanValues,
        enumValues,
        processTableValues,
        deviceAndPackageValues,
        deviceAndProcessValues,
        selectSourcesValues
      } = this.state;
      const {
        launch,
        vsAdapterType,
        threads,
        getProcessName
      } = config;
      const stringValues = new Map();
      const stringArrayValues = new Map();
      const objectValues = new Map();
      const numberValues = new Map();
      const jsonValues = new Map();
      await Promise.all(Array.from(this._getConfigurationProperties().filter(property => property.visible && atomInputValues.has(property.name)).map(async property => {
        var _ref3;

        const {
          name,
          type
        } = property;
        const itemType = (_ref3 = property) != null ? _ref3.itemType : _ref3;
        const value = atomInputValues.get(name) || '';

        if (type === 'path') {
          try {
            const resolvedPath = this.props.pathResolver == null ? value : await this.props.pathResolver(targetUri, value);
            stringValues.set(name, resolvedPath);
          } catch (_) {
            stringValues.set(name, value);
          }
        } else if (type === 'string') {
          stringValues.set(name, value);
        } else if (type === 'array' && itemType === 'string') {
          stringArrayValues.set(name, (0, _string().shellParseWithGlobs)(value));
        } else if (type === 'object') {
          const objectValue = {};
          (0, _string().shellParseWithGlobs)(value).forEach(variable => {
            const [lhs, rhs] = variable.split('=');
            objectValue[lhs] = rhs;
          });
          objectValues.set(name, objectValue);
        } else if (type === 'number') {
          numberValues.set(name, Number(value));
        } else if (type === 'json') {
          jsonValues.set(name, JSON.parse(value));
        }

        return value;
      })));
      const packageValues = new Map();

      this._getConfigurationProperties().filter(property => property.visible && deviceAndPackageValues.has(property.name)).forEach(property => {
        const deviceAndPackage = deviceAndPackageValues.get(property.name);

        if (deviceAndPackage != null) {
          packageValues.set(property.name, deviceAndPackage.selectedPackage);
        }
      });

      const processValues = new Map();

      this._getConfigurationProperties().filter(property => property.visible && deviceAndProcessValues.has(property.name)).forEach(property => {
        var _ref4;

        const deviceAndProcess = deviceAndProcessValues.get(property.name);
        const processName = (_ref4 = deviceAndProcess) != null ? (_ref4 = _ref4.selectedProcess) != null ? _ref4.name : _ref4 : _ref4;

        if (deviceAndProcess != null && processName != null) {
          processValues.set(property.name, processName);
        }
      });

      const values = {};
      [booleanValues, enumValues, stringValues, stringArrayValues, objectValues, numberValues, processTableValues, jsonValues, deviceAndPackageValues, deviceAndProcessValues, selectSourcesValues].forEach(map => {
        map.forEach((value, key) => {
          values[key] = value;
        });
      });

      this._getConfigurationProperties().filter(property => !property.visible && !atomInputValues.has(property.name)).forEach(property => {
        var _ref5;

        const {
          name
        } = property;
        values[name] = (_ref5 = property) != null ? _ref5.defaultValue : _ref5;
      });

      const debuggerService = await (0, _debugger().getDebuggerService)();
      debuggerService.startVspDebugging({
        targetUri,
        debugMode: launch ? 'launch' : 'attach',
        adapterType: vsAdapterType,
        config: values,
        showThreads: threads,
        customControlButtons: [],
        threadsComponentTitle: 'Threads',
        customDisposable: new (_UniversalDisposable().default)(),
        processName: getProcessName(values)
      });
      (0, _DebuggerConfigSerializer().serializeDebuggerConfig)(...this._getSerializationArgs(this.props), {
        atomInputValues: Array.from(atomInputValues),
        booleanValues: Array.from(booleanValues),
        enumValues: Array.from(enumValues),
        packageValues: Array.from(packageValues),
        processValues: Array.from(processValues),
        selectSourcesValues: Array.from(selectSourcesValues)
      });
    };

    this._disposables = new (_UniversalDisposable().default)();
    this.state = {
      atomInputValues: new Map(),
      booleanValues: new Map(),
      enumValues: new Map(),
      processTableValues: new Map(),
      deviceAndPackageValues: new Map(),
      deviceAndProcessValues: new Map(),
      selectSourcesValues: new Map()
    };
  }

  _atomInputType(type, itemType) {
    return type === 'string' || type === 'path' || type === 'array' && itemType === 'string' || type === 'object' || type === 'number' || type === 'json';
  }

  _getConfigurationProperties() {
    const {
      config
    } = this.props;
    return config.properties;
  }

  _populateDefaultValues(config, atomInputValues, booleanValues, enumValues) {
    const ignorePreviousParams = config.ignorePreviousParams !== undefined ? config.ignorePreviousParams : false;
    config.properties.filter(property => property.visible).map(property => {
      var _ref;

      const {
        name,
        type
      } = property;
      const itemType = (_ref = property) != null ? _ref.itemType : _ref;

      if (this._atomInputType(type, itemType)) {
        const existingValue = atomInputValues.get(name);

        if ((ignorePreviousParams || existingValue == null) && typeof property.defaultValue !== 'undefined') {
          // String(propertyDescription.default) deals with both strings and numbers and arrays
          // JSON.stringify for JSON
          // empty string otherwise
          const defaultValue = type === 'string' || type === 'number' || type === 'array' ? String(property.defaultValue) : type === 'json' ? JSON.stringify(property.defaultValue) : '';
          atomInputValues.set(name, defaultValue);
        }
      } else if (type === 'boolean') {
        const existingValue = booleanValues.get(name);

        if ((ignorePreviousParams || existingValue == null) && typeof property.defaultValue !== 'undefined' && property.defaultValue != null && typeof property.defaultValue === 'boolean') {
          booleanValues.set(name, property.defaultValue);
        } else {
          booleanValues.set(name, false);
        }
      } else if (type === 'enum' && property.enums != null) {
        const existingValue = enumValues.get(name);

        if ((ignorePreviousParams || existingValue == null) && typeof property.defaultValue !== 'undefined' && property.defaultValue != null && typeof property.defaultValue === 'string') {
          enumValues.set(name, property.defaultValue);
        }
      }
    });
  }

  _getSerializationArgs(props) {
    const {
      targetUri,
      config,
      debuggerTypeName
    } = props;
    const args = [_nuclideUri().default.isRemote(targetUri) ? _nuclideUri().default.getHostname(targetUri) : 'local', config.launch ? 'launch' : 'attach', debuggerTypeName];
    return args;
  }

  _deserializeDebuggerConfig(props) {
    (0, _DebuggerConfigSerializer().deserializeDebuggerConfig)(...this._getSerializationArgs(props), (transientSettings, savedSettings) => {
      const {
        config
      } = props;
      const {
        cwdPropertyName,
        scriptPropertyName,
        launch,
        scriptExtension
      } = config;
      const atomInputValues = new Map(savedSettings.atomInputValues || []);
      const scriptPath = scriptPropertyName != null && atomInputValues.get(scriptPropertyName) || scriptExtension != null && getActiveScriptPath(scriptExtension) || '';

      if (cwdPropertyName != null) {
        const cwd = atomInputValues.get(cwdPropertyName) || (scriptPath !== '' ? _nuclideUri().default.dirname(scriptPath) : '');

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

      this._populateDefaultValues(config, atomInputValues, booleanValues, enumValues); // do not serialize and deserialize these values:


      const processTableValues = new Map();
      const deviceAndPackageValues = new Map();
      const deviceAndProcessValues = new Map();
      this.setState({
        atomInputValues,
        booleanValues,
        enumValues,
        processTableValues,
        deviceAndPackageValues,
        deviceAndProcessValues
      });
    });
  }

  setState(newState) {
    super.setState(newState, () => this.props.configIsValidChanged(this._debugButtonShouldEnable()));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.debuggerTypeName !== this.props.debuggerTypeName) {
      this._deserializeDebuggerConfig(nextProps);
    }
  }

  UNSAFE_componentWillMount() {
    this._deserializeDebuggerConfig(this.props);
  }

  componentDidMount() {
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': async () => {
        if (this._debugButtonShouldEnable()) {
          await this._handleDebugButtonClick();
        }
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _valueExists(property) {
    const {
      name,
      type
    } = property;

    if (type === 'string' || type === 'path' || type === 'array' && property.itemType === 'string') {
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
    } else if (type === 'deviceAndPackage') {
      const deviceAndPackageValue = this.state.deviceAndPackageValues.get(name);
      return deviceAndPackageValue != null && deviceAndPackageValue.device != null && deviceAndPackageValue.selectedPackage != null;
    } else if (type === 'deviceAndProcess') {
      const deviceAndProcessValue = this.state.deviceAndProcessValues.get(name);
      return deviceAndProcessValue != null && deviceAndProcessValue.device != null && deviceAndProcessValue.selectedProcess != null;
    } else if (type === 'selectSources') {
      const selectSourcesValue = this.state.selectSourcesValues.get(name);
      return selectSourcesValue != null;
    }

    return false;
  }

  _debugButtonShouldEnable() {
    return this._getConfigurationProperties().filter(p => p.required).every(p => this._valueExists(p));
  }

  _getComponentForProperty(property) {
    var _ref2;

    const {
      name,
      type,
      description,
      required
    } = property;
    const formattedName = (0, _string().capitalize)(name.replace(/([A-Z])/g, ' $1')) + (required ? ' (Required)' : '');
    const nameLabel = React.createElement("label", null, formattedName, ":");
    const itemType = (_ref2 = property) != null ? _ref2.itemType : _ref2;

    if (this._atomInputType(type, itemType)) {
      const value = this.state.atomInputValues.get(name) || '';
      return React.createElement("div", null, nameLabel, React.createElement(_AtomInput().AtomInput, {
        key: this.props.debuggerTypeName + ':' + name,
        placeholderText: description,
        value: value,
        onDidChange: newValue => {
          this.state.atomInputValues.set(name, newValue);
          this.props.configIsValidChanged(this._debugButtonShouldEnable());
        }
      }));
    } else if (type === 'boolean') {
      const checked = this.state.booleanValues.get(name) || false;
      return React.createElement("div", null, React.createElement("div", null, nameLabel), React.createElement(_Checkbox().Checkbox, {
        checked: checked,
        label: description,
        onChange: newValue => {
          this.state.booleanValues.set(name, newValue);
          this.props.configIsValidChanged(this._debugButtonShouldEnable());
        }
      }));
    } else if (type === 'enum' && property.enums != null) {
      const enums = property.enums;
      const selectedValue = this.state.enumValues.get(name) || '';
      return React.createElement("div", null, nameLabel, React.createElement(_RadioGroup().default, {
        selectedIndex: enums.indexOf(selectedValue),
        optionLabels: enums.map((enumValue, i) => React.createElement("label", {
          key: i
        }, enumValue)),
        onSelectedChange: index => {
          this.state.enumValues.set(name, enums[index]);
          this.props.configIsValidChanged(this._debugButtonShouldEnable());
        }
      }));
    } else if (type === 'process') {
      return React.createElement("div", null, nameLabel, React.createElement(_SelectableFilterableProcessTable().default, {
        targetUri: this.props.targetUri,
        onSelect: selectedProcess => {
          if (selectedProcess != null) {
            this.state.processTableValues.set(name, selectedProcess.pid);
          } else {
            this.state.processTableValues.delete(name);
          }

          this.props.configIsValidChanged(this._debugButtonShouldEnable());
        }
      }));
    } else if (type === 'deviceAndPackage') {
      return React.createElement(_DeviceAndPackage().DeviceAndPackage, {
        targetUri: this.props.targetUri,
        deserialize: () => {
          let packageValuesArray = [];
          (0, _DebuggerConfigSerializer().deserializeDebuggerConfig)(...this._getSerializationArgs(this.props), (transientSettings, savedSettings) => {
            packageValuesArray = savedSettings.packageValues || [];
          });
          const packageValues = new Map(packageValuesArray);
          return packageValues.get(name) || null;
        },
        onSelect: (device, javaPackage) => {
          this.state.deviceAndPackageValues.set(name, {
            device,
            selectedPackage: javaPackage
          });
          this.props.configIsValidChanged(this._debugButtonShouldEnable());
        }
      });
    } else if (type === 'deviceAndProcess') {
      return React.createElement(_DeviceAndProcess().DeviceAndProcess, {
        targetUri: this.props.targetUri,
        deserialize: () => {
          let processValuesArray = [];
          (0, _DebuggerConfigSerializer().deserializeDebuggerConfig)(...this._getSerializationArgs(this.props), (transientSettings, savedSettings) => {
            processValuesArray = savedSettings.processValues || [];
          });
          const processValues = new Map(processValuesArray);
          return processValues.get(name) || null;
        },
        onSelect: (device, javaProcess) => {
          this.state.deviceAndProcessValues.set(name, {
            device,
            selectedProcess: javaProcess
          });
          this.props.configIsValidChanged(this._debugButtonShouldEnable());
        }
      });
    } else if (type === 'selectSources') {
      return React.createElement("div", null, nameLabel, React.createElement(_SourceSelector().SourceSelector, {
        deserialize: () => {
          let selectSourcesValuesArray = [];
          (0, _DebuggerConfigSerializer().deserializeDebuggerConfig)(...this._getSerializationArgs(this.props), (transientSettings, savedSettings) => {
            selectSourcesValuesArray = savedSettings.selectSourcesValues || [];
          });
          const selectSourcesValues = new Map(selectSourcesValuesArray);
          return selectSourcesValues.get(name) || null;
        },
        onSelect: selectedSource => {
          this.state.selectSourcesValues.set(name, selectedSource);
          this.props.configIsValidChanged(this._debugButtonShouldEnable());
        }
      }));
    }

    return React.createElement("div", null, React.createElement("label", null, "NO TRANSLATION YET FOR: ", (0, _string().capitalize)(name)), React.createElement("hr", null));
  }

  render() {
    const {
      debuggerTypeName,
      config
    } = this.props;
    return React.createElement("div", {
      className: "block"
    }, config.header, this._getConfigurationProperties().filter(property => property.visible).map(property => React.createElement("div", {
      key: debuggerTypeName + ':' + property.name
    }, this._getComponentForProperty(property))));
  }

}

exports.default = AutoGenLaunchAttachUiComponent;