'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GetToolBar} from '../../commons-atom/suda-tool-bar';
import type {WorkspaceViewsService} from '../../nuclide-workspace-views/lib/types';
import type {HealthStats, PaneItemState} from './types';

// Imports from non-Nuclide modules.
import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import {React} from 'react-for-atom';
import Rx from 'rxjs';

// Imports from other Nuclide packages.
import {track} from '../../nuclide-analytics';
import createPackage from '../../commons-atom/createPackage';
import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import featureConfig from '../../commons-atom/featureConfig';

// Imports from within this Nuclide package.
import HealthPaneItem from './HealthPaneItem';
import {Profiler} from './Profiler';

class Activation {
  _currentConfig: Object;
  _viewTimeout: ?number;
  _analyticsTimeout: ?number;
  _analyticsBuffer: Array<HealthStats>;
  _profiler: Profiler;

  _paneItemStates: Rx.BehaviorSubject<?PaneItemState>;
  _subscriptions: CompositeDisposable;

  _healthButton: ?HTMLElement;
  _healthJewelValue: ?string;

  constructor(state: ?Object): void {
    this._analyticsBuffer = [];
    this._paneItemStates = new Rx.BehaviorSubject(null);
    this._profiler = new Profiler();

    (this: any)._updateAnalytics = this._updateAnalytics.bind(this);
    (this: any)._updateViews = this._updateViews.bind(this);

    this._subscriptions = new CompositeDisposable(
      this._profiler,
      featureConfig.onDidChange('nuclide-health', event => {
        this._currentConfig = event.newValue;
        // If user changes any config, update the health - and reset the polling cycles.
        this._updateViews();
        this._updateAnalytics();
      }),
    );
    this._currentConfig = ((featureConfig.get('nuclide-health'): any): Object);
    this._updateViews();
    this._updateAnalytics();
  }

  dispose(): void {
    this._subscriptions.dispose();
    if (this._viewTimeout != null) {
      clearTimeout(this._viewTimeout);
    }
    if (this._analyticsTimeout != null) {
      clearTimeout(this._analyticsTimeout);
    }
  }

  consumeToolBar(getToolBar: GetToolBar): IDisposable {
    const toolBar = getToolBar('nuclide-health');
    this._healthButton = toolBar.addButton({
      icon: 'dashboard',
      callback: 'nuclide-health:toggle',
      tooltip: 'Toggle Nuclide health stats',
      priority: -400,
    }).element;
    this._healthButton.classList.add('nuclide-health-jewel');
    this._healthJewelValue = null;
    const disposable = new Disposable(() => {
      this._healthButton = this._healthJewelValue = null;
      toolBar.removeItems();
    });
    this._subscriptions.add(disposable);
    return disposable;
  }

  consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
    invariant(this._paneItemStates);
    this._subscriptions.add(
      api.registerFactory({
        id: 'nuclide-health',
        name: 'Health',
        iconName: 'dashboard',
        toggleCommand: 'nuclide-health:toggle',
        defaultLocation: 'pane',
        create: () => {
          invariant(this._paneItemStates != null);
          return viewableFromReactElement(<HealthPaneItem stateStream={this._paneItemStates} />);
        },
        isInstance: item => item instanceof HealthPaneItem,
      }),
    );
  }

  _updateToolbarJewel(stats: HealthStats) {
    let value: string = '';
    if (this._currentConfig.toolbarJewel != null) {
      const jewel = this._currentConfig.toolbarJewel;
      switch (jewel) {
        case 'CPU':
          value = `${stats.cpuPercentage.toFixed(0)}%`;
          break;
        case 'Heap':
          value = `${stats.heapPercentage.toFixed(0)}%`;
          break;
        case 'Memory':
          value = `${Math.floor(stats.rss / 1024 / 1024)}M`;
          break;
        case 'Key latency':
          value = `${stats.lastKeyLatency}ms`;
          break;
        case 'Handles':
          value = `${stats.activeHandles}`;
          break;
        case 'Child processes':
          value = `${stats.activeHandlesByType.childprocess.length}`;
          break;
        case 'Event loop':
          value = `${stats.activeRequests}`;
          break;
      }
    }

    const healthButton = this._healthButton;
    if (healthButton != null) {
      healthButton.classList.toggle('updated', this._healthJewelValue !== value);
      healthButton.dataset.jewelValue = value;
      this._healthJewelValue = value;
    }
  }

  _updateViews(): void {
    if (!this._paneItemStates) {
      return;
    }

    const stats = this._profiler.getStats();
    this._analyticsBuffer.push(stats);
    this._paneItemStates.next({
      toolbarJewel: this._currentConfig.toolbarJewel || '',
      updateToolbarJewel: value => { featureConfig.set('nuclide-health.toolbarJewel', value); },
      stats,
    });
    this._updateToolbarJewel(stats);

    if (this._currentConfig.viewTimeout) {
      if (this._viewTimeout !== null) {
        clearTimeout(this._viewTimeout);
      }
      this._viewTimeout = setTimeout(this._updateViews, this._currentConfig.viewTimeout * 1000);
    }
  }

  _updateAnalytics(): void {
    if (this._analyticsBuffer.length > 0) {
      // Aggregates the buffered stats up by suffixing avg, min, max to their names.
      const aggregateStats = {};

      // All analyticsBuffer entries have the same keys; we use the first entry to know what they
      // are.
      Object.keys(this._analyticsBuffer[0]).forEach(statsKey => {
        // These values are not to be aggregated or sent.
        if (statsKey === 'lastKeyLatency' || statsKey === 'activeHandlesByType') {
          return;
        }

        const aggregates = aggregate(
          this._analyticsBuffer.map(
            stats => (typeof stats[statsKey] === 'number' ? stats[statsKey] : 0),
          ),
          // skipZeros: Don't use empty key latency values in aggregates.
          (statsKey === 'keyLatency'),
        );
        Object.keys(aggregates).forEach(aggregatesKey => {
          const value = aggregates[aggregatesKey];
          if (value !== null && value !== undefined) {
            aggregateStats[`${statsKey}_${aggregatesKey}`] = value.toFixed(2);
          }
        });
      });
      track('nuclide-health', aggregateStats);
      this._analyticsBuffer = [];
    }

    if (this._currentConfig.analyticsTimeout) {
      if (this._analyticsTimeout !== null) {
        clearTimeout(this._analyticsTimeout);
      }
      this._analyticsTimeout = setTimeout(
        this._updateAnalytics,
        this._currentConfig.analyticsTimeout * 60 * 1000,
      );
    }
  }

}

function aggregate(
  values_: Array<number>,
  skipZeros: boolean = false,
): {avg: ?number, min: ?number, max: ?number} {
  let values = values_;
  // Some values (like memory usage) might be very high & numerous, so avoid summing them all up.
  if (skipZeros) {
    values = values.filter(value => value !== 0);
    if (values.length === 0) {
      return {avg: null, min: null, max: null};
    }
  }
  const avg = values.reduce((prevValue, currValue, index) => {
    return prevValue + (currValue - prevValue) / (index + 1);
  }, 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return {avg, min, max};
}

export default createPackage(Activation);
