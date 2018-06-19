/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {DebuggerModeType, IDebugService, IThread} from '../types';
import type {ControlButtonSpecification} from 'nuclide-debugger-common';
import {
  LoadingSpinner,
  LoadingSpinnerSizes,
} from 'nuclide-commons-ui/LoadingSpinner';

import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {fastDebounce} from 'nuclide-commons/observable';
import * as React from 'react';
import {Button} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import {Observable} from 'rxjs';
import {DebuggerMode} from '../constants';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import logger from '../logger';
import nullthrows from 'nullthrows';

type DebuggerSteppingComponentProps = {
  service: IDebugService,
};

type DebuggerSteppingComponentState = {
  debuggerMode: DebuggerModeType,
  waitingForPause: boolean,
  customControlButtons: Array<ControlButtonSpecification>,
};

const defaultTooltipOptions = {
  placement: 'bottom',
};

const STEP_OVER_ICON = (
  <svg viewBox="0 0 100 100">
    <circle cx="46" cy="63" r="10" />
    <path
      d={
        'M83.8,54.7c-6.5-16.6-20.7-28.1-37.2-28.1c-19.4,0-35.6,16-39.9,' +
        '37.3l11.6,2.9c3-16.2,14.5-28.2,28.2-28.2 c11,0,20.7,7.8,25.6,' +
        '19.3l-9.6,2.7l20.8,14.7L93.7,52L83.8,54.7z'
      }
    />
  </svg>
);

const STEP_INTO_ICON = (
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="75" r="10" />
    <polygon points="42,20 57,20 57,40 72,40 50,60 28,40 42,40" />
  </svg>
);

const STEP_OUT_ICON = (
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="75" r="10" />
    <polygon
      points="42,20 57,20 57,40 72,40 50,60 28,40 42,40"
      transform="rotate(180, 50, 40)"
    />
  </svg>
);

function SVGButton(props: {
  onClick: () => mixed,
  tooltip: atom$TooltipsAddOptions,
  icon: React.Element<any>,
  disabled: boolean,
}): React.Element<any> {
  return (
    <Button
      className="debugger-stepping-svg-button"
      onClick={props.onClick}
      disabled={props.disabled}
      tooltip={props.tooltip}>
      <div>{props.icon}</div>
    </Button>
  );
}

export default class DebuggerSteppingComponent extends React.Component<
  DebuggerSteppingComponentProps,
  DebuggerSteppingComponentState,
> {
  _disposables: UniversalDisposable;

  constructor(props: DebuggerSteppingComponentProps) {
    super(props);

    this._disposables = new UniversalDisposable();
    const {service} = props;
    this.state = {
      debuggerMode: service.getDebuggerMode(),
      waitingForPause: false,
      customControlButtons: [],
    };
  }

  componentDidMount(): void {
    const {service} = this.props;
    const model = service.getModel();
    this._disposables.add(
      Observable.merge(
        observableFromSubscribeFunction(service.onDidChangeMode.bind(service)),
        observableFromSubscribeFunction(model.onDidChangeCallStack.bind(model)),
        observableFromSubscribeFunction(
          service.viewModel.onDidFocusStackFrame.bind(service.viewModel),
        ),
      )
        .startWith(null)
        .let(fastDebounce(10))
        .subscribe(() => {
          const debuggerMode = service.getDebuggerMode();
          const {focusedProcess} = service.viewModel;

          this.setState({
            debuggerMode,
            customControlButtons:
              focusedProcess == null
                ? []
                : focusedProcess.configuration.customControlButtons || [],
          });
          if (
            this.state.waitingForPause &&
            debuggerMode !== DebuggerMode.RUNNING
          ) {
            this._setWaitingForPause(false);
          }
        }),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _setWaitingForPause(waiting: boolean): void {
    this.setState({
      waitingForPause: waiting,
    });
  }

  _getPausableThread(): ?IThread {
    const {focusedThread, focusedProcess} = this.props.service.viewModel;
    if (focusedThread != null) {
      return focusedThread;
    } else if (focusedProcess != null) {
      return focusedProcess.getAllThreads()[0];
    } else {
      return null;
    }
  }

  _togglePauseState = () => {
    const pausableThread = this._getPausableThread();
    if (pausableThread == null) {
      logger.error('No thread to pause/resume');
      return;
    }

    if (pausableThread.stopped) {
      pausableThread.continue();
    } else {
      this._setWaitingForPause(true);
      pausableThread.pause();
    }
  };

  render(): React.Node {
    const {debuggerMode, waitingForPause, customControlButtons} = this.state;
    const {service} = this.props;
    const {focusedThread} = service.viewModel;
    const isPaused = debuggerMode === DebuggerMode.PAUSED;
    const isStopped = debuggerMode === DebuggerMode.STOPPED;
    const isPausing = debuggerMode === DebuggerMode.RUNNING && waitingForPause;
    const playPauseIcon = isPausing ? null : (
      <span
        className={isPaused ? 'icon-playback-play' : 'icon-playback-pause'}
      />
    );

    const loadingIndicator = !isPausing ? null : (
      <LoadingSpinner
        className="debugger-stepping-playpause-button-loading"
        size={LoadingSpinnerSizes.EXTRA_SMALL}
      />
    );

    const restartDebuggerButton =
      debuggerMode !== DebuggerMode.STOPPED ? (
        <Button
          icon="sync"
          className="debugger-stepping-button-separated"
          disabled={isStopped}
          tooltip={{
            ...defaultTooltipOptions,
            title:
              'Restart the debugger using the same settings as the current debug session',
            keyBindingCommand: 'debugger:restart-debugging',
          }}
          onClick={() => service.restartProcess()}
        />
      ) : null;

    const DebuggerStepButton = (props: {
      /* eslint-disable react/no-unused-prop-types */
      icon: React.Element<any>,
      title: string,
      keyBindingCommand: string,
      disabled: boolean,
      onClick: () => mixed,
      /* eslint-enable react/no-unused-prop-types */
    }) => (
      <SVGButton
        icon={props.icon}
        disabled={props.disabled}
        tooltip={{
          ...defaultTooltipOptions,
          title: props.title,
          keyBindingCommand: props.keyBindingCommand,
        }}
        onClick={props.onClick}
      />
    );

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
    const attached =
      process != null && process.configuration.debugMode === 'attach';

    return (
      <div className="debugger-stepping-component">
        <ButtonGroup className="debugger-stepping-buttongroup">
          {restartDebuggerButton}
          <Button
            disabled={isPausing || pausableThread == null}
            tooltip={{
              ...defaultTooltipOptions,
              title: playPauseTitle,
              keyBindingCommand: isPaused
                ? 'debugger:continue-debugging'
                : undefined,
            }}
            onClick={this._togglePauseState.bind(this)}>
            <div className="debugger-stepping-playpause-button">
              {playPauseIcon}
              {loadingIndicator}
            </div>
          </Button>
          <DebuggerStepButton
            icon={STEP_OVER_ICON}
            disabled={!isPaused || focusedThread == null}
            title="Step over"
            keyBindingCommand="debugger:step-over"
            onClick={() => nullthrows(focusedThread).next()}
          />
          <DebuggerStepButton
            icon={STEP_INTO_ICON}
            disabled={!isPaused || focusedThread == null}
            title="Step into"
            keyBindingCommand="debugger:step-into"
            onClick={() => nullthrows(focusedThread).stepIn()}
          />
          <DebuggerStepButton
            icon={STEP_OUT_ICON}
            disabled={!isPaused || focusedThread == null}
            title="Step out"
            keyBindingCommand="debugger:step-out"
            onClick={() => nullthrows(focusedThread).stepOut()}
          />
          <Button
            icon="primitive-square"
            disabled={isStopped}
            tooltip={{
              ...defaultTooltipOptions,
              title: attached ? 'Detach' : 'Terminate',
              keyBindingCommand: 'debugger:stop-debugging',
            }}
            onClick={() => service.stopProcess()}
          />
        </ButtonGroup>
        <ButtonGroup className="debugger-stepping-buttongroup">
          {customControlButtons.map((specification, i) => {
            const buttonProps = {
              ...specification,
              tooltip: {
                title: specification.title,
              },
            };
            return <Button {...buttonProps} key={i} />;
          })}
        </ButtonGroup>
      </div>
    );
  }
}
