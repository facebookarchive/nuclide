'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
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

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _logger;

function _load_logger() {
  return _logger = _interopRequireDefault(require('../logger'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const defaultTooltipOptions = {
  placement: 'bottom'
};

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

    this._togglePauseState = () => {
      const { focusedThread } = this.props.service.viewModel;
      if (focusedThread == null) {
        (_logger || _load_logger()).default.error('No focussed thread to pause/resume');
        return;
      }

      const { debuggerMode } = this.state;
      if (debuggerMode === (_constants || _load_constants()).DebuggerMode.RUNNING) {
        this._setWaitingForPause(true);
        focusedThread.pause();
      } else if (debuggerMode === (_constants || _load_constants()).DebuggerMode.PAUSED) {
        focusedThread.continue();
      } else {
        (_logger || _load_logger()).default.error('Unable to pause/resume in debug mode', debuggerMode);
      }
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const { service } = props;
    this.state = {
      debuggerMode: service.getDebuggerMode(),
      waitingForPause: false,
      customControlButtons: []
    };
  }

  componentDidMount() {
    const { service } = this.props;
    this._disposables.add(_rxjsBundlesRxMinJs.Observable.of(null).concat((0, (_event || _load_event()).observableFromSubscribeFunction)(service.onDidChangeMode.bind(service))).subscribe(() => {
      const debuggerMode = service.getDebuggerMode();
      const { focusedProcess } = service.viewModel;

      this.setState({
        debuggerMode,
        customControlButtons: focusedProcess == null ? [] : focusedProcess.configuration.properties.customControlButtons
      });
      if (this.state.waitingForPause && debuggerMode !== (_constants || _load_constants()).DebuggerMode.RUNNING) {
        this._setWaitingForPause(false);
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _setWaitingForPause(waiting) {
    this.setState({
      waitingForPause: waiting
    });
  }

  render() {
    const { debuggerMode, waitingForPause, customControlButtons } = this.state;
    const { service } = this.props;
    const { focusedThread, focusedProcess } = service.viewModel;
    const isReadonlyTarget = focusedProcess == null ? false : focusedProcess.configuration.capabilities.readOnlyTarget;
    const isPaused = debuggerMode === (_constants || _load_constants()).DebuggerMode.PAUSED;
    const isStopped = debuggerMode === (_constants || _load_constants()).DebuggerMode.STOPPED;
    const isPausing = debuggerMode === (_constants || _load_constants()).DebuggerMode.RUNNING && waitingForPause;
    const playPauseIcon = isPausing ? null : _react.createElement('span', {
      className: isPaused ? 'icon-playback-play' : 'icon-playback-pause'
    });

    const loadingIndicator = !isPausing ? null : _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
      className: 'nuclide-debugger-stepping-playpause-button-loading',
      size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.EXTRA_SMALL
    });

    const restartDebuggerButton = debuggerMode !== (_constants || _load_constants()).DebuggerMode.STOPPED ? _react.createElement((_Button || _load_Button()).Button, {
      icon: 'sync',
      className: 'nuclide-debugger-stepping-button-separated',
      disabled: isStopped,
      tooltip: Object.assign({}, defaultTooltipOptions, {
        title: 'Restart the debugger using the same settings as the current debug session',
        keyBindingCommand: 'nuclide-debugger:restart-debugging'
      }),
      onClick: () => service.restartProcess()
    }) : null;

    const DebuggerStepButton = props => _react.createElement(SVGButton, {
      icon: props.icon,
      disabled: props.disabled,
      tooltip: Object.assign({}, defaultTooltipOptions, {
        title: props.title,
        keyBindingCommand: props.keyBindingCommand
      }),
      onClick: props.onClick
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
          disabled: !isPaused || isReadonlyTarget || focusedThread == null,
          title: 'Step over',
          keyBindingCommand: 'nuclide-debugger:step-over',
          onClick: () => (0, (_nullthrows || _load_nullthrows()).default)(focusedThread).next()
        }),
        _react.createElement(DebuggerStepButton, {
          icon: STEP_INTO_ICON,
          disabled: !isPaused || isReadonlyTarget || focusedThread == null,
          title: 'Step into',
          keyBindingCommand: 'nuclide-debugger:step-into',
          onClick: () => (0, (_nullthrows || _load_nullthrows()).default)(focusedThread).stepIn()
        }),
        _react.createElement(DebuggerStepButton, {
          icon: STEP_OUT_ICON,
          disabled: !isPaused || isReadonlyTarget || focusedThread == null,
          title: 'Step out',
          keyBindingCommand: 'nuclide-debugger:step-out',
          onClick: () => (0, (_nullthrows || _load_nullthrows()).default)(focusedThread).stepOut()
        }),
        _react.createElement((_Button || _load_Button()).Button, {
          icon: 'primitive-square',
          disabled: isStopped,
          tooltip: Object.assign({}, defaultTooltipOptions, {
            title: 'Detach debugger',
            keyBindingCommand: 'nuclide-debugger:stop-debugging'
          }),
          onClick: () => service.stopProcess()
        })
      ),
      _react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { className: 'nuclide-debugger-stepping-buttongroup' },
        customControlButtons.map((specification, i) => {
          const buttonProps = Object.assign({}, specification, {
            tooltip: {
              title: specification.title
            }
          });
          return _react.createElement((_Button || _load_Button()).Button, Object.assign({}, buttonProps, { key: i }));
        })
      )
    );
  }
}
exports.default = DebuggerSteppingComponent;