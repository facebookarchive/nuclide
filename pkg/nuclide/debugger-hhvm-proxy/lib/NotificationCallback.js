'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Subject} from 'rx';

export type NotificationType = 'info' | 'warning' | 'error' | 'fatalError';

export class NotificationCallback {
  _notificationObservable: Subject;

  constructor(notificationObservable: Subject) {
    this._notificationObservable = notificationObservable;
  }

  sendMessage(type: NotificationType, message: string): void {
    this._notificationObservable.onNext({
      type,
      message,
    });
  }
}
