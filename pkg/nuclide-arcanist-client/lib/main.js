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
//# sourceMappingURL=data:application/json;base64,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TUFBTTtBQUNMLFdBQU87QUFDTCxTQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNiLFFBQUUsUUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLEFBQUU7S0FDbkIsQ0FBQztHQUNIO0NBQ0Y7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsZUFBYSxFQUFiLGFBQWE7QUFDYix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsaUJBQWUsRUFBZixlQUFlO0FBQ2YsMkJBQXlCLEVBQXpCLHlCQUF5QjtBQUN6QiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLHlDQUF1QyxFQUF2Qyx1Q0FBdUM7Q0FDeEMsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZW9mICogYXMgQXJjYW5pc3RCYXNlU2VydmljZSBmcm9tICcuLi8uLi9udWNsaWRlLWFyY2FuaXN0LWJhc2UnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IERJRkZFUkVOVElBTF9SRVZJU0lPTl9SRUdFWCA9IC9eRGlmZmVyZW50aWFsIFJldmlzaW9uOlxccyooXFxEK1xcL1tkRF0oWzEtOV1bMC05XXs1LH0pKS9pbTtcblxuZXhwb3J0IHR5cGUgUGhhYnJpY2F0b3JSZXZpc2lvbkluZm8gPSB7XG4gIHVybDogc3RyaW5nO1xuICBpZDogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBnZXRTZXJ2aWNlKGZpbGVOYW1lOiBOdWNsaWRlVXJpKTogQXJjYW5pc3RCYXNlU2VydmljZSB7XG4gIGNvbnN0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY2xpZW50Jyk7XG4gIGNvbnN0IHNlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdBcmNhbmlzdEJhc2VTZXJ2aWNlJywgZmlsZU5hbWUpO1xuICBpbnZhcmlhbnQoc2VydmljZSk7XG4gIHJldHVybiBzZXJ2aWNlO1xufVxuXG5mdW5jdGlvbiBmaW5kQXJjQ29uZmlnRGlyZWN0b3J5KGZpbGVOYW1lOiBOdWNsaWRlVXJpKTogUHJvbWlzZTw/TnVjbGlkZVVyaT4ge1xuICByZXR1cm4gZ2V0U2VydmljZShmaWxlTmFtZSkuZmluZEFyY0NvbmZpZ0RpcmVjdG9yeShmaWxlTmFtZSk7XG59XG5cbmZ1bmN0aW9uIHJlYWRBcmNDb25maWcoZmlsZU5hbWU6IE51Y2xpZGVVcmkpOiBQcm9taXNlPD9PYmplY3Q+IHtcbiAgcmV0dXJuIGdldFNlcnZpY2UoZmlsZU5hbWUpLnJlYWRBcmNDb25maWcoZmlsZU5hbWUpO1xufVxuXG5mdW5jdGlvbiBmaW5kQXJjUHJvamVjdElkT2ZQYXRoKGZpbGVOYW1lOiBOdWNsaWRlVXJpKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gIHJldHVybiBnZXRTZXJ2aWNlKGZpbGVOYW1lKS5maW5kQXJjUHJvamVjdElkT2ZQYXRoKGZpbGVOYW1lKTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvamVjdFJlbGF0aXZlUGF0aChmaWxlTmFtZTogTnVjbGlkZVVyaSk6IFByb21pc2U8P3N0cmluZz4ge1xuICByZXR1cm4gZ2V0U2VydmljZShmaWxlTmFtZSkuZ2V0UHJvamVjdFJlbGF0aXZlUGF0aChmaWxlTmFtZSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpbmREaWFnbm9zdGljcyhcbiAgZmlsZU5hbWVzOiBJdGVyYWJsZTxOdWNsaWRlVXJpPixcbiAgc2tpcDogQXJyYXk8c3RyaW5nPixcbik6IFByb21pc2U8QXJyYXk8T2JqZWN0Pj4ge1xuICBjb25zdCBzZXJ2aWNlVG9GaWxlTmFtZXM6IE1hcDxBcmNhbmlzdEJhc2VTZXJ2aWNlLCBBcnJheTxOdWNsaWRlVXJpPj4gPSBuZXcgTWFwKCk7XG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlTmFtZXMpIHtcbiAgICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZShmaWxlKTtcbiAgICBsZXQgZmlsZXMgPSBzZXJ2aWNlVG9GaWxlTmFtZXMuZ2V0KHNlcnZpY2UpO1xuICAgIGlmIChmaWxlcyA9PSBudWxsKSB7XG4gICAgICBmaWxlcyA9IFtdO1xuICAgICAgc2VydmljZVRvRmlsZU5hbWVzLnNldChzZXJ2aWNlLCBmaWxlcyk7XG4gICAgfVxuICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gIH1cblxuICBjb25zdCByZXN1bHRzOiBBcnJheTxQcm9taXNlPEFycmF5PE9iamVjdD4+PiA9IFtdO1xuICBmb3IgKGNvbnN0IFtzZXJ2aWNlLCBmaWxlc10gb2Ygc2VydmljZVRvRmlsZU5hbWVzKSB7XG4gICAgcmVzdWx0cy5wdXNoKHNlcnZpY2UuZmluZERpYWdub3N0aWNzKGZpbGVzLCBza2lwKSk7XG4gIH1cblxuICByZXR1cm4gW10uY29uY2F0KC4uLihhd2FpdCBQcm9taXNlLmFsbChyZXN1bHRzKSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVQaGFicmljYXRvclJldmlzaW9uKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBnZXRTZXJ2aWNlKGZpbGVQYXRoKS5jcmVhdGVQaGFicmljYXRvclJldmlzaW9uKGZpbGVQYXRoKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlUGhhYnJpY2F0b3JSZXZpc2lvbihcbiAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gIG1lc3NhZ2U6IHN0cmluZyxcbiAgYWxsb3dVbnRyYWNrZWQ6IGJvb2xlYW4sXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIGdldFNlcnZpY2UoZmlsZVBhdGgpLnVwZGF0ZVBoYWJyaWNhdG9yUmV2aXNpb24oZmlsZVBhdGgsIG1lc3NhZ2UsIGFsbG93VW50cmFja2VkKTtcbn1cblxuZnVuY3Rpb24gZ2V0UGhhYnJpY2F0b3JSZXZpc2lvbkZyb21Db21taXRNZXNzYWdlKGNvbW1pdE1lc3NhZ2U6IHN0cmluZyk6ID9QaGFicmljYXRvclJldmlzaW9uSW5mbyB7XG4gIGNvbnN0IG1hdGNoID0gRElGRkVSRU5USUFMX1JFVklTSU9OX1JFR0VYLmV4ZWMoY29tbWl0TWVzc2FnZSk7XG4gIGlmIChtYXRjaCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICB1cmw6IG1hdGNoWzFdLFxuICAgICAgaWQ6IGBEJHttYXRjaFsyXX1gLFxuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGZpbmRBcmNDb25maWdEaXJlY3RvcnksXG4gIHJlYWRBcmNDb25maWcsXG4gIGZpbmRBcmNQcm9qZWN0SWRPZlBhdGgsXG4gIGdldFByb2plY3RSZWxhdGl2ZVBhdGgsXG4gIGZpbmREaWFnbm9zdGljcyxcbiAgY3JlYXRlUGhhYnJpY2F0b3JSZXZpc2lvbixcbiAgdXBkYXRlUGhhYnJpY2F0b3JSZXZpc2lvbixcbiAgZ2V0UGhhYnJpY2F0b3JSZXZpc2lvbkZyb21Db21taXRNZXNzYWdlLFxufTtcbiJdfQ==