'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _event;













function _load_event() {return _event = require('../../../../../nuclide-commons/event');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}
var _react = _interopRequireWildcard(require('react'));var _TruncatedButton;
function _load_TruncatedButton() {return _TruncatedButton = _interopRequireDefault(require('../../../../../nuclide-commons-ui/TruncatedButton'));}var _DebuggerSteppingComponent;
function _load_DebuggerSteppingComponent() {return _DebuggerSteppingComponent = _interopRequireDefault(require('./DebuggerSteppingComponent'));}var _constants;
function _load_constants() {return _constants = require('../constants');}var _DebuggerControllerView;
function _load_DebuggerControllerView() {return _DebuggerControllerView = _interopRequireDefault(require('./DebuggerControllerView'));}var _goToLocation;
function _load_goToLocation() {return _goToLocation = require('../../../../../nuclide-commons-atom/go-to-location');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const DEVICE_PANEL_URL = 'atom://nuclide/devices'; /**
                                                    * Copyright (c) 2017-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the BSD-style license found in the
                                                    * LICENSE file in the root directory of this source tree. An additional grant
                                                    * of patent rights can be found in the PATENTS file in the same directory.
                                                    *
                                                    *  strict-local
                                                    * @format
                                                    */
class DebuggerControlsView extends _react.PureComponent


{


  constructor(props) {
    super(props);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      mode: props.service.getDebuggerMode(),
      hasDevicePanelService: false };

  }

  componentDidMount() {
    const { service } = this.props;
    this._disposables.add(
    (0, (_event || _load_event()).observableFromSubscribeFunction)(
    service.onDidChangeMode.bind(service)).
    subscribe(mode => this.setState({ mode })),
    atom.packages.serviceHub.consume('nuclide.devices', '0.0.0', provider =>
    this.setState({
      hasDevicePanelService: true })));



  }

  componentWillUnmount() {
    this._dispose();
  }

  _dispose() {
    this._disposables.dispose();
  }

  render() {
    const { service } = this.props;
    const { mode } = this.state;
    const debuggerStoppedNotice =
    mode !== (_constants || _load_constants()).DebuggerMode.STOPPED ? null :
    _react.createElement('div', { className: 'debugger-pane-content' },
      _react.createElement('div', { className: 'debugger-state-notice' },
        _react.createElement('span', null, 'The debugger is not attached.'),
        _react.createElement('div', { className: 'padded' },
          _react.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
            onClick: () =>
            atom.commands.dispatch(
            atom.views.getView(atom.workspace),
            'debugger:show-attach-dialog'),


            icon: 'nuclicon-debugger',
            label: 'Attach debugger...' }),

          _react.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
            onClick: () =>
            atom.commands.dispatch(
            atom.views.getView(atom.workspace),
            'debugger:show-launch-dialog'),


            icon: 'nuclicon-debugger',
            label: 'Launch debugger...' }),

          this.state.hasDevicePanelService ?
          _react.createElement((_TruncatedButton || _load_TruncatedButton()).default, {
            onClick: () => (0, (_goToLocation || _load_goToLocation()).goToLocation)(DEVICE_PANEL_URL),
            icon: 'device-mobile',
            label: 'Manage devices...' }) :

          null)));





    const debugeeRunningNotice =
    mode !== (_constants || _load_constants()).DebuggerMode.RUNNING ? null :
    _react.createElement('div', { className: 'debugger-pane-content' },
      _react.createElement('div', { className: 'debugger-state-notice' }, 'The debug target is currently running.'));





    return (
      _react.createElement('div', { className: 'debugger-container-new' },
        _react.createElement('div', { className: 'debugger-section-header' },
          _react.createElement((_DebuggerControllerView || _load_DebuggerControllerView()).default, { service: service })),

        _react.createElement('div', { className: 'debugger-section-header debugger-controls-section' },
          _react.createElement((_DebuggerSteppingComponent || _load_DebuggerSteppingComponent()).default, { service: service })),

        debugeeRunningNotice,
        debuggerStoppedNotice));


  }}exports.default = DebuggerControlsView;