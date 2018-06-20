'use strict';

var _tasks;

function _load_tasks() {
  return _tasks = require('../tasks');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
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

describe('commons-node/tasks', () => {
  describe('observableFromTask', () => {
    it('calls start when subscribed', () => {
      const task = createMockTask();
      const observable = (0, (_tasks || _load_tasks()).observableFromTask)(task);
      expect(task.start).not.toHaveBeenCalled();
      observable.subscribe();
      expect(task.start).toHaveBeenCalled();
    });

    it('calls cancel when unsubscribed early', () => {
      const task = createMockTask();
      const observable = (0, (_tasks || _load_tasks()).observableFromTask)(task);
      const sub = observable.subscribe();
      expect(task.cancel).not.toHaveBeenCalled();
      sub.unsubscribe();
      expect(task.cancel).toHaveBeenCalled();
    });

    it('completes when the task does', () => {
      const task = createMockTask();
      const observable = (0, (_tasks || _load_tasks()).observableFromTask)(task);
      const completed = jest.fn();
      observable.subscribe({ complete: completed });
      expect(completed).not.toHaveBeenCalled();
      task._complete();
      expect(completed).toHaveBeenCalled();
    });

    it('errors when the task does', () => {
      const task = createMockTask();
      const observable = (0, (_tasks || _load_tasks()).observableFromTask)(task);
      const errored = jest.fn();
      observable.subscribe({ error: errored });
      expect(errored).not.toHaveBeenCalled();
      task._error(new Error());
      expect(errored).toHaveBeenCalled();
    });

    it("doesn't call cancel when unsubscribed after completion", () => {
      const task = createMockTask();
      const observable = (0, (_tasks || _load_tasks()).observableFromTask)(task);
      const sub = observable.subscribe();
      task._complete();
      sub.unsubscribe();
      expect(task.cancel).not.toHaveBeenCalled();
    });

    it("doesn't call cancel when unsubscribed after an error", () => {
      const task = createMockTask();
      const observable = (0, (_tasks || _load_tasks()).observableFromTask)(task);
      const sub = observable.catch(() => _rxjsBundlesRxMinJs.Observable.empty()).subscribe();
      task._error(new Error());
      sub.unsubscribe();
      expect(task.cancel).not.toHaveBeenCalled();
    });

    it('includes emitted message events', () => {
      const task = createMockTask();
      const observable = (0, (_tasks || _load_tasks()).observableFromTask)(task);
      const handler = jest.fn();
      observable.subscribe(handler);
      task._message({ text: 'hello', level: 'warning' });
      expect(handler).toHaveBeenCalledWith({
        type: 'message',
        message: { text: 'hello', level: 'warning' }
      });
    });

    it('includes emitted progress events', () => {
      const task = createMockTask();
      const observable = (0, (_tasks || _load_tasks()).observableFromTask)(task);
      const handler = jest.fn();
      observable.subscribe(handler);
      task._progress(0.5);
      expect(handler).toHaveBeenCalledWith({ type: 'progress', progress: 0.5 });
    });

    it('includes emitted result events', () => {
      const task = createMockTask();
      const observable = (0, (_tasks || _load_tasks()).observableFromTask)(task);
      const handler = jest.fn();
      observable.subscribe(handler);
      task._result(42);
      expect(handler).toHaveBeenCalledWith({ type: 'result', result: 42 });
    });

    it('includes emitted status events', () => {
      const task = createMockTask();
      const observable = (0, (_tasks || _load_tasks()).observableFromTask)(task);
      const handler = jest.fn();
      observable.subscribe(handler);
      task._status('fine and dandy');
      expect(handler).toHaveBeenCalledWith({
        type: 'status',
        status: 'fine and dandy'
      });
    });
  });

  describe('taskFromObservable', () => {
    it('subscribes when started', () => {
      const observable = new _rxjsBundlesRxMinJs.Subject();
      jest.spyOn(observable, 'subscribe');
      const task = (0, (_tasks || _load_tasks()).taskFromObservable)(observable);
      expect(observable.subscribe).not.toHaveBeenCalled();
      task.start();
      expect(observable.subscribe).toHaveBeenCalled();
    });

    it('unsubscribes when canceled', () => {
      const sub = new _rxjsBundlesRxMinJs.Subscription();
      jest.spyOn(sub, 'unsubscribe').mockImplementation(() => {});
      const observable = new _rxjsBundlesRxMinJs.Subject();
      jest.spyOn(observable, 'subscribe').mockReturnValue(sub);
      const task = (0, (_tasks || _load_tasks()).taskFromObservable)(observable);
      task.start();
      expect(sub.unsubscribe).not.toHaveBeenCalled();
      task.cancel();
      expect(sub.unsubscribe).toHaveBeenCalled();
    });

    it('calls onDidComplete callbacks when it completes', () => {
      const sub = new _rxjsBundlesRxMinJs.Subscription();
      jest.spyOn(sub, 'unsubscribe').mockImplementation(() => {});
      const observable = new _rxjsBundlesRxMinJs.Subject();
      const task = (0, (_tasks || _load_tasks()).taskFromObservable)(observable);
      const completed = jest.fn();
      task.onDidComplete(completed);
      task.start();
      expect(completed).not.toHaveBeenCalled();
      observable.complete();
      expect(completed).toHaveBeenCalled();
    });

    it('calls onDidError callbacks when it errors', () => {
      const observable = new _rxjsBundlesRxMinJs.Subject();
      const task = (0, (_tasks || _load_tasks()).taskFromObservable)(observable);
      const errored = jest.fn();
      task.onDidError(errored);
      task.start();
      expect(errored).not.toHaveBeenCalled();
      observable.error();
      expect(errored).toHaveBeenCalled();
    });

    it('calls onMessage callbacks for message events', () => {
      const observable = new _rxjsBundlesRxMinJs.Subject();
      const task = (0, (_tasks || _load_tasks()).taskFromObservable)(observable);
      const handler = jest.fn();

      if (!(task.onMessage != null)) {
        throw new Error('Invariant violation: "task.onMessage != null"');
      }

      task.onMessage(handler);
      task.start();
      expect(handler).not.toHaveBeenCalled();
      observable.next({
        type: 'message',
        message: { text: 'hello', level: 'warning' }
      });
      expect(handler).toHaveBeenCalledWith({ text: 'hello', level: 'warning' });
    });

    it('calls onProgress callbacks for progress events', () => {
      const observable = new _rxjsBundlesRxMinJs.Subject();
      const task = (0, (_tasks || _load_tasks()).taskFromObservable)(observable);
      const handler = jest.fn();

      if (!(task.onProgress != null)) {
        throw new Error('Invariant violation: "task.onProgress != null"');
      }

      task.onProgress(handler);
      task.start();
      expect(handler).not.toHaveBeenCalled();
      observable.next({ type: 'progress', progress: 0.5 });
      expect(handler).toHaveBeenCalledWith(0.5);
    });

    it('calls onResult callbacks for result events', () => {
      const observable = new _rxjsBundlesRxMinJs.Subject();
      const task = (0, (_tasks || _load_tasks()).taskFromObservable)(observable);
      const handler = jest.fn();

      if (!(task.onResult != null)) {
        throw new Error('Invariant violation: "task.onResult != null"');
      }

      task.onResult(handler);
      task.start();
      expect(handler).not.toHaveBeenCalled();
      observable.next({ type: 'result', result: 42 });
      expect(handler).toHaveBeenCalledWith(42);
    });

    it('calls onStatusChange callbacks for status events', () => {
      const observable = new _rxjsBundlesRxMinJs.Subject();
      const task = (0, (_tasks || _load_tasks()).taskFromObservable)(observable);
      const handler = jest.fn();

      if (!(task.onStatusChange != null)) {
        throw new Error('Invariant violation: "task.onStatusChange != null"');
      }

      task.onStatusChange(handler);
      task.start();
      expect(handler).not.toHaveBeenCalled();
      observable.next({ type: 'status', status: 'fine and dandy' });
      expect(handler).toHaveBeenCalledWith('fine and dandy');
    });
  });
});

function createMockTask() {
  const emitter = new (_eventKit || _load_eventKit()).Emitter();
  const task = {
    start: () => {},
    cancel: () => {},
    onDidComplete: callback => {
      return emitter.on('complete', callback);
    },
    onDidError: callback => {
      return emitter.on('error', callback);
    },
    onMessage: callback => {
      return emitter.on('message', callback);
    },
    onProgress: callback => {
      return emitter.on('progress', callback);
    },
    onResult: callback => {
      return emitter.on('result', callback);
    },
    onStatusChange: callback => {
      return emitter.on('status', callback);
    },
    _complete: () => {
      emitter.emit('complete');
    },
    _error: err => {
      emitter.emit('error', err);
    },
    _message: message => {
      emitter.emit('message', message);
    },
    _progress: progress => {
      emitter.emit('progress', progress);
    },
    _result: result => {
      emitter.emit('result', result);
    },
    _status: status => {
      emitter.emit('status', status);
    }
  };
  jest.spyOn(task, 'start').mockImplementation(() => {});
  jest.spyOn(task, 'cancel').mockImplementation(() => {});
  return task;
}