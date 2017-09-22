'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerSteppingComponent = undefined;

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

var _react = _interopRequireWildcard(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _ChromeActionRegistryActions;

function _load_ChromeActionRegistryActions() {
  return _ChromeActionRegistryActions = _interopRequireDefault(require('./ChromeActionRegistryActions'));
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const defaultTooltipOptions = {
  placement: 'bottom'
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

const STEP_OVER_ICON = _react.createElement(
  'svg',
  { viewBox: '0 0 100 100' },
  _react.createElement('circle', { cx: '46', cy: '63', r: '10' }),
  _react.createElement('path', {
    d: 'M83.8,54.7c-6.5-16.6-20.7-28.1-37.2-28.1c-19.4,0-35.6,16-39.9,' + '37.3l11.6,2.9c3-16.2,14.5-28.2,28.2-28.2 c11,0,20.7,7.8,25.6,' + '19.3l-9.6,2.7l20.8,14.7L93.7,52L83.8,54.7z'
  })
);

const STEP_INTO_ICON = _react.createElement(
  'svg',
  { viewBox: '0 0 100 100' },
  _react.createElement('circle', { cx: '50', cy: '75', r: '10' }),
  _react.createElement('polygon', { points: '42,20 57,20 57,40 72,40 50,60 28,40 42,40' })
);

const STEP_OUT_ICON = _react.createElement(
  'svg',
  { viewBox: '0 0 100 100' },
  _react.createElement('circle', { cx: '50', cy: '75', r: '10' }),
  _react.createElement('polygon', {
    points: '42,20 57,20 57,40 72,40 50,60 28,40 42,40',
    transform: 'rotate(180, 50, 40)'
  })
);

function SVGButton(props) {
  return _react.createElement(
    (_Button || _load_Button()).Button,
    {
      className: 'nuclide-debugger-stepping-svg-button',
      onClick: props.onClick,
      disabled: props.disabled,
      tooltip: props.tooltip },
    _react.createElement(
      'div',
      null,
      props.icon
    )
  );
}

class DebuggerSteppingComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._setWaitingForPause = waiting => {
      this.setState({
        waitingForPause: waiting
      });
    };

    this._togglePauseState = () => {
      if (this.state.debuggerMode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING) {
        this._setWaitingForPause(true);
      }

      // ChromeActionRegistryActions.PAUSE actually toggles paused state.
      const actionId = this.state.debuggerMode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING ? (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.PAUSE : (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.RUN;
      this.props.actions.triggerDebuggerAction(actionId);
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const { debuggerStore } = props;
    this.state = {
      allowSingleThreadStepping: Boolean(debuggerStore.getSettings().get('SingleThreadStepping')),
      debuggerMode: debuggerStore.getDebuggerMode(),
      pauseOnException: debuggerStore.getTogglePauseOnException(),
      pauseOnCaughtException: debuggerStore.getTogglePauseOnCaughtException(),
      enableSingleThreadStepping: debuggerStore.getEnableSingleThreadStepping(),
      customControlButtons: debuggerStore.getCustomControlButtons(),
      waitingForPause: false
    };
  }

  componentDidMount() {
    const { debuggerStore } = this.props;
    this._disposables.add(debuggerStore.onChange(() => {
      this.setState({
        allowSingleThreadStepping: Boolean(debuggerStore.getSettings().get('SingleThreadStepping')),
        debuggerMode: debuggerStore.getDebuggerMode(),
        pauseOnException: debuggerStore.getTogglePauseOnException(),
        pauseOnCaughtException: debuggerStore.getTogglePauseOnCaughtException(),
        enableSingleThreadStepping: debuggerStore.getEnableSingleThreadStepping(),
        customControlButtons: debuggerStore.getCustomControlButtons()
      });

      if (this.state.waitingForPause && debuggerStore.getDebuggerMode() !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING) {
        this._setWaitingForPause(false);
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const {
      debuggerMode,
      pauseOnException,
      pauseOnCaughtException,
      allowSingleThreadStepping,
      enableSingleThreadStepping,
      customControlButtons,
      waitingForPause
    } = this.state;
    const { actions, debuggerStore } = this.props;
    const isReadonlyTarget = debuggerStore.getIsReadonlyTarget();
    const isPaused = debuggerMode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.PAUSED;
    const isStopped = debuggerMode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STOPPED;
    const isPausing = debuggerMode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.RUNNING && waitingForPause;
    const playPauseIcon = isPausing ? null : _react.createElement('span', {
      className: isPaused ? 'icon-playback-play' : 'icon-playback-pause'
    });

    const loadingIndicator = !isPausing ? null : _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
      className: 'nuclide-debugger-stepping-playpause-button-loading',
      size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.EXTRA_SMALL
    });

    // "Set Source Paths" is only available if the current debugger provides
    // this functionality.
    const setSourcePathsButton = !this.props.debuggerStore.getCanSetSourcePaths() ? null : _react.createElement((_Button || _load_Button()).Button, {
      className: 'nuclide-debugger-set-source-path-button',
      icon: 'file-code',
      title: 'Configure source file paths',
      onClick: () => actions.configureSourcePaths()
    });

    const restartDebuggerButton = !this.props.debuggerStore.getCanRestartDebugger() ? null : _react.createElement((_Button || _load_Button()).Button, {
      icon: 'sync',
      className: 'nuclide-debugger-stepping-button-separated',
      disabled: isStopped,
      tooltip: Object.assign({}, defaultTooltipOptions, {
        title: 'Restart the debugger using the same settings as the current debug session',
        keyBindingCommand: 'nuclide-debugger:restart-debugging'
      }),
      onClick: () => actions.restartDebugger()
    });

    const DebuggerStepButton = props => _react.createElement(SVGButton, {
      icon: props.icon,
      disabled: props.disabled,
      tooltip: Object.assign({}, defaultTooltipOptions, {
        title: props.title,
        keyBindingCommand: props.keyBindingCommand
      }),
      onClick: actions.triggerDebuggerAction.bind(actions, props.action)
    });

    return _react.createElement(
      'div',
      { className: 'nuclide-debugger-stepping-component' },
      _react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { className: 'nuclide-debugger-stepping-buttongroup' },
        restartDebuggerButton,
        _react.createElement(
          (_Button || _load_Button()).Button,
          {
            disabled: isStopped || isPausing || isReadonlyTarget,
            tooltip: Object.assign({}, defaultTooltipOptions, {
              title: isPausing ? 'Waiting for pause...' : isPaused ? 'Continue' : 'Pause',
              keyBindingCommand: isPaused ? 'nuclide-debugger:continue-debugging' : undefined
            }),
            onClick: this._togglePauseState.bind(this) },
          _react.createElement(
            'div',
            { className: 'nuclide-debugger-stepping-playpause-button' },
            playPauseIcon,
            loadingIndicator
          )
        ),
        _react.createElement(DebuggerStepButton, {
          icon: STEP_OVER_ICON,
          disabled: !isPaused || isReadonlyTarget,
          title: 'Step over',
          keyBindingCommand: 'nuclide-debugger:step-over',
          action: (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_OVER
        }),
        _react.createElement(DebuggerStepButton, {
          icon: STEP_INTO_ICON,
          disabled: !isPaused || isReadonlyTarget,
          title: 'Step into',
          keyBindingCommand: 'nuclide-debugger:step-into',
          action: (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_INTO
        }),
        _react.createElement(DebuggerStepButton, {
          icon: STEP_OUT_ICON,
          disabled: !isPaused || isReadonlyTarget,
          title: 'Step out',
          keyBindingCommand: 'nuclide-debugger:step-out',
          action: (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_OUT
        }),
        _react.createElement((_Button || _load_Button()).Button, {
          icon: 'primitive-square',
          disabled: isStopped,
          tooltip: Object.assign({}, defaultTooltipOptions, {
            title: 'Detach debugger',
            keyBindingCommand: 'nuclide-debugger:stop-debugging'
          }),
          onClick: () => actions.stopDebugging()
        }),
        setSourcePathsButton
      ),
      _react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { className: 'nuclide-debugger-stepping-buttongroup' },
        customControlButtons.map((specification, i) => _react.createElement((_Button || _load_Button()).Button, Object.assign({}, specification, { key: i })))
      ),
      _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'nuclide-debugger-exception-checkbox',
        onChange: () => actions.togglePauseOnException(!pauseOnException),
        checked: pauseOnException,
        disabled: isReadonlyTarget,
        label: pauseOnException ? 'Pause on' : 'Pause on exception'
      }),
      pauseOnException ? [_react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { key: 'first' },
        _react.createElement(
          (_Button || _load_Button()).Button,
          {
            size: 'EXTRA_SMALL',
            selected: !pauseOnCaughtException,
            onClick: () => actions.togglePauseOnCaughtException(false) },
          'uncaught'
        ),
        _react.createElement(
          (_Button || _load_Button()).Button,
          {
            size: 'EXTRA_SMALL',
            selected: pauseOnCaughtException,
            onClick: () => actions.togglePauseOnCaughtException(true) },
          'any'
        )
      ), _react.createElement(
        'span',
        {
          key: 'second',
          className: 'nuclide-debugger-exception-fragment' },
        ' exception'
      )] : null,
      allowSingleThreadStepping ? _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        disabled: isStopped || isReadonlyTarget,
        className: 'nuclide-debugger-exception-checkbox',
        onChange: () => actions.toggleSingleThreadStepping(!enableSingleThreadStepping),
        checked: enableSingleThreadStepping,
        label: 'Single Thread Stepping'
      }) : null
    );
  }
}
exports.DebuggerSteppingComponent = DebuggerSteppingComponent;