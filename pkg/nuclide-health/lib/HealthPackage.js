'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GadgetsService, Gadget} from '../../nuclide-gadgets/lib/types';
import type {HealthStats} from './types';

// Imports from non-Nuclide modules.
import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import os from 'os';
import Rx from 'rxjs';

// Imports from other Nuclide packages.
import {track, HistogramTracker} from '../../nuclide-analytics';
import {atomEventDebounce} from '../../nuclide-atom-helpers';
import featureConfig from '../../nuclide-feature-config';

// Imports from within this Nuclide package.
import createHealthGadget from './createHealthGadget';

// We may as well declare these outside of Activation because most of them really are nullable.
let currentConfig = {};
let viewTimeout: ?number = null;
let analyticsTimeout: ?number = null;
let analyticsBuffer: Array<HealthStats> = [];

// Variables for tracking where and when a key was pressed, and the time before it had an effect.
let activeEditorSubscriptions: ?CompositeDisposable = null;
let keyEditorId = 0;
let keyDownTime = 0;
let keyLatency = 0;
let lastKeyLatency = 0;
let keyLatencyHistogram: ?HistogramTracker = null;

let paneItemState$: ?Rx.BehaviorSubject = null;

let subscriptions: CompositeDisposable = (null: any);

export function activate(state: ?Object) {
  paneItemState$ = new Rx.BehaviorSubject(null);
  subscriptions = new CompositeDisposable();
  subscriptions.add(
    featureConfig.onDidChange('nuclide-health', event => {
      currentConfig = event.newValue;
      // If user changes any config, update the health - and reset the polling cycles.
      updateViews();
      updateAnalytics();
    }),
    atom.workspace.onDidChangeActivePaneItem(disposeActiveEditorDisposables),
    atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem(timeActiveEditorKeys),
  );
  currentConfig = featureConfig.get('nuclide-health');
  timeActiveEditorKeys();
  updateViews();
  updateAnalytics();

  keyLatencyHistogram = new HistogramTracker(
    'keypress-latency',
    /* maxValue */ 500,
    /* buckets */ 25,
    /* intervalSeconds */ 60,
  );
}

export function deactivate() {
  subscriptions.dispose();
  paneItemState$ = null;
  if (viewTimeout !== null) {
    clearTimeout(viewTimeout);
    viewTimeout = null;
  }
  if (analyticsTimeout !== null) {
    clearTimeout(analyticsTimeout);
    analyticsTimeout = null;
  }
  if (activeEditorSubscriptions) {
    activeEditorSubscriptions.dispose();
    activeEditorSubscriptions = null;
  }
  if (keyLatencyHistogram != null) {
    keyLatencyHistogram.dispose();
    keyLatencyHistogram = null;
  }
}

export function consumeToolBar(getToolBar: (group: string) => Object): void {
  const priority = require('../../nuclide-commons').toolbar.farEndPriority(400);
  const toolBar = getToolBar('nuclide-health');
  toolBar.addButton({
    icon: 'dashboard',
    callback: 'nuclide-health:toggle',
    tooltip: 'Toggle Nuclide health stats',
    priority,
  });
  subscriptions.add(new Disposable(() => {
    toolBar.removeItems();
  }));
}

export function consumeGadgetsService(gadgetsApi: GadgetsService): void {
  invariant(paneItemState$);
  const gadget: Gadget = (createHealthGadget(paneItemState$): any);
  subscriptions.add(gadgetsApi.registerGadget(gadget));
}

function disposeActiveEditorDisposables(): void {
  // Clear out any events & timing data from previous text editor.
  if (activeEditorSubscriptions != null) {
    activeEditorSubscriptions.dispose();
    activeEditorSubscriptions = null;
  }
}

function timeActiveEditorKeys(): void {
  disposeActiveEditorDisposables();
  activeEditorSubscriptions = new CompositeDisposable();

  // If option is enabled, start timing latency of keys on the new text editor.
  if (!paneItemState$) {
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
      keyEditorId = editor.id;
      keyDownTime = Date.now();
    }
  };

  // Stop the clock when the (same) editor has changed content.
  const stopKeyClock = () => {
    if (editor && editor.id && keyEditorId === editor.id && keyDownTime) {
      keyLatency = Date.now() - keyDownTime;
      if (keyLatencyHistogram != null) {
        keyLatencyHistogram.track(keyLatency);
      }
      // Reset so that subsequent non-key-initiated buffer updates don't produce silly big numbers.
      keyDownTime = 0;
    }
  };

  // Add the listener to keydown.
  view.addEventListener('keydown', startKeyClock);

  activeEditorSubscriptions.add(
    // Remove the listener in a home-made disposable for when this editor is no-longer active.
    new Disposable(() => view.removeEventListener('keydown', startKeyClock)),

    // stopKeyClock is fast so attaching it to onDidChange here is OK.
    // onDidStopChanging would be another option - any cost is deferred, but with far less fidelity.
    editor.onDidChange(stopKeyClock),
  );
}

function updateViews(): void {
  if (!paneItemState$) {
    return;
  }

  const stats = getHealthStats();
  analyticsBuffer.push(stats);
  paneItemState$.next({stats, activeHandleObjects: getActiveHandles()});
  if (currentConfig.viewTimeout) {
    if (viewTimeout !== null) {
      clearTimeout(viewTimeout);
    }
    viewTimeout = setTimeout(updateViews, currentConfig.viewTimeout * 1000);
  }
}

function updateAnalytics(): void {
  if (analyticsBuffer.length > 0) {
    // Aggregates the buffered stats up by suffixing avg, min, max to their names.
    const aggregateStats = {};

    // All analyticsBuffer entries have the same keys; we use the first entry to know what they are.
    Object.keys(analyticsBuffer[0]).forEach(statsKey => {
      if (statsKey === 'lastKeyLatency') {
        return;
        // This field is only used to for a sticky value in the status bar, and is not to be sent.
      }

      const aggregates = aggregate(
        analyticsBuffer.map(stats => stats[statsKey]),
        (statsKey === 'keyLatency'), // skipZeros: Don't use empty key latency values in aggregates.
      );
      Object.keys(aggregates).forEach(aggregatesKey => {
        const value = aggregates[aggregatesKey];
        if (value !== null && value !== undefined) {
          aggregateStats[`${statsKey}_${aggregatesKey}`] = value.toFixed(2);
        }
      });
    });
    track('nuclide-health', aggregateStats);
    analyticsBuffer = [];
  }

  if (currentConfig.analyticsTimeout) {
    if (analyticsTimeout !== null) {
      clearTimeout(analyticsTimeout);
    }
    analyticsTimeout = setTimeout(updateAnalytics, currentConfig.analyticsTimeout * 60 * 1000);
  }
}

function aggregate(
  values: Array<number>,
  skipZeros: boolean = false,
): {avg: ?number; min: ?number; max: ?number} {
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

function getHealthStats(): HealthStats {
  const stats = process.memoryUsage();                               // RSS, heap and usage.

  if (keyLatency) {
    lastKeyLatency = keyLatency;
  }

  const result = {
    ...stats,
    heapPercentage: (100 * stats.heapUsed / stats.heapTotal),   // Just for convenience.
    cpuPercentage: os.loadavg()[0],                             // 1 minute CPU average.
    lastKeyLatency,
    keyLatency,
    activeHandles: getActiveHandles().length,
    activeRequests: getActiveRequests().length,
  };

  keyLatency = 0; // We only want to ever record a key latency time once, and so we reset it.

  return result;
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
