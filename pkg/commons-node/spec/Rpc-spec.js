'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Rpc} from '../Rpc';
import {Observable} from 'rxjs';

class MockTransport {
  sentMessages: Array<string>;
  _incomingMessages: Observable<string>;
  receiveMessages: () => void;

  constructor(incomingMessages: Array<string>) {
    this.sentMessages = [];
    this._incomingMessages = Observable.fromPromise(new Promise((resolve, reject) => {
      this.receiveMessages = () => resolve(incomingMessages);
    })).flatMap(Observable.from);
  }
  sendMessage(message: string): void {
    this.sentMessages.push(message);
  }
  onMessage(): Observable<string> {
    return this._incomingMessages;
  }
}

describe('Rpc', () => {
  it('should be able to make a call', () => {
    waitsForPromise(async () => {
      const transport = new MockTransport(['{"type":"response","id":1,"result":"result1"}']);
      const rpc = new Rpc('TestRPC', transport);
      const result = rpc.call('m', ['1', '2', '3']);
      expect(transport.sentMessages)
        .toEqual(['{"type":"call","id":1,"method":"m","args":["1","2","3"]}']);
      transport.receiveMessages();
      expect(await result).toEqual('result1');
    });
  });

  it('should reject a pending call when the response contains an error', () => {
    waitsForPromise(async () => {
      const transport = new MockTransport(['{"type":"response","id":1,"error":"error1"}']);
      const rpc = new Rpc('TestRPC', transport);
      const result = rpc.call('m', []);
      expect(transport.sentMessages).toEqual(['{"type":"call","id":1,"method":"m","args":[]}']);
      transport.receiveMessages();
      let hadError = false;
      try {
        await result;
      } catch (e) {
        hadError = true;
        expect(e.message).toEqual('error1');
      }
      expect(hadError).toEqual(true);
    });
  });
});
