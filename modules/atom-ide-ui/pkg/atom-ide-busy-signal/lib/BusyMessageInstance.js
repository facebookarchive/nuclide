/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {BusyMessage} from './types';

import invariant from 'assert';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export class BusyMessageInstance {
  // These things are set at construction-time:
  _publishCallback: () => void;
  _creationOrder: number;
  _waitingFor: 'computer' | 'user';
  _onDidClick: ?() => void;
  _disposables: UniversalDisposable;
  // These things might be modified afterwards:
  _title: ?HTMLElement = null;
  _isVisibleForDebounce: boolean = true;
  _isVisibleForFile: boolean = true;

  constructor(
    publishCallback: () => void,
    creationOrder: number,
    waitingFor: 'computer' | 'user',
    onDidClick: ?() => void,
    disposables: UniversalDisposable,
  ) {
    this._publishCallback = publishCallback;
    this._creationOrder = creationOrder;
    this._waitingFor = waitingFor;
    this._onDidClick = onDidClick;
    this._disposables = disposables;
  }

  get waitingFor(): 'computer' | 'user' {
    return this._waitingFor;
  }

  setTitle(val: string): void {
    invariant(!this._disposables.disposed);
    if (this._onDidClick == null) {
      const span = document.createElement('span');
      span.appendChild(document.createTextNode(val));
      this._title = span;
    } else {
      const anchor = document.createElement('a');
      anchor.onclick = this._onDidClick;
      anchor.appendChild(document.createTextNode(val));
      this._title = anchor;
    }
    if (this.isVisible()) {
      this._publishCallback();
    }
  }

  getTitleHTML(): ?HTMLElement {
    return this._title;
  }

  setIsVisibleForDebounce(val: boolean): void {
    invariant(!this._disposables.disposed);
    this._isVisibleForDebounce = val;
    this._publishCallback();
  }

  setIsVisibleForFile(val: boolean): void {
    invariant(!this._disposables.disposed);
    this._isVisibleForFile = val;
    this._publishCallback();
  }

  isVisible(): boolean {
    invariant(!this._disposables.disposed);
    return (
      this._isVisibleForFile &&
      this._isVisibleForDebounce &&
      this._title != null
    );
  }

  compare(that: BusyMessageInstance): number {
    return this._creationOrder - that._creationOrder;
  }

  dispose(): void {
    this._disposables.dispose();
    this._title = null;
    this._publishCallback();
  }
}

// This is how we declare that a type fulfills an interface in Flow:
(((null: any): BusyMessageInstance): BusyMessage);
