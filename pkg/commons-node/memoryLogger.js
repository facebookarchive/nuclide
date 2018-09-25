"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SnapshotLogger = exports.MemoryLogger = void 0;

function _doubleEndedQueue() {
  const data = _interopRequireDefault(require("double-ended-queue"));

  _doubleEndedQueue = function () {
    return data;
  };

  return data;
}

var _util = _interopRequireDefault(require("util"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// Retain past five minutes
const DEFAULT_RETENTION_PERIOD_MS = 5 * 60 * 1000; // ...but only if it is less than 10 MB

const DEFAULT_RETENTION_SIZE_LIMIT = 10 * 1000 * 1000;

class MemoryLogger {
  constructor(underlyingLogger, retentionPeriod = DEFAULT_RETENTION_PERIOD_MS, sizeLimit = DEFAULT_RETENTION_SIZE_LIMIT) {
    this._logs = new (_doubleEndedQueue().default)();
    this._underlyingLogger = underlyingLogger;
    this._retentionPeriod = retentionPeriod;
    this._sizeLimit = sizeLimit;
    this._size = 0;
  }

  dispose() {
    this._logs.isEmpty();
  }

  dump(count) {
    let logs = this._logs.toArray();

    if (count != null && count < this._logs.length) {
      if (!(count > 0)) {
        throw new Error('Must provide a positive count');
      }

      logs = logs.slice(logs.length - count);
    }

    return logs.map(entry => `${formatTime(entry.time)} ${entry.level} - ${entry.text}\n`).join('');
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
    } // this._logs will keep the past five minute's worth of logs


    const time = Date.now(); // push the new entry

    const newLog = {
      time,
      level,
      text: message
    };

    this._logs.push(newLog); // the format is HH:MM:SS level - text (level + text + 12 chars)


    this._size += newLog.level.length + newLog.text.length + 12; // and remove all expired entries

    while (true) {
      const front = this._logs.peekFront();

      if (front == null) {
        break;
      }

      if (time <= front.time + this._retentionPeriod && this._size <= this._sizeLimit) {
        break;
      }

      this._logs.shift();

      this._size -= front.level.length + front.text.length + 12;
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
        results.push({
          title: `${filepath} ${formatTime(snapshot.time)},v${snapshot.version}`,
          text: snapshot.text
        });
      }
    }

    return results;
  }

  snapshot(filepath, version, buffer) {
    if (this._retentionPeriod === 0) {
      return;
    } // this._files will keep historical versions of every open file.
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
    } // Remove any old snapshots at the start of the array


    const firstRemainingSnapshot = snapshots.findIndex(snapshot => snapshot.time + this._retentionPeriod > time);

    if (firstRemainingSnapshot > 0) {
      snapshots.splice(0, firstRemainingSnapshot);
    } // Add a new snashot at the end


    snapshots.push({
      time,
      text: buffer.getText(),
      version
    });
  }

  close(filepath) {
    this._files.delete(filepath);
  }

}
/**
 * Formats a UNIX timestamp in 24-hour US format.
 * e.g. 16:01:19
 */


exports.SnapshotLogger = SnapshotLogger;

function formatTime(time) {
  return new Date(time).toLocaleTimeString('en-US', {
    hour12: false
  });
}