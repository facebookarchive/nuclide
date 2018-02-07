'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SnapshotLogger = exports.MemoryLogger = undefined;

var _doubleEndedQueue;

function _load_doubleEndedQueue() {
  return _doubleEndedQueue = _interopRequireDefault(require('double-ended-queue'));
}

var _util = _interopRequireDefault(require('util'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Retain past five minutes
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const DEFAULT_RETENTION_PERIOD_MS = 5 * 60 * 1000;

// ...but only if it is less than 10 MB
const DEFAULT_RETENTION_SIZE_LIMIT = 10 * 1000 * 1000;

class MemoryLogger {

  constructor(underlyingLogger, retentionPeriod = DEFAULT_RETENTION_PERIOD_MS, sizeLimit = DEFAULT_RETENTION_SIZE_LIMIT) {
    this._logs = new (_doubleEndedQueue || _load_doubleEndedQueue()).default();

    this._underlyingLogger = underlyingLogger;
    this._retentionPeriod = retentionPeriod;
    this._sizeLimit = sizeLimit;
    this._size = 0;
  }

  dispose() {
    this._logs.isEmpty();
  }

  dump() {
    return this._logs.toArray().map(entry => `${entry.text}\n`).join('');
  }

  getUnderlyingLogger() {
    return this._underlyingLogger;
  }

  debug(format, ...values) {
    const message = _util.default.format(format, ...values);
    const underlying = this._underlyingLogger;
    if (underlying != null) {
      underlying.debug(message.substring(0, 400));
    }
    this._appendAndExpunge('DEBUG', message);
  }

  trace(format, ...values) {
    const message = _util.default.format(format, ...values);
    const underlying = this._underlyingLogger;
    if (underlying != null) {
      underlying.trace(message.substring(0, 400));
    }
    this._appendAndExpunge('TRACE', message);
  }

  info(format, ...values) {
    const message = _util.default.format(format, ...values);
    const underlying = this._underlyingLogger;
    if (underlying != null) {
      underlying.info(message.substring(0, 400));
    }
    this._appendAndExpunge('INFO', message);
  }

  warn(format, ...values) {
    const message = _util.default.format(format, ...values);
    const underlying = this._underlyingLogger;
    if (underlying != null) {
      underlying.warn(message);
    }
    this._appendAndExpunge('WARN', message);
  }

  error(format, ...values) {
    const message = _util.default.format(format, ...values);
    const underlying = this._underlyingLogger;
    if (underlying != null) {
      underlying.error(message);
    }
    this._appendAndExpunge('ERROR', message);
  }

  _appendAndExpunge(level, message) {
    if (this._retentionPeriod === 0) {
      return;
    }

    // this._logs will keep the past five minute's worth of logs
    const time = Date.now();
    const text = new Date(time).toLocaleTimeString('en-US', { hour12: false }) + ' ' + level + ' - ' + message;
    // push the new entry
    const newLog = { time, text };
    this._logs.push(newLog);
    this._size += text.length;
    // and remove all expired entries
    while (true) {
      const front = this._logs.peekFront();
      if (front == null) {
        break;
      }
      if (time <= front.time + this._retentionPeriod && this._size <= this._sizeLimit) {
        break;
      }
      this._logs.shift();
      this._size -= front.text.length;
    }
  }
}

exports.MemoryLogger = MemoryLogger;
class SnapshotLogger {

  constructor(retentionPeriod = 5 * 60 * 1000, // retain past five minutes
  snapshotInterval = 30 * 1000) // snapshot no more than every 30s
  {
    this._files = new Map();

    this._retentionPeriod = retentionPeriod;
    this._snapshotInterval = snapshotInterval;
  }

  dispose() {
    this._files.clear();
  }

  dump() {
    const results = [];
    for (const [filepath, snapshots] of this._files) {
      for (const snapshot of snapshots) {
        const time = new Date(snapshot.time).toLocaleTimeString('en-US', {
          hour12: false
        });
        const version = String(snapshot.version);
        results.push({
          title: `${filepath} ${time},v${version}`,
          text: snapshot.text
        });
      }
    }
    return results;
  }

  snapshot(filepath, version, buffer) {
    if (this._retentionPeriod === 0) {
      return;
    }
    // this._files will keep historical versions of every open file.
    // It will keep at least one copy of it, and will discard older copies if
    // they're older than five minutes. It will save version updates but no
    // more frequently than once every thirty seconds.
    const time = new Date().getTime();
    let snapshots = this._files.get(filepath);
    if (snapshots != null && snapshots.length > 0) {
      const mostRecent = snapshots[snapshots.length - 1];
      if (mostRecent.time + this._snapshotInterval > time || mostRecent.version === version) {
        return;
      }
    }
    if (snapshots == null) {
      snapshots = [];
      this._files.set(filepath, snapshots);
    }
    // Remove any old snapshots at the start of the array
    const firstRemainingSnapshot = snapshots.findIndex(snapshot => snapshot.time + this._retentionPeriod > time);
    if (firstRemainingSnapshot > 0) {
      snapshots.splice(0, firstRemainingSnapshot);
    }
    // Add a new snashot at the end
    snapshots.push({ time, text: buffer.getText(), version });
  }

  close(filepath) {
    this._files.delete(filepath);
  }
}
exports.SnapshotLogger = SnapshotLogger;