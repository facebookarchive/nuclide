'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SnapshotLogger = exports.MemoryLogger = undefined;

var _dequeue;

function _load_dequeue() {
  return _dequeue = _interopRequireDefault(require('dequeue'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MemoryLogger {

  constructor(underlyingLogger, retentionPeriod = 5 * 60 * 1000) // retain past five minutes
  {
    this._logs = new (_dequeue || _load_dequeue()).default();

    this._underlyingLogger = underlyingLogger;
    this._retentionPeriod = retentionPeriod;
  } // stores LogEntry elements


  dispose() {
    this._logs.empty();
  }

  dump() {
    // We only have a destructive way to enumerate all elements of _log,
    // so we'll build up a replacement list.
    const newLogs = new (_dequeue || _load_dequeue()).default();
    let result = '';
    while (this._logs.length > 0) {
      const log = this._logs.shift();
      result += log.text + '\n';
      newLogs.push(log);
    }
    this._logs = newLogs;
    return result;
  }

  getUnderlyingLogger() {
    return this._underlyingLogger;
  }

  trace(message) {
    this._underlyingLogger.trace(message.substring(0, 400));
    this._appendAndExpunge('TRACE', message);
  }

  info(message) {
    this._underlyingLogger.info(message.substring(0, 400));
    this._appendAndExpunge('INFO', message);
  }

  warn(message) {
    this._underlyingLogger.warn(message);
    this._appendAndExpunge('WARN', message);
  }

  error(message) {
    this._underlyingLogger.error(message);
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
    // and unshift all expired entries
    while (this._logs.length > 0 && this._logs.first().time + this._retentionPeriod <= time) {
      this._logs.shift();
    }
  }
}

exports.MemoryLogger = MemoryLogger; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */

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