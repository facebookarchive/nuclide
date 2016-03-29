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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var findDiagnostics = _asyncToGenerator(function* (fileNames, skip) {
  var _ref4;

  var serviceToFileNames = new Map();
  for (var file of fileNames) {
    var service = getService(file);
    var files = serviceToFileNames.get(service);
    if (files == null) {
      files = [];
      serviceToFileNames.set(service, files);
    }
    files.push(file);
  }

  var results = [];
  for (var _ref3 of serviceToFileNames) {
    var _ref2 = _slicedToArray(_ref3, 2);

    var service = _ref2[0];
    var files = _ref2[1];

    results.push(service.findDiagnostics(files, skip));
  }

  return (_ref4 = []).concat.apply(_ref4, _toConsumableArray((yield Promise.all(results))));
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var DIFFERENTIAL_REVISION_REGEX = /^Differential Revision:\s*(\D+\/[dD]([1-9][0-9]{5,}))/im;

function getService(fileName) {
  var _require = require('../../nuclide-client');

  var getServiceByNuclideUri = _require.getServiceByNuclideUri;

  var service = getServiceByNuclideUri('ArcanistBaseService', fileName);
  (0, _assert2['default'])(service);
  return service;
}

function findArcConfigDirectory(fileName) {
  return getService(fileName).findArcConfigDirectory(fileName);
}

function readArcConfig(fileName) {
  return getService(fileName).readArcConfig(fileName);
}

function findArcProjectIdOfPath(fileName) {
  return getService(fileName).findArcProjectIdOfPath(fileName);
}

function getProjectRelativePath(fileName) {
  return getService(fileName).getProjectRelativePath(fileName);
}

function createPhabricatorRevision(filePath) {
  return getService(filePath).createPhabricatorRevision(filePath);
}

function updatePhabricatorRevision(filePath, message, allowUntracked) {
  return getService(filePath).updatePhabricatorRevision(filePath, message, allowUntracked);
}

function getPhabricatorRevisionFromCommitMessage(commitMessage) {
  var match = DIFFERENTIAL_REVISION_REGEX.exec(commitMessage);
  if (match === null) {
    return null;
  } else {
    return {
      url: match[1],
      id: 'D' + match[2]
    };
  }
}

module.exports = {
  findArcConfigDirectory: findArcConfigDirectory,
  readArcConfig: readArcConfig,
  findArcProjectIdOfPath: findArcProjectIdOfPath,
  getProjectRelativePath: getProjectRelativePath,
  findDiagnostics: findDiagnostics,
  createPhabricatorRevision: createPhabricatorRevision,
  updatePhabricatorRevision: updatePhabricatorRevision,
  getPhabricatorRevisionFromCommitMessage: getPhabricatorRevisionFromCommitMessage
};
//# sourceMappingURL=data:application/json;base64,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Q2IsTUFBTTtBQUNMLFdBQU87QUFDTCxTQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNiLFFBQUUsUUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLEFBQUU7S0FDbkIsQ0FBQztHQUNIO0NBQ0Y7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsZUFBYSxFQUFiLGFBQWE7QUFDYix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsaUJBQWUsRUFBZixlQUFlO0FBQ2YsMkJBQXlCLEVBQXpCLHlCQUF5QjtBQUN6QiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLHlDQUF1QyxFQUF2Qyx1Q0FBdUM7Q0FDeEMsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEFyY2FuaXN0QmFzZVNlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1hcmNhbmlzdC1iYXNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBESUZGRVJFTlRJQUxfUkVWSVNJT05fUkVHRVggPSAvXkRpZmZlcmVudGlhbCBSZXZpc2lvbjpcXHMqKFxcRCtcXC9bZERdKFsxLTldWzAtOV17NSx9KSkvaW07XG5cbmV4cG9ydCB0eXBlIFBoYWJyaWNhdG9yUmV2aXNpb25JbmZvID0ge1xuICB1cmw6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbn1cblxuZnVuY3Rpb24gZ2V0U2VydmljZShmaWxlTmFtZTogTnVjbGlkZVVyaSk6IEFyY2FuaXN0QmFzZVNlcnZpY2Uge1xuICBjb25zdCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNsaWVudCcpO1xuICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnQXJjYW5pc3RCYXNlU2VydmljZScsIGZpbGVOYW1lKTtcbiAgaW52YXJpYW50KHNlcnZpY2UpO1xuICByZXR1cm4gc2VydmljZTtcbn1cblxuZnVuY3Rpb24gZmluZEFyY0NvbmZpZ0RpcmVjdG9yeShmaWxlTmFtZTogTnVjbGlkZVVyaSk6IFByb21pc2U8P051Y2xpZGVVcmk+IHtcbiAgcmV0dXJuIGdldFNlcnZpY2UoZmlsZU5hbWUpLmZpbmRBcmNDb25maWdEaXJlY3RvcnkoZmlsZU5hbWUpO1xufVxuXG5mdW5jdGlvbiByZWFkQXJjQ29uZmlnKGZpbGVOYW1lOiBOdWNsaWRlVXJpKTogUHJvbWlzZTw/T2JqZWN0PiB7XG4gIHJldHVybiBnZXRTZXJ2aWNlKGZpbGVOYW1lKS5yZWFkQXJjQ29uZmlnKGZpbGVOYW1lKTtcbn1cblxuZnVuY3Rpb24gZmluZEFyY1Byb2plY3RJZE9mUGF0aChmaWxlTmFtZTogTnVjbGlkZVVyaSk6IFByb21pc2U8P3N0cmluZz4ge1xuICByZXR1cm4gZ2V0U2VydmljZShmaWxlTmFtZSkuZmluZEFyY1Byb2plY3RJZE9mUGF0aChmaWxlTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGdldFByb2plY3RSZWxhdGl2ZVBhdGgoZmlsZU5hbWU6IE51Y2xpZGVVcmkpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgcmV0dXJuIGdldFNlcnZpY2UoZmlsZU5hbWUpLmdldFByb2plY3RSZWxhdGl2ZVBhdGgoZmlsZU5hbWUpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBmaW5kRGlhZ25vc3RpY3MoXG4gIGZpbGVOYW1lczogSXRlcmFibGU8TnVjbGlkZVVyaT4sXG4gIHNraXA6IEFycmF5PHN0cmluZz4sXG4pOiBQcm9taXNlPEFycmF5PE9iamVjdD4+IHtcbiAgY29uc3Qgc2VydmljZVRvRmlsZU5hbWVzOiBNYXA8QXJjYW5pc3RCYXNlU2VydmljZSwgQXJyYXk8TnVjbGlkZVVyaT4+ID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZU5hbWVzKSB7XG4gICAgY29uc3Qgc2VydmljZSA9IGdldFNlcnZpY2UoZmlsZSk7XG4gICAgbGV0IGZpbGVzID0gc2VydmljZVRvRmlsZU5hbWVzLmdldChzZXJ2aWNlKTtcbiAgICBpZiAoZmlsZXMgPT0gbnVsbCkge1xuICAgICAgZmlsZXMgPSBbXTtcbiAgICAgIHNlcnZpY2VUb0ZpbGVOYW1lcy5zZXQoc2VydmljZSwgZmlsZXMpO1xuICAgIH1cbiAgICBmaWxlcy5wdXNoKGZpbGUpO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0czogQXJyYXk8UHJvbWlzZTxBcnJheTxPYmplY3Q+Pj4gPSBbXTtcbiAgZm9yIChjb25zdCBbc2VydmljZSwgZmlsZXNdIG9mIHNlcnZpY2VUb0ZpbGVOYW1lcykge1xuICAgIHJlc3VsdHMucHVzaChzZXJ2aWNlLmZpbmREaWFnbm9zdGljcyhmaWxlcywgc2tpcCkpO1xuICB9XG5cbiAgcmV0dXJuIFtdLmNvbmNhdCguLi4oYXdhaXQgUHJvbWlzZS5hbGwocmVzdWx0cykpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUGhhYnJpY2F0b3JSZXZpc2lvbihcbiAgZmlsZVBhdGg6IE51Y2xpZGVVcmlcbik6IE9ic2VydmFibGU8e3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30+IHtcbiAgcmV0dXJuIGdldFNlcnZpY2UoZmlsZVBhdGgpLmNyZWF0ZVBoYWJyaWNhdG9yUmV2aXNpb24oZmlsZVBhdGgpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVQaGFicmljYXRvclJldmlzaW9uKFxuICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgbWVzc2FnZTogc3RyaW5nLFxuICBhbGxvd1VudHJhY2tlZDogYm9vbGVhbixcbik6IE9ic2VydmFibGU8e3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30+IHtcbiAgcmV0dXJuIGdldFNlcnZpY2UoZmlsZVBhdGgpLnVwZGF0ZVBoYWJyaWNhdG9yUmV2aXNpb24oZmlsZVBhdGgsIG1lc3NhZ2UsIGFsbG93VW50cmFja2VkKTtcbn1cblxuZnVuY3Rpb24gZ2V0UGhhYnJpY2F0b3JSZXZpc2lvbkZyb21Db21taXRNZXNzYWdlKGNvbW1pdE1lc3NhZ2U6IHN0cmluZyk6ID9QaGFicmljYXRvclJldmlzaW9uSW5mbyB7XG4gIGNvbnN0IG1hdGNoID0gRElGRkVSRU5USUFMX1JFVklTSU9OX1JFR0VYLmV4ZWMoY29tbWl0TWVzc2FnZSk7XG4gIGlmIChtYXRjaCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICB1cmw6IG1hdGNoWzFdLFxuICAgICAgaWQ6IGBEJHttYXRjaFsyXX1gLFxuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGZpbmRBcmNDb25maWdEaXJlY3RvcnksXG4gIHJlYWRBcmNDb25maWcsXG4gIGZpbmRBcmNQcm9qZWN0SWRPZlBhdGgsXG4gIGdldFByb2plY3RSZWxhdGl2ZVBhdGgsXG4gIGZpbmREaWFnbm9zdGljcyxcbiAgY3JlYXRlUGhhYnJpY2F0b3JSZXZpc2lvbixcbiAgdXBkYXRlUGhhYnJpY2F0b3JSZXZpc2lvbixcbiAgZ2V0UGhhYnJpY2F0b3JSZXZpc2lvbkZyb21Db21taXRNZXNzYWdlLFxufTtcbiJdfQ==