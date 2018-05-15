'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));


















var _react = _interopRequireWildcard(require('react'));var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _nuclideUri;
function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../../../nuclide-commons/nuclideUri'));}var _Button;
function _load_Button() {return _Button = require('../../../../../nuclide-commons-ui/Button');}var _ButtonGroup;
function _load_ButtonGroup() {return _ButtonGroup = require('../../../../../nuclide-commons-ui/ButtonGroup');}var _Dropdown;
function _load_Dropdown() {return _Dropdown = require('../../../../../nuclide-commons-ui/Dropdown');}var _Tabs;
function _load_Tabs() {return _Tabs = _interopRequireDefault(require('../../../../../nuclide-commons-ui/Tabs'));}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _AtomServiceContainer;

function _load_AtomServiceContainer() {return _AtomServiceContainer = require('../AtomServiceContainer');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}



























// TODO those should be managed by the debugger store state
function setLastUsedDebugger(
host,
action,
debuggerDisplayName)
{
  const key = 'DEBUGGER_LAST_USED_' + host + '_' + action;
  localStorage.setItem(key, debuggerDisplayName);
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */ /* global localStorage */function getLastUsedDebugger(host, action) {const key = 'DEBUGGER_LAST_USED_' + host + '_' + action;return localStorage.getItem(key);}class DebuggerLaunchAttachUI extends _react.Component


{




  constructor(props) {
    super(props);this.












































































































    _setConfigValid = valid => {
      this.setState({
        configIsValid: valid });

    };this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();this._disposables.add(atom.commands.add('atom-workspace', { 'core:confirm': () => {if (this.state.configIsValid) {this._rememberTab(); // Close the dialog, but do it on the next tick so that the child
          // component gets to handle the event first (and start the debugger).
          process.nextTick(this.props.dialogCloser);}} }), atom.commands.add('atom-workspace', { 'core:cancel': () => {this._rememberTab();this.props.dialogCloser();} }));this.state = { selectedProviderTab: null, configIsValid: false, enabledProviders: [] };}_rememberTab() {// Remember the last tab the user used for this connection when the "launch/attach"
    // button is clicked.
    const host = (_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.connection) : 'local';if (this.state.selectedProviderTab != null) {setLastUsedDebugger(host, this.props.dialogMode, this.state.selectedProviderTab || '');}}componentWillMount() {const host = (_nuclideUri || _load_nuclideUri()).default.isRemote(this.props.connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(this.props.connection) : 'local';this._filterProviders(host);this.setState({ selectedProviderTab: getLastUsedDebugger(host, this.props.dialogMode) });}componentWillReceiveProps(nextProps) {const host = (_nuclideUri || _load_nuclideUri()).default.isRemote(nextProps.connection) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(nextProps.connection) : 'local';this._filterProviders(host);this.setState({ selectedProviderTab: getLastUsedDebugger(host, nextProps.dialogMode) });}componentWillUnmount() {this._disposables.dispose();}_getProviderIfEnabled(provider) {var _this = this;return (0, _asyncToGenerator.default)(function* () {const enabled = yield provider.getCallbacksForAction(_this.props.dialogMode).isEnabled();return enabled ? provider : null;})();}_filterProviders(key) {this.setState({ enabledProviders: [] });_rxjsBundlesRxMinJs.Observable.merge(...(this.props.providers.get(key) || []).map(provider => _rxjsBundlesRxMinJs.Observable.fromPromise(this._getProviderIfEnabled(provider)))).filter(provider => provider != null).map(provider => {if (!(provider != null)) {throw new Error('Invariant violation: "provider != null"');}return provider.getCallbacksForAction(this.props.dialogMode).getDebuggerTypeNames().map(debuggerName => {return { provider, debuggerName };});}).scan((arr, provider) => arr.concat(provider), []).subscribe(enabledProviders => {this.setState({ enabledProviders });});}_getTabsFromEnabledProviders(enabledProviders) {const tabs = this.state.enabledProviders.map(debuggerType => ({
      name: debuggerType.debuggerName,
      tabContent:
      _react.createElement('span', { title: debuggerType.debuggerName },
        debuggerType.debuggerName) })).



    sort((a, b) => a.name.localeCompare(b.name));
    return tabs;
  }

  setState(
  partialState,
  callback)
  {
    if (typeof partialState === 'function') {
      super.setState(partialState, callback);
    } else {
      const fullState = Object.assign({},
      this.state,
      partialState);

      if (fullState.selectedProviderTab == null) {
        const tabs = this._getTabsFromEnabledProviders(
        fullState.enabledProviders);

        if (tabs.length > 0) {
          const firstTab = tabs[0];
          fullState.selectedProviderTab = firstTab.name;
        }
      }
      super.setState(fullState, callback);
    }
  }

  render() {
    const tabs = this._getTabsFromEnabledProviders(this.state.enabledProviders);
    let providerContent = null;
    if (tabs.length > 0) {
      let selectedTab =
      this.state.selectedProviderTab != null ?
      this.state.selectedProviderTab :
      this.state.enabledProviders[0].debuggerName;
      let provider = this.state.enabledProviders.find(
      p => p.debuggerName === selectedTab);

      if (provider == null) {
        provider = this.state.enabledProviders[0];
        selectedTab = provider.debuggerName;
      }

      const debuggerConfigPage = provider.provider.
      getCallbacksForAction(this.props.dialogMode).
      getComponent(selectedTab, valid => this._setConfigValid(valid));

      providerContent =
      _react.createElement('div', null,
        _react.createElement((_Tabs || _load_Tabs()).default, {
          className: 'debugger-launch-attach-tabs',
          tabs: tabs,
          activeTabName: this.state.selectedProviderTab,
          triggeringEvent: 'onClick',
          onActiveTabChange: newTab => {
            this._setConfigValid(false);
            this.setState({ selectedProviderTab: newTab.name });
          } }),

        _react.createElement('div', { className: 'debugger-launch-attach-tabcontent' },
          debuggerConfigPage));



    } else {
      // No debugging providers available.
      providerContent =
      _react.createElement('div', { className: 'debugger-launch-attach-tabcontent' }, 'No debuggers installed, look for available debuggers on',
        ' ',
        _react.createElement('a', { href: 'https://atom.io/packages/search?q=atom-ide-debugger-' }, 'atom.io/packages'));




    }

    return (
      _react.createElement('div', { className: 'padded debugger-launch-attach-container' },
        (0, (_AtomServiceContainer || _load_AtomServiceContainer()).isNuclideEnvironment)() ?
        _react.createElement('h1', { className: 'debugger-launch-attach-header' },
          _react.createElement('span', { className: 'padded' },
            this.props.dialogMode === 'attach' ?
            'Attach debugger to ' :
            'Launch debugger on '),

          _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
            className: 'inline',
            options: this.props.connectionOptions,
            onChange: value => this.props.connectionChanged(value),
            size: 'xs',
            value: this.props.connection })) :


        null,
        providerContent,
        _react.createElement('div', { className: 'debugger-launch-attach-actions' },
          _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, null,
            _react.createElement((_Button || _load_Button()).Button, {
                onClick: () =>
                atom.commands.dispatch(
                atom.views.getView(atom.workspace),
                'core:cancel') }, 'Cancel'),




            _react.createElement((_Button || _load_Button()).Button, {
                buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
                disabled: !this.state.configIsValid,
                onClick: () =>
                atom.commands.dispatch(
                atom.views.getView(atom.workspace),
                'core:confirm') },


              this.props.dialogMode === 'attach' ? 'Attach' : 'Launch')))));





  }}exports.default = DebuggerLaunchAttachUI;