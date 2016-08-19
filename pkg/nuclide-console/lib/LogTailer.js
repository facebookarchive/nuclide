'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Message, OutputProviderStatus} from './types';
import type {ConnectableObservable} from 'rxjs';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {track} from '../../nuclide-analytics';
import {getLogger} from '../../nuclide-logging';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';

type TrackingEventNames = {
  start: string,
  stop: string,
  restart: string,
};

type Options = {
  name: string,
  messages: Observable<Message>,
  trackingEvents: TrackingEventNames,

  // Signals that the source is ready ("running"). This allows us to account for sources that need
  // some initialization without having to worry about it in cases that don't.
  ready?: Observable<void>,
};

type StartOptions = {
  // A node-style error-first callback. This API is used because: Atom commands don't let us return
  // values (an Observable or Promise would work well here) and we want to have success and error
  // messages use the same channel (instead of a separate `onRunning` and `onRunningError`
  // callback).
  onRunning: (err?: Error) => mixed,
};

/**
 * A utility for writing packages that tail log sources. Just give it a cold observable and let it
 * handle the rest.
 */
export class LogTailer {
  _name: string;
  _eventNames: TrackingEventNames;
  _subscription: ?rx$ISubscription;
  _messages: ConnectableObservable<Message>;
  _ready: ?Observable<void>;
  _runningCallbacks: Array<(err?: Error) => mixed>;
  _startCount: number;
  _statuses: BehaviorSubject<OutputProviderStatus>;

  constructor(options: Options) {
    this._name = options.name;
    this._eventNames = options.trackingEvents;
    this._ready = options.ready;
    this._runningCallbacks = [];
    this._startCount = 0;
    this._statuses = new BehaviorSubject('stopped');

    this._messages = Observable.merge(
      options.messages,
      this._ready == null ? Observable.empty() : this._ready.ignoreElements(), // For the errors.
    )
      .do({
        error: err => {
          this._stop(false);
          this._invokeRunningCallbacks(err);
        },
        complete: () => {
          this._stop();
        },
      })
      .share()
      .publish();

    // Whenever the status becomes "running," invoke all of the registered running callbacks.
    this._statuses
      .distinctUntilChanged()
      .filter(status => status === 'running')
      .subscribe(() => { this._invokeRunningCallbacks(); });
  }

  start(options?: StartOptions): void {
    this._startCount += 1;
    if (options != null && options.onRunning != null) {
      this._runningCallbacks.push(options.onRunning);
    }
    this._start(true);
  }

  stop(): void {
    // If the process is explicitly stopped, call all of the running callbacks with a cancelation
    // error.
    this._startCount = 0;
    this._runningCallbacks.forEach(cb => {
      cb(new ProcessCancelledError(this._name));
    });

    this._stop();
  }

  restart(): void {
    track(this._eventNames.restart);
    this._stop(false);
    this._start(false);
  }

  observeStatus(cb: (status: 'starting' | 'running' | 'stopped') => void): IDisposable {
    return new UniversalDisposable(this._statuses.subscribe(cb));
  }

  _invokeRunningCallbacks(err: ?Error): void {
    // Invoke all of the registered running callbacks.
    if (this._runningCallbacks.length > 0) {
      this._runningCallbacks.forEach(cb => {
        if (err == null) {
          cb();
        } else {
          cb(err);
        }
      });
    }

    if (err != null && this._startCount !== this._runningCallbacks.length) {
      getLogger().error(`Error with ${this._name} tailer.`, err);
      const message = `An unexpected error occurred while running the ${this._name} process`
        + (err.message ? `:\n\n**${err.message}**` : '.');
      const notification = atom.notifications.addError(message, {
        dismissable: true,
        detail: err.stack == null ? '' : err.stack.toString(),
        buttons: [{
          text: `Restart ${this._name}`,
          className: 'icon icon-sync',
          onDidClick: () => {
            notification.dismiss();
            this.restart();
          },
        }],
      });
    }

    this._runningCallbacks = [];
    this._startCount = 0;
  }

  _start(trackCall: boolean): void {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-console:toggle',
      {visible: true},
    );

    if (this._statuses.getValue() !== 'stopped') {
      return;
    }

    if (trackCall) {
      track(this._eventNames.start);
    }

    // If the LogTailer was created with a way of detecting when the source was ready, the initial
    // status is "starting." Otherwise, assume that it's started immediately.
    const initialStatus = this._ready == null ? 'running' : 'starting';
    this._statuses.next(initialStatus);

    if (this._subscription != null) {
      this._subscription.unsubscribe();
    }

    const sub = new Subscription();
    if (this._ready != null) {
      sub.add(
        this._ready
          // Ignore errors here. We'll catch them above.
          .catch(error => Observable.empty())
          .takeUntil(this._statuses.filter(status => status !== 'starting'))
          .subscribe(() => { this._statuses.next('running'); }),
      );
    }
    sub.add(this._messages.connect());
    this._subscription = sub;
  }

  _stop(trackCall: boolean = true): void {
    if (this._subscription != null) {
      this._subscription.unsubscribe();
    }

    if (this._statuses.getValue() === 'stopped') {
      return;
    }
    if (trackCall) {
      track(this._eventNames.stop);
    }

    this._statuses.next('stopped');
  }

  getMessages(): Observable<Message> {
    return this._messages;
  }

}

class ProcessCancelledError extends Error {
  constructor(logProducerName: string) {
    super(`${logProducerName} was stopped`);
    this.name = 'ProcessCancelledError';
  }
}
