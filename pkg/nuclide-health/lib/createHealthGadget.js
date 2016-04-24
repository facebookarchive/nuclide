'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HealthStats} from './types';
import type Rx from 'rxjs';

import HealthPaneItemComponent from './ui/HealthPaneItemComponent';
import {React} from 'react-for-atom';

type State = {
  activeHandleObjects?: Array<Object>;
  stats?: HealthStats;
};

export default function createHealthGadget(state$: Rx.Observable<?State>): Class<any> {

  return class HealthPaneItem extends React.Component<void, void, State> {

    static gadgetId = 'nuclide-health';

    state: State;

    _stateSubscription: rx$ISubscription;

    constructor(...args) {
      super(...args);
      this.state = {};
    }

    componentDidMount() {
      this._stateSubscription = state$.subscribe(state => this.setState(state || {}));
    }

    componentWillUnmount() {
      this._stateSubscription.unsubscribe();
    }

    getTitle(): string {
      return 'Health';
    }

    getIconName(): string {
      return 'dashboard';
    }

    // Return false to prevent the tab getting split (since we only update a singleton health pane).
    copy(): boolean {
      return false;
    }

    render() {
      const {stats, activeHandleObjects} = this.state;

      if (stats == null || activeHandleObjects == null) {
        return <div />;
      }

      return (
        <div className="pane-item padded nuclide-health-pane-item">
          <HealthPaneItemComponent
            cpuPercentage={stats.cpuPercentage}
            heapPercentage={stats.heapPercentage}
            memory={stats.rss}
            lastKeyLatency={stats.lastKeyLatency}
            activeHandles={activeHandleObjects.length}
            activeHandleObjects={activeHandleObjects}
            activeRequests={stats.activeRequests}
          />
        </div>
      );
    }

  };

}
