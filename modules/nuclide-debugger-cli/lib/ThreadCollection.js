"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _Thread() {
  const data = _interopRequireDefault(require("./Thread"));

  _Thread = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
class ThreadCollection {
  constructor() {
    this._threads = new Map();
  }

  updateThreads(threads) {
    const newIds = new Set(threads.map(_ => _.id()));
    const existingIds = [...this._threads.keys()];
    existingIds.filter(_ => !newIds.has(_)).forEach(_ => this._threads.delete(_));
    threads.forEach(_ => {
      const thread = this._threads.get(_.id());

      if (thread != null) {
        thread.setName(_.name());
        return;
      }

      this._threads.set(_.id(), _);
    });

    if (this._focusThread != null && this.getThreadById(this._focusThread) == null) {
      this._focusThread = null;
    }
  }

  addThread(thread) {
    this._threads.set(thread.id(), thread);
  }

  removeThread(id) {
    this._threads.delete(id);

    if (this._focusThread === id) {
      this._focusThread = null;
    }
  }

  get allThreads() {
    return [...this._threads.values()];
  }

  getThreadById(id) {
    return this._threads.get(id);
  }

  markThreadStopped(id) {
    let thread = this.getThreadById(id);

    if (thread == null) {
      thread = new (_Thread().default)(id, `Thread ${id}`);
      this.addThread(thread);
    }

    thread.setStopped();
  }

  markThreadRunning(id) {
    const thread = this.getThreadById(id);

    if (thread == null) {
      throw new Error(`Attempt to mark unknown thread ${id} as running.`);
    }

    thread.setRunning();
  }

  markAllThreadsStopped() {
    [...this._threads.values()].forEach(thread => thread.setStopped());
  }

  markAllThreadsRunning() {
    [...this._threads.values()].forEach(thread => thread.setRunning());
  }

  allThreadsStopped() {
    return [...this._threads.values()].reduce((x, y) => x && y.isStopped, true);
  }

  allThreadsRunning() {
    return [...this._threads.values()].reduce((x, y) => x && !y.isStopped, true);
  }

  firstStoppedThread() {
    const stopped = [...this._threads.values()].sort((a, b) => a.id() - b.id()).find(_ => _.isStopped);

    if (stopped == null) {
      return null;
    }

    return stopped.id();
  }

  setFocusThread(id) {
    if (this.getThreadById(id) == null) {
      throw new Error(`Attempt to focus unknown thread ${id}`);
    }

    this._focusThread = id;
  }

  get focusThreadId() {
    return this._focusThread;
  }

  get focusThread() {
    if (this._focusThread == null) {
      return null;
    }

    return this._threads.get(this._focusThread);
  }

}

exports.default = ThreadCollection;