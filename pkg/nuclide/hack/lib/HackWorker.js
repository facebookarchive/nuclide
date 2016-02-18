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
  var Blob = window.Blob;
  var Worker = window.Worker;
  var URL = window.URL;

  var blob = new Blob([workerText], { type: 'application/javascript' });
  var worker = new Worker(URL.createObjectURL(blob));
  return worker;
}

module.exports = HackWorker;
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxDQUFDO0FBQ3RFLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNyRCxTQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IkhhY2tXb3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5jb25zdCBERUZBVUxUX1dFQldPUktFUl9USU1FT1VUID0gMzAgKiAxMDAwO1xuY29uc3QgREVGQVVMVF9QT09SX1BFUkZfVElNRU9VVCA9IDggKiAxMDAwO1xuXG50eXBlIFdvcmtlclRhc2sgPSB7XG4gIHdvcmtlck1lc3NhZ2U6IG1peGVkLFxuICBvblJlc3BvbnNlOiAocmVzcG9uc2U6IGFueSkgPT4gdm9pZCxcbiAgb25GYWlsOiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkLFxufTtcblxuLyoqXG4gKiBIYWNrV29ya2VyIHVzZXMgdGhlIGhoX2lkZS5qcyB0aGF0J3MgYSB0cmFuc2xhdGlvbiBmcm9tIE9DYW1sIHRvIEphdmFTY3JpcHQgKG5vdCByZWFkYWJsZSkuXG4gKiBJdCdzIHJlc3BvbnNpYmxlIGZvciBwcm92aWRpbmcgbGFuZ3VhZ2Ugc2VydmljZXMgd2l0aG91dCBoaXR0aW5nIHRoZSBzZXJ2ZXIsIGlmIHBvc3NpYmxlLlxuICogZS5nLiBzb21lIGF1dG9jb21wbGV0aW9ucywgZ28gdG8gZGVmaW5pdGlvbiwgZGlhZ25vc3RpYyByZXF1ZXN0cyBhbmQgb3V0bGluZSBjb3VsZCBiZSBzZXJ2ZWRcbiAqIGxvY2FsbHkuIFRoaXMgaXMgZG9uZSBhcyBhIHdlYiB3b3JrZXIgbm90IHRvIGJsb2NrIHRoZSBtYWluIFVJIHRocmVhZCB3aGVuIGV4ZWN1dGluZyBsYW5ndWFnZVxuICogdGFza3MuXG4gKi9cblxudHlwZSBIYWNrV29ya2VyT3B0aW9ucyA9IHtcbiAgd2ViV29ya2VyVGltZW91dD86IG51bWJlcixcbiAgcG9vclBlcmZUaW1lb3V0PzogbnVtYmVyLFxuICB3b3JrZXI/OiBXb3JrZXIsXG59O1xuXG5jbGFzcyBIYWNrV29ya2VyIHtcbiAgX2FjdGl2ZVRhc2s6ID9Xb3JrZXJUYXNrO1xuICBfdGFza1F1ZXVlOiBBcnJheTxXb3JrZXJUYXNrPjtcbiAgX2RlcFRhc2tRdWV1ZTogQXJyYXk8V29ya2VyVGFzaz47XG4gIF93ZWJXb3JrZXJUaW1lb3V0OiBudW1iZXI7XG4gIF9wb29yUGVmVGltZW91dDogbnVtYmVyO1xuICBfd29ya2VyOiBXb3JrZXI7XG4gIF90aW1lb3V0VGltZXI6IGFueTtcbiAgX3BlcmZvcm1hbmNlVGltZXI6IGFueTtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiA/SGFja1dvcmtlck9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLl9hY3RpdmVUYXNrID0gbnVsbDtcbiAgICB0aGlzLl90YXNrUXVldWUgPSBbXTtcbiAgICB0aGlzLl9kZXBUYXNrUXVldWUgPSBbXTtcbiAgICB0aGlzLl93ZWJXb3JrZXJUaW1lb3V0ID0gb3B0aW9ucy53ZWJXb3JrZXJUaW1lb3V0IHx8IERFRkFVTFRfV0VCV09SS0VSX1RJTUVPVVQ7XG4gICAgdGhpcy5fcG9vclBlZlRpbWVvdXQgPSBvcHRpb25zLnBvb3JQZXJmVGltZW91dCB8fCBERUZBVUxUX1BPT1JfUEVSRl9USU1FT1VUO1xuICAgIHRoaXMuX3dvcmtlciA9IG9wdGlvbnMud29ya2VyIHx8IHN0YXJ0V2ViV29ya2VyKCk7XG4gICAgdGhpcy5fd29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBlID0+IHRoaXMuX2hhbmRsZUhhY2tXb3JrZXJSZXBseShlLmRhdGEpLCBmYWxzZSk7XG4gICAgdGhpcy5fd29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IgPT4gdGhpcy5faGFuZGxlSGFja1dvcmtlckVycm9yKGVycm9yKSwgZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgYSB3ZWIgd29ya2VyIHRhc2sgYW5kIHJldHVybnMgYSBwcm9taXNlIG9mIHRoZSB2YWx1ZSBleHBlY3RlZCBmcm9tIHRoZSBoYWNrIHdvcmtlci5cbiAgICovXG4gIHJ1bldvcmtlclRhc2sod29ya2VyTWVzc2FnZTogbWl4ZWQsIG9wdGlvbnM6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgY29uc3QgcXVldWUgPSBvcHRpb25zLmlzRGVwZW5kZW5jeSA/IHRoaXMuX2RlcFRhc2tRdWV1ZSA6IHRoaXMuX3Rhc2tRdWV1ZTtcbiAgICAgIHF1ZXVlLnB1c2goe1xuICAgICAgICB3b3JrZXJNZXNzYWdlLFxuICAgICAgICBvblJlc3BvbnNlOiByZXNwb25zZSA9PiB7XG4gICAgICAgICAgY29uc3QgaW50ZXJuYWxFcnJvciA9IHJlc3BvbnNlLmludGVybmFsX2Vycm9yO1xuICAgICAgICAgIGlmIChpbnRlcm5hbEVycm9yKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0hhY2sgV29ya2VyOiBJbnRlcm5hbCBFcnJvciEgLSAnICtcbiAgICAgICAgICAgICAgICBTdHJpbmcoaW50ZXJuYWxFcnJvcikgKyAnIC0gJyArIEpTT04uc3RyaW5naWZ5KHdvcmtlck1lc3NhZ2UpKTtcbiAgICAgICAgICAgIHJlamVjdChpbnRlcm5hbEVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBvbkZhaWw6IGVycm9yID0+IHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0hhY2sgV29ya2VyOiBFcnJvciEnLCBlcnJvciwgSlNPTi5zdHJpbmdpZnkod29ya2VyTWVzc2FnZSkpO1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2Rpc3BhdGNoVGFza0lmUmVhZHkoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fd29ya2VyLnRlcm1pbmF0ZSgpO1xuICB9XG5cbiAgX2Rpc3BhdGNoVGFza0lmUmVhZHkoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVRhc2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3Rhc2tRdWV1ZS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVRhc2sgPSB0aGlzLl90YXNrUXVldWUuc2hpZnQoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2RlcFRhc2tRdWV1ZS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVRhc2sgPSB0aGlzLl9kZXBUYXNrUXVldWUuc2hpZnQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVRhc2spIHtcbiAgICAgIC8vIGRpc3BhdGNoIGl0IGFuZCBzdGFydCB0aW1lcnNcbiAgICAgIGNvbnN0IHdvcmtlck1lc3NhZ2UgPSB0aGlzLl9hY3RpdmVUYXNrLndvcmtlck1lc3NhZ2U7XG4gICAgICB0aGlzLl9kaXNwYXRjaFRhc2sod29ya2VyTWVzc2FnZSk7XG4gICAgICB0aGlzLl90aW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbG9nZ2VyLndhcm4oJ1dlYndvcmtlciBpcyBzdHVjayBpbiBhIGpvYiEnLCBKU09OLnN0cmluZ2lmeSh3b3JrZXJNZXNzYWdlKSk7XG4gICAgICB9LCB0aGlzLl93ZWJXb3JrZXJUaW1lb3V0KTtcbiAgICAgIHRoaXMuX3BlcmZvcm1hbmNlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbG9nZ2VyLndhcm4oJ1Bvb3IgV2Vid29ya2VyIFBlcmZvcm1hbmNlIScsIEpTT04uc3RyaW5naWZ5KHdvcmtlck1lc3NhZ2UpKTtcbiAgICAgIH0sIHRoaXMuX3Bvb3JQZWZUaW1lb3V0KTtcbiAgICB9XG4gIH1cblxuICBfZGlzcGF0Y2hUYXNrKHRhc2tNZXNzYWdlOiBtaXhlZCkge1xuICAgIHRoaXMuX3dvcmtlci5wb3N0TWVzc2FnZSh0YXNrTWVzc2FnZSk7XG4gIH1cblxuICBfaGFuZGxlSGFja1dvcmtlclJlcGx5KHJlcGx5OiBtaXhlZCkge1xuICAgIHRoaXMuX2NsZWFyVGltZXJzKCk7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVRhc2spIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVRhc2sub25SZXNwb25zZShyZXBseSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlci5lcnJvcignSGFjayBXb3JrZXIgcmVwbGllZCB3aXRob3V0IGFuIGFjdGl2ZSB0YXNrIScpO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmVUYXNrID0gbnVsbDtcbiAgICB0aGlzLl9kaXNwYXRjaFRhc2tJZlJlYWR5KCk7XG4gIH1cblxuICBfaGFuZGxlSGFja1dvcmtlckVycm9yKGVycm9yOiBFcnJvcikge1xuICAgIHRoaXMuX2NsZWFyVGltZXJzKCk7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVRhc2spIHtcbiAgICAgIHRoaXMuX2FjdGl2ZVRhc2sub25GYWlsKGVycm9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2VyLmVycm9yKCdIYWNrIFdvcmtlciBlcnJvcmVkIHdpdGhvdXQgYW4gYWN0aXZlIHRhc2shJyk7XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2ZVRhc2sgPSBudWxsO1xuICAgIHRoaXMuX2Rpc3BhdGNoVGFza0lmUmVhZHkoKTtcbiAgfVxuXG4gIF9jbGVhclRpbWVycygpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZW91dFRpbWVyKTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fcGVyZm9ybWFuY2VUaW1lcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RhcnRXZWJXb3JrZXIoKTogV29ya2VyIHtcbiAgLy8gSGFja3kgd2F5IHRvIGxvYWQgdGhlIHdvcmtlciBmaWxlcyBmcm9tIHRoZSBmaWxlc3lzdGVtIGFzIHRleHQsXG4gIC8vIHRoZW4gaW5qZWN0IHRoZSB0ZXh0IGludG8gQmxvYiB1cmwgZm9yIHRoZSBXZWJXb3JrZXIgdG8gY29uc3VtZS5cbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDM0MzkxMy9ob3ctdG8tY3JlYXRlLWEtd2ViLXdvcmtlci1mcm9tLWEtc3RyaW5nXG4gIC8vIEkgZGlkIHNvIGJlY2F1c2UgSSBjYW4ndCB1c2UgdGhlIGF0b206Ly8gdXJsIHByb3RvY29sIHRvIGxvYWQgcmVzb3VyY2VzIGluIGphdmFzY3JpcHQ6XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vYmxvYi9tYXN0ZXIvc3JjL2Jyb3dzZXIvYXRvbS1wcm90b2NvbC1oYW5kbGVyLmNvZmZlZVxuICBjb25zdCBoaElkZVRleHQgPSBmcy5yZWFkRmlsZVN5bmMoXG4gICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL1ZlbmRvckxpYi9oaF9pZGUuanMnKSxcbiAgICAndXRmLTgnLFxuICApO1xuICBjb25zdCB3ZWJXb3JrZXJUZXh0ID0gZnMucmVhZEZpbGVTeW5jKFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9zdGF0aWMvSGFja1dlYldvcmtlci5qcycpLFxuICAgICd1dGYtOCcsXG4gICk7XG4gIC8vIENvbmNhdGVuYXRlIHRoZSBjb2RlIHRleHQgdG8gcGFzcyB0byB0aGUgV29ya2VyIGluIGEgYmxvYiB1cmxcbiAgY29uc3Qgd29ya2VyVGV4dCA9IGhoSWRlVGV4dCArICdcXG4vLzw8TUVSR0U+PlxcbicgKyB3ZWJXb3JrZXJUZXh0O1xuICBjb25zdCB7QmxvYiwgV29ya2VyLCBVUkx9ID0gd2luZG93O1xuICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3dvcmtlclRleHRdLCB7dHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnfSk7XG4gIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIoVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSk7XG4gIHJldHVybiB3b3JrZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGFja1dvcmtlcjtcbiJdfQ==