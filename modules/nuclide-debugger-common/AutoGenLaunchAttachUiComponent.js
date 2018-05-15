'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));


















var _react = _interopRequireWildcard(require('react'));var _idx;

function _load_idx() {return _idx = _interopRequireDefault(require('idx'));}var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _Checkbox;
function _load_Checkbox() {return _Checkbox = require('../nuclide-commons-ui/Checkbox');}var _RadioGroup;
function _load_RadioGroup() {return _RadioGroup = _interopRequireDefault(require('../nuclide-commons-ui/RadioGroup'));}var _AtomInput;
function _load_AtomInput() {return _AtomInput = require('../nuclide-commons-ui/AtomInput');}var _nuclideUri;
function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../nuclide-commons/nuclideUri'));}var _string;
function _load_string() {return _string = require('../nuclide-commons/string');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));}var _debugger;
function _load_debugger() {return _debugger = require('../nuclide-commons-atom/debugger');}var _DebuggerConfigSerializer;
function _load_DebuggerConfigSerializer() {return _DebuggerConfigSerializer = require('./DebuggerConfigSerializer');}var _SelectableFilterableProcessTable;



function _load_SelectableFilterableProcessTable() {return _SelectableFilterableProcessTable = _interopRequireDefault(require('./SelectableFilterableProcessTable'));}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}















// extension must be a string starting with a '.' like '.js' or '.py'
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
 */function getActiveScriptPath(extension) {const center = atom.workspace.getCenter ? atom.workspace.getCenter() : atom.workspace;const activeEditor = center.getActiveTextEditor();if (activeEditor == null || !activeEditor.getPath() || !(0, (_nullthrows || _load_nullthrows()).default)(activeEditor.getPath()).endsWith(extension)) {return '';
  }
  return (_nuclideUri || _load_nuclideUri()).default.getPath((0, (_nullthrows || _load_nullthrows()).default)(activeEditor.getPath()));
}

class AutoGenLaunchAttachUiComponent extends _react.Component


{


  constructor(props) {var _this;
    _this = super(props);this.











































































































































































































































































































    _handleDebugButtonClick = (0, _asyncToGenerator.default)(function* () {
      const { targetUri, config } = _this.props;
      const {
        atomInputValues,
        booleanValues,
        enumValues,
        processTableValues } =
      _this.state;
      const { launch, vsAdapterType, threads } = config;

      const stringValues = new Map();
      const stringArrayValues = new Map();
      const objectValues = new Map();
      const numberValues = new Map();
      const jsonValues = new Map();
      _this._getConfigurationProperties().
      filter(
      function (property) {return property.visible && atomInputValues.has(property.name);}).

      forEach(function (property) {var _ref3;
        const { name, type } = property;
        const itemType = (_ref3 = property) != null ? _ref3.itemType : _ref3;
        const value = atomInputValues.get(name) || '';
        if (type === 'string') {
          stringValues.set(name, value);
        } else if (type === 'array' && itemType === 'string') {
          stringArrayValues.set(name, (0, (_string || _load_string()).shellParse)(value));
        } else if (type === 'object') {
          const objectValue = {};
          (0, (_string || _load_string()).shellParse)(value).forEach(function (variable) {
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
      jsonValues].
      forEach(function (map) {
        map.forEach(function (value, key) {
          values[key] = value;
        });
      });

      _this._getConfigurationProperties().
      filter(
      function (property) {return !property.visible && !atomInputValues.has(property.name);}).

      forEach(function (property) {var _ref4;
        const { name } = property;
        values[name] = (_ref4 = property) != null ? _ref4.defaultValue : _ref4;
      });

      const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
      debuggerService.startVspDebugging({
        targetUri,
        debugMode: launch ? 'launch' : 'attach',
        adapterType: vsAdapterType,
        adapterExecutable: null,
        config: values,
        capabilities: { threads },
        properties: {
          customControlButtons: [],
          threadsComponentTitle: 'Threads' },

        customDisposable: new (_UniversalDisposable || _load_UniversalDisposable()).default() });


      (0, (_DebuggerConfigSerializer || _load_DebuggerConfigSerializer()).serializeDebuggerConfig)(..._this._getSerializationArgs(_this.props), {
        atomInputValues: Array.from(atomInputValues),
        booleanValues: Array.from(booleanValues),
        enumValues: Array.from(enumValues) });

    });this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();this.state = { atomInputValues: new Map(), booleanValues: new Map(), enumValues: new Map(), processTableValues: new Map() };}_atomInputType(type, itemType) {return type === 'string' || type === 'array' && itemType === 'string' || type === 'object' || type === 'number' || type === 'json';}_getConfigurationProperties() {const { config } = this.props;return config.properties;}_populateDefaultValues(config, atomInputValues, booleanValues, enumValues) {config.properties.filter(property => property.visible).map(property => {var _ref;const { name, type } = property;const itemType = (_ref = property) != null ? _ref.itemType : _ref;if (this._atomInputType(type, itemType)) {const existingValue = atomInputValues.get(name);if (existingValue == null && typeof property.defaultValue !== 'undefined') {// String(propertyDescription.default) deals with both strings and numbers and arrays
          // JSON.stringify for JSON
          // empty string otherwise
          const defaultValue = type === 'string' || type === 'number' || type === 'array' ? String(property.defaultValue) : type === 'json' ? JSON.stringify(property.defaultValue) : '';atomInputValues.set(name, defaultValue);}} else if (type === 'boolean') {const existingValue = booleanValues.get(name);if (existingValue == null && typeof property.defaultValue !== 'undefined' && property.defaultValue != null && typeof property.defaultValue === 'boolean') {booleanValues.set(name, property.defaultValue);} else {booleanValues.set(name, false);}} else if (type === 'enum' && property.enums != null) {const existingValue = enumValues.get(name);if (existingValue == null && typeof property.defaultValue !== 'undefined' && property.defaultValue != null && typeof property.defaultValue === 'string') {enumValues.set(name, property.defaultValue);}}});}_getSerializationArgs(props) {const { targetUri, config, debuggerTypeName } = props;const args = [(_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(targetUri) : 'local', config.launch ? 'launch' : 'attach', debuggerTypeName];return args;}_deserializeDebuggerConfig(props) {(0, (_DebuggerConfigSerializer || _load_DebuggerConfigSerializer()).deserializeDebuggerConfig)(...this._getSerializationArgs(props), (transientSettings, savedSettings) => {const { config } = props;const { cwdPropertyName, scriptPropertyName, launch, scriptExtension } = config;const atomInputValues = new Map(savedSettings.atomInputValues || []);const scriptPath = scriptPropertyName != null && atomInputValues.get(scriptPropertyName) || scriptExtension != null && getActiveScriptPath(scriptExtension) || '';if (cwdPropertyName != null) {const cwd = atomInputValues.get(cwdPropertyName) || (scriptPath !== '' ? (_nuclideUri || _load_nuclideUri()).default.dirname(scriptPath) : '');if (cwd !== '') {atomInputValues.set(cwdPropertyName, cwd);}}if (launch) {if (scriptPath !== '' && scriptPropertyName != null) {atomInputValues.set(scriptPropertyName, scriptPath);}}const booleanValues = new Map(savedSettings.booleanValues || []);const enumValues = new Map(savedSettings.enumValues || []);this._populateDefaultValues(config, atomInputValues, booleanValues, enumValues); // do not serialize and deserialize processes
      const processTableValues = new Map();this.setState({ atomInputValues, booleanValues, enumValues, processTableValues });});}setState(newState) {super.setState(newState, () => this.props.configIsValidChanged(this._debugButtonShouldEnable()));}componentWillReceiveProps(nextProps) {if (nextProps.debuggerTypeName !== this.props.debuggerTypeName) {this._deserializeDebuggerConfig(nextProps);}}componentWillMount() {this._deserializeDebuggerConfig(this.props);}componentDidMount() {var _this2 = this;this._disposables.add(atom.commands.add('atom-workspace', { 'core:confirm': (() => {var _ref6 = (0, _asyncToGenerator.default)(function* () {if (_this2._debugButtonShouldEnable()) {yield _this2._handleDebugButtonClick();}});return function coreConfirm() {return _ref6.apply(this, arguments);};})() }));}componentWillUnmount() {this._disposables.dispose();}_valueExists(property) {const { name, type } = property;if (type === 'string') {const value = this.state.atomInputValues.get(name);return value != null && value !== '';} else if (type === 'number') {const value = this.state.atomInputValues.get(name);return value != null && !isNaN(value);} else if (type === 'boolean') {const value = this.state.booleanValues.get(name);return value != null;} else if (type === 'enum') {const value = this.state.enumValues.get(name);return value != null;} else if (type === 'process') {const value = this.state.processTableValues.get(name);return value != null;}return false;}_debugButtonShouldEnable() {return this._getConfigurationProperties().filter(p => p.required).every(p => this._valueExists(p));}_getComponentForProperty(property) {var _ref2;const { name, type, description, required } = property;const formattedName = (0, (_string || _load_string()).capitalize)(name.replace(/([A-Z])/g, ' $1')) + (required ? ' (Required)' : '');const nameLabel = _react.createElement('label', null, formattedName, ':');const itemType = (_ref2 = property) != null ? _ref2.itemType : _ref2;if (this._atomInputType(type, itemType)) {const value = this.state.atomInputValues.get(name) || '';return _react.createElement('div', null, nameLabel, _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, { key: this.props.debuggerTypeName + ':' + name, placeholderText: description, value: value, onDidChange: newValue => {this.state.atomInputValues.set(name, newValue);this.props.configIsValidChanged(this._debugButtonShouldEnable());} }));} else if (type === 'boolean') {const checked = this.state.booleanValues.get(name) || false;return _react.createElement('div', null, _react.createElement('div', null, nameLabel), _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, { checked: checked, label: description, onChange: newValue => {this.state.booleanValues.set(name, newValue);this.props.configIsValidChanged(this._debugButtonShouldEnable());} }));} else if (type === 'enum' && property.enums != null) {const enums = property.enums;const selectedValue = this.state.enumValues.get(name) || '';return _react.createElement('div', null, nameLabel, _react.createElement((_RadioGroup || _load_RadioGroup()).default, { selectedIndex: enums.indexOf(selectedValue), optionLabels: enums.map((enumValue, i) => _react.createElement('label', { key: i }, enumValue)), onSelectedChange: index => {this.state.enumValues.set(name, enums[index]);this.props.configIsValidChanged(this._debugButtonShouldEnable());} }));} else if (type === 'process') {return _react.createElement('div', null, nameLabel, _react.createElement((_SelectableFilterableProcessTable || _load_SelectableFilterableProcessTable()).default, { targetUri: this.props.targetUri, onSelect: selectedProcess => {if (selectedProcess != null) {this.state.processTableValues.set(name, selectedProcess.pid);} else {this.state.processTableValues.delete(name);}this.props.configIsValidChanged(this._debugButtonShouldEnable());} }));}return _react.createElement('div', null, _react.createElement('label', null, 'NO TRANSLATION YET FOR: ', (0, (_string || _load_string()).capitalize)(name)), _react.createElement('hr', null));}render() {const { debuggerTypeName, config } = this.props;return _react.createElement('div', { className: 'block' }, config.header, this._getConfigurationProperties().filter(property => property.visible).map(property => _react.createElement('div', { key: debuggerTypeName + ':' + property.name }, this._getComponentForProperty(property))));}}exports.default = AutoGenLaunchAttachUiComponent;