'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _RadioGroup;

function _load_RadioGroup() {
  return _RadioGroup = _interopRequireDefault(require('nuclide-commons-ui/RadioGroup'));
}

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class AutoGenLaunchAttachUiComponent extends _react.Component {

  constructor(props) {
    var _this;

    _this = super(props);
    this._handleDebugButtonClick = (0, _asyncToGenerator.default)(function* () {
      const numberValues = new Map();
      _this._getConfigurationProperties().filter(function (property) {
        return property.type === 'number';
      }).forEach(function (property) {
        const { name } = property;
        numberValues.set(name, Number(_this.state.stringValues.get(name)));
        _this.state.stringValues.delete(name);
      });
      yield _this.props.handleDebugButtonClick(_this.props.targetUri, _this.state.stringValues, _this.state.booleanValues, _this.state.enumValues, numberValues);

      (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).serializeDebuggerConfig)(..._this._getSerializationArgs(_this.props), {
        stringValues: Array.from(_this.state.stringValues.entries()),
        booleanValues: Array.from(_this.state.booleanValues.entries()),
        enumValues: Array.from(_this.state.enumValues.entries()),
        numberValues: Array.from(numberValues)
      });
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      stringValues: new Map(),
      booleanValues: new Map(),
      enumValues: new Map()
    };
  }

  _getConfigurationProperties() {
    const { config } = this.props;
    return config.properties;
  }

  _populateDefaultValues(config, stringValues, booleanValues, enumValues) {
    config.properties.map(property => {
      var _ref;

      const { name, type } = property;
      const itemType = (_ref = property) != null ? _ref.itemType : _ref;
      if (type === 'string' || type === 'array' && itemType === 'string' || type === 'object' || type === 'number') {
        const existingValue = stringValues.get(name);
        if (existingValue == null && typeof property.defaultValue !== 'undefined') {
          // String(propertyDescription.default) deals with both strings and numbers
          const defaultValue = type === 'string' || type === 'number' ? String(property.defaultValue) : '';
          stringValues.set(name, defaultValue);
        }
      } else if (type === 'boolean') {
        const existingValue = booleanValues.get(name);
        if (existingValue == null && typeof property.defaultValue !== 'undefined' && property.defaultValue != null && typeof property.defaultValue === 'boolean') {
          booleanValues.set(name, property.defaultValue);
        } else {
          booleanValues.set(name, false);
        }
      } else if (type === 'enum' && property.enums != null) {
        const existingValue = enumValues.get(name);
        if (existingValue == null && typeof property.defaultValue !== 'undefined' && property.defaultValue != null && typeof property.defaultValue === 'string') {
          enumValues.set(name, property.defaultValue);
        }
      }
    });
  }

  _getSerializationArgs(props) {
    const { targetUri, config, debuggerTypeName } = props;
    const args = [(_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(targetUri) : 'local', config.launch ? 'launch' : 'attach', debuggerTypeName];
    return args;
  }

  _deserializeDebuggerConfig(props) {
    (0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).deserializeDebuggerConfig)(...this._getSerializationArgs(props), (transientSettings, savedSettings) => {
      const stringValues = new Map(savedSettings.stringValues || []);
      const { config } = props;
      if (config.launch) {
        const scriptPath = stringValues.get(config.scriptPropertyName) || (0, (_utils || _load_utils()).getActiveScriptPath)(config.scriptExtension);
        if (scriptPath !== '') {
          stringValues.set(config.scriptPropertyName, scriptPath);
        }
        const cwd = stringValues.get(config.cwdPropertyName) || (scriptPath.length > 0 ? (_nuclideUri || _load_nuclideUri()).default.dirname(scriptPath) : '');
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
      this._populateDefaultValues(config, stringValues, booleanValues, enumValues);
      this.setState({
        stringValues,
        booleanValues,
        enumValues
      });
    });
  }

  setState(newState) {
    super.setState(newState, () => this.props.configIsValidChanged(this._debugButtonShouldEnable()));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.debuggerTypeName !== this.props.debuggerTypeName) {
      this._deserializeDebuggerConfig(nextProps);
    }
  }

  componentWillMount() {
    this._deserializeDebuggerConfig(this.props);
  }

  componentDidMount() {
    var _this2 = this;

    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': (() => {
        var _ref4 = (0, _asyncToGenerator.default)(function* () {
          if (_this2._debugButtonShouldEnable()) {
            yield _this2._handleDebugButtonClick();
          }
        });

        return function coreConfirm() {
          return _ref4.apply(this, arguments);
        };
      })()
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _valueExists(property) {
    const { name, type } = property;
    if (type === 'string') {
      const value = this.state.stringValues.get(name);
      return value != null && value !== '';
    } else if (type === 'number') {
      const value = this.state.stringValues.get(name);
      return value != null && !isNaN(value);
    } else if (type === 'boolean') {
      const value = this.state.booleanValues.get(name);
      return value != null;
    }
    return false;
  }

  _debugButtonShouldEnable() {
    return this._getConfigurationProperties().filter(p => p.required).every(p => this._valueExists(p));
  }

  _getComponentForProperty(property) {
    var _ref2;

    const { name, type, description, required } = property;
    const formattedName = (0, (_string || _load_string()).capitalize)(name).replace(/([a-z])([A-Z])/, '$1 $2') + (required ? ' (Required)' : '');
    const nameLabel = _react.createElement(
      'label',
      null,
      formattedName,
      ':'
    );
    const itemType = (_ref2 = property) != null ? _ref2.itemType : _ref2;
    if (type === 'string' || type === 'array' && itemType === 'string' || type === 'object' || type === 'number') {
      const value = this.state.stringValues.get(name) || '';
      return _react.createElement(
        'div',
        null,
        nameLabel,
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          key: this.props.debuggerTypeName + ':' + name,
          placeholderText: description,
          value: value,
          onDidChange: newValue => {
            this.state.stringValues.set(name, newValue);
            this.props.configIsValidChanged(this._debugButtonShouldEnable());
          }
        })
      );
    } else if (type === 'boolean') {
      const checked = this.state.booleanValues.get(name) || false;
      return _react.createElement(
        'div',
        null,
        _react.createElement(
          'div',
          null,
          nameLabel
        ),
        _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
          checked: checked,
          label: description,
          onChange: newValue => {
            this.state.booleanValues.set(name, newValue);
            this.props.configIsValidChanged(this._debugButtonShouldEnable());
          }
        })
      );
    } else if (type === 'enum' && property.enums != null) {
      const enums = property.enums;
      const selectedValue = this.state.enumValues.get(name) || '';
      return _react.createElement(
        'div',
        null,
        nameLabel,
        _react.createElement((_RadioGroup || _load_RadioGroup()).default, {
          selectedIndex: enums.indexOf(selectedValue),
          optionLabels: enums.map((enumValue, i) => _react.createElement(
            'label',
            { key: i },
            enumValue
          )),
          onSelectedChange: index => {
            this.state.enumValues.set(name, enums[index]);
            this.props.configIsValidChanged(this._debugButtonShouldEnable());
          }
        })
      );
    }
    return _react.createElement(
      'div',
      null,
      _react.createElement(
        'label',
        null,
        'NO TRANSLATION YET FOR: ',
        (0, (_string || _load_string()).capitalize)(name)
      ),
      _react.createElement('hr', null)
    );
  }

  _renderHeader() {
    const { config } = this.props;
    return config.header != null ? config.header : null;
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'block' },
      this._renderHeader(),
      this._getConfigurationProperties().map(property => this._getComponentForProperty(property))
    );
  }

}
exports.default = AutoGenLaunchAttachUiComponent;