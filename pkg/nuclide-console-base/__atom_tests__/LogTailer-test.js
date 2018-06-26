'use strict';

var _LogTailer;

function _load_LogTailer() {
  return _LogTailer = require('../lib/LogTailer');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('LogTailer', () => {
  it('invokes the running callback when there\'s no "starting" status', () => {
    const logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'test',
      messages: _rxjsBundlesRxMinJs.Observable.never(),
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart'
      }
    });
    const handleRunning = jest.fn();
    logTailer.start({ onRunning: handleRunning });
    expect(handleRunning).toHaveBeenCalled();
  });

  it('invokes the running callback when there\'s a "starting" status', () => {
    const ready = new _rxjsBundlesRxMinJs.Subject();
    const logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'test',
      messages: _rxjsBundlesRxMinJs.Observable.never(),
      ready,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart'
      }
    });
    const handleRunning = jest.fn();
    logTailer.start({ onRunning: handleRunning });
    expect(handleRunning).not.toHaveBeenCalled();
    ready.next();
    expect(handleRunning).toHaveBeenCalled();
  });

  it("doesn't show an error notification when every start call has a running callback", () => {
    jest.spyOn(atom.notifications, 'addError').mockImplementation(() => {});
    const ready = new _rxjsBundlesRxMinJs.Subject();
    const messages = new _rxjsBundlesRxMinJs.Subject();
    const err = new Error('Uh oh');
    const logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'test',
      messages,
      ready,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart'
      }
    });
    const handleRunning = jest.fn();
    const handleRunning2 = jest.fn();
    logTailer.start({ onRunning: handleRunning });
    logTailer.start({ onRunning: handleRunning2 });
    messages.error(err);
    expect(handleRunning).toHaveBeenCalledWith(err);
    expect(handleRunning2).toHaveBeenCalledWith(err);
    expect(atom.notifications.addError).not.toHaveBeenCalled();
  });

  it("shows an error notification when a running callback isn't registered", () => {
    jest.spyOn(atom.notifications, 'addError').mockImplementation(() => {});
    const ready = new _rxjsBundlesRxMinJs.Subject();
    const messages = new _rxjsBundlesRxMinJs.Subject();
    const err = new Error('Uh oh');
    const logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'test',
      messages,
      ready,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart'
      }
    });
    const handleRunning = jest.fn();
    logTailer.start({ onRunning: handleRunning });
    logTailer.start();
    messages.error(err);
    expect(handleRunning).toHaveBeenCalledWith(err);
    expect(atom.notifications.addError).toHaveBeenCalled();
  });

  it('invokes the running callback with a cancellation error when stopped before ready', () => {
    const logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'test',
      messages: _rxjsBundlesRxMinJs.Observable.never(),
      ready: _rxjsBundlesRxMinJs.Observable.never(),
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart'
      }
    });
    const handleRunning = jest.fn();
    logTailer.start({ onRunning: handleRunning });
    logTailer.stop();
    expect(handleRunning).toHaveBeenCalled();
    const err = handleRunning.mock.calls[0][0];
    expect(err.name).toBe('ProcessCancelledError');
  });

  it('invokes the running callback with a cancellation error when the source completes before ever' + ' becoming ready', () => {
    const messages = new _rxjsBundlesRxMinJs.Subject();
    const logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'test',
      messages,
      ready: _rxjsBundlesRxMinJs.Observable.never(),
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart'
      }
    });
    const handleRunning = jest.fn();
    logTailer.start({ onRunning: handleRunning });
    messages.complete();
    expect(handleRunning).toHaveBeenCalled();
    const err = handleRunning.mock.calls[0][0];
    expect(err.name).toBe('ProcessCancelledError');
  });

  it("invokes the running callback immediately if it's already running", () => {
    const ready = new _rxjsBundlesRxMinJs.Subject();
    const logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'test',
      messages: _rxjsBundlesRxMinJs.Observable.never(),
      ready,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart'
      }
    });
    const handleRunning = jest.fn();
    logTailer.start();
    ready.next();
    logTailer.start({ onRunning: handleRunning });
    expect(handleRunning).toHaveBeenCalled();
  });

  it("shows an error notification if there's an error after it starts running", () => {
    jest.spyOn(atom.notifications, 'addError').mockImplementation(() => {});
    const ready = new _rxjsBundlesRxMinJs.Subject();
    const messages = new _rxjsBundlesRxMinJs.Subject();
    const logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'test',
      messages,
      ready,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart'
      }
    });
    const handleRunning = jest.fn();
    logTailer.start({ onRunning: handleRunning });
    logTailer.start();
    ready.next();
    messages.error(new Error('Uh oh'));
    expect(handleRunning).toHaveBeenCalledWith();
    expect(atom.notifications.addError).toHaveBeenCalled();
  });

  it('uses the error handler', () => {
    jest.spyOn(atom.notifications, 'addError').mockImplementation(() => {});
    const handleError = jest.fn();
    const messages = new _rxjsBundlesRxMinJs.Subject();
    const logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'test',
      messages,
      handleError,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart'
      }
    });
    logTailer.start();
    messages.error(new Error('Uh oh'));
    expect(handleError).toHaveBeenCalled();
    expect(atom.notifications.addError).not.toHaveBeenCalled();
  });

  it('uses the default error handling when the error is re-thrown by the handler', () => {
    jest.spyOn(atom.notifications, 'addError').mockImplementation(() => {});
    const handleError = jest.fn().mockImplementation(err => {
      throw err;
    });
    const messages = new _rxjsBundlesRxMinJs.Subject();
    const logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'test',
      messages,
      handleError,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart'
      }
    });
    logTailer.start();
    messages.error(new Error('Uh oh'));
    expect(handleError).toHaveBeenCalled();
    expect(atom.notifications.addError).toHaveBeenCalled();
  });

  it("doesn't use the default notification when the error handler throws a new error", () => {
    jest.spyOn(atom.notifications, 'addError').mockImplementation(() => {});
    const handleError = jest.fn().mockImplementation(() => {
      throw new Error('Unexpected');
    });
    const messages = new _rxjsBundlesRxMinJs.Subject();
    const logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'test',
      messages,
      handleError,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart'
      }
    });
    logTailer.start();
    messages.error(new Error('Uh oh'));
    expect(handleError).toHaveBeenCalled();
    expect(atom.notifications.addError).not.toHaveBeenCalled();
  });
});