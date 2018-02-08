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

import type {WebSocketTransport} from '../lib/WebSocketTransport';
import invariant from 'assert';
import {
  QueuedAckTransport,
  frameAck,
  frameContent,
  parseMessage,
  ACK,
  CONTENT,
  ACK_BUFFER_TIME,
  PENDING_MESSAGE_TIMEOUT,
} from '../lib/QueuedAckTransport';
import {Emitter} from 'event-kit';
import {Subject} from 'rxjs';
import {protocolLogger} from '../lib/utils';

function makeUnreliableTransport(
  receiver: Subject<string> = new Subject(),
): WebSocketTransport {
  let isClosed = false;
  const transport: any = new Emitter();
  transport.send = jasmine.createSpy('send').andCallFake((data: Object) => {
    transport.emit('send', data);
    return Promise.resolve(true);
  });
  transport.onClose = jasmine
    .createSpy('onClose')
    .andCallFake((callback: () => mixed): IDisposable => {
      return transport.on('close', callback);
    });
  transport.onMessage = jasmine.createSpy('onMessage').andReturn(receiver);
  transport.close = jasmine.createSpy('close').andCallFake((): void => {
    isClosed = true;
    transport.emit('close');
  });
  transport.isClosed = (): boolean => {
    return isClosed;
  };
  return transport;
}

describe('QueuedAckTransport framing', () => {
  it('roundtrips ack id', () => {
    const wireMessage = frameAck(53);
    const parsed = parseMessage(wireMessage);
    expect(parsed.type).toBe(ACK);
    expect(parsed.id).toBe(53);
  });
  it('roundtrips content', () => {
    const id = 65536;
    const message = 'May I ask you a question?';
    const wireMessage = frameContent(id, message);
    const parsed = parseMessage(wireMessage);
    expect(parsed.type).toBe(CONTENT);
    invariant(parsed.type === 'CONTENT');
    expect(parsed.id).toBe(id);
    expect(parsed.message).toBe(message);
  });
});

describe('QueuedAckTransport', () => {
  let receiver: Subject<string>;
  let transport;
  let q;

  beforeEach(() => {
    receiver = new Subject();
    transport = makeUnreliableTransport(receiver);
    q = new QueuedAckTransport('42', transport, protocolLogger);
  });

  it('constructor', () => {
    expect(q.getState()).toBe('open');
    expect(transport.onMessage).toHaveBeenCalledWith();
    expect(transport.onClose).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('send - open', () => {
    const data = JSON.stringify({message: 42});
    q.send(data);
    expect(transport.send).toHaveBeenCalledWith(frameContent(1, data));
  });

  it('close tranport', () => {
    const onDisconnect = jasmine.createSpy('onDisconnect');
    q.onDisconnect(onDisconnect);

    transport.close();

    expect(q.getState()).toBe('disconnected');
    expect(onDisconnect).toHaveBeenCalledWith(transport);
  });

  it('disconnect', () => {
    const onDisconnect = jasmine.createSpy('onDisconnect');
    q.onDisconnect(onDisconnect);

    q.disconnect();

    expect(q.getState()).toBe('disconnected');
    expect(onDisconnect).toHaveBeenCalledWith(transport);
    expect(transport.close).toHaveBeenCalledWith();

    q.disconnect();

    expect(q.getState()).toBe('disconnected');
  });

  it('dispose unsubscribes from disconnect', () => {
    const onDisconnect = jasmine.createSpy('onDisconnect');
    q.onDisconnect(onDisconnect).dispose();

    q.disconnect();

    expect(onDisconnect).not.toHaveBeenCalled();
  });

  it('reconnnect', () => {
    q.disconnect();

    const newTransport = makeUnreliableTransport();
    q.reconnect(newTransport);

    expect(q.getState()).toBe('open');
    expect(newTransport.onMessage).toHaveBeenCalledWith();
    expect(newTransport.onClose).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('send while disconnected resends on reconnect', () => {
    q.disconnect();
    const data = JSON.stringify({message: 42});
    q.send(data);

    const newTransport = makeUnreliableTransport();
    q.reconnect(newTransport);

    expect(q.getState()).toBe('open');
    expect(transport.send).not.toHaveBeenCalled();
    expect(newTransport.send).toHaveBeenCalledWith(frameContent(1, data));
  });

  it('resend only unacked on reconnect', () => {
    const data1 = JSON.stringify({message: 42});
    const data2 = JSON.stringify({message: 97});
    q.send(data1);
    q.send(data2);
    receiver.next(frameAck(1));
    q.disconnect();

    const newTransport = makeUnreliableTransport(receiver);
    q.reconnect(newTransport);

    expect(q.getState()).toBe('open');
    expect(transport.send).toHaveBeenCalled();
    expect(transport.send.argsForCall).toEqual([
      [frameContent(1, data1)],
      [frameContent(2, data2)],
    ]);
    expect(newTransport.send).toHaveBeenCalled();
    expect(newTransport.send.argsForCall).toEqual([[frameContent(2, data2)]]);
  });

  it('close', () => {
    const onDisconnect = jasmine.createSpy('onDisconnect');
    q.onDisconnect(onDisconnect);
    q.close();

    expect(onDisconnect).toHaveBeenCalledWith(transport);
    expect(q.getState()).toBe('closed');
    expect(transport.close).toHaveBeenCalledWith();
  });

  it('close after disconnect', () => {
    q.disconnect();
    const onDisconnect = jasmine.createSpy('onDisconnect');
    q.onDisconnect(onDisconnect);
    q.close();

    expect(onDisconnect).not.toHaveBeenCalled();
    expect(q.getState()).toBe('closed');
  });

  it('onMessage', () => {
    const onMessage = jasmine.createSpy('onMessage');
    q.onMessage().subscribe(onMessage);
    const data = JSON.stringify({message: 42});
    receiver.next(frameContent(1, data));

    expect(onMessage).toHaveBeenCalledWith(data);
  });

  // This simulates receiving the first two messages out of order.
  // The receiver should process 1,2.
  it('onMessage first two out of order', () => {
    const onMessage = jasmine.createSpy('onMessage');
    q.onMessage().subscribe(onMessage);
    const data1 = JSON.stringify({message: 42});
    const data2 = JSON.stringify({message: 43});

    receiver.next(frameContent(2, data2));
    receiver.next(frameContent(1, data1));

    expect(onMessage.argsForCall).toEqual([[data1], [data2]]);
  });

  // This simulates a sender retrying messages and sending a,a,b,b (where a+1=b),
  // where the middle two messages are reordered so the receiver sees a,b,a,b.
  // The receiver should still process only a,b
  it('onMessage retry out of order', () => {
    const onMessage = jasmine.createSpy('onMessage');
    q.onMessage().subscribe(onMessage);
    const data1 = JSON.stringify({message: 42});
    const data2 = JSON.stringify({message: 43});

    receiver.next(frameContent(1, data1));
    receiver.next(frameContent(2, data2));
    receiver.next(frameContent(1, data1));
    receiver.next(frameContent(2, data2));

    expect(onMessage).toHaveBeenCalled();
    expect(onMessage.argsForCall).toEqual([[data1], [data2]]);
  });

  it('dispose unsubscribes from onMessage', () => {
    const onMessage = jasmine.createSpy('onMessage');
    const subscription = q.onMessage().subscribe(onMessage);
    subscription.unsubscribe();

    const data = JSON.stringify({message: 42});
    receiver.next(frameContent(1, data));

    expect(onMessage).not.toHaveBeenCalled();
  });

  it('disconnects if pending send sits too long', () => {
    const data = JSON.stringify({message: 42});
    q.send(data);

    advanceClock(PENDING_MESSAGE_TIMEOUT - 1);
    expect(transport.close).not.toHaveBeenCalled();
    expect(q.getState()).toBe('open');

    advanceClock(2);
    expect(transport.close).toHaveBeenCalled();
    expect(q.getState()).toBe('disconnected');
  });

  it('disconnects if pending receive sits too long', () => {
    const onMessage = jasmine.createSpy('onMessage');
    q.onMessage().subscribe(onMessage);
    const data = JSON.stringify({message: 42});
    receiver.next(frameContent(2, data));

    advanceClock(PENDING_MESSAGE_TIMEOUT - 1);
    expect(transport.close).not.toHaveBeenCalled();
    expect(q.getState()).toBe('open');

    advanceClock(2);
    expect(transport.close).toHaveBeenCalled();
    expect(q.getState()).toBe('disconnected');

    expect(onMessage).not.toHaveBeenCalled();
  });

  it('does not disconnect if no pending work', () => {
    const data = JSON.stringify({message: 42});
    q.send(data);
    receiver.next(frameAck(1));

    advanceClock(2 * PENDING_MESSAGE_TIMEOUT);
    expect(transport.close).not.toHaveBeenCalled();
    expect(q.getState()).toBe('open');
  });

  it('does not disconnect if we keep making progress', () => {
    const data1 = JSON.stringify({message: 42});
    const data2 = JSON.stringify({message: 97});
    const expectedSends = [];
    const expectedDeliveries = [];
    const onMessage = jasmine.createSpy('onMessage');
    q.onMessage().subscribe(onMessage);

    const check = checkId => {
      expect(q.getState()).toBe('open', checkId);
      expect(transport.close).not.toHaveBeenCalled();
      expect(transport.send.argsForCall).toEqual(expectedSends, checkId);
      expect(onMessage.argsForCall).toEqual(expectedDeliveries, checkId);
    };

    q.send(data1);
    expectedSends.push([frameContent(1, data1)]);
    check('q.send(data1)');

    advanceClock(PENDING_MESSAGE_TIMEOUT - 1);
    check('advanceClock after q.send(data1)');

    receiver.next(frameContent(2, data2));
    check('receiver.next(frameContent(2, data2))');

    receiver.next(frameAck(1));
    check('receiver.next(frameAck(1))');

    advanceClock(PENDING_MESSAGE_TIMEOUT - 1);
    check('advanceClock after receiver.next(frameAck(1))');

    q.send(data2);
    expectedSends.push([frameContent(2, data2)]);
    check('q.send(data2)');

    receiver.next(frameContent(1, data1));
    expectedDeliveries.push([data1]);
    expectedDeliveries.push([data2]);
    check('receiver.next(frameContent(1, data1))');

    advanceClock(PENDING_MESSAGE_TIMEOUT - 1);
    // Assuming ACK_BUFFER_TIME has passed, now that we received 2 and then 1,
    // we should have sent an ack for 2.
    invariant(PENDING_MESSAGE_TIMEOUT - 1 > ACK_BUFFER_TIME);
    expectedSends.push([frameAck(2)]);
    check('advanceClock after receiver.next(frameContent(1, data1))');

    receiver.next(frameAck(2));
    check('receiver.next(frameAck(2))');

    advanceClock(2 * PENDING_MESSAGE_TIMEOUT);
    check('advanceClock final');
  });

  it('does not crash with amnesia', () => {
    receiver.next(frameAck(10));
    expect(q.getState()).toBe('closed');
    expect(transport.close).toHaveBeenCalled();
  });
});
