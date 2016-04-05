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

var _nuclideLogging = require('../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();

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
//# sourceMappingURL=data:application/json;base64,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LFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiSGFja1dvcmtlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbmNvbnN0IERFRkFVTFRfV0VCV09SS0VSX1RJTUVPVVQgPSAzMCAqIDEwMDA7XG5jb25zdCBERUZBVUxUX1BPT1JfUEVSRl9USU1FT1VUID0gOCAqIDEwMDA7XG5cbnR5cGUgV29ya2VyVGFzayA9IHtcbiAgd29ya2VyTWVzc2FnZTogbWl4ZWQ7XG4gIG9uUmVzcG9uc2U6IChyZXNwb25zZTogYW55KSA9PiB2b2lkO1xuICBvbkZhaWw6IChlcnJvcjogRXJyb3IpID0+IHZvaWQ7XG59O1xuXG4vKipcbiAqIEhhY2tXb3JrZXIgdXNlcyB0aGUgaGhfaWRlLmpzIHRoYXQncyBhIHRyYW5zbGF0aW9uIGZyb20gT0NhbWwgdG8gSmF2YVNjcmlwdCAobm90IHJlYWRhYmxlKS5cbiAqIEl0J3MgcmVzcG9uc2libGUgZm9yIHByb3ZpZGluZyBsYW5ndWFnZSBzZXJ2aWNlcyB3aXRob3V0IGhpdHRpbmcgdGhlIHNlcnZlciwgaWYgcG9zc2libGUuXG4gKiBlLmcuIHNvbWUgYXV0b2NvbXBsZXRpb25zLCBnbyB0byBkZWZpbml0aW9uLCBkaWFnbm9zdGljIHJlcXVlc3RzIGFuZCBvdXRsaW5lIGNvdWxkIGJlIHNlcnZlZFxuICogbG9jYWxseS4gVGhpcyBpcyBkb25lIGFzIGEgd2ViIHdvcmtlciBub3QgdG8gYmxvY2sgdGhlIG1haW4gVUkgdGhyZWFkIHdoZW4gZXhlY3V0aW5nIGxhbmd1YWdlXG4gKiB0YXNrcy5cbiAqL1xuXG50eXBlIEhhY2tXb3JrZXJPcHRpb25zID0ge1xuICB3ZWJXb3JrZXJUaW1lb3V0PzogbnVtYmVyO1xuICBwb29yUGVyZlRpbWVvdXQ/OiBudW1iZXI7XG4gIHdvcmtlcj86IFdvcmtlcjtcbn07XG5cbmNsYXNzIEhhY2tXb3JrZXIge1xuICBfYWN0aXZlVGFzazogP1dvcmtlclRhc2s7XG4gIF90YXNrUXVldWU6IEFycmF5PFdvcmtlclRhc2s+O1xuICBfZGVwVGFza1F1ZXVlOiBBcnJheTxXb3JrZXJUYXNrPjtcbiAgX3dlYldvcmtlclRpbWVvdXQ6IG51bWJlcjtcbiAgX3Bvb3JQZWZUaW1lb3V0OiBudW1iZXI7XG4gIF93b3JrZXI6IFdvcmtlcjtcbiAgX3RpbWVvdXRUaW1lcjogYW55O1xuICBfcGVyZm9ybWFuY2VUaW1lcjogYW55O1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6ID9IYWNrV29ya2VyT3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuX2FjdGl2ZVRhc2sgPSBudWxsO1xuICAgIHRoaXMuX3Rhc2tRdWV1ZSA9IFtdO1xuICAgIHRoaXMuX2RlcFRhc2tRdWV1ZSA9IFtdO1xuICAgIHRoaXMuX3dlYldvcmtlclRpbWVvdXQgPSBvcHRpb25zLndlYldvcmtlclRpbWVvdXQgfHwgREVGQVVMVF9XRUJXT1JLRVJfVElNRU9VVDtcbiAgICB0aGlzLl9wb29yUGVmVGltZW91dCA9IG9wdGlvbnMucG9vclBlcmZUaW1lb3V0IHx8IERFRkFVTFRfUE9PUl9QRVJGX1RJTUVPVVQ7XG4gICAgdGhpcy5fd29ya2VyID0gb3B0aW9ucy53b3JrZXIgfHwgc3RhcnRXZWJXb3JrZXIoKTtcbiAgICB0aGlzLl93b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGUgPT4gdGhpcy5faGFuZGxlSGFja1dvcmtlclJlcGx5KGUuZGF0YSksIGZhbHNlKTtcbiAgICB0aGlzLl93b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvciA9PiB0aGlzLl9oYW5kbGVIYWNrV29ya2VyRXJyb3IoZXJyb3IpLCBmYWxzZSk7XG4gIH1cblxuICAvKipcbiAgICogUnVucyBhIHdlYiB3b3JrZXIgdGFzayBhbmQgcmV0dXJucyBhIHByb21pc2Ugb2YgdGhlIHZhbHVlIGV4cGVjdGVkIGZyb20gdGhlIGhhY2sgd29ya2VyLlxuICAgKi9cbiAgcnVuV29ya2VyVGFzayh3b3JrZXJNZXNzYWdlOiBtaXhlZCwgb3B0aW9uczogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICBjb25zdCBxdWV1ZSA9IG9wdGlvbnMuaXNEZXBlbmRlbmN5ID8gdGhpcy5fZGVwVGFza1F1ZXVlIDogdGhpcy5fdGFza1F1ZXVlO1xuICAgICAgcXVldWUucHVzaCh7XG4gICAgICAgIHdvcmtlck1lc3NhZ2UsXG4gICAgICAgIG9uUmVzcG9uc2U6IHJlc3BvbnNlID0+IHtcbiAgICAgICAgICBjb25zdCBpbnRlcm5hbEVycm9yID0gcmVzcG9uc2UuaW50ZXJuYWxfZXJyb3I7XG4gICAgICAgICAgaWYgKGludGVybmFsRXJyb3IpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcignSGFjayBXb3JrZXI6IEludGVybmFsIEVycm9yISAtICcgK1xuICAgICAgICAgICAgICAgIFN0cmluZyhpbnRlcm5hbEVycm9yKSArICcgLSAnICsgSlNPTi5zdHJpbmdpZnkod29ya2VyTWVzc2FnZSkpO1xuICAgICAgICAgICAgcmVqZWN0KGludGVybmFsRXJyb3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9uRmFpbDogZXJyb3IgPT4ge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignSGFjayBXb3JrZXI6IEVycm9yIScsIGVycm9yLCBKU09OLnN0cmluZ2lmeSh3b3JrZXJNZXNzYWdlKSk7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fZGlzcGF0Y2hUYXNrSWZSZWFkeSgpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl93b3JrZXIudGVybWluYXRlKCk7XG4gIH1cblxuICBfZGlzcGF0Y2hUYXNrSWZSZWFkeSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fYWN0aXZlVGFzaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdGFza1F1ZXVlLmxlbmd0aCkge1xuICAgICAgdGhpcy5fYWN0aXZlVGFzayA9IHRoaXMuX3Rhc2tRdWV1ZS5zaGlmdCgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fZGVwVGFza1F1ZXVlLmxlbmd0aCkge1xuICAgICAgdGhpcy5fYWN0aXZlVGFzayA9IHRoaXMuX2RlcFRhc2tRdWV1ZS5zaGlmdCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fYWN0aXZlVGFzaykge1xuICAgICAgLy8gZGlzcGF0Y2ggaXQgYW5kIHN0YXJ0IHRpbWVyc1xuICAgICAgY29uc3Qgd29ya2VyTWVzc2FnZSA9IHRoaXMuX2FjdGl2ZVRhc2sud29ya2VyTWVzc2FnZTtcbiAgICAgIHRoaXMuX2Rpc3BhdGNoVGFzayh3b3JrZXJNZXNzYWdlKTtcbiAgICAgIHRoaXMuX3RpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsb2dnZXIud2FybignV2Vid29ya2VyIGlzIHN0dWNrIGluIGEgam9iIScsIEpTT04uc3RyaW5naWZ5KHdvcmtlck1lc3NhZ2UpKTtcbiAgICAgIH0sIHRoaXMuX3dlYldvcmtlclRpbWVvdXQpO1xuICAgICAgdGhpcy5fcGVyZm9ybWFuY2VUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsb2dnZXIud2FybignUG9vciBXZWJ3b3JrZXIgUGVyZm9ybWFuY2UhJywgSlNPTi5zdHJpbmdpZnkod29ya2VyTWVzc2FnZSkpO1xuICAgICAgfSwgdGhpcy5fcG9vclBlZlRpbWVvdXQpO1xuICAgIH1cbiAgfVxuXG4gIF9kaXNwYXRjaFRhc2sodGFza01lc3NhZ2U6IG1peGVkKSB7XG4gICAgdGhpcy5fd29ya2VyLnBvc3RNZXNzYWdlKHRhc2tNZXNzYWdlKTtcbiAgfVxuXG4gIF9oYW5kbGVIYWNrV29ya2VyUmVwbHkocmVwbHk6IG1peGVkKSB7XG4gICAgdGhpcy5fY2xlYXJUaW1lcnMoKTtcbiAgICBpZiAodGhpcy5fYWN0aXZlVGFzaykge1xuICAgICAgdGhpcy5fYWN0aXZlVGFzay5vblJlc3BvbnNlKHJlcGx5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nZ2VyLmVycm9yKCdIYWNrIFdvcmtlciByZXBsaWVkIHdpdGhvdXQgYW4gYWN0aXZlIHRhc2shJyk7XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2ZVRhc2sgPSBudWxsO1xuICAgIHRoaXMuX2Rpc3BhdGNoVGFza0lmUmVhZHkoKTtcbiAgfVxuXG4gIF9oYW5kbGVIYWNrV29ya2VyRXJyb3IoZXJyb3I6IEVycm9yKSB7XG4gICAgdGhpcy5fY2xlYXJUaW1lcnMoKTtcbiAgICBpZiAodGhpcy5fYWN0aXZlVGFzaykge1xuICAgICAgdGhpcy5fYWN0aXZlVGFzay5vbkZhaWwoZXJyb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0hhY2sgV29ya2VyIGVycm9yZWQgd2l0aG91dCBhbiBhY3RpdmUgdGFzayEnKTtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlVGFzayA9IG51bGw7XG4gICAgdGhpcy5fZGlzcGF0Y2hUYXNrSWZSZWFkeSgpO1xuICB9XG5cbiAgX2NsZWFyVGltZXJzKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0VGltZXIpO1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9wZXJmb3JtYW5jZVRpbWVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGFydFdlYldvcmtlcigpOiBXb3JrZXIge1xuICAvLyBIYWNreSB3YXkgdG8gbG9hZCB0aGUgd29ya2VyIGZpbGVzIGZyb20gdGhlIGZpbGVzeXN0ZW0gYXMgdGV4dCxcbiAgLy8gdGhlbiBpbmplY3QgdGhlIHRleHQgaW50byBCbG9iIHVybCBmb3IgdGhlIFdlYldvcmtlciB0byBjb25zdW1lLlxuICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwMzQzOTEzL2hvdy10by1jcmVhdGUtYS13ZWItd29ya2VyLWZyb20tYS1zdHJpbmdcbiAgLy8gSSBkaWQgc28gYmVjYXVzZSBJIGNhbid0IHVzZSB0aGUgYXRvbTovLyB1cmwgcHJvdG9jb2wgdG8gbG9hZCByZXNvdXJjZXMgaW4gamF2YXNjcmlwdDpcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9ibG9iL21hc3Rlci9zcmMvYnJvd3Nlci9hdG9tLXByb3RvY29sLWhhbmRsZXIuY29mZmVlXG4gIGNvbnN0IGhoSWRlVGV4dCA9IGZzLnJlYWRGaWxlU3luYyhcbiAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vVmVuZG9yTGliL2hoX2lkZS5qcycpLFxuICAgICd1dGYtOCcsXG4gICk7XG4gIGNvbnN0IHdlYldvcmtlclRleHQgPSBmcy5yZWFkRmlsZVN5bmMoXG4gICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3N0YXRpYy9IYWNrV2ViV29ya2VyLmpzJyksXG4gICAgJ3V0Zi04JyxcbiAgKTtcbiAgLy8gQ29uY2F0ZW5hdGUgdGhlIGNvZGUgdGV4dCB0byBwYXNzIHRvIHRoZSBXb3JrZXIgaW4gYSBibG9iIHVybFxuICBjb25zdCB3b3JrZXJUZXh0ID0gaGhJZGVUZXh0ICsgJ1xcbi8vPDxNRVJHRT4+XFxuJyArIHdlYldvcmtlclRleHQ7XG4gIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbd29ya2VyVGV4dF0sIHt0eXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCd9KTtcbiAgY29uc3Qgd29ya2VyID0gbmV3IFdvcmtlcihVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcbiAgcmV0dXJuIHdvcmtlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIYWNrV29ya2VyO1xuIl19