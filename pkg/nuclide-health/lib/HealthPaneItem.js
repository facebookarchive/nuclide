'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {PaneItemState} from './types';
import type {Observable} from 'rxjs';

import HealthPaneItemComponent from './ui/HealthPaneItemComponent';
import {React} from 'react-for-atom';

type Props = {
  stateStream: Observable<?PaneItemState>,
};

export default class HealthPaneItem extends React.Component {
  props: Props;
  state: PaneItemState;

  _stateSubscription: rxjs$ISubscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      stats: null,
      childProcessesTree: null,
    };
  }

  componentDidMount() {
    // Note: We assume the `stateStram` prop never changes.
    this._stateSubscription = this.props.stateStream.subscribe(state => this.setState(state || {}));
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
    const {toolbarJewel, updateToolbarJewel, childProcessesTree, stats} = this.state;

    if (stats == null) {
      return <div />;
    }

    return (
      <div className="pane-item padded nuclide-health-pane-item">
        <HealthPaneItemComponent
          toolbarJewel={toolbarJewel}
          updateToolbarJewel={updateToolbarJewel}
          cpuPercentage={stats.cpuPercentage}
          heapPercentage={stats.heapPercentage}
          memory={stats.rss}
          activeHandles={stats.activeHandles}
          activeRequests={stats.activeRequests}
          activeHandlesByType={stats.activeHandlesByType}
          childProcessesTree={childProcessesTree}
        />
      </div>
    );
  }

}
