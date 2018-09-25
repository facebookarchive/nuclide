"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DevicePanelTask = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class DevicePanelTask {
  constructor(taskFactory, name) {
    this._subscription = null;
    this._events = new _RxMin.ReplaySubject(1);
    this._taskFactory = taskFactory;
    this._name = name;

    this._events.next(null);
  }

  getName() {
    return this._name;
  }

  getTaskEvents() {
    return this._events;
  }

  start() {
    const task = this._taskFactory().share();

    this._subscription = task.subscribe(message => {
      this._events.next(message);

      if (message.type === 'result') {
        atom.notifications.addSuccess(`Device task '${this._name}' succeeded.`);
      }
    }, () => {
      atom.notifications.addError(`Device task '${this._name}' failed.`);

      this._finishRun();
    }, () => {
      this._finishRun();
    });
  }

  cancel() {
    this._finishRun();
  }

  _finishRun() {
    if (this._subscription != null) {
      this._subscription.unsubscribe();

      this._subscription = null;
    }

    this._events.next(null);
  }

}

exports.DevicePanelTask = DevicePanelTask;