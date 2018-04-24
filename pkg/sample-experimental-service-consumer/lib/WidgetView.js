/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {Subject, ReplaySubject, Observable} from 'rxjs';

type State = {count: number};

export default class WidgetView {
  componentId = 'sample-experimental-service-consumer.WidgetComponent';
  _updates = new Subject();
  _disposed = new ReplaySubject(1);
  state: State = {count: 0};

  get updates(): Observable<mixed> {
    return this._updates.takeUntil(this._disposed);
  }

  setState(state: State): void {
    this.state = {...this.state, ...state};
    this._updates.next();
  }

  render() {
    return this.state;
  }

  handleAction(action: Object) {
    // TODO: Type action
    switch (action.type) {
      case 'increment':
        this.setState({count: this.state.count + 1});
        break;
      case 'decrement':
        this.setState({count: this.state.count - 1});
        break;
      default:
        throw new Error(`Invalid action type: ${action.type}`);
    }
  }

  dispose(): void {
    this._disposed.next();
  }
}
