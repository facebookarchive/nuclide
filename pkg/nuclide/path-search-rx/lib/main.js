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
  var _require = require('../../task');

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

exports.fileSearchForDirectory = fileSearchForDirectory;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/**
 * This is an object that lives in the main process that delegates calls to the
 * FileSearch in the forked process.
 */

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
    })(function (query) {
      return this._task.invokeRemoteMethod({
        file: require.resolve('./FileSearch'),
        method: 'doSearch',
        args: [this._directoryUri, query]
      });
    })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7SUFxRGUsYUFBYSxxQkFBNUIsV0FBNkIsWUFBb0IsRUFBa0M7aUJBQzVELE9BQU8sQ0FBQyxZQUFZLENBQUM7O01BQW5DLFVBQVUsWUFBVixVQUFVOztBQUNqQixNQUFNLElBQUksR0FBRyxVQUFVLEVBQUUsQ0FBQztBQUMxQixRQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztBQUM1QixRQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7QUFDckMsVUFBTSxFQUFFLDRCQUE0QjtBQUNwQyxRQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUM7R0FDckIsQ0FBQyxDQUFDO0FBQ0gsU0FBTyxJQUFJLHFCQUFxQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztDQUN0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBcENLLHFCQUFxQjtBQUlkLFdBSlAscUJBQXFCLENBSWIsSUFBVSxFQUFFLFlBQTBCLEVBQUU7MEJBSmhELHFCQUFxQjs7QUFLdkIsUUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsUUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7R0FDbkM7O2VBUEcscUJBQXFCOzs7Ozs7Ozs7Ozs7T0FTcEIsVUFBQyxLQUFhLEVBQW9DO0FBQ3JELGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztBQUNuQyxZQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7QUFDckMsY0FBTSxFQUFFLFVBQVU7QUFDbEIsWUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUM7T0FDbEMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssSUFBSSxFQUFFO0FBQzFELGVBQU8seUJBQXlCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO09BQ3REO0FBQ0QsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0Qjs7O1NBdEJHLHFCQUFxQjs7O0FBeUIzQixJQUFNLHlCQUFnRixHQUFHLEVBQUUsQ0FBQzs7QUFtQnJGLFNBQVMsc0JBQXNCLENBQUMsWUFBb0IsRUFBdUI7QUFDaEYsTUFBSSxZQUFZLElBQUkseUJBQXlCLEVBQUU7QUFDN0MsV0FBTyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUNoRDs7QUFFRCxNQUFNLE9BQU8sR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDNUMsMkJBQXlCLENBQUMsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ2xELFNBQU8sT0FBTyxDQUFDO0NBQ2hCIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VGFza30gZnJvbSAnLi4vLi4vdGFzayc7XG5pbXBvcnQgdHlwZSB7RmlsZVNlYXJjaFJlc3VsdCBhcyBGaWxlU2VhcmNoUmVzdWx0VHlwZX0gZnJvbSAnLi9GaWxlU2VhcmNoJztcblxuZXhwb3J0IHR5cGUgRmlsZVNlYXJjaFJlc3VsdCA9IEZpbGVTZWFyY2hSZXN1bHRUeXBlO1xuXG50eXBlIERpcmVjdG9yeVVyaSA9IHN0cmluZztcbmV4cG9ydCB0eXBlIEZpbGVTZWFyY2ggPSB7XG4gIHF1ZXJ5OiAocXVlcnk6IHN0cmluZykgPT4gUHJvbWlzZTxBcnJheTxGaWxlU2VhcmNoUmVzdWx0Pj47XG4gIGRpc3Bvc2U6ICgpID0+IHZvaWQ7XG59O1xuXG4vKipcbiAqIFRoaXMgaXMgYW4gb2JqZWN0IHRoYXQgbGl2ZXMgaW4gdGhlIG1haW4gcHJvY2VzcyB0aGF0IGRlbGVnYXRlcyBjYWxscyB0byB0aGVcbiAqIEZpbGVTZWFyY2ggaW4gdGhlIGZvcmtlZCBwcm9jZXNzLlxuICovXG5jbGFzcyBNYWluUHJvY2Vzc0ZpbGVTZWFyY2gge1xuICBfdGFzazogVGFzaztcbiAgX2RpcmVjdG9yeVVyaTogRGlyZWN0b3J5VXJpO1xuXG4gIGNvbnN0cnVjdG9yKHRhc2s6IFRhc2ssIGRpcmVjdG9yeVVyaTogRGlyZWN0b3J5VXJpKSB7XG4gICAgdGhpcy5fdGFzayA9IHRhc2s7XG4gICAgdGhpcy5fZGlyZWN0b3J5VXJpID0gZGlyZWN0b3J5VXJpO1xuICB9XG5cbiAgcXVlcnkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RmlsZVNlYXJjaFJlc3VsdD4+IHtcbiAgICByZXR1cm4gdGhpcy5fdGFzay5pbnZva2VSZW1vdGVNZXRob2Qoe1xuICAgICAgZmlsZTogcmVxdWlyZS5yZXNvbHZlKCcuL0ZpbGVTZWFyY2gnKSxcbiAgICAgIG1ldGhvZDogJ2RvU2VhcmNoJyxcbiAgICAgIGFyZ3M6IFt0aGlzLl9kaXJlY3RvcnlVcmksIHF1ZXJ5XSxcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmlbdGhpcy5fZGlyZWN0b3J5VXJpXSA9PT0gdGhpcykge1xuICAgICAgZGVsZXRlIGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmlbdGhpcy5fZGlyZWN0b3J5VXJpXTtcbiAgICB9XG4gICAgdGhpcy5fdGFzay5kaXNwb3NlKCk7XG4gIH1cbn1cblxuY29uc3QgZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaToge1trZXk6IERpcmVjdG9yeVVyaV06IFByb21pc2U8TWFpblByb2Nlc3NGaWxlU2VhcmNoPn0gPSB7fTtcblxuYXN5bmMgZnVuY3Rpb24gbmV3RmlsZVNlYXJjaChkaXJlY3RvcnlVcmk6IHN0cmluZyk6IFByb21pc2U8TWFpblByb2Nlc3NGaWxlU2VhcmNoPiB7XG4gIGNvbnN0IHtjcmVhdGVUYXNrfSA9IHJlcXVpcmUoJy4uLy4uL3Rhc2snKTtcbiAgY29uc3QgdGFzayA9IGNyZWF0ZVRhc2soKTtcbiAgYXdhaXQgdGFzay5pbnZva2VSZW1vdGVNZXRob2Qoe1xuICAgIGZpbGU6IHJlcXVpcmUucmVzb2x2ZSgnLi9GaWxlU2VhcmNoJyksXG4gICAgbWV0aG9kOiAnaW5pdEZpbGVTZWFyY2hGb3JEaXJlY3RvcnknLFxuICAgIGFyZ3M6IFtkaXJlY3RvcnlVcmldLFxuICB9KTtcbiAgcmV0dXJuIG5ldyBNYWluUHJvY2Vzc0ZpbGVTZWFyY2godGFzaywgZGlyZWN0b3J5VXJpKTtcbn1cblxuLyoqXG4gKiBDdXJyZW50bHksIGFsbCB0aGUgY2FsbGVyIGNhcmVzIGFib3V0IGlzIHRoYXQgdGhlIFByb21pc2UgcmVzb2x2ZXMgdG8gYW5cbiAqIG9iamVjdCB3aXRoIGEgcXVlcnkoKSBtZXRob2QuXG4gKlxuICogVE9ETyhtYm9saW4pOiBDYWxsZXIgc2hvdWxkIGFsc28gaW52b2tlIGRpc3Bvc2UoKSwgYXMgYXBwcm9wcmlhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5KGRpcmVjdG9yeVVyaTogc3RyaW5nKTogUHJvbWlzZTxGaWxlU2VhcmNoPiB7XG4gIGlmIChkaXJlY3RvcnlVcmkgaW4gZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaSkge1xuICAgIHJldHVybiBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5VXJpW2RpcmVjdG9yeVVyaV07XG4gIH1cblxuICBjb25zdCBwcm9taXNlID0gbmV3RmlsZVNlYXJjaChkaXJlY3RvcnlVcmkpO1xuICBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5VXJpW2RpcmVjdG9yeVVyaV0gPSBwcm9taXNlO1xuICByZXR1cm4gcHJvbWlzZTtcbn1cbiJdfQ==