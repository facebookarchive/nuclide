'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CircularBuffer} from '../../nuclide-commons';
import {Emitter} from 'atom';

export type Item = {
  date: Date;
  service: string;
  method: string;
  isLocal: boolean;
  args: Array<mixed>;
  argInfo: ?string;
}

const NEW_ITEM_EVENT = 'NEW_ITEM_EVENT';

export default class ServiceLogger {
  _buffer: CircularBuffer<Item>;
  _emitter: Emitter;

  constructor() {
    this._buffer = new CircularBuffer(10000);
    this._emitter = new Emitter();
  }

  logServiceCall(
    service: string,
    method: string,
    isLocal: boolean,
    ...args: Array<mixed>
  ): void {
    const item: Item = {
      date: new Date(),
      service,
      method,
      isLocal,
      args,
      argInfo: createArgInfo(service, method, args),
    };
    this._buffer.push(item);
    this._emitter.emit(NEW_ITEM_EVENT, item);
  }

  // $FlowIssue: t6187050
  [Symbol.iterator](): Iterator<Item> {
    return this._buffer[Symbol.iterator]();
  }

  onNewItem(callback: (item: Item) => mixed): IDisposable {
    return this._emitter.on(NEW_ITEM_EVENT, callback);
  }

  dispose() {
    this._emitter.dispose();
  }
}

/**
 * THIS IS A HACK.
 *
 * Takes the info for a service call and returns a string description of the relevant arguments.
 *
 * For now, we centralize some logic about how particular service calls should be formatted for
 * display in log messages and the Nuclide Service Monitor. Rather than annotate which arguments
 * in a service call should be included in the serialized version of the args (that are used for
 * debugging), we take a shortcut and just hardcode the logic for each service call of interest,
 * for now. It's not smart to choose a naive heuristic like "log all string arguments" because
 * services such as Flow take the unsaved file contents as an argument, which would clutter our
 * logs.
 */
function createArgInfo(service: string, method: string, args: Array<any>): ?string {
  if (service === 'ArcanistBaseService') {
    // All Arcanist services take a file.
    return /* fileName */ args[0];
  } else if (service === 'BuckUtils') {
    if (method === 'getBuckProjectRoot') {
      return /* fileName */ args[0];
    }
  } else if (service === 'FlowService') {
    if (method === 'findDefinition') {
      return /* fileName */ args[0];
    } else if (method === 'findDiagnostics') {
      return /* fileName */ args[0];
    } else if (method === 'getType') {
      return /* fileName */ args[0];
    } else if (method === 'getAutocompleteSuggestions') {
      return /* fileName */ args[0];
    }
  } else if (service === 'HgService') {
    if (method === 'fetchDiffInfo') {
      return /* fileName */ args[0];
    } else if (method === 'fetchStatuses') {
      const filePaths: Array<string> = args[0];
      return filePaths.join(';');
    }
  }
  return null;
}
