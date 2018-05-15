'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _LoadingSpinner;













function _load_LoadingSpinner() {return _LoadingSpinner = require('../../../../../nuclide-commons-ui/LoadingSpinner');}var _event;




function _load_event() {return _event = require('../../../../../nuclide-commons/event');}var _observable;
function _load_observable() {return _observable = require('../../../../../nuclide-commons/observable');}
var _react = _interopRequireWildcard(require('react'));var _Button;
function _load_Button() {return _Button = require('../../../../../nuclide-commons-ui/Button');}var _ButtonGroup;
function _load_ButtonGroup() {return _ButtonGroup = require('../../../../../nuclide-commons-ui/ButtonGroup');}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _constants;
function _load_constants() {return _constants = require('../constants');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _logger;
function _load_logger() {return _logger = _interopRequireDefault(require('../logger'));}var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}











const defaultTooltipOptions = {
  placement: 'bottom' }; /**
                          * Copyright (c) 2017-present, Facebook, Inc.
                          * All rights reserved.
                          *
                          * This source code is licensed under the BSD-style license found in the
                          * LICENSE file in the root directory of this source tree. An additional grant
                          * of patent rights can be found in the PATENTS file in the same directory.
                          *
                          * 
                          * @format
                          */const STEP_OVER_ICON = _react.createElement('svg', { viewBox: '0 0 100 100' }, _react.createElement('circle', { cx: '46', cy: '63', r: '10' }), _react.createElement('path', { d: 'M83.8,54.7c-6.5-16.6-20.7-28.1-37.2-28.1c-19.4,0-35.6,16-39.9,' + '37.3l11.6,2.9c3-16.2,14.5-28.2,28.2-28.2 c11,0,20.7,7.8,25.6,' + '19.3l-9.6,2.7l20.8,14.7L93.7,52L83.8,54.7z' }));





const STEP_INTO_ICON =
_react.createElement('svg', { viewBox: '0 0 100 100' },
  _react.createElement('circle', { cx: '50', cy: '75', r: '10' }),
  _react.createElement('polygon', { points: '42,20 57,20 57,40 72,40 50,60 28,40 42,40' }));



const STEP_OUT_ICON =
_react.createElement('svg', { viewBox: '0 0 100 100' },
  _react.createElement('circle', { cx: '50', cy: '75', r: '10' }),
  _react.createElement('polygon', {
    points: '42,20 57,20 57,40 72,40 50,60 28,40 42,40',
    transform: 'rotate(180, 50, 40)' }));




function SVGButton(props)




{
  return (
    _react.createElement((_Button || _load_Button()).Button, {
        className: 'debugger-stepping-svg-button',
        onClick: props.onClick,
        disabled: props.disabled,
        tooltip: props.tooltip },
      _react.createElement('div', null, props.icon)));


}

class DebuggerSteppingComponent extends _react.Component


{


  constructor(props) {
    super(props);this.

































































    _togglePauseState = () => {
      const pausableThread = this._getPausableThread();
      if (pausableThread == null) {
        (_logger || _load_logger()).default.error('No thread to pause/resume');
        return;
      }

      if (pausableThread.stopped) {
        pausableThread.continue();
      } else {
        this._setWaitingForPause(true);
        pausableThread.pause();
      }
    };this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();const { service } = props;this.state = { debuggerMode: service.getDebuggerMode(), waitingForPause: false, customControlButtons: [] };}componentDidMount() {const { service } = this.props;const model = service.getModel();this._disposables.add(_rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(service.onDidChangeMode.bind(service)), (0, (_event || _load_event()).observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model)), (0, (_event || _load_event()).observableFromSubscribeFunction)(service.viewModel.onDidFocusStackFrame.bind(service.viewModel))).startWith(null).let((0, (_observable || _load_observable()).fastDebounce)(10)).subscribe(() => {const debuggerMode = service.getDebuggerMode();const { focusedProcess } = service.viewModel;this.setState({ debuggerMode, customControlButtons: focusedProcess == null ? [] : focusedProcess.configuration.properties.customControlButtons });if (this.state.waitingForPause && debuggerMode !== (_constants || _load_constants()).DebuggerMode.RUNNING) {this._setWaitingForPause(false);}}));}componentWillUnmount() {this._disposables.dispose();}_setWaitingForPause(waiting) {this.setState({ waitingForPause: waiting });}_getPausableThread() {const { focusedThread, focusedProcess } = this.props.service.viewModel;if (focusedThread != null) {return focusedThread;} else if (focusedProcess != null) {return focusedProcess.getAllThreads()[0];} else {return null;}}

  render() {
    const { debuggerMode, waitingForPause, customControlButtons } = this.state;
    const { service } = this.props;
    const { focusedThread } = service.viewModel;
    const isPaused = debuggerMode === (_constants || _load_constants()).DebuggerMode.PAUSED;
    const isStopped = debuggerMode === (_constants || _load_constants()).DebuggerMode.STOPPED;
    const isPausing = debuggerMode === (_constants || _load_constants()).DebuggerMode.RUNNING && waitingForPause;
    const playPauseIcon = isPausing ? null :
    _react.createElement('span', {
      className: isPaused ? 'icon-playback-play' : 'icon-playback-pause' });



    const loadingIndicator = !isPausing ? null :
    _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
      className: 'debugger-stepping-playpause-button-loading',
      size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.EXTRA_SMALL });



    const restartDebuggerButton =
    debuggerMode !== (_constants || _load_constants()).DebuggerMode.STOPPED ?
    _react.createElement((_Button || _load_Button()).Button, {
      icon: 'sync',
      className: 'debugger-stepping-button-separated',
      disabled: isStopped,
      tooltip: Object.assign({},
      defaultTooltipOptions, {
        title:
        'Restart the debugger using the same settings as the current debug session',
        keyBindingCommand: 'debugger:restart-debugging' }),

      onClick: () => service.restartProcess() }) :

    null;

    const DebuggerStepButton = props =>








    _react.createElement(SVGButton, {
      icon: props.icon,
      disabled: props.disabled,
      tooltip: Object.assign({},
      defaultTooltipOptions, {
        title: props.title,
        keyBindingCommand: props.keyBindingCommand }),

      onClick: props.onClick });



    const pausableThread = this._getPausableThread();
    let playPauseTitle;
    if (isPausing) {
      playPauseTitle = 'Waiting for pause...';
    } else if (isPaused) {
      playPauseTitle = 'Continue';
    } else if (pausableThread == null) {
      playPauseTitle = 'No running threads to pause!';
    } else {
      playPauseTitle = 'Pause';
    }

    return (
      _react.createElement('div', { className: 'debugger-stepping-component' },
        _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, { className: 'debugger-stepping-buttongroup' },
          restartDebuggerButton,
          _react.createElement((_Button || _load_Button()).Button, {
              disabled: isPausing || pausableThread == null,
              tooltip: Object.assign({},
              defaultTooltipOptions, {
                title: playPauseTitle,
                keyBindingCommand: isPaused ?
                'debugger:continue-debugging' :
                undefined }),

              onClick: this._togglePauseState.bind(this) },
            _react.createElement('div', { className: 'debugger-stepping-playpause-button' },
              playPauseIcon,
              loadingIndicator)),


          _react.createElement(DebuggerStepButton, {
            icon: STEP_OVER_ICON,
            disabled: !isPaused || focusedThread == null,
            title: 'Step over',
            keyBindingCommand: 'debugger:step-over',
            onClick: () => (0, (_nullthrows || _load_nullthrows()).default)(focusedThread).next() }),

          _react.createElement(DebuggerStepButton, {
            icon: STEP_INTO_ICON,
            disabled: !isPaused || focusedThread == null,
            title: 'Step into',
            keyBindingCommand: 'debugger:step-into',
            onClick: () => (0, (_nullthrows || _load_nullthrows()).default)(focusedThread).stepIn() }),

          _react.createElement(DebuggerStepButton, {
            icon: STEP_OUT_ICON,
            disabled: !isPaused || focusedThread == null,
            title: 'Step out',
            keyBindingCommand: 'debugger:step-out',
            onClick: () => (0, (_nullthrows || _load_nullthrows()).default)(focusedThread).stepOut() }),

          _react.createElement((_Button || _load_Button()).Button, {
            icon: 'primitive-square',
            disabled: isStopped,
            tooltip: Object.assign({},
            defaultTooltipOptions, {
              title: 'Detach debugger',
              keyBindingCommand: 'debugger:stop-debugging' }),

            onClick: () => service.stopProcess() })),


        _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, { className: 'debugger-stepping-buttongroup' },
          customControlButtons.map((specification, i) => {
            const buttonProps = Object.assign({},
            specification, {
              tooltip: {
                title: specification.title } });


            return _react.createElement((_Button || _load_Button()).Button, Object.assign({}, buttonProps, { key: i }));
          }))));



  }}exports.default = DebuggerSteppingComponent;