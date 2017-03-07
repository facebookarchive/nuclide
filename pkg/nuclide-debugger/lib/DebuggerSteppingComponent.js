/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type DebuggerActions from './DebuggerActions';
import type {ControlButtonSpecification, DebuggerModeType} from './types';
import type {DebuggerStore} from './DebuggerStore';

import React from 'react';
import {Button} from '../../nuclide-ui/Button';
import {ButtonGroup} from '../../nuclide-ui/ButtonGroup';
import {Checkbox} from '../../nuclide-ui/Checkbox';
import ChromeActionRegistryActions from './ChromeActionRegistryActions';
import {DebuggerMode} from './DebuggerStore';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

type DebuggerSteppingComponentProps = {
  actions: DebuggerActions,
  debuggerStore: DebuggerStore,
};

type DebuggerSteppingComponentState = {
  allowSingleThreadStepping: boolean,
  debuggerMode: DebuggerModeType,
  pauseOnException: boolean,
  pauseOnCaughtException: boolean,
  enableSingleThreadStepping: boolean,
  customControlButtons: Array<ControlButtonSpecification>,
};

const defaultTooltipOptions = {
  placement: 'bottom',
};

const STEP_OVER_ICON =
  <svg viewBox="0 0 100 100">
    <circle cx="46" cy="63" r="10" />
    <path
      d={
        'M83.8,54.7c-6.5-16.6-20.7-28.1-37.2-28.1c-19.4,0-35.6,16-39.9,' +
        '37.3l11.6,2.9c3-16.2,14.5-28.2,28.2-28.2 c11,0,20.7,7.8,25.6,' +
        '19.3l-9.6,2.7l20.8,14.7L93.7,52L83.8,54.7z'
      }
    />
  </svg>;

const STEP_INTO_ICON =
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="75" r="10" />
    <polygon points="42,20 57,20 57,40 72,40 50,60 28,40 42,40" />
  </svg>;

const STEP_OUT_ICON =
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="75" r="10" />
    <polygon
      points="42,20 57,20 57,40 72,40 50,60 28,40 42,40"
      transform="rotate(180, 50, 40)"
    />
  </svg>;

function SVGButton(props: {
  onClick: () => void,
  tooltip: atom$TooltipsAddOptions,
  icon: React.Element<any>,
  disabled: boolean,
}): React.Element<any> {
  return (
    <Button
      className="nuclide-debugger-stepping-svg-button"
      onClick={props.onClick}
      disabled={props.disabled}
      tooltip={props.tooltip}>
      <div>
        {props.icon}
      </div>
    </Button>
  );
}

export class DebuggerSteppingComponent extends React.Component {
  props: DebuggerSteppingComponentProps;
  state: DebuggerSteppingComponentState;
  _disposables: UniversalDisposable;

  constructor(props: DebuggerSteppingComponentProps) {
    super(props);
    this._disposables = new UniversalDisposable();
    const {debuggerStore} = props;
    this.state = {
      allowSingleThreadStepping: Boolean(debuggerStore.getSettings().get('SingleThreadStepping')),
      debuggerMode: debuggerStore.getDebuggerMode(),
      pauseOnException: debuggerStore.getTogglePauseOnException(),
      pauseOnCaughtException: debuggerStore.getTogglePauseOnCaughtException(),
      enableSingleThreadStepping: debuggerStore.getEnableSingleThreadStepping(),
      customControlButtons: debuggerStore.getCustomControlButtons(),
    };
  }

  componentDidMount(): void {
    const {debuggerStore} = this.props;
    this._disposables.add(
      debuggerStore.onChange(() => {
        this.setState({
          allowSingleThreadStepping: Boolean(debuggerStore.getSettings()
            .get('SingleThreadStepping')),
          debuggerMode: debuggerStore.getDebuggerMode(),
          pauseOnException: debuggerStore.getTogglePauseOnException(),
          pauseOnCaughtException: debuggerStore.getTogglePauseOnCaughtException(),
          enableSingleThreadStepping: debuggerStore.getEnableSingleThreadStepping(),
          customControlButtons: debuggerStore.getCustomControlButtons(),
        });
      }),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  render(): ?React.Element<any> {
    const {
      debuggerMode,
      pauseOnException,
      pauseOnCaughtException,
      allowSingleThreadStepping,
      enableSingleThreadStepping,
      customControlButtons,
    } = this.state;
    const {actions} = this.props;
    const isPaused = debuggerMode === DebuggerMode.PAUSED;
    const isStopped = debuggerMode === DebuggerMode.STOPPED;
    return (
      <div className="nuclide-debugger-stepping-component">
        <ButtonGroup className="nuclide-debugger-stepping-buttongroup">
          <Button
            icon={isPaused ? 'playback-play' : 'playback-pause'}
            disabled={isStopped}
            tooltip={{
              ...defaultTooltipOptions,
              title: isPaused ? 'Continue' : 'Pause',
              keyBindingCommand: isPaused ?
                'nuclide-debugger:continue-debugging' :
                undefined,
            }}
            onClick={
              actions.triggerDebuggerAction.bind(
                actions,
                ChromeActionRegistryActions.PAUSE, // Toggles paused state
              )
            }
          />
          <SVGButton
            icon={STEP_OVER_ICON}
            disabled={!isPaused}
            tooltip={{
              ...defaultTooltipOptions,
              title: 'Step over',
              keyBindingCommand: 'nuclide-debugger:step-over',
            }}
            onClick={
              actions.triggerDebuggerAction.bind(actions, ChromeActionRegistryActions.STEP_OVER)
            }
          />
          <SVGButton
            icon={STEP_INTO_ICON}
            disabled={!isPaused}
            tooltip={{
              ...defaultTooltipOptions,
              title: 'Step into',
              keyBindingCommand: 'nuclide-debugger:step-into',
            }}
            onClick={
              actions.triggerDebuggerAction.bind(actions, ChromeActionRegistryActions.STEP_INTO)
            }
          />
          <SVGButton
            icon={STEP_OUT_ICON}
            disabled={!isPaused}
            tooltip={{
              ...defaultTooltipOptions,
              title: 'Step out',
              keyBindingCommand: 'nuclide-debugger:step-out',
            }}
            onClick={
              actions.triggerDebuggerAction.bind(actions, ChromeActionRegistryActions.STEP_OUT)
            }
          />
          <Button
            icon="primitive-square"
            tooltip={{
              ...defaultTooltipOptions,
              title: 'Stop debugging',
              keyBindingCommand: 'nuclide-debugger:stop-debugging',
            }}
            onClick={
              () => actions.stopDebugging()
            }
          />
        </ButtonGroup>
        <ButtonGroup className="nuclide-debugger-stepping-buttongroup">
          {customControlButtons.map((specification, i) => <Button {...specification} key={i} />)}
        </ButtonGroup>
        <Checkbox
          className="nuclide-debugger-exception-checkbox"
          onChange={() => actions.togglePauseOnException(!pauseOnException)}
          checked={pauseOnException}
          label={pauseOnException ? 'Pause on' : 'Pause on exception'}
        />
        {pauseOnException ? [
          <ButtonGroup key="first">
            <Button
              size="EXTRA_SMALL"
              selected={!pauseOnCaughtException}
              onClick={() => actions.togglePauseOnCaughtException(false)}>
              uncaught
            </Button>
            <Button
              size="EXTRA_SMALL"
              selected={pauseOnCaughtException}
              onClick={() => actions.togglePauseOnCaughtException(true)}>
              any
            </Button>
          </ButtonGroup>,
          <span
            key="second"
            className="nuclide-debugger-exception-fragment">
            {' exception'}
          </span>,
        ] : null}
        {allowSingleThreadStepping ?
          <Checkbox
            disabled={isStopped}
            className="nuclide-debugger-exception-checkbox"
            onChange={() => actions.toggleSingleThreadStepping(!enableSingleThreadStepping)}
            checked={enableSingleThreadStepping}
            label={'Single Thread Stepping'}
          />
          : null
        }
      </div>
    );
  }
}
