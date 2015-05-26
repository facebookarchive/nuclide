'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var HackWorker = require('../lib/HackWorker');
var {EventEmitter} = require('events');
var logger = require('nuclide-logging').getLogger();

describe('HackWorker', () => {
  describe('runWorkerTask()', () => {
    var hackWorker;
    beforeEach(() => {
      hackWorker = new HackWorker();
    });

    afterEach(() => {
      hackWorker.dispose();
    });

    it('runs a trivial function task', () => {
      var taskHandler = jasmine.createSpy();
      hackWorker.runWorkerTask({cmd: 'parseInt', args: ['25']}).then(taskHandler);
      waitsFor(() => taskHandler.callCount > 0);
      runs(() => {
        var response = taskHandler.argsForCall[0][0];
        expect(response).toBe(25);
      });
    });

    it('fail a worker task and gets error', () => {
      var taskHandler = jasmine.createSpy();
      hackWorker.runWorkerTask({cmd: 'nothing', args: []}).catch(taskHandler);
      waitsFor(() => taskHandler.callCount > 0);
      runs(() => {
        var error = taskHandler.argsForCall[0][0];
        expect(error.type).toBe('error');
        expect(error.message).toBe('Uncaught TypeError: Cannot read property \'apply\' of undefined');
      });
    });
  });

  describe('simulate queueing tasks with custom worker', () => {
    var hackWorker;
    var worker;
    var workerReplyIn = (milliSeconds) => {
      worker.postMessage = (message) => {
        setTimeout(() => {
          worker.emit('message', {data: message});
        }, milliSeconds);
      };
    };
    beforeEach(() => {
      worker = new EventEmitter();
      worker.addEventListener = worker.addListener;
      worker.terminate = () => 0;
      workerReplyIn(5);
      hackWorker = new HackWorker({worker, webWorkerTimeout: 10, poorPerfTimeout: 20});
    });

    afterEach(() => {
      hackWorker.dispose();
    });

    it('queues and processes two tasks in order', () => {
      var task1Handler = jasmine.createSpy();
      hackWorker.runWorkerTask('reply1').then(task1Handler);
      var task2Handler = jasmine.createSpy();
      hackWorker.runWorkerTask('reply2').then(task2Handler);
      expect(task1Handler.callCount).toBe(0);
      expect(task2Handler.callCount).toBe(0);
      window.advanceClock(6);
      waits(1);
      runs(() => {
        expect(task1Handler.callCount).toBe(1);
        expect(task1Handler.argsForCall[0][0]).toBe('reply1');
        expect(task2Handler.callCount).toBe(0);
        window.advanceClock(6);
      });
      waits(1);
      runs(() => {
        expect(task1Handler.callCount).toBe(1);
        expect(task2Handler.callCount).toBe(1);
        expect(task2Handler.argsForCall[0][0]).toBe('reply2');
      });
    });

    it('task timeout warning, then the result', () => {
      var warnHandler = logger.warn = jasmine.createSpy();
      workerReplyIn(15);
      var taskHandler = jasmine.createSpy();
      hackWorker.runWorkerTask('reply').then(taskHandler);
      window.advanceClock(11);
      waits(1);
      runs(() => {
        expect(taskHandler.callCount).toBe(0);
        expect(warnHandler.callCount).toBe(1);
        expect(warnHandler.argsForCall[0][0]).toBe('Webworker is stuck in a job!');
        window.advanceClock(5);
      });
      waits(1);
      runs(() => {
        expect(taskHandler.callCount).toBe(1);
        expect(warnHandler.callCount).toBe(1);
        expect(taskHandler.argsForCall[0][0]).toBe('reply');
      });
    });

    it('task timeout and perf warnings, then the result, then a normal task time', () => {
      var warnHandler = logger.warn = jasmine.createSpy();
      var task1Handler = jasmine.createSpy();
      var task2Handler = jasmine.createSpy();
      // schedule the first task with extraordinary response time.
      workerReplyIn(25);
      hackWorker.runWorkerTask('reply1').then(task1Handler);
      // queue another task with a normal task time.
      workerReplyIn(5);
      hackWorker.runWorkerTask('reply2').then(task2Handler);
      window.advanceClock(11);
      waits(1);
      runs(() => {
        expect(task1Handler.callCount).toBe(0);
        expect(task2Handler.callCount).toBe(0);
        expect(warnHandler.callCount).toBe(1);
        expect(warnHandler.argsForCall[0][0]).toBe('Webworker is stuck in a job!');
        window.advanceClock(11);
      });
      waits(1);
      runs(() => {
        expect(task1Handler.callCount).toBe(0);
        expect(task2Handler.callCount).toBe(0);
        expect(warnHandler.callCount).toBe(2);
        expect(warnHandler.argsForCall[1][0]).toBe('Poor Webworker Performance!');
        window.advanceClock(4);
      });
      waits(1);
      runs(() => {
        expect(task1Handler.callCount).toBe(1);
        expect(task1Handler.argsForCall[0][0]).toBe('reply1');
        expect(task2Handler.callCount).toBe(0);
        expect(warnHandler.callCount).toBe(2);
        window.advanceClock(6);
      });
      waits(1);
      runs(() => {
        expect(task2Handler.callCount).toBe(1);
        expect(task2Handler.argsForCall[0][0]).toBe('reply2');
      });
    });
  });
});
