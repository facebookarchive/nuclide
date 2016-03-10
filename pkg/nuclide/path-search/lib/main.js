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

var getFileSearchModule = _asyncToGenerator(function* () {
  if (_fileSearchModule != null) {
    return _fileSearchModule;
  }
  var GK_NATIVE_SEARCH = 'nuclide_file_search_native';
  var GK_TIMEOUT = 2000;
  try {
    var _require = require('../../../fb/gatekeeper');

    var gatekeeper = _require.gatekeeper;

    if (yield gatekeeper.asyncIsGkEnabled(GK_NATIVE_SEARCH, GK_TIMEOUT)) {
      _fileSearchModule = require.resolve('./NativeFileSearch');
      return _fileSearchModule;
    }
  } catch (e) {
    // ignore
  }
  _fileSearchModule = require.resolve('./FileSearch');
  return _fileSearchModule;
}

/**
 * This is an object that lives in the main process that delegates calls to the
 * FileSearch in the forked process.
 */
);

var newFileSearch = _asyncToGenerator(function* (directoryUri) {
  var _require2 = require('../../task');

  var createTask = _require2.createTask;

  var task = createTask();
  yield task.invokeRemoteMethod({
    file: yield getFileSearchModule(),
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

exports.fileSearchForDirectory = fileSearchForDirectory;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _fileSearchModule = undefined;

var MainProcessFileSearch = (function () {
  function MainProcessFileSearch(task, directoryUri) {
    _classCallCheck(this, MainProcessFileSearch);

    this._task = task;
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
      return this._task.invokeRemoteMethod({
        file: yield getFileSearchModule(),
        method: 'doSearch',
        args: [this._directoryUri, query]
      });
    }))
  }, {
    key: 'dispose',
    value: function dispose() {
      if (fileSearchForDirectoryUri[this._directoryUri] === this) {
        delete fileSearchForDirectoryUri[this._directoryUri];
      }
      this._task.dispose();
    }
  }]);

  return MainProcessFileSearch;
})();

var fileSearchForDirectoryUri = {};

function fileSearchForDirectory(directoryUri) {
  if (directoryUri in fileSearchForDirectoryUri) {
    return fileSearchForDirectoryUri[directoryUri];
  }

  var promise = newFileSearch(directoryUri);
  fileSearchForDirectoryUri[directoryUri] = promise;
  return promise;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7SUF1QmUsbUJBQW1CLHFCQUFsQyxhQUFzRDtBQUNwRCxNQUFJLGlCQUFpQixJQUFJLElBQUksRUFBRTtBQUM3QixXQUFPLGlCQUFpQixDQUFDO0dBQzFCO0FBQ0QsTUFBTSxnQkFBZ0IsR0FBRyw0QkFBNEIsQ0FBQztBQUN0RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDeEIsTUFBSTttQkFDbUIsT0FBTyxDQUFDLHdCQUF3QixDQUFDOztRQUEvQyxVQUFVLFlBQVYsVUFBVTs7QUFDakIsUUFBSSxNQUFNLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsRUFBRTtBQUNuRSx1QkFBaUIsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDMUQsYUFBTyxpQkFBaUIsQ0FBQztLQUMxQjtHQUNGLENBQUMsT0FBTyxDQUFDLEVBQUU7O0dBRVg7QUFDRCxtQkFBaUIsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BELFNBQU8saUJBQWlCLENBQUM7Q0FDMUI7Ozs7Ozs7O0lBaUNjLGFBQWEscUJBQTVCLFdBQTZCLFlBQW9CLEVBQWtDO2tCQUM1RCxPQUFPLENBQUMsWUFBWSxDQUFDOztNQUFuQyxVQUFVLGFBQVYsVUFBVTs7QUFDakIsTUFBTSxJQUFJLEdBQUcsVUFBVSxFQUFFLENBQUM7QUFDMUIsUUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUM7QUFDNUIsUUFBSSxFQUFFLE1BQU0sbUJBQW1CLEVBQUU7QUFDakMsVUFBTSxFQUFFLDRCQUE0QjtBQUNwQyxRQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUM7R0FDckIsQ0FBQyxDQUFDO0FBQ0gsU0FBTyxJQUFJLHFCQUFxQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztDQUN0RDs7Ozs7Ozs7Ozs7Ozs7OztBQTVERCxJQUFJLGlCQUEwQixZQUFBLENBQUM7O0lBd0J6QixxQkFBcUI7QUFJZCxXQUpQLHFCQUFxQixDQUliLElBQVUsRUFBRSxZQUEwQixFQUFFOzBCQUpoRCxxQkFBcUI7O0FBS3ZCLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO0dBQ25DOztlQVBHLHFCQUFxQjs7Ozs7Ozs7Ozs7O3lCQVNkLFdBQUMsS0FBYSxFQUFvQztBQUMzRCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUM7QUFDbkMsWUFBSSxFQUFFLE1BQU0sbUJBQW1CLEVBQUU7QUFDakMsY0FBTSxFQUFFLFVBQVU7QUFDbEIsWUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUM7T0FDbEMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssSUFBSSxFQUFFO0FBQzFELGVBQU8seUJBQXlCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO09BQ3REO0FBQ0QsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0Qjs7O1NBdEJHLHFCQUFxQjs7O0FBeUIzQixJQUFNLHlCQUFnRixHQUFHLEVBQUUsQ0FBQzs7QUFtQnJGLFNBQVMsc0JBQXNCLENBQUMsWUFBb0IsRUFBdUI7QUFDaEYsTUFBSSxZQUFZLElBQUkseUJBQXlCLEVBQUU7QUFDN0MsV0FBTyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUNoRDs7QUFFRCxNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDNUMsMkJBQXlCLENBQUMsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ2xELFNBQU8sT0FBTyxDQUFDO0NBQ2hCIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VGFza30gZnJvbSAnLi4vLi4vdGFzayc7XG5pbXBvcnQgdHlwZSB7RmlsZVNlYXJjaFJlc3VsdCBhcyBGaWxlU2VhcmNoUmVzdWx0VHlwZX0gZnJvbSAnLi9GaWxlU2VhcmNoJztcblxuZXhwb3J0IHR5cGUgRmlsZVNlYXJjaFJlc3VsdCA9IEZpbGVTZWFyY2hSZXN1bHRUeXBlO1xuXG50eXBlIERpcmVjdG9yeVVyaSA9IHN0cmluZztcbmV4cG9ydCB0eXBlIEZpbGVTZWFyY2ggPSB7XG4gIHF1ZXJ5OiAocXVlcnk6IHN0cmluZykgPT4gUHJvbWlzZTxBcnJheTxGaWxlU2VhcmNoUmVzdWx0Pj47XG4gIGRpc3Bvc2U6ICgpID0+IHZvaWQ7XG59O1xuXG5sZXQgX2ZpbGVTZWFyY2hNb2R1bGU6ID9zdHJpbmc7XG5hc3luYyBmdW5jdGlvbiBnZXRGaWxlU2VhcmNoTW9kdWxlKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmIChfZmlsZVNlYXJjaE1vZHVsZSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIF9maWxlU2VhcmNoTW9kdWxlO1xuICB9XG4gIGNvbnN0IEdLX05BVElWRV9TRUFSQ0ggPSAnbnVjbGlkZV9maWxlX3NlYXJjaF9uYXRpdmUnO1xuICBjb25zdCBHS19USU1FT1VUID0gMjAwMDtcbiAgdHJ5IHtcbiAgICBjb25zdCB7Z2F0ZWtlZXBlcn0gPSByZXF1aXJlKCcuLi8uLi8uLi9mYi9nYXRla2VlcGVyJyk7XG4gICAgaWYgKGF3YWl0IGdhdGVrZWVwZXIuYXN5bmNJc0drRW5hYmxlZChHS19OQVRJVkVfU0VBUkNILCBHS19USU1FT1VUKSkge1xuICAgICAgX2ZpbGVTZWFyY2hNb2R1bGUgPSByZXF1aXJlLnJlc29sdmUoJy4vTmF0aXZlRmlsZVNlYXJjaCcpO1xuICAgICAgcmV0dXJuIF9maWxlU2VhcmNoTW9kdWxlO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIGlnbm9yZVxuICB9XG4gIF9maWxlU2VhcmNoTW9kdWxlID0gcmVxdWlyZS5yZXNvbHZlKCcuL0ZpbGVTZWFyY2gnKTtcbiAgcmV0dXJuIF9maWxlU2VhcmNoTW9kdWxlO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgYW4gb2JqZWN0IHRoYXQgbGl2ZXMgaW4gdGhlIG1haW4gcHJvY2VzcyB0aGF0IGRlbGVnYXRlcyBjYWxscyB0byB0aGVcbiAqIEZpbGVTZWFyY2ggaW4gdGhlIGZvcmtlZCBwcm9jZXNzLlxuICovXG5jbGFzcyBNYWluUHJvY2Vzc0ZpbGVTZWFyY2gge1xuICBfdGFzazogVGFzaztcbiAgX2RpcmVjdG9yeVVyaTogRGlyZWN0b3J5VXJpO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2s6IFRhc2ssIGRpcmVjdG9yeVVyaTogRGlyZWN0b3J5VXJpKSB7XG4gICAgdGhpcy5fdGFzayA9IHRhc2s7XG4gICAgdGhpcy5fZGlyZWN0b3J5VXJpID0gZGlyZWN0b3J5VXJpO1xuICB9XG5cbiAgYXN5bmMgcXVlcnkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RmlsZVNlYXJjaFJlc3VsdD4+IHtcbiAgICByZXR1cm4gdGhpcy5fdGFzay5pbnZva2VSZW1vdGVNZXRob2Qoe1xuICAgICAgZmlsZTogYXdhaXQgZ2V0RmlsZVNlYXJjaE1vZHVsZSgpLFxuICAgICAgbWV0aG9kOiAnZG9TZWFyY2gnLFxuICAgICAgYXJnczogW3RoaXMuX2RpcmVjdG9yeVVyaSwgcXVlcnldLFxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAoZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaVt0aGlzLl9kaXJlY3RvcnlVcmldID09PSB0aGlzKSB7XG4gICAgICBkZWxldGUgZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaVt0aGlzLl9kaXJlY3RvcnlVcmldO1xuICAgIH1cbiAgICB0aGlzLl90YXNrLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5jb25zdCBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5VXJpOiB7W2tleTogRGlyZWN0b3J5VXJpXTogUHJvbWlzZTxNYWluUHJvY2Vzc0ZpbGVTZWFyY2g+fSA9IHt9O1xuXG5hc3luYyBmdW5jdGlvbiBuZXdGaWxlU2VhcmNoKGRpcmVjdG9yeVVyaTogc3RyaW5nKTogUHJvbWlzZTxNYWluUHJvY2Vzc0ZpbGVTZWFyY2g+IHtcbiAgY29uc3Qge2NyZWF0ZVRhc2t9ID0gcmVxdWlyZSgnLi4vLi4vdGFzaycpO1xuICBjb25zdCB0YXNrID0gY3JlYXRlVGFzaygpO1xuICBhd2FpdCB0YXNrLmludm9rZVJlbW90ZU1ldGhvZCh7XG4gICAgZmlsZTogYXdhaXQgZ2V0RmlsZVNlYXJjaE1vZHVsZSgpLFxuICAgIG1ldGhvZDogJ2luaXRGaWxlU2VhcmNoRm9yRGlyZWN0b3J5JyxcbiAgICBhcmdzOiBbZGlyZWN0b3J5VXJpXSxcbiAgfSk7XG4gIHJldHVybiBuZXcgTWFpblByb2Nlc3NGaWxlU2VhcmNoKHRhc2ssIGRpcmVjdG9yeVVyaSk7XG59XG5cbi8qKlxuICogQ3VycmVudGx5LCBhbGwgdGhlIGNhbGxlciBjYXJlcyBhYm91dCBpcyB0aGF0IHRoZSBQcm9taXNlIHJlc29sdmVzIHRvIGFuXG4gKiBvYmplY3Qgd2l0aCBhIHF1ZXJ5KCkgbWV0aG9kLlxuICpcbiAqIFRPRE8obWJvbGluKTogQ2FsbGVyIHNob3VsZCBhbHNvIGludm9rZSBkaXNwb3NlKCksIGFzIGFwcHJvcHJpYXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmlsZVNlYXJjaEZvckRpcmVjdG9yeShkaXJlY3RvcnlVcmk6IHN0cmluZyk6IFByb21pc2U8RmlsZVNlYXJjaD4ge1xuICBpZiAoZGlyZWN0b3J5VXJpIGluIGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmkpIHtcbiAgICByZXR1cm4gZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaVtkaXJlY3RvcnlVcmldO1xuICB9XG5cbiAgY29uc3QgcHJvbWlzZSA9IG5ld0ZpbGVTZWFyY2goZGlyZWN0b3J5VXJpKTtcbiAgZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaVtkaXJlY3RvcnlVcmldID0gcHJvbWlzZTtcbiAgcmV0dXJuIHByb21pc2U7XG59XG4iXX0=