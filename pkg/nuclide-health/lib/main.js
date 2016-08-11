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
import os from 'os';
import {React} from 'react-for-atom';
import Rx from 'rxjs';

// Imports from other Nuclide packages.
import {track, HistogramTracker} from '../../nuclide-analytics';
import createPackage from '../../commons-atom/createPackage';
import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import {
  onWorkspaceDidStopChangingActivePaneItem,
} from '../../commons-atom/debounced';
import featureConfig from '../../commons-atom/featureConfig';

// Imports from within this Nuclide package.
import HealthPaneItem from './HealthPaneItem';

class Activation {
  _currentConfig: Object;
  _viewTimeout: ?number;
  _analyticsTimeout: ?number;
  _analyticsBuffer: Array<HealthStats>;

  // Variables for tracking where and when a key was pressed, and the time before it had an effect.
  _activeEditorSubscriptions: ?CompositeDisposable;
  _keyEditorId: number;
  _keyDownTime: number;
  _keyLatency: number;
  _lastKeyLatency: number;
  _keyLatencyHistogram: ?HistogramTracker;

  _paneItemStates: Rx.BehaviorSubject<?PaneItemState>;
  _subscriptions: CompositeDisposable;

  _healthButton: ?HTMLElement;
  _healthJewelValue: ?string;

  constructor(state: ?Object): void {
    this._analyticsBuffer = [];
    this._keyEditorId = 0;
    this._keyDownTime = 0;
    this._keyLatency = 0;
    this._lastKeyLatency = 0;
    this._paneItemStates = new Rx.BehaviorSubject(null);

    (this: any)._disposeActiveEditorDisposables = this._disposeActiveEditorDisposables.bind(this);
    (this: any)._timeActiveEditorKeys = this._timeActiveEditorKeys.bind(this);
    (this: any)._updateAnalytics = this._updateAnalytics.bind(this);
    (this: any)._updateViews = this._updateViews.bind(this);

    this._subscriptions = new CompositeDisposable(
      featureConfig.onDidChange('nuclide-health', event => {
        this._currentConfig = event.newValue;
        // If user changes any config, update the health - and reset the polling cycles.
        this._updateViews();
        this._updateAnalytics();
      }),
      atom.workspace.onDidChangeActivePaneItem(this._disposeActiveEditorDisposables),
      onWorkspaceDidStopChangingActivePaneItem(this._timeActiveEditorKeys),
    );
    this._currentConfig = ((featureConfig.get('nuclide-health'): any): Object);
    this._timeActiveEditorKeys();
    this._updateViews();
    this._updateAnalytics();

    this._keyLatencyHistogram = new HistogramTracker(
      'keypress-latency',
      /* maxValue */ 500,
      /* buckets */ 25,
      /* intervalSeconds */ 60,
    );
  }

  dispose(): void {
    this._subscriptions.dispose();
    if (this._viewTimeout != null) {
      clearTimeout(this._viewTimeout);
    }
    if (this._analyticsTimeout != null) {
      clearTimeout(this._analyticsTimeout);
    }
    if (this._activeEditorSubscriptions) {
      this._activeEditorSubscriptions.dispose();
    }
    if (this._keyLatencyHistogram != null) {
      this._keyLatencyHistogram.dispose();
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

  _disposeActiveEditorDisposables(): void {
    // Clear out any events & timing data from previous text editor.
    if (this._activeEditorSubscriptions != null) {
      this._activeEditorSubscriptions.dispose();
      this._activeEditorSubscriptions = null;
    }
  }

  _timeActiveEditorKeys(): void {
    this._disposeActiveEditorDisposables();

    // If option is enabled, start timing latency of keys on the new text editor.
    if (!this._paneItemStates) {
      return;
    }

    // Ensure the editor is valid and there is a view to attach the keypress timing to.
    const editor: ?TextEditor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }
    const view = atom.views.getView(editor);
    if (!view) {
      return;
    }

    // Start the clock when a key is pressed. Function is named so it can be disposed well.
    const startKeyClock = () => {
      if (editor) {
        this._keyEditorId = editor.id;
        this._keyDownTime = Date.now();
      }
    };

    // Stop the clock when the (same) editor has changed content.
    const stopKeyClock = () => {
      if (editor && editor.id && this._keyEditorId === editor.id && this._keyDownTime) {
        this._keyLatency = Date.now() - this._keyDownTime;
        if (this._keyLatencyHistogram != null) {
          this._keyLatencyHistogram.track(this._keyLatency);
        }
        // Reset so that subsequent non-key-initiated buffer updates don't produce silly big
        // numbers.
        this._keyDownTime = 0;
      }
    };

    // Add the listener to keydown.
    view.addEventListener('keydown', startKeyClock);

    this._activeEditorSubscriptions = new CompositeDisposable(
      // Remove the listener in a home-made disposable for when this editor is no-longer active.
      new Disposable(() => view.removeEventListener('keydown', startKeyClock)),

      // stopKeyClock is fast so attaching it to onDidChange here is OK. onDidStopChanging would be
      // another option - any cost is deferred, but with far less fidelity.
      editor.onDidChange(stopKeyClock),
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

    const stats = this._getHealthStats();
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

  _getHealthStats(): HealthStats {
    const stats = process.memoryUsage();                          // RSS, heap and usage.

    if (this._keyLatency) {
      this._lastKeyLatency = this._keyLatency;
    }

    const activeHandles = getActiveHandles();
    const activeHandlesByType = getActiveHandlesByType(Array.from(activeHandles));

    const result = {
      ...stats,
      heapPercentage: (100 * stats.heapUsed / stats.heapTotal),   // Just for convenience.
      cpuPercentage: os.loadavg()[0],                             // 1 minute CPU average.
      lastKeyLatency: this._lastKeyLatency,
      keyLatency: this._lastKeyLatency,
      activeHandles: activeHandles.length,
      activeRequests: getActiveRequests().length,
      activeHandlesByType,
    };

    // We only want to ever record a key latency time once, and so we reset it.
    this._keyLatency = 0;
    return result;
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

// These two functions are to defend against undocumented Node functions.
function getActiveHandles(): Array<Object> {
  if (process._getActiveHandles) {
    return process._getActiveHandles();
  }
  return [];
}

function getActiveRequests(): Array<Object> {
  if (process._getActiveRequests) {
    return process._getActiveRequests();
  }
  return [];
}

function getActiveHandlesByType(handles: Array<Object>): {[type: string]: Array<Object>} {
  const activeHandlesByType = {
    childprocess: [],
    tlssocket: [],
    other: [],
  };
  getTopLevelHandles(handles).filter(handle => {
    let type = handle.constructor.name.toLowerCase();
    if (type !== 'childprocess' && type !== 'tlssocket') {
      type = 'other';
    }
    activeHandlesByType[type].push(handle);
  });
  return activeHandlesByType;
}

// Returns a list of handles which are not children of others (i.e. sockets as process pipes).
function getTopLevelHandles(handles: Array<Object>): Array<Object> {
  const topLevelHandles: Array<Object> = [];
  const seen: Set<Object> = new Set();
  handles.forEach(handle => {
    if (seen.has(handle)) {
      return;
    }
    seen.add(handle);
    topLevelHandles.push(handle);
    if (handle.constructor.name === 'ChildProcess') {
      seen.add(handle);
      ['stdin', 'stdout', 'stderr', '_channel'].forEach(pipe => {
        if (handle[pipe]) {
          seen.add(handle[pipe]);
        }
      });
    }
  });
  return topLevelHandles;
}

export default createPackage(Activation);
