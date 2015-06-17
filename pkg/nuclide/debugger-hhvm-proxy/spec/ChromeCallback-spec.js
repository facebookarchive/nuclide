'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var ChromeCallback = require('../lib/ChromeCallback');

describe('debugger-hhvm-proxy ChromeCallback', () => {
  var callback;
  var chromeCallback;

  beforeEach(() => {
    callback = jasmine.createSpy('callback');
    chromeCallback = new ChromeCallback(callback);
  });

  it('sendMethod: no args', () => {
    chromeCallback.sendMethod('method1');
    expect(callback).toHaveBeenCalledWith('{"method":"method1"}');
  });

  it('sendMethod: args', () => {
    chromeCallback.sendMethod('method1', { arg1: 12 });
    expect(callback).toHaveBeenCalledWith('{"method":"method1","params":{"arg1":12}}');
  });

  it('replyWithError', () => {
    chromeCallback.replyWithError(42, 'error-msg');
    expect(callback).toHaveBeenCalledWith('{"id":42,"result":{},"error":"error-msg"}');
  });

  it('replyToCommand: no-error', () => {
    chromeCallback.replyToCommand(42, {result:'value'});
    expect(callback).toHaveBeenCalledWith('{"id":42,"result":{"result":"value"}}');
  });

  it('replyToCommand: error', () => {
    chromeCallback.replyToCommand(42, {result:'value'}, 'error-msg');
    expect(callback).toHaveBeenCalledWith(
      '{"id":42,"result":{"result":"value"},"error":"error-msg"}');
  });

});
