'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Commands from './Commands';
import type {Gadget} from '../../gadgets-interfaces';
import type {AppState, Record} from './types';
import type Rx from 'rx';

import Console from './Console';
import {React} from 'react-for-atom';

type State = {
  records: Array<Record>;
};

export default function createOutputGadget(
  state$: Rx.Observable<AppState>,
  commands: Commands,
): Gadget {

  class OutputGadget extends React.Component {

    state: State;

    static gadgetId = 'nuclide-output';
    static defaultLocation = 'bottom';

    _state$Subscription: IDisposable;

    constructor(props: mixed) {
      super(props);
      this.state = {
        records: [],
      };
    }

    getTitle(): string {
      return 'Output';
    }

    componentWillMount() {
      this._state$Subscription = state$.subscribe(state => this.setState({records: state.records}));
    }

    componentWillUnmount() {
      this._state$Subscription.dispose();
    }

    render(): ?ReactElement {
      return (
        <Console
          clearRecords={() => commands.clearRecords()}
          records={this.state.records}
        />
      );
    }

  }

  return ((OutputGadget: any): Gadget);
}
