'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  React,
} from 'react-for-atom';
import {Button} from '../../nuclide-ui/lib/Button';
import {ButtonGroup} from '../../nuclide-ui/lib/ButtonGroup';

type DebuggerSteppingComponentProps = {};

export class DebuggerSteppingComponent extends React.Component {
  props: DebuggerSteppingComponentProps;

  constructor(props: DebuggerSteppingComponentProps) {
    super(props);
  }

  render(): ?React.Element {
    // TODO consume paused state via props & wire up action handlers.
    const isPaused = false;
    return (
      <div>
        <ButtonGroup>
          <Button
            icon={isPaused ? 'playback-play' : 'playback-pause'}
            title={isPaused ? 'pause' : 'continue'}
          />
          <Button icon="arrow-right" title="step over" />
          <Button icon="arrow-down" title="step into" />
          <Button icon="arrow-up" title="step out" />
        </ButtonGroup>
      </div>
    );
  }
}
