var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-env browser */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _logging = require('../../logging');

var logger = (0, _logging.getLogger)();

var DEFAULT_WEBWORKER_TIMEOUT = 30 * 1000;
var DEFAULT_POOR_PERF_TIMEOUT = 8 * 1000;

/**
 * HackWorker uses the hh_ide.js that's a translation from OCaml to JavaScript (not readable).
 * It's responsible for providing language services without hitting the server, if possible.
 * e.g. some autocompletions, go to definition, diagnostic requests and outline could be served
 * locally. This is done as a web worker not to block the main UI thread when executing language
 * tasks.
 */

var HackWorker = (function () {
  function HackWorker(options) {
    var _this = this;

    _classCallCheck(this, HackWorker);

    options = options || {};
    this._activeTask = null;
    this._taskQueue = [];
    this._depTaskQueue = [];
    this._webWorkerTimeout = options.webWorkerTimeout || DEFAULT_WEBWORKER_TIMEOUT;
    this._poorPefTimeout = options.poorPerfTimeout || DEFAULT_POOR_PERF_TIMEOUT;
    this._worker = options.worker || startWebWorker();
    this._worker.addEventListener('message', function (e) {
      return _this._handleHackWorkerReply(e.data);
    }, false);
    this._worker.addEventListener('error', function (error) {
      return _this._handleHackWorkerError(error);
    }, false);
  }

  /**
   * Runs a web worker task and returns a promise of the value expected from the hack worker.
   */

  _createClass(HackWorker, [{
    key: 'runWorkerTask',
    value: function runWorkerTask(workerMessage, options) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        options = options || {};
        var queue = options.isDependency ? _this2._depTaskQueue : _this2._taskQueue;
        queue.push({
          workerMessage: workerMessage,
          onResponse: function onResponse(response) {
            var internalError = response.internal_error;
            if (internalError) {
              logger.error('Hack Worker: Internal Error! - ' + String(internalError) + ' - ' + JSON.stringify(workerMessage));
              reject(internalError);
            } else {
              resolve(response);
            }
          },
          onFail: function onFail(error) {
            logger.error('Hack Worker: Error!', error, JSON.stringify(workerMessage));
            reject(error);
          }
        });
        _this2._dispatchTaskIfReady();
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._worker.terminate();
    }
  }, {
    key: '_dispatchTaskIfReady',
    value: function _dispatchTaskIfReady() {
      var _this3 = this;

      if (this._activeTask) {
        return;
      }
      if (this._taskQueue.length) {
        this._activeTask = this._taskQueue.shift();
      } else if (this._depTaskQueue.length) {
        this._activeTask = this._depTaskQueue.shift();
      }
      if (this._activeTask) {
        (function () {
          // dispatch it and start timers
          var workerMessage = _this3._activeTask.workerMessage;
          _this3._dispatchTask(workerMessage);
          _this3._timeoutTimer = setTimeout(function () {
            logger.warn('Webworker is stuck in a job!', JSON.stringify(workerMessage));
          }, _this3._webWorkerTimeout);
          _this3._performanceTimer = setTimeout(function () {
            logger.warn('Poor Webworker Performance!', JSON.stringify(workerMessage));
          }, _this3._poorPefTimeout);
        })();
      }
    }
  }, {
    key: '_dispatchTask',
    value: function _dispatchTask(taskMessage) {
      this._worker.postMessage(taskMessage);
    }
  }, {
    key: '_handleHackWorkerReply',
    value: function _handleHackWorkerReply(reply) {
      this._clearTimers();
      if (this._activeTask) {
        this._activeTask.onResponse(reply);
      } else {
        logger.error('Hack Worker replied without an active task!');
      }
      this._activeTask = null;
      this._dispatchTaskIfReady();
    }
  }, {
    key: '_handleHackWorkerError',
    value: function _handleHackWorkerError(error) {
      this._clearTimers();
      if (this._activeTask) {
        this._activeTask.onFail(error);
      } else {
        logger.error('Hack Worker errored without an active task!');
      }
      this._activeTask = null;
      this._dispatchTaskIfReady();
    }
  }, {
    key: '_clearTimers',
    value: function _clearTimers() {
      clearTimeout(this._timeoutTimer);
      clearTimeout(this._performanceTimer);
    }
  }]);

  return HackWorker;
})();

function startWebWorker() {
  // Hacky way to load the worker files from the filesystem as text,
  // then inject the text into Blob url for the WebWorker to consume.
  // http://stackoverflow.com/questions/10343913/how-to-create-a-web-worker-from-a-string
  // I did so because I can't use the atom:// url protocol to load resources in javascript:
  // https://github.com/atom/atom/blob/master/src/browser/atom-protocol-handler.coffee
  var hhIdeText = _fs2['default'].readFileSync(_path2['default'].join(__dirname, '../VendorLib/hh_ide.js'), 'utf-8');
  var webWorkerText = _fs2['default'].readFileSync(_path2['default'].join(__dirname, '../static/HackWebWorker.js'), 'utf-8');
  // Concatenate the code text to pass to the Worker in a blob url
  var workerText = hhIdeText + '\n//<<MERGE>>\n' + webWorkerText;
  var blob = new Blob([workerText], { type: 'application/javascript' });
  var worker = new Worker(URL.createObjectURL(blob));
  return worker;
}

module.exports = HackWorker;
//# sourceMappingURL=data:application/json;base64,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QUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IkhhY2tXb3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuY29uc3QgREVGQVVMVF9XRUJXT1JLRVJfVElNRU9VVCA9IDMwICogMTAwMDtcbmNvbnN0IERFRkFVTFRfUE9PUl9QRVJGX1RJTUVPVVQgPSA4ICogMTAwMDtcblxudHlwZSBXb3JrZXJUYXNrID0ge1xuICB3b3JrZXJNZXNzYWdlOiBtaXhlZDtcbiAgb25SZXNwb25zZTogKHJlc3BvbnNlOiBhbnkpID0+IHZvaWQ7XG4gIG9uRmFpbDogKGVycm9yOiBFcnJvcikgPT4gdm9pZDtcbn07XG5cbi8qKlxuICogSGFja1dvcmtlciB1c2VzIHRoZSBoaF9pZGUuanMgdGhhdCdzIGEgdHJhbnNsYXRpb24gZnJvbSBPQ2FtbCB0byBKYXZhU2NyaXB0IChub3QgcmVhZGFibGUpLlxuICogSXQncyByZXNwb25zaWJsZSBmb3IgcHJvdmlkaW5nIGxhbmd1YWdlIHNlcnZpY2VzIHdpdGhvdXQgaGl0dGluZyB0aGUgc2VydmVyLCBpZiBwb3NzaWJsZS5cbiAqIGUuZy4gc29tZSBhdXRvY29tcGxldGlvbnMsIGdvIHRvIGRlZmluaXRpb24sIGRpYWdub3N0aWMgcmVxdWVzdHMgYW5kIG91dGxpbmUgY291bGQgYmUgc2VydmVkXG4gKiBsb2NhbGx5LiBUaGlzIGlzIGRvbmUgYXMgYSB3ZWIgd29ya2VyIG5vdCB0byBibG9jayB0aGUgbWFpbiBVSSB0aHJlYWQgd2hlbiBleGVjdXRpbmcgbGFuZ3VhZ2VcbiAqIHRhc2tzLlxuICovXG5cbnR5cGUgSGFja1dvcmtlck9wdGlvbnMgPSB7XG4gIHdlYldvcmtlclRpbWVvdXQ/OiBudW1iZXI7XG4gIHBvb3JQZXJmVGltZW91dD86IG51bWJlcjtcbiAgd29ya2VyPzogV29ya2VyO1xufTtcblxuY2xhc3MgSGFja1dvcmtlciB7XG4gIF9hY3RpdmVUYXNrOiA/V29ya2VyVGFzaztcbiAgX3Rhc2tRdWV1ZTogQXJyYXk8V29ya2VyVGFzaz47XG4gIF9kZXBUYXNrUXVldWU6IEFycmF5PFdvcmtlclRhc2s+O1xuICBfd2ViV29ya2VyVGltZW91dDogbnVtYmVyO1xuICBfcG9vclBlZlRpbWVvdXQ6IG51bWJlcjtcbiAgX3dvcmtlcjogV29ya2VyO1xuICBfdGltZW91dFRpbWVyOiBhbnk7XG4gIF9wZXJmb3JtYW5jZVRpbWVyOiBhbnk7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogP0hhY2tXb3JrZXJPcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5fYWN0aXZlVGFzayA9IG51bGw7XG4gICAgdGhpcy5fdGFza1F1ZXVlID0gW107XG4gICAgdGhpcy5fZGVwVGFza1F1ZXVlID0gW107XG4gICAgdGhpcy5fd2ViV29ya2VyVGltZW91dCA9IG9wdGlvbnMud2ViV29ya2VyVGltZW91dCB8fCBERUZBVUxUX1dFQldPUktFUl9USU1FT1VUO1xuICAgIHRoaXMuX3Bvb3JQZWZUaW1lb3V0ID0gb3B0aW9ucy5wb29yUGVyZlRpbWVvdXQgfHwgREVGQVVMVF9QT09SX1BFUkZfVElNRU9VVDtcbiAgICB0aGlzLl93b3JrZXIgPSBvcHRpb25zLndvcmtlciB8fCBzdGFydFdlYldvcmtlcigpO1xuICAgIHRoaXMuX3dvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZSA9PiB0aGlzLl9oYW5kbGVIYWNrV29ya2VyUmVwbHkoZS5kYXRhKSwgZmFsc2UpO1xuICAgIHRoaXMuX3dvcmtlci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yID0+IHRoaXMuX2hhbmRsZUhhY2tXb3JrZXJFcnJvcihlcnJvciksIGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIGEgd2ViIHdvcmtlciB0YXNrIGFuZCByZXR1cm5zIGEgcHJvbWlzZSBvZiB0aGUgdmFsdWUgZXhwZWN0ZWQgZnJvbSB0aGUgaGFjayB3b3JrZXIuXG4gICAqL1xuICBydW5Xb3JrZXJUYXNrKHdvcmtlck1lc3NhZ2U6IG1peGVkLCBvcHRpb25zOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIGNvbnN0IHF1ZXVlID0gb3B0aW9ucy5pc0RlcGVuZGVuY3kgPyB0aGlzLl9kZXBUYXNrUXVldWUgOiB0aGlzLl90YXNrUXVldWU7XG4gICAgICBxdWV1ZS5wdXNoKHtcbiAgICAgICAgd29ya2VyTWVzc2FnZSxcbiAgICAgICAgb25SZXNwb25zZTogcmVzcG9uc2UgPT4ge1xuICAgICAgICAgIGNvbnN0IGludGVybmFsRXJyb3IgPSByZXNwb25zZS5pbnRlcm5hbF9lcnJvcjtcbiAgICAgICAgICBpZiAoaW50ZXJuYWxFcnJvcikge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdIYWNrIFdvcmtlcjogSW50ZXJuYWwgRXJyb3IhIC0gJyArXG4gICAgICAgICAgICAgICAgU3RyaW5nKGludGVybmFsRXJyb3IpICsgJyAtICcgKyBKU09OLnN0cmluZ2lmeSh3b3JrZXJNZXNzYWdlKSk7XG4gICAgICAgICAgICByZWplY3QoaW50ZXJuYWxFcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb25GYWlsOiBlcnJvciA9PiB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdIYWNrIFdvcmtlcjogRXJyb3IhJywgZXJyb3IsIEpTT04uc3RyaW5naWZ5KHdvcmtlck1lc3NhZ2UpKTtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9kaXNwYXRjaFRhc2tJZlJlYWR5KCk7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3dvcmtlci50ZXJtaW5hdGUoKTtcbiAgfVxuXG4gIF9kaXNwYXRjaFRhc2tJZlJlYWR5KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hY3RpdmVUYXNrKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl90YXNrUXVldWUubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9hY3RpdmVUYXNrID0gdGhpcy5fdGFza1F1ZXVlLnNoaWZ0KCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9kZXBUYXNrUXVldWUubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9hY3RpdmVUYXNrID0gdGhpcy5fZGVwVGFza1F1ZXVlLnNoaWZ0KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9hY3RpdmVUYXNrKSB7XG4gICAgICAvLyBkaXNwYXRjaCBpdCBhbmQgc3RhcnQgdGltZXJzXG4gICAgICBjb25zdCB3b3JrZXJNZXNzYWdlID0gdGhpcy5fYWN0aXZlVGFzay53b3JrZXJNZXNzYWdlO1xuICAgICAgdGhpcy5fZGlzcGF0Y2hUYXNrKHdvcmtlck1lc3NhZ2UpO1xuICAgICAgdGhpcy5fdGltZW91dFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxvZ2dlci53YXJuKCdXZWJ3b3JrZXIgaXMgc3R1Y2sgaW4gYSBqb2IhJywgSlNPTi5zdHJpbmdpZnkod29ya2VyTWVzc2FnZSkpO1xuICAgICAgfSwgdGhpcy5fd2ViV29ya2VyVGltZW91dCk7XG4gICAgICB0aGlzLl9wZXJmb3JtYW5jZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxvZ2dlci53YXJuKCdQb29yIFdlYndvcmtlciBQZXJmb3JtYW5jZSEnLCBKU09OLnN0cmluZ2lmeSh3b3JrZXJNZXNzYWdlKSk7XG4gICAgICB9LCB0aGlzLl9wb29yUGVmVGltZW91dCk7XG4gICAgfVxuICB9XG5cbiAgX2Rpc3BhdGNoVGFzayh0YXNrTWVzc2FnZTogbWl4ZWQpIHtcbiAgICB0aGlzLl93b3JrZXIucG9zdE1lc3NhZ2UodGFza01lc3NhZ2UpO1xuICB9XG5cbiAgX2hhbmRsZUhhY2tXb3JrZXJSZXBseShyZXBseTogbWl4ZWQpIHtcbiAgICB0aGlzLl9jbGVhclRpbWVycygpO1xuICAgIGlmICh0aGlzLl9hY3RpdmVUYXNrKSB7XG4gICAgICB0aGlzLl9hY3RpdmVUYXNrLm9uUmVzcG9uc2UocmVwbHkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0hhY2sgV29ya2VyIHJlcGxpZWQgd2l0aG91dCBhbiBhY3RpdmUgdGFzayEnKTtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlVGFzayA9IG51bGw7XG4gICAgdGhpcy5fZGlzcGF0Y2hUYXNrSWZSZWFkeSgpO1xuICB9XG5cbiAgX2hhbmRsZUhhY2tXb3JrZXJFcnJvcihlcnJvcjogRXJyb3IpIHtcbiAgICB0aGlzLl9jbGVhclRpbWVycygpO1xuICAgIGlmICh0aGlzLl9hY3RpdmVUYXNrKSB7XG4gICAgICB0aGlzLl9hY3RpdmVUYXNrLm9uRmFpbChlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5lcnJvcignSGFjayBXb3JrZXIgZXJyb3JlZCB3aXRob3V0IGFuIGFjdGl2ZSB0YXNrIScpO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmVUYXNrID0gbnVsbDtcbiAgICB0aGlzLl9kaXNwYXRjaFRhc2tJZlJlYWR5KCk7XG4gIH1cblxuICBfY2xlYXJUaW1lcnMoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXRUaW1lcik7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3BlcmZvcm1hbmNlVGltZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0YXJ0V2ViV29ya2VyKCk6IFdvcmtlciB7XG4gIC8vIEhhY2t5IHdheSB0byBsb2FkIHRoZSB3b3JrZXIgZmlsZXMgZnJvbSB0aGUgZmlsZXN5c3RlbSBhcyB0ZXh0LFxuICAvLyB0aGVuIGluamVjdCB0aGUgdGV4dCBpbnRvIEJsb2IgdXJsIGZvciB0aGUgV2ViV29ya2VyIHRvIGNvbnN1bWUuXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAzNDM5MTMvaG93LXRvLWNyZWF0ZS1hLXdlYi13b3JrZXItZnJvbS1hLXN0cmluZ1xuICAvLyBJIGRpZCBzbyBiZWNhdXNlIEkgY2FuJ3QgdXNlIHRoZSBhdG9tOi8vIHVybCBwcm90b2NvbCB0byBsb2FkIHJlc291cmNlcyBpbiBqYXZhc2NyaXB0OlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2Jsb2IvbWFzdGVyL3NyYy9icm93c2VyL2F0b20tcHJvdG9jb2wtaGFuZGxlci5jb2ZmZWVcbiAgY29uc3QgaGhJZGVUZXh0ID0gZnMucmVhZEZpbGVTeW5jKFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9WZW5kb3JMaWIvaGhfaWRlLmpzJyksXG4gICAgJ3V0Zi04JyxcbiAgKTtcbiAgY29uc3Qgd2ViV29ya2VyVGV4dCA9IGZzLnJlYWRGaWxlU3luYyhcbiAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vc3RhdGljL0hhY2tXZWJXb3JrZXIuanMnKSxcbiAgICAndXRmLTgnLFxuICApO1xuICAvLyBDb25jYXRlbmF0ZSB0aGUgY29kZSB0ZXh0IHRvIHBhc3MgdG8gdGhlIFdvcmtlciBpbiBhIGJsb2IgdXJsXG4gIGNvbnN0IHdvcmtlclRleHQgPSBoaElkZVRleHQgKyAnXFxuLy88PE1FUkdFPj5cXG4nICsgd2ViV29ya2VyVGV4dDtcbiAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt3b3JrZXJUZXh0XSwge3R5cGU6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0J30pO1xuICBjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyKFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuICByZXR1cm4gd29ya2VyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhhY2tXb3JrZXI7XG4iXX0=