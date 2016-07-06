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

import {DisposableSubscription} from '../../commons-node/stream';
import {track} from '../../nuclide-analytics';
import {getLogger} from '../../nuclide-logging';
import {BehaviorSubject, Observable} from 'rxjs';

type TrackingEventNames = {
  start: string;
  stop: string;
  restart: string;
};

type Options = {
  name: string;
  messages: Observable<Message>;
  trackingEvents: TrackingEventNames;
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
  _statuses: BehaviorSubject<OutputProviderStatus>;

  constructor(options: Options) {
    this._name = options.name;
    this._eventNames = options.trackingEvents;
    this._messages = options.messages
      .do({
        complete: () => {
          this._stop();
        },
      })
      .catch(err => {
        this._stop(false);
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
        return Observable.empty();
      })
      .share()
      .publish();
    this._statuses = new BehaviorSubject('stopped');
  }

  start(): void {
    this._start();
  }

  stop(): void {
    this._stop();
  }

  restart(): void {
    track(this._eventNames.restart);
    this._stop(false);
    this._start(false);
  }

  observeStatus(cb: (status: 'running' | 'stopped') => void): IDisposable {
    return new DisposableSubscription(this._statuses.subscribe(cb));
  }

  _start(trackCall: boolean = true): void {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');

    if (this._statuses.getValue() !== 'stopped') {
      return;
    }
    if (trackCall) {
      track(this._eventNames.start);
    }

    this._statuses.next('running');

    if (this._subscription != null) {
      this._subscription.unsubscribe();
    }

    this._subscription = this._messages.connect();
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
