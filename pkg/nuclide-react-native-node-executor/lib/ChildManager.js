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
import type {
  RnRequest,
  ServerReplyCallback,
} from './types';
import type {EventEmitter} from 'events';

let logger;
function getLogger() {
  if (!logger) {
    logger = require('../../nuclide-logging').getLogger();
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

  _createChild(): void {
    if (this._child == null) {
      this._child = new Child(this._onReply, this._emitter);
    }
  }

  async killChild(): Promise<void> {
    if (!this._child) {
      return;
    }
    await this._child.kill();
    this._child = null;
  }

  handleMessage(message: RnRequest): void {
    if (message.replyID) {
      // getting cross-talk from another executor (probably Chrome)
      return;
    }

    switch (message.method) {
      case 'prepareJSRuntime':
        return this._prepareJSRuntime(message);
      case 'executeApplicationScript':
        return this._executeApplicationScript(message);
      default:
        return this._executeJSCall(message);
    }
  }

  _prepareJSRuntime(message: RnRequest): void {
    this._createChild();
    this._onReply(message.id);
  }

  _executeApplicationScript(message: RnRequest): void {
    (async () => {
      if (!this._child) {
        // Warn Child not initialized;
        return;
      }

      const {id: messageId, url: messageUrl, inject} = message;
      invariant(messageId != null);
      invariant(messageUrl != null);
      invariant(inject != null);

      const parsedUrl = url.parse(messageUrl, /* parseQueryString */ true);
      invariant(parsedUrl.query);
      parsedUrl.query.inlineSourceMap = true;
      delete parsedUrl.search;
      // $FlowIssue url.format() does not accept what url.parse() returns.
      const scriptUrl = url.format(parsedUrl);
      const script = await getScriptContents(scriptUrl);
      invariant(this._child);
      this._child.executeApplicationScript(script, inject, messageId);
    })();
  }

  _executeJSCall(message: RnRequest): void {
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
