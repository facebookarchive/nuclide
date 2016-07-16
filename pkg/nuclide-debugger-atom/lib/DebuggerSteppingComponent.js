'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerActions from './DebuggerActions';
import type {DebuggerModeType} from './types';

import {
  React,
} from 'react-for-atom';
import {Button} from '../../nuclide-ui/lib/Button';
import {ButtonGroup} from '../../nuclide-ui/lib/ButtonGroup';
import ChromeActionRegistryActions from './ChromeActionRegistryActions';
import {DebuggerMode} from './DebuggerStore';

type DebuggerSteppingComponentProps = {
  actions: DebuggerActions,
  debuggerMode: DebuggerModeType,
};

export class DebuggerSteppingComponent extends React.Component {
  props: DebuggerSteppingComponentProps;

  constructor(props: DebuggerSteppingComponentProps) {
    super(props);
  }

  render(): ?React.Element<any> {
    const {
      actions,
      debuggerMode,
    } = this.props;
    const isPaused = debuggerMode === DebuggerMode.PAUSED;
    return (
      <div>
        <ButtonGroup>
          <Button
            icon={isPaused ? 'playback-play' : 'playback-pause'}
            title={isPaused ? 'pause' : 'continue'}
            onClick={
              actions.triggerDebuggerAction.bind(
                actions,
                ChromeActionRegistryActions.PAUSE, // Toggles paused state
              )
            }
          />
          <Button
            icon="arrow-right"
            title="step over"
            onClick={
              actions.triggerDebuggerAction.bind(actions, ChromeActionRegistryActions.STEP_OVER)
            }
          />
          <Button
            icon="arrow-down"
            title="step into"
            onClick={
              actions.triggerDebuggerAction.bind(actions, ChromeActionRegistryActions.STEP_INTO)
            }
          />
          <Button
            icon="arrow-up"
            title="step out"
            onClick={
              actions.triggerDebuggerAction.bind(actions, ChromeActionRegistryActions.STEP_OUT)
            }
          />
        </ButtonGroup>
      </div>
    );
  }
}
