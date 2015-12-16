'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BusySignalMessage} from '../../busy-signal-interfaces';

import {Subject} from 'rx';

import {MessageStore} from '../lib/MessageStore';

describe('MessageStore', () => {
  let messageStore: MessageStore = (null: any);
  let messagePublisher: Subject<BusySignalMessage> = (null: any);
  let messageStreamResults: Array<Array<BusySignalMessage>> = (null: any);
  let sampleMessage: BusySignalMessage = (null: any);

  function getLastResult() {
    return messageStreamResults[messageStreamResults.length - 1];
  }

  beforeEach(() => {
    messageStore = new MessageStore();
    messagePublisher = new Subject();
    messageStreamResults = [];
    sampleMessage = {
      status: 'busy',
      id: 0,
      message: 'foobar',
    };
    const provider = {
      messages: messagePublisher,
    };
    messageStore.consumeProvider(provider);
    messageStore.getMessageStream().subscribe(messages => messageStreamResults.push(messages));
  });

  it('should publish the current state as soon as it receives a subscriber', () => {
    expect(messageStreamResults).toEqual([[]]);
  });

  it('should publish messages it receives', () => {
    messagePublisher.onNext(sampleMessage);
    expect(getLastResult()).toEqual([sampleMessage]);
  });

  it('should remove invalidated messages', () => {
    messagePublisher.onNext(sampleMessage);
    // $FlowIssue(>= 0.19.0) #8813014
    messagePublisher.onNext({...sampleMessage, status: 'done'});
    expect(getLastResult()).toEqual([]);
  });

  it('should allow multiple messages from a single provider', () => {
    const firstMessage = sampleMessage;
    const secondMessage = {...sampleMessage, id: 1};
    messagePublisher.onNext(firstMessage);
    messagePublisher.onNext(secondMessage);
    // Message order within a provider is respected.
    expect(getLastResult()).toEqual([firstMessage, secondMessage]);
    messagePublisher.onNext({...sampleMessage, status: 'done'});
    messagePublisher.onNext({id: 1, status: 'done'});
    expect(getLastResult()).toEqual([]);
  });

  it('should handle messages from different providers', () => {
    const otherPublisher = new Subject();
    messageStore.consumeProvider({
      messages: otherPublisher,
    });
    messagePublisher.onNext(sampleMessage);
    otherPublisher.onNext(sampleMessage);
    expect(getLastResult()).toEqual([sampleMessage, sampleMessage]);
    messagePublisher.onNext({...sampleMessage, status: 'done'});
    expect(getLastResult()).toEqual([sampleMessage]);
  });
});
