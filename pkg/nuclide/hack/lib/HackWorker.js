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
 * e.g. some autocompletions, go to definition, diagnostic requests and outline could be served locally.
 * This is done as a web worker not to block the main UI thread when executing language tasks.
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
  var Blob = window.Blob;
  var Worker = window.Worker;
  var URL = window.URL;

  var blob = new Blob([workerText], { type: 'application/javascript' });
  var worker = new Worker(URL.createObjectURL(blob));
  return worker;
}

module.exports = HackWorker;
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxDQUFDO0FBQ3RFLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNyRCxTQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IkhhY2tXb3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5jb25zdCBERUZBVUxUX1dFQldPUktFUl9USU1FT1VUID0gMzAgKiAxMDAwO1xuY29uc3QgREVGQVVMVF9QT09SX1BFUkZfVElNRU9VVCA9IDggKiAxMDAwO1xuXG50eXBlIFdvcmtlclRhc2sgPSB7XG4gIHdvcmtlck1lc3NhZ2U6IG1peGVkO1xuICBvblJlc3BvbnNlOiAocmVzcG9uc2U6IGFueSkgPT4gdm9pZDtcbiAgb25GYWlsOiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkO1xufTtcblxuLyoqXG4gKiBIYWNrV29ya2VyIHVzZXMgdGhlIGhoX2lkZS5qcyB0aGF0J3MgYSB0cmFuc2xhdGlvbiBmcm9tIE9DYW1sIHRvIEphdmFTY3JpcHQgKG5vdCByZWFkYWJsZSkuXG4gKiBJdCdzIHJlc3BvbnNpYmxlIGZvciBwcm92aWRpbmcgbGFuZ3VhZ2Ugc2VydmljZXMgd2l0aG91dCBoaXR0aW5nIHRoZSBzZXJ2ZXIsIGlmIHBvc3NpYmxlLlxuICogZS5nLiBzb21lIGF1dG9jb21wbGV0aW9ucywgZ28gdG8gZGVmaW5pdGlvbiwgZGlhZ25vc3RpYyByZXF1ZXN0cyBhbmQgb3V0bGluZSBjb3VsZCBiZSBzZXJ2ZWQgbG9jYWxseS5cbiAqIFRoaXMgaXMgZG9uZSBhcyBhIHdlYiB3b3JrZXIgbm90IHRvIGJsb2NrIHRoZSBtYWluIFVJIHRocmVhZCB3aGVuIGV4ZWN1dGluZyBsYW5ndWFnZSB0YXNrcy5cbiAqL1xuXG50eXBlIEhhY2tXb3JrZXJPcHRpb25zID0ge1xuICB3ZWJXb3JrZXJUaW1lb3V0PzogbnVtYmVyO1xuICBwb29yUGVyZlRpbWVvdXQ/OiBudW1iZXI7XG4gIHdvcmtlcj86IFdvcmtlcjtcbn07XG5cbmNsYXNzIEhhY2tXb3JrZXIge1xuICBfYWN0aXZlVGFzazogP1dvcmtlclRhc2s7XG4gIF90YXNrUXVldWU6IEFycmF5PFdvcmtlclRhc2s+O1xuICBfZGVwVGFza1F1ZXVlOiBBcnJheTxXb3JrZXJUYXNrPjtcbiAgX3dlYldvcmtlclRpbWVvdXQ6IG51bWJlcjtcbiAgX3Bvb3JQZWZUaW1lb3V0OiBudW1iZXI7XG4gIF93b3JrZXI6IFdvcmtlcjtcbiAgX3RpbWVvdXRUaW1lcjogYW55O1xuICBfcGVyZm9ybWFuY2VUaW1lcjogYW55O1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6ID9IYWNrV29ya2VyT3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuX2FjdGl2ZVRhc2sgPSBudWxsO1xuICAgIHRoaXMuX3Rhc2tRdWV1ZSA9IFtdO1xuICAgIHRoaXMuX2RlcFRhc2tRdWV1ZSA9IFtdO1xuICAgIHRoaXMuX3dlYldvcmtlclRpbWVvdXQgPSBvcHRpb25zLndlYldvcmtlclRpbWVvdXQgfHwgREVGQVVMVF9XRUJXT1JLRVJfVElNRU9VVDtcbiAgICB0aGlzLl9wb29yUGVmVGltZW91dCA9IG9wdGlvbnMucG9vclBlcmZUaW1lb3V0IHx8IERFRkFVTFRfUE9PUl9QRVJGX1RJTUVPVVQ7XG4gICAgdGhpcy5fd29ya2VyID0gb3B0aW9ucy53b3JrZXIgfHwgc3RhcnRXZWJXb3JrZXIoKTtcbiAgICB0aGlzLl93b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChlKSA9PiB0aGlzLl9oYW5kbGVIYWNrV29ya2VyUmVwbHkoZS5kYXRhKSwgZmFsc2UpO1xuICAgIHRoaXMuX3dvcmtlci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChlcnJvcikgPT4gdGhpcy5faGFuZGxlSGFja1dvcmtlckVycm9yKGVycm9yKSwgZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgYSB3ZWIgd29ya2VyIHRhc2sgYW5kIHJldHVybnMgYSBwcm9taXNlIG9mIHRoZSB2YWx1ZSBleHBlY3RlZCBmcm9tIHRoZSBoYWNrIHdvcmtlci5cbiAgICovXG4gIHJ1bldvcmtlclRhc2sod29ya2VyTWVzc2FnZTogbWl4ZWQsIG9wdGlvbnM6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgY29uc3QgcXVldWUgPSBvcHRpb25zLmlzRGVwZW5kZW5jeSA/IHRoaXMuX2RlcFRhc2tRdWV1ZSA6IHRoaXMuX3Rhc2tRdWV1ZTtcbiAgICAgIHF1ZXVlLnB1c2goe1xuICAgICAgICB3b3JrZXJNZXNzYWdlLFxuICAgICAgICBvblJlc3BvbnNlOiAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICBjb25zdCBpbnRlcm5hbEVycm9yID0gcmVzcG9uc2UuaW50ZXJuYWxfZXJyb3I7XG4gICAgICAgICAgaWYgKGludGVybmFsRXJyb3IpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignSGFjayBXb3JrZXI6IEludGVybmFsIEVycm9yISAtICcgK1xuICAgICAgICAgICAgICAgIFN0cmluZyhpbnRlcm5hbEVycm9yKSArICcgLSAnICsgSlNPTi5zdHJpbmdpZnkod29ya2VyTWVzc2FnZSkpO1xuICAgICAgICAgICAgcmVqZWN0KGludGVybmFsRXJyb3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9uRmFpbDogKGVycm9yKSA9PiB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdIYWNrIFdvcmtlcjogRXJyb3IhJywgZXJyb3IsIEpTT04uc3RyaW5naWZ5KHdvcmtlck1lc3NhZ2UpKTtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9kaXNwYXRjaFRhc2tJZlJlYWR5KCk7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3dvcmtlci50ZXJtaW5hdGUoKTtcbiAgfVxuXG4gIF9kaXNwYXRjaFRhc2tJZlJlYWR5KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9hY3RpdmVUYXNrKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl90YXNrUXVldWUubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9hY3RpdmVUYXNrID0gdGhpcy5fdGFza1F1ZXVlLnNoaWZ0KCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9kZXBUYXNrUXVldWUubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9hY3RpdmVUYXNrID0gdGhpcy5fZGVwVGFza1F1ZXVlLnNoaWZ0KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9hY3RpdmVUYXNrKSB7XG4gICAgICAvLyBkaXNwYXRjaCBpdCBhbmQgc3RhcnQgdGltZXJzXG4gICAgICBjb25zdCB3b3JrZXJNZXNzYWdlID0gdGhpcy5fYWN0aXZlVGFzay53b3JrZXJNZXNzYWdlO1xuICAgICAgdGhpcy5fZGlzcGF0Y2hUYXNrKHdvcmtlck1lc3NhZ2UpO1xuICAgICAgdGhpcy5fdGltZW91dFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxvZ2dlci53YXJuKCdXZWJ3b3JrZXIgaXMgc3R1Y2sgaW4gYSBqb2IhJywgSlNPTi5zdHJpbmdpZnkod29ya2VyTWVzc2FnZSkpO1xuICAgICAgfSwgdGhpcy5fd2ViV29ya2VyVGltZW91dCk7XG4gICAgICB0aGlzLl9wZXJmb3JtYW5jZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxvZ2dlci53YXJuKCdQb29yIFdlYndvcmtlciBQZXJmb3JtYW5jZSEnLCBKU09OLnN0cmluZ2lmeSh3b3JrZXJNZXNzYWdlKSk7XG4gICAgICB9LCB0aGlzLl9wb29yUGVmVGltZW91dCk7XG4gICAgfVxuICB9XG5cbiAgX2Rpc3BhdGNoVGFzayh0YXNrTWVzc2FnZTogbWl4ZWQpIHtcbiAgICB0aGlzLl93b3JrZXIucG9zdE1lc3NhZ2UodGFza01lc3NhZ2UpO1xuICB9XG5cbiAgX2hhbmRsZUhhY2tXb3JrZXJSZXBseShyZXBseTogbWl4ZWQpIHtcbiAgICB0aGlzLl9jbGVhclRpbWVycygpO1xuICAgIGlmICh0aGlzLl9hY3RpdmVUYXNrKSB7XG4gICAgICB0aGlzLl9hY3RpdmVUYXNrLm9uUmVzcG9uc2UocmVwbHkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0hhY2sgV29ya2VyIHJlcGxpZWQgd2l0aG91dCBhbiBhY3RpdmUgdGFzayEnKTtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlVGFzayA9IG51bGw7XG4gICAgdGhpcy5fZGlzcGF0Y2hUYXNrSWZSZWFkeSgpO1xuICB9XG5cbiAgX2hhbmRsZUhhY2tXb3JrZXJFcnJvcihlcnJvcjogRXJyb3IpIHtcbiAgICB0aGlzLl9jbGVhclRpbWVycygpO1xuICAgIGlmICh0aGlzLl9hY3RpdmVUYXNrKSB7XG4gICAgICB0aGlzLl9hY3RpdmVUYXNrLm9uRmFpbChlcnJvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5lcnJvcignSGFjayBXb3JrZXIgZXJyb3JlZCB3aXRob3V0IGFuIGFjdGl2ZSB0YXNrIScpO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmVUYXNrID0gbnVsbDtcbiAgICB0aGlzLl9kaXNwYXRjaFRhc2tJZlJlYWR5KCk7XG4gIH1cblxuICBfY2xlYXJUaW1lcnMoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXRUaW1lcik7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3BlcmZvcm1hbmNlVGltZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN0YXJ0V2ViV29ya2VyKCk6IFdvcmtlciB7XG4gIC8vIEhhY2t5IHdheSB0byBsb2FkIHRoZSB3b3JrZXIgZmlsZXMgZnJvbSB0aGUgZmlsZXN5c3RlbSBhcyB0ZXh0LFxuICAvLyB0aGVuIGluamVjdCB0aGUgdGV4dCBpbnRvIEJsb2IgdXJsIGZvciB0aGUgV2ViV29ya2VyIHRvIGNvbnN1bWUuXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAzNDM5MTMvaG93LXRvLWNyZWF0ZS1hLXdlYi13b3JrZXItZnJvbS1hLXN0cmluZ1xuICAvLyBJIGRpZCBzbyBiZWNhdXNlIEkgY2FuJ3QgdXNlIHRoZSBhdG9tOi8vIHVybCBwcm90b2NvbCB0byBsb2FkIHJlc291cmNlcyBpbiBqYXZhc2NyaXB0OlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2Jsb2IvbWFzdGVyL3NyYy9icm93c2VyL2F0b20tcHJvdG9jb2wtaGFuZGxlci5jb2ZmZWVcbiAgY29uc3QgaGhJZGVUZXh0ID0gZnMucmVhZEZpbGVTeW5jKFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9WZW5kb3JMaWIvaGhfaWRlLmpzJyksXG4gICAgJ3V0Zi04JyxcbiAgKTtcbiAgY29uc3Qgd2ViV29ya2VyVGV4dCA9IGZzLnJlYWRGaWxlU3luYyhcbiAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vc3RhdGljL0hhY2tXZWJXb3JrZXIuanMnKSxcbiAgICAndXRmLTgnLFxuICApO1xuICAvLyBDb25jYXRlbmF0ZSB0aGUgY29kZSB0ZXh0IHRvIHBhc3MgdG8gdGhlIFdvcmtlciBpbiBhIGJsb2IgdXJsXG4gIGNvbnN0IHdvcmtlclRleHQgPSBoaElkZVRleHQgKyAnXFxuLy88PE1FUkdFPj5cXG4nICsgd2ViV29ya2VyVGV4dDtcbiAgY29uc3Qge0Jsb2IsIFdvcmtlciwgVVJMfSA9IHdpbmRvdztcbiAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt3b3JrZXJUZXh0XSwge3R5cGU6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0J30pO1xuICBjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyKFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuICByZXR1cm4gd29ya2VyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhhY2tXb3JrZXI7XG4iXX0=