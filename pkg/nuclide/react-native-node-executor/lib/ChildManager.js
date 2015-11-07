'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import http from 'http';
import url from 'url';

import Child from './Child';
import type {ServerReplyCallback} from './types';
import type {EventEmitter} from 'events';

let logger;
function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

export default class ChildManager {

  _child: ?Child;
  _onReply: ServerReplyCallback;
  _emitter: EventEmitter;

  constructor(onReply: ServerReplyCallback, emitter: EventEmitter) {
    this._onReply = onReply;
    this._emitter = emitter;
  }

  async createChild(): Promise<void> {
    await this.killChild();
    this._child = new Child(this._onReply, this._emitter);
  }

  async killChild(): Promise<void> {
    if (!this._child) {
      return;
    }
    await this._child.kill();
    this._child = null;
  }

  handleMessage(message: Object) {
    if (message.replyID) {
      // getting cross-talk from another executor (probably Chrome)
      return;
    }

    switch (message.method) {
      case 'prepareJSRuntime':
        return this.prepareJSRuntime(message);
      case 'executeApplicationScript':
        return this.executeApplicationScript(message);
      case 'executeJSCall':
        return this.executeJSCall(message);
      default:
        getLogger().error(`Unknown method: ${message.method}.\nPayload: ${message}`);
    }
  }

  async prepareJSRuntime(message: Object): Promise<void> {
    await this.createChild();
    this._onReply(message.id);
  }

  async executeApplicationScript(message: Object): Promise<void> {
    if (!this._child) {
      // Warn Child not initialized;
      return;
    }
    const parsedUrl = url.parse(message.url, /* parseQueryString */ true);
    invariant(parsedUrl.query);
    parsedUrl.query.inlineSourceMap = true;
    delete parsedUrl.search;
    // $FlowIssue url.format() does not accept what url.parse() returns.
    const scriptUrl = url.format(parsedUrl);
    const script = await getScriptContents(scriptUrl);
    invariant(this._child);
    this._child.execScript(script, message.inject, message.id);
  }

  executeJSCall(message: Object) {
    if (!this._child) {
      // Warn Child not initialized;
      return;
    }
    this._child.execCall(message, message.id);
  }
}

function getScriptContents(src): Promise<string> {
  return new Promise((resolve, reject) => {
    http.get(src, res => {
      res.setEncoding('utf8');
      let buff = '';
      res.on('data', chunk => buff += chunk);
      res.on('end', () => {
        resolve(buff);
      });
    }).on('error', err => {
      getLogger().error('Failed to get script from packager.');
      reject(err);
    });
  });
}
