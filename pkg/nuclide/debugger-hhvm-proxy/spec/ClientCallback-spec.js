'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ClientCallback as ClientCallbackType} from '../lib/ClientCallback';

import {uncachedRequire, clearRequireCache} from '../../test-helpers';

describe('debugger-hhvm-proxy ClientCallback', () => {
  let clientCallback: any;
  let observableSpy: any;

  beforeEach(() => {
    observableSpy = jasmine.createSpyObj('serverMessageObservable', [
      'onNext',
      'onCompleted',
    ]);
    spyOn(require('rx'), 'Subject').andReturn(observableSpy);
    const {ClientCallback} = ((
      uncachedRequire(require, '../lib/ClientCallback'): any
    ): {ClientCallback: () => ClientCallbackType});
    clientCallback = new ClientCallback();
  });

  afterEach(() => {
    clearRequireCache(require, '../lib/ClientCallback');
  });

  it('sendMethod: no args', () => {
    clientCallback.sendMethod(observableSpy, 'method1');
    expect(observableSpy.onNext).toHaveBeenCalledWith('{"method":"method1"}');
  });

  it('sendMethod: args', () => {
    clientCallback.sendMethod(observableSpy, 'method1', { arg1: 12 });
    expect(observableSpy.onNext).toHaveBeenCalledWith('{"method":"method1","params":{"arg1":12}}');
  });

  it('replyWithError', () => {
    clientCallback.replyWithError(42, 'error-msg');
    expect(observableSpy.onNext).toHaveBeenCalledWith('{"id":42,"result":{},"error":"error-msg"}');
  });

  it('replyToCommand: no-error', () => {
    clientCallback.replyToCommand(42, {result:'value'});
    expect(observableSpy.onNext).toHaveBeenCalledWith('{"id":42,"result":{"result":"value"}}');
  });

  it('replyToCommand: error', () => {
    clientCallback.replyToCommand(42, {result:'value'}, 'error-msg');
    expect(observableSpy.onNext).toHaveBeenCalledWith(
      '{"id":42,"result":{"result":"value"},"error":"error-msg"}');
  });

  it('sendUserMessage', () => {
    const message = {
      type: 'error',
      message: 'error message',
    };
    clientCallback.sendUserMessage('notification', message);
    expect(observableSpy.onNext).toHaveBeenCalledWith(message);
  });

  it('dispose', () => {
    clientCallback.dispose();
    expect(observableSpy.onCompleted).toHaveBeenCalled();
  });
});
