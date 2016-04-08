'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';

type Props = {
  busy: boolean;
};

const SPINNER = '\uF087';

export class StatusBarTileComponent extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
  }

  render(): ReactElement {
    const classes = ['nuclide-busy-signal-status-bar'];
    if (this.props.busy) {
      classes.push('nuclide-busy-signal-status-bar-busy');
    } else {
      classes.push('nuclide-busy-signal-status-bar-idle');
    }
    return (
      <div className={classes.join(' ')}>{SPINNER}</div>
    );
  }
}
