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

import {onWorkspaceDidStopChangingActivePaneItem} from '../../commons-atom/debounced';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {DisposableSubscription} from '../../commons-node/stream';
import {HistogramTracker} from '../../nuclide-analytics';
import {CompositeDisposable, Disposable} from 'atom';
import os from 'os';
import {Observable} from 'rxjs';

export class Profiler {
  _activeEditorSubscriptions: ?CompositeDisposable;
  _keyEditorId: number;
  _keyLatency: number;
  _lastKeyLatency: number;
  _keyDownTime: number;
  _subscriptions: IDisposable;

  // Variables for tracking where and when a key was pressed, and the time before it had an effect.
  _keyLatencyHistogram: HistogramTracker;

  constructor() {
    this._keyEditorId = 0;
    this._keyDownTime = 0;
    this._keyLatency = 0;
    this._lastKeyLatency = 0;

    this._keyLatencyHistogram = new HistogramTracker(
      'keypress-latency',
      /* maxValue */ 500,
      /* buckets */ 25,
      /* intervalSeconds */ 60,
    );

    (this: any)._timeActiveEditorKeys = this._timeActiveEditorKeys.bind(this);
    (this: any)._disposeActiveEditorDisposables = this._disposeActiveEditorDisposables.bind(this);

    this._subscriptions = new CompositeDisposable(
      new DisposableSubscription(
        Observable.of(null)
          .concat(observableFromSubscribeFunction(onWorkspaceDidStopChangingActivePaneItem))
          .subscribe(this._timeActiveEditorKeys),
      ),
      atom.workspace.onDidChangeActivePaneItem(this._disposeActiveEditorDisposables),
    );
  }

  dispose(): void {
    if (this._activeEditorSubscriptions != null) {
      this._activeEditorSubscriptions.dispose();
    }
    this._keyLatencyHistogram.dispose();
  }

  getStats(): HealthStats {
    const stats = process.memoryUsage();                          // RSS, heap and usage.

    // FIXME: `getStats()` really shouldn't have side-effects.
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

  _disposeActiveEditorDisposables(): void {
    // Clear out any events & timing data from previous text editor.
    if (this._activeEditorSubscriptions != null) {
      this._activeEditorSubscriptions.dispose();
      this._activeEditorSubscriptions = null;
    }
  }

  _timeActiveEditorKeys(): void {
    this._disposeActiveEditorDisposables();

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

}

// These two functions are to defend against undocumented Node functions.
function getActiveHandles(): Array<Object> {
  if (process._getActiveHandles) {
    return process._getActiveHandles();
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

function getActiveRequests(): Array<Object> {
  if (process._getActiveRequests) {
    return process._getActiveRequests();
  }
  return [];
}
