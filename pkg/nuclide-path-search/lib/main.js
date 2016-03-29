Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var newFileSearch = _asyncToGenerator(function* (directoryUri) {
  var _require = require('../../nuclide-task');

  var createTask = _require.createTask;

  var task = createTask();
  yield task.invokeRemoteMethod({
    file: require.resolve('./FileSearch'),
    method: 'initFileSearchForDirectory',
    args: [directoryUri]
  });
  return new MainProcessFileSearch(task, directoryUri);
}

/**
 * Currently, all the caller cares about is that the Promise resolves to an
 * object with a query() method.
 *
 * TODO(mbolin): Caller should also invoke dispose(), as appropriate.
 */
);

var fileSearchForDirectory = _asyncToGenerator(function* (directoryUri) {
  if (directoryUri in fileSearchForDirectoryUri) {
    return fileSearchForDirectoryUri[directoryUri];
  }

  var exists = yield _nuclideCommons.fsPromise.exists(directoryUri);
  if (!exists) {
    throw new Error('Could not find directory to search : ' + directoryUri);
  }

  var stat = yield _nuclideCommons.fsPromise.stat(directoryUri);
  if (!stat.isDirectory()) {
    throw new Error('Provided path is not a directory : ' + directoryUri);
  }

  var promise = newFileSearch(directoryUri);
  fileSearchForDirectoryUri[directoryUri] = promise;
  return promise;
});

exports.fileSearchForDirectory = fileSearchForDirectory;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideCommons = require('../../nuclide-commons');

var logger = (0, _nuclideLogging.getLogger)();

/**
 * This is an object that lives in the main process that delegates calls to the
 * FileSearch in the forked process.
 */

var MainProcessFileSearch = (function () {
  function MainProcessFileSearch(task, directoryUri) {
    var _this = this;

    _classCallCheck(this, MainProcessFileSearch);

    this._task = task;
    this._task.onError(function (buffer) {
      logger.error('File search process crashed with message:', buffer.toString());
      _this.dispose();
    });
    this._directoryUri = directoryUri;
  }

  _createClass(MainProcessFileSearch, [{
    key: 'query',
    value: (function (_query) {
      function query(_x) {
        return _query.apply(this, arguments);
      }

      query.toString = function () {
        return _query.toString();
      };

      return query;
    })(_asyncToGenerator(function* (query) {
      var task = this._task;
      if (task == null) {
        throw new Error('Task has been disposed');
      }
      return task.invokeRemoteMethod({
        file: require.resolve('./FileSearch'),
        method: 'doSearch',
        args: [this._directoryUri, query]
      });
    }))
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._task != null) {
        delete fileSearchForDirectoryUri[this._directoryUri];
        this._task.dispose();
        this._task = null;
      }
    }
  }]);

  return MainProcessFileSearch;
})();

var fileSearchForDirectoryUri = {};
//# sourceMappingURL=data:application/json;base64,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QUUsQ0FBQztBQUNyQixZQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztPQUNuQjtLQUNGOzs7U0EvQkcscUJBQXFCOzs7QUFrQzNCLElBQU0seUJBQWdGLEdBQUcsRUFBRSxDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VGFza30gZnJvbSAnLi4vLi4vbnVjbGlkZS10YXNrJztcbmltcG9ydCB0eXBlIHtGaWxlU2VhcmNoUmVzdWx0IGFzIEZpbGVTZWFyY2hSZXN1bHRUeXBlfSBmcm9tICcuL0ZpbGVTZWFyY2gnO1xuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmltcG9ydCB7ZnNQcm9taXNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuXG5leHBvcnQgdHlwZSBGaWxlU2VhcmNoUmVzdWx0ID0gRmlsZVNlYXJjaFJlc3VsdFR5cGU7XG5cbnR5cGUgRGlyZWN0b3J5VXJpID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgRmlsZVNlYXJjaCA9IHtcbiAgcXVlcnk6IChxdWVyeTogc3RyaW5nKSA9PiBQcm9taXNlPEFycmF5PEZpbGVTZWFyY2hSZXN1bHQ+PjtcbiAgZGlzcG9zZTogKCkgPT4gdm9pZDtcbn07XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG4vKipcbiAqIFRoaXMgaXMgYW4gb2JqZWN0IHRoYXQgbGl2ZXMgaW4gdGhlIG1haW4gcHJvY2VzcyB0aGF0IGRlbGVnYXRlcyBjYWxscyB0byB0aGVcbiAqIEZpbGVTZWFyY2ggaW4gdGhlIGZvcmtlZCBwcm9jZXNzLlxuICovXG5jbGFzcyBNYWluUHJvY2Vzc0ZpbGVTZWFyY2gge1xuICBfdGFzazogP1Rhc2s7XG4gIF9kaXJlY3RvcnlVcmk6IERpcmVjdG9yeVVyaTtcblxuICBjb25zdHJ1Y3Rvcih0YXNrOiBUYXNrLCBkaXJlY3RvcnlVcmk6IERpcmVjdG9yeVVyaSkge1xuICAgIHRoaXMuX3Rhc2sgPSB0YXNrO1xuICAgIHRoaXMuX3Rhc2sub25FcnJvcihidWZmZXIgPT4ge1xuICAgICAgbG9nZ2VyLmVycm9yKCdGaWxlIHNlYXJjaCBwcm9jZXNzIGNyYXNoZWQgd2l0aCBtZXNzYWdlOicsIGJ1ZmZlci50b1N0cmluZygpKTtcbiAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgIH0pO1xuICAgIHRoaXMuX2RpcmVjdG9yeVVyaSA9IGRpcmVjdG9yeVVyaTtcbiAgfVxuXG4gIGFzeW5jIHF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PEZpbGVTZWFyY2hSZXN1bHQ+PiB7XG4gICAgY29uc3QgdGFzayA9IHRoaXMuX3Rhc2s7XG4gICAgaWYgKHRhc2sgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXNrIGhhcyBiZWVuIGRpc3Bvc2VkJyk7XG4gICAgfVxuICAgIHJldHVybiB0YXNrLmludm9rZVJlbW90ZU1ldGhvZCh7XG4gICAgICBmaWxlOiByZXF1aXJlLnJlc29sdmUoJy4vRmlsZVNlYXJjaCcpLFxuICAgICAgbWV0aG9kOiAnZG9TZWFyY2gnLFxuICAgICAgYXJnczogW3RoaXMuX2RpcmVjdG9yeVVyaSwgcXVlcnldLFxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fdGFzayAhPSBudWxsKSB7XG4gICAgICBkZWxldGUgZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaVt0aGlzLl9kaXJlY3RvcnlVcmldO1xuICAgICAgdGhpcy5fdGFzay5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl90YXNrID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaToge1trZXk6IERpcmVjdG9yeVVyaV06IFByb21pc2U8TWFpblByb2Nlc3NGaWxlU2VhcmNoPn0gPSB7fTtcblxuYXN5bmMgZnVuY3Rpb24gbmV3RmlsZVNlYXJjaChkaXJlY3RvcnlVcmk6IHN0cmluZyk6IFByb21pc2U8TWFpblByb2Nlc3NGaWxlU2VhcmNoPiB7XG4gIGNvbnN0IHtjcmVhdGVUYXNrfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdGFzaycpO1xuICBjb25zdCB0YXNrID0gY3JlYXRlVGFzaygpO1xuICBhd2FpdCB0YXNrLmludm9rZVJlbW90ZU1ldGhvZCh7XG4gICAgZmlsZTogcmVxdWlyZS5yZXNvbHZlKCcuL0ZpbGVTZWFyY2gnKSxcbiAgICBtZXRob2Q6ICdpbml0RmlsZVNlYXJjaEZvckRpcmVjdG9yeScsXG4gICAgYXJnczogW2RpcmVjdG9yeVVyaV0sXG4gIH0pO1xuICByZXR1cm4gbmV3IE1haW5Qcm9jZXNzRmlsZVNlYXJjaCh0YXNrLCBkaXJlY3RvcnlVcmkpO1xufVxuXG4vKipcbiAqIEN1cnJlbnRseSwgYWxsIHRoZSBjYWxsZXIgY2FyZXMgYWJvdXQgaXMgdGhhdCB0aGUgUHJvbWlzZSByZXNvbHZlcyB0byBhblxuICogb2JqZWN0IHdpdGggYSBxdWVyeSgpIG1ldGhvZC5cbiAqXG4gKiBUT0RPKG1ib2xpbik6IENhbGxlciBzaG91bGQgYWxzbyBpbnZva2UgZGlzcG9zZSgpLCBhcyBhcHByb3ByaWF0ZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoZGlyZWN0b3J5VXJpOiBzdHJpbmcpOiBQcm9taXNlPEZpbGVTZWFyY2g+IHtcbiAgaWYgKGRpcmVjdG9yeVVyaSBpbiBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5VXJpKSB7XG4gICAgcmV0dXJuIGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmlbZGlyZWN0b3J5VXJpXTtcbiAgfVxuXG4gIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGZzUHJvbWlzZS5leGlzdHMoZGlyZWN0b3J5VXJpKTtcbiAgaWYgKCFleGlzdHMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIGRpcmVjdG9yeSB0byBzZWFyY2ggOiAnICsgZGlyZWN0b3J5VXJpKTtcbiAgfVxuXG4gIGNvbnN0IHN0YXQgPSBhd2FpdCBmc1Byb21pc2Uuc3RhdChkaXJlY3RvcnlVcmkpO1xuICBpZiAoIXN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHJvdmlkZWQgcGF0aCBpcyBub3QgYSBkaXJlY3RvcnkgOiAnICsgZGlyZWN0b3J5VXJpKTtcbiAgfVxuXG4gIGNvbnN0IHByb21pc2UgPSBuZXdGaWxlU2VhcmNoKGRpcmVjdG9yeVVyaSk7XG4gIGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmlbZGlyZWN0b3J5VXJpXSA9IHByb21pc2U7XG4gIHJldHVybiBwcm9taXNlO1xufVxuIl19