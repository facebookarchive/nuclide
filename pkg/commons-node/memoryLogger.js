/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {default as Deque} from 'double-ended-queue';
import util from 'util';
import invariant from 'assert';

type LogEntry = {|time: number, text: string|};

// Retain past five minutes
const DEFAULT_RETENTION_PERIOD_MS = 5 * 60 * 1000;

// ...but only if it is less than 10 MB
const DEFAULT_RETENTION_SIZE_LIMIT = 10 * 1000 * 1000;

export class MemoryLogger {
  _underlyingLogger: ?log4js$Logger;
  _logs: Deque<LogEntry> = new Deque();
  _retentionPeriod: number;
  _sizeLimit: number;
  _size: number;

  constructor(
    underlyingLogger: ?log4js$Logger,
    retentionPeriod: number = DEFAULT_RETENTION_PERIOD_MS,
    sizeLimit: number = DEFAULT_RETENTION_SIZE_LIMIT,
  ) {
    this._underlyingLogger = underlyingLogger;
    this._retentionPeriod = retentionPeriod;
    this._sizeLimit = sizeLimit;
    this._size = 0;
  }

  dispose(): void {
    this._logs.isEmpty();
  }

  dump(): string {
    return this._logs
      .toArray()
      .map(entry => `${entry.text}\n`)
      .join('');
  }

  tail(count: number): string {
    invariant(count > 0);
    if (count >= this._logs.length) {
      return this.dump();
    } else {
      return this._logs
        .toArray()
        .slice(this._logs.length - count, this._logs.length)
        .map(entry => `${entry.text}\n`)
        .join('');
    }
  }

  getUnderlyingLogger(): ?log4js$Logger {
    return this._underlyingLogger;
  }

  debug(format: string, ...values: Array<any>): void {
    const message = util.format(format, ...values);
    const underlying = this._underlyingLogger;
    if (underlying != null) {
      underlying.debug(message.substring(0, 400));
    }
    this._appendAndExpunge('DEBUG', message);
  }

  trace(format: string, ...values: Array<any>): void {
    const message = util.format(format, ...values);
    const underlying = this._underlyingLogger;
    if (underlying != null) {
      underlying.trace(message.substring(0, 400));
    }
    this._appendAndExpunge('TRACE', message);
  }

  info(format: string, ...values: Array<any>): void {
    const message = util.format(format, ...values);
    const underlying = this._underlyingLogger;
    if (underlying != null) {
      underlying.info(message.substring(0, 400));
    }
    this._appendAndExpunge('INFO', message);
  }

  warn(format: string, ...values: Array<any>): void {
    const message = util.format(format, ...values);
    const underlying = this._underlyingLogger;
    if (underlying != null) {
      underlying.warn(message);
    }
    this._appendAndExpunge('WARN', message);
  }

  error(format: string, ...values: Array<any>): void {
    const message = util.format(format, ...values);
    const underlying = this._underlyingLogger;
    if (underlying != null) {
      underlying.error(message);
    }
    this._appendAndExpunge('ERROR', message);
  }

  _appendAndExpunge(level: string, message: string): void {
    if (this._retentionPeriod === 0) {
      return;
    }

    // this._logs will keep the past five minute's worth of logs
    const time = Date.now();
    const text =
      new Date(time).toLocaleTimeString('en-US', {hour12: false}) +
      ' ' +
      level +
      ' - ' +
      message;
    // push the new entry
    const newLog: LogEntry = {time, text};
    this._logs.push(newLog);
    this._size += text.length;
    // and remove all expired entries
    while (true) {
      const front = this._logs.peekFront();
      if (front == null) {
        break;
      }
      if (
        time <= front.time + this._retentionPeriod &&
        this._size <= this._sizeLimit
      ) {
        break;
      }
      this._logs.shift();
      this._size -= front.text.length;
    }
  }
}

export class SnapshotLogger {
  _retentionPeriod: number;
  _snapshotInterval: number;
  _files: Map<
    string,
    Array<{|time: number, text: string, version: number|}>,
  > = new Map();

  constructor(
    retentionPeriod: number = 5 * 60 * 1000, // retain past five minutes
    snapshotInterval: number = 30 * 1000, // snapshot no more than every 30s
  ) {
    this._retentionPeriod = retentionPeriod;
    this._snapshotInterval = snapshotInterval;
  }

  dispose(): void {
    this._files.clear();
  }

  dump(): Array<{|title: string, text: string|}> {
    const results = [];
    for (const [filepath, snapshots] of this._files) {
      for (const snapshot of snapshots) {
        const time = new Date(snapshot.time).toLocaleTimeString('en-US', {
          hour12: false,
        });
        const version = String(snapshot.version);
        results.push({
          title: `${filepath} ${time},v${version}`,
          text: snapshot.text,
        });
      }
    }
    return results;
  }

  snapshot(
    filepath: string,
    version: number,
    buffer: simpleTextBuffer$TextBuffer,
  ): void {
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
      if (
        mostRecent.time + this._snapshotInterval > time ||
        mostRecent.version === version
      ) {
        return;
      }
    }
    if (snapshots == null) {
      snapshots = [];
      this._files.set(filepath, snapshots);
    }
    // Remove any old snapshots at the start of the array
    const firstRemainingSnapshot = snapshots.findIndex(
      snapshot => snapshot.time + this._retentionPeriod > time,
    );
    if (firstRemainingSnapshot > 0) {
      snapshots.splice(0, firstRemainingSnapshot);
    }
    // Add a new snashot at the end
    snapshots.push({time, text: buffer.getText(), version});
  }

  close(filepath: string): void {
    this._files.delete(filepath);
  }
}
