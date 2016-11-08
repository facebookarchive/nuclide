'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerSteppingComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../nuclide-ui/Checkbox');
}

var _ChromeActionRegistryActions;

function _load_ChromeActionRegistryActions() {
  return _ChromeActionRegistryActions = _interopRequireDefault(require('./ChromeActionRegistryActions'));
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultTooltipOptions = {
  placement: 'bottom'
};

const STEP_OVER_ICON = _reactForAtom.React.createElement(
  'svg',
  { viewBox: '0 0 100 100' },
  _reactForAtom.React.createElement('circle', { cx: '46', cy: '63', r: '10' }),
  _reactForAtom.React.createElement('path', {
    d: 'M83.8,54.7c-6.5-16.6-20.7-28.1-37.2-28.1c-19.4,0-35.6,16-39.9,' + '37.3l11.6,2.9c3-16.2,14.5-28.2,28.2-28.2 c11,0,20.7,7.8,25.6,' + '19.3l-9.6,2.7l20.8,14.7L93.7,52L83.8,54.7z'
  })
);

const STEP_INTO_ICON = _reactForAtom.React.createElement(
  'svg',
  { viewBox: '0 0 100 100' },
  _reactForAtom.React.createElement('circle', { cx: '50', cy: '75', r: '10' }),
  _reactForAtom.React.createElement('polygon', { points: '42,20 57,20 57,40 72,40 50,60 28,40 42,40' })
);

const STEP_OUT_ICON = _reactForAtom.React.createElement(
  'svg',
  { viewBox: '0 0 100 100' },
  _reactForAtom.React.createElement('circle', { cx: '50', cy: '75', r: '10' }),
  _reactForAtom.React.createElement('polygon', {
    points: '42,20 57,20 57,40 72,40 50,60 28,40 42,40',
    transform: 'rotate(180, 50, 40)'
  })
);

function SVGButton(props) {
  return _reactForAtom.React.createElement(
    (_Button || _load_Button()).Button,
    {
      className: 'nuclide-debugger-stepping-svg-button',
      onClick: props.onClick,
      tooltip: props.tooltip },
    _reactForAtom.React.createElement(
      'div',
      null,
      props.icon
    )
  );
}

let DebuggerSteppingComponent = exports.DebuggerSteppingComponent = class DebuggerSteppingComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    var _props = this.props;
    const actions = _props.actions,
          debuggerMode = _props.debuggerMode,
          pauseOnException = _props.pauseOnException,
          pauseOnCaughtException = _props.pauseOnCaughtException,
          allowSingleThreadStepping = _props.allowSingleThreadStepping,
          singleThreadStepping = _props.singleThreadStepping,
          customControlButtons = _props.customControlButtons;

    const isPaused = debuggerMode === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.PAUSED;
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-debugger-stepping-component' },
      _reactForAtom.React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { className: 'nuclide-debugger-stepping-buttongroup' },
        _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
          icon: isPaused ? 'playback-play' : 'playback-pause',
          tooltip: Object.assign({}, defaultTooltipOptions, {
            title: isPaused ? 'Continue' : 'Pause',
            keyBindingCommand: isPaused ? 'nuclide-debugger:continue-debugging' : undefined
          }),
          onClick: actions.triggerDebuggerAction.bind(actions, (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.PAUSE)
        }),
        _reactForAtom.React.createElement(SVGButton, {
          icon: STEP_OVER_ICON,
          tooltip: Object.assign({}, defaultTooltipOptions, {
            title: 'Step over',
            keyBindingCommand: 'nuclide-debugger:step-over'
          }),
          onClick: actions.triggerDebuggerAction.bind(actions, (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_OVER)
        }),
        _reactForAtom.React.createElement(SVGButton, {
          icon: STEP_INTO_ICON,
          tooltip: Object.assign({}, defaultTooltipOptions, {
            title: 'Step into',
            keyBindingCommand: 'nuclide-debugger:step-into'
          }),
          onClick: actions.triggerDebuggerAction.bind(actions, (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_INTO)
        }),
        _reactForAtom.React.createElement(SVGButton, {
          icon: STEP_OUT_ICON,
          tooltip: Object.assign({}, defaultTooltipOptions, {
            title: 'Step out',
            keyBindingCommand: 'nuclide-debugger:step-out'
          }),
          onClick: actions.triggerDebuggerAction.bind(actions, (_ChromeActionRegistryActions || _load_ChromeActionRegistryActions()).default.STEP_OUT)
        }),
        _reactForAtom.React.createElement((_Button || _load_Button()).Button, {
          icon: 'primitive-square',
          tooltip: Object.assign({}, defaultTooltipOptions, {
            title: 'Stop debugging',
            keyBindingCommand: 'nuclide-debugger:stop-debugging'
          }),
          onClick: () => actions.stopDebugging()
        })
      ),
      _reactForAtom.React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { className: 'nuclide-debugger-stepping-buttongroup' },
        customControlButtons.map((specification, i) => _reactForAtom.React.createElement((_Button || _load_Button()).Button, Object.assign({}, specification, { key: i })))
      ),
      _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'nuclide-debugger-exception-checkbox',
        onChange: () => actions.togglePauseOnException(!pauseOnException),
        checked: pauseOnException,
        label: pauseOnException ? 'Pause on' : 'Pause on exception'
      }),
      pauseOnException ? [_reactForAtom.React.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { key: 'first' },
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          {
            size: 'EXTRA_SMALL',
            selected: !pauseOnCaughtException,
            onClick: () => actions.togglePauseOnCaughtException(false) },
          'uncaught'
        ),
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          {
            size: 'EXTRA_SMALL',
            selected: pauseOnCaughtException,
            onClick: () => actions.togglePauseOnCaughtException(true) },
          'any'
        )
      ), _reactForAtom.React.createElement(
        'span',
        {
          key: 'second',
          className: 'nuclide-debugger-exception-fragment' },
        ' exception'
      )] : null,
      allowSingleThreadStepping ? _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        className: 'nuclide-debugger-exception-checkbox',
        onChange: () => actions.toggleSingleThreadStepping(!singleThreadStepping),
        checked: singleThreadStepping,
        label: 'Single Thread Stepping'
      }) : null
    );
  }
};