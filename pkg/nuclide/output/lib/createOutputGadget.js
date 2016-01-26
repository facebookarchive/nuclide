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
import type {AppState} from './types';
import type Rx from 'rx';

import {React} from 'react-for-atom';

export default function createOutputGadget(
  state$: Rx.Observable<AppState>,
  commands: Commands,
): Gadget {

  class OutputGadget extends React.Component {

    static gadgetId = 'nuclide-output';

    _state$Subscription: rx$IDisposable;

    getTitle(): string {
      return 'Output';
    }

    componentWillMount() {
      this._state$Subscription = state$.subscribe(state => this.setState(state));
    }

    componentWillUnmount() {
      this._state$Subscription.dispose();
    }

    render(): ?ReactElement {
      return (
        <table>
          <tbody>
            {this._renderRecords()}
          </tbody>
        </table>
      );
    }

    _renderRecords(): Array<ReactElement> {
      return this.state.records.map(record => (
        <tr>
          <td>{record.source}</td>
          <td>{record.text}</td>
        </tr>
      ));
    }

  }

  return ((OutputGadget: any): Gadget);
}
