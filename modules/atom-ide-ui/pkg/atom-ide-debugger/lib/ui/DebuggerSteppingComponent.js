"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _LoadingSpinner() {
  const data = require("../../../../../nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _Button() {
  const data = require("../../../../../nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../../../nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _constants() {
  const data = require("../constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _logger() {
  const data = _interopRequireDefault(require("../logger"));

  _logger = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
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
const defaultTooltipOptions = {
  placement: 'bottom'
};
const STEP_OVER_ICON = React.createElement("svg", {
  viewBox: "0 0 100 100"
}, React.createElement("circle", {
  cx: "46",
  cy: "63",
  r: "10"
}), React.createElement("path", {
  d: 'M83.8,54.7c-6.5-16.6-20.7-28.1-37.2-28.1c-19.4,0-35.6,16-39.9,' + '37.3l11.6,2.9c3-16.2,14.5-28.2,28.2-28.2 c11,0,20.7,7.8,25.6,' + '19.3l-9.6,2.7l20.8,14.7L93.7,52L83.8,54.7z'
}));
const STEP_INTO_ICON = React.createElement("svg", {
  viewBox: "0 0 100 100"
}, React.createElement("circle", {
  cx: "50",
  cy: "75",
  r: "10"
}), React.createElement("polygon", {
  points: "42,20 57,20 57,40 72,40 50,60 28,40 42,40"
}));
const STEP_OUT_ICON = React.createElement("svg", {
  viewBox: "0 0 100 100"
}, React.createElement("circle", {
  cx: "50",
  cy: "75",
  r: "10"
}), React.createElement("polygon", {
  points: "42,20 57,20 57,40 72,40 50,60 28,40 42,40",
  transform: "rotate(180, 50, 40)"
}));

function SVGButton(props) {
  return React.createElement(_Button().Button, {
    className: "debugger-stepping-svg-button",
    onClick: props.onClick,
    disabled: props.disabled,
    tooltip: props.tooltip
  }, React.createElement("div", null, props.icon));
}

class DebuggerSteppingComponent extends React.Component {
  constructor(props) {
    super(props);

    this._togglePauseState = () => {
      const pausableThread = this._getPausableThread();

      if (pausableThread == null) {
        _logger().default.error('No thread to pause/resume');

        return;
      }

      if (pausableThread.stopped) {
        pausableThread.continue();
      } else {
        this._setWaitingForPause(true);

        pausableThread.pause();
      }
    };

    this._disposables = new (_UniversalDisposable().default)();
    const {
      service
    } = props;
    this.state = {
      debuggerMode: service.getDebuggerMode(),
      waitingForPause: false,
      customControlButtons: []
    };
  }

  componentDidMount() {
    const {
      service
    } = this.props;
    const model = service.getModel();

    this._disposables.add(_RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(service.onDidChangeMode.bind(service)), (0, _event().observableFromSubscribeFunction)(model.onDidChangeCallStack.bind(model)), (0, _event().observableFromSubscribeFunction)(service.viewModel.onDidFocusStackFrame.bind(service.viewModel))).startWith(null).let((0, _observable().fastDebounce)(10)).subscribe(() => {
      const debuggerMode = service.getDebuggerMode();
      const {
        focusedProcess
      } = service.viewModel;
      this.setState({
        debuggerMode,
        customControlButtons: focusedProcess == null ? [] : focusedProcess.configuration.customControlButtons || []
      });

      if (this.state.waitingForPause && debuggerMode !== _constants().DebuggerMode.RUNNING) {
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

  _getPausableThread() {
    const {
      focusedThread,
      focusedProcess
    } = this.props.service.viewModel;

    if (focusedThread != null) {
      return focusedThread;
    } else if (focusedProcess != null) {
      return focusedProcess.getAllThreads()[0];
    } else {
      return null;
    }
  }

  render() {
    const {
      debuggerMode,
      waitingForPause,
      customControlButtons
    } = this.state;
    const {
      service
    } = this.props;
    const {
      focusedThread
    } = service.viewModel;

    const isPaused = debuggerMode === _constants().DebuggerMode.PAUSED;

    const isStopped = debuggerMode === _constants().DebuggerMode.STOPPED;

    const isPausing = debuggerMode === _constants().DebuggerMode.RUNNING && waitingForPause;
    const playPauseIcon = isPausing ? null : React.createElement("span", {
      className: isPaused ? 'icon-playback-play' : 'icon-playback-pause'
    });
    const loadingIndicator = !isPausing ? null : React.createElement(_LoadingSpinner().LoadingSpinner, {
      className: "debugger-stepping-playpause-button-loading",
      size: _LoadingSpinner().LoadingSpinnerSizes.EXTRA_SMALL
    });
    const restartDebuggerButton = debuggerMode !== _constants().DebuggerMode.STOPPED ? React.createElement(_Button().Button, {
      icon: "sync",
      className: "debugger-stepping-button-separated",
      disabled: isStopped,
      tooltip: Object.assign({}, defaultTooltipOptions, {
        title: 'Restart the debugger using the same settings as the current debug session',
        keyBindingCommand: 'debugger:restart-debugging'
      }),
      onClick: () => service.restartProcess()
    }) : null;

    const DebuggerStepButton = props => React.createElement(SVGButton, {
      icon: props.icon,
      disabled: props.disabled,
      tooltip: Object.assign({}, defaultTooltipOptions, {
        title: props.title,
        keyBindingCommand: props.keyBindingCommand
      }),
      onClick: props.onClick
    });

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

    const process = service.getModel().getProcesses()[0];
    const attached = process != null && process.configuration.debugMode === 'attach';
    return React.createElement("div", {
      className: "debugger-stepping-component"
    }, React.createElement(_ButtonGroup().ButtonGroup, {
      className: "debugger-stepping-buttongroup"
    }, restartDebuggerButton, React.createElement(_Button().Button, {
      disabled: isPausing || pausableThread == null,
      tooltip: Object.assign({}, defaultTooltipOptions, {
        title: playPauseTitle,
        keyBindingCommand: isPaused ? 'debugger:continue-debugging' : undefined
      }),
      onClick: this._togglePauseState.bind(this)
    }, React.createElement("div", {
      className: "debugger-stepping-playpause-button"
    }, playPauseIcon, loadingIndicator)), React.createElement(DebuggerStepButton, {
      icon: STEP_OVER_ICON,
      disabled: !isPaused || focusedThread == null,
      title: "Step over",
      keyBindingCommand: "debugger:step-over",
      onClick: () => (0, _nullthrows().default)(focusedThread).next()
    }), React.createElement(DebuggerStepButton, {
      icon: STEP_INTO_ICON,
      disabled: !isPaused || focusedThread == null,
      title: "Step into",
      keyBindingCommand: "debugger:step-into",
      onClick: () => (0, _nullthrows().default)(focusedThread).stepIn()
    }), React.createElement(DebuggerStepButton, {
      icon: STEP_OUT_ICON,
      disabled: !isPaused || focusedThread == null,
      title: "Step out",
      keyBindingCommand: "debugger:step-out",
      onClick: () => (0, _nullthrows().default)(focusedThread).stepOut()
    }), React.createElement(_Button().Button, {
      icon: "primitive-square",
      disabled: isStopped,
      tooltip: Object.assign({}, defaultTooltipOptions, {
        title: attached ? 'Detach' : 'Terminate',
        keyBindingCommand: 'debugger:stop-debugging'
      }),
      onClick: () => service.stopProcess()
    })), React.createElement(_ButtonGroup().ButtonGroup, {
      className: "debugger-stepping-buttongroup"
    }, customControlButtons.map((specification, i) => {
      const buttonProps = Object.assign({}, specification, {
        tooltip: {
          title: specification.title
        }
      });
      return React.createElement(_Button().Button, Object.assign({}, buttonProps, {
        key: i
      }));
    })));
  }

}

exports.default = DebuggerSteppingComponent;