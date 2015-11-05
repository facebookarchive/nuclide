'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {fork} from 'child_process';
import path from 'path';

import type {ServerReplyCallback} from './types';

export default class Child {

  _onReply: ServerReplyCallback;
  _proc: Object;

  constructor(onReply: ServerReplyCallback) {
    this._onReply = onReply;

    // TODO(natthu): Atom v1.2.0 will upgrade Electron to v0.34.0 which in turn vendors in node 4.
    // Once we upgrade to that version of atom, we can remove the `execPath` argument and let Atom
    // invoke the subprocess script.
    this._proc = fork(path.join(__dirname, 'executor.js'), [], {execPath: 'node'});
    this._proc.on('message', payload => {
      this._onReply(payload.replyId, payload.result);
    });
  }

  kill(): Promise<void> {
    return new Promise((res, rej) => {
      this._proc.on('close', () => {
        res();
      });
      this._proc.kill();
    });
  }

  execScript(script: string, inject: string, id: number) {
    this._proc.send({
      id,
      op: 'evalScript',
      data: {
        script,
        inject,
      },
    });
  }

  execCall(payload: Object, id: number) {
    this._proc.send({
      id,
      op: 'call',
      data: {
        moduleName: payload.moduleName,
        moduleMethod: payload.moduleMethod,
        arguments: payload.arguments,
      },
    });
  }
}
