'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {HackRpc} from '../lib/HackRpc';
import {Observable} from 'rxjs';

class MockTransport {
  sentMessages: Array<string>;
  _incomingMessages: Observable<string>;
  recieveMessages: () => void;

  constructor(incomingMessages: Array<string>) {
    this.sentMessages = [];
    this._incomingMessages = Observable.fromPromise(new Promise((resolve, reject) => {
      this.recieveMessages = () => resolve(incomingMessages);
    })).flatMap(Observable.from);
  }
  sendMessage(message: string): void {
    this.sentMessages.push(message);
  }
  onMessage(): Observable<string> {
    return this._incomingMessages;
  }
}

describe('HackRpc', () => {
  it('call', () => {
    waitsForPromise(async () => {
      const transport = new MockTransport(['{"type":"response","id":1,"result":"result1"}']);
      const rpc = new HackRpc(transport);
      const result = rpc.call(['1', '2', '3']);
      expect(transport.sentMessages).toEqual(['{"type":"call","id":1,"args":["1","2","3"]}']);
      transport.recieveMessages();
      expect(await result).toEqual('result1');
    });
  });

  it('call with error', () => {
    waitsForPromise(async () => {
      const transport = new MockTransport(['{"type":"response","id":1,"error":"error1"}']);
      const rpc = new HackRpc(transport);
      const result = rpc.call([]);
      expect(transport.sentMessages).toEqual(['{"type":"call","id":1,"args":[]}']);
      transport.recieveMessages();
      let hadError = false;
      try {
        await result;
      } catch (e) {
        hadError = true;
        expect(e.toString()).toEqual('Error: "error1"');
      }
      expect(hadError).toEqual(true);
    });
  });
});
