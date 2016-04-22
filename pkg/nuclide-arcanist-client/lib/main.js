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
  return getService(filePath).createPhabricatorRevision(filePath).share();
}

function updatePhabricatorRevision(filePath, message, allowUntracked) {
  return getService(filePath).updatePhabricatorRevision(filePath, message, allowUntracked).share();
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
//# sourceMappingURL=data:application/json;base64,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QUFJLEVBQUU7QUFDbEIsV0FBTyxJQUFJLENBQUM7R0FDYixNQUFNO0FBQ0wsV0FBTztBQUNMLFNBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2IsUUFBRSxRQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQUFBRTtLQUNuQixDQUFDO0dBQ0g7Q0FDRjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2Ysd0JBQXNCLEVBQXRCLHNCQUFzQjtBQUN0QixlQUFhLEVBQWIsYUFBYTtBQUNiLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsd0JBQXNCLEVBQXRCLHNCQUFzQjtBQUN0QixpQkFBZSxFQUFmLGVBQWU7QUFDZiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLDJCQUF5QixFQUF6Qix5QkFBeUI7QUFDekIseUNBQXVDLEVBQXZDLHVDQUF1QztDQUN4QyxDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEFyY2FuaXN0QmFzZVNlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1hcmNhbmlzdC1iYXNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBESUZGRVJFTlRJQUxfUkVWSVNJT05fUkVHRVggPSAvXkRpZmZlcmVudGlhbCBSZXZpc2lvbjpcXHMqKFxcRCtcXC9bZERdKFsxLTldWzAtOV17NSx9KSkvaW07XG5cbmV4cG9ydCB0eXBlIFBoYWJyaWNhdG9yUmV2aXNpb25JbmZvID0ge1xuICB1cmw6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbn07XG5cbmZ1bmN0aW9uIGdldFNlcnZpY2UoZmlsZU5hbWU6IE51Y2xpZGVVcmkpOiBBcmNhbmlzdEJhc2VTZXJ2aWNlIHtcbiAgY29uc3Qge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jbGllbnQnKTtcbiAgY29uc3Qgc2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0FyY2FuaXN0QmFzZVNlcnZpY2UnLCBmaWxlTmFtZSk7XG4gIGludmFyaWFudChzZXJ2aWNlKTtcbiAgcmV0dXJuIHNlcnZpY2U7XG59XG5cbmZ1bmN0aW9uIGZpbmRBcmNDb25maWdEaXJlY3RvcnkoZmlsZU5hbWU6IE51Y2xpZGVVcmkpOiBQcm9taXNlPD9OdWNsaWRlVXJpPiB7XG4gIHJldHVybiBnZXRTZXJ2aWNlKGZpbGVOYW1lKS5maW5kQXJjQ29uZmlnRGlyZWN0b3J5KGZpbGVOYW1lKTtcbn1cblxuZnVuY3Rpb24gcmVhZEFyY0NvbmZpZyhmaWxlTmFtZTogTnVjbGlkZVVyaSk6IFByb21pc2U8P09iamVjdD4ge1xuICByZXR1cm4gZ2V0U2VydmljZShmaWxlTmFtZSkucmVhZEFyY0NvbmZpZyhmaWxlTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGZpbmRBcmNQcm9qZWN0SWRPZlBhdGgoZmlsZU5hbWU6IE51Y2xpZGVVcmkpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgcmV0dXJuIGdldFNlcnZpY2UoZmlsZU5hbWUpLmZpbmRBcmNQcm9qZWN0SWRPZlBhdGgoZmlsZU5hbWUpO1xufVxuXG5mdW5jdGlvbiBnZXRQcm9qZWN0UmVsYXRpdmVQYXRoKGZpbGVOYW1lOiBOdWNsaWRlVXJpKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gIHJldHVybiBnZXRTZXJ2aWNlKGZpbGVOYW1lKS5nZXRQcm9qZWN0UmVsYXRpdmVQYXRoKGZpbGVOYW1lKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZmluZERpYWdub3N0aWNzKFxuICBmaWxlTmFtZXM6IEl0ZXJhYmxlPE51Y2xpZGVVcmk+LFxuICBza2lwOiBBcnJheTxzdHJpbmc+LFxuKTogUHJvbWlzZTxBcnJheTxPYmplY3Q+PiB7XG4gIGNvbnN0IHNlcnZpY2VUb0ZpbGVOYW1lczogTWFwPEFyY2FuaXN0QmFzZVNlcnZpY2UsIEFycmF5PE51Y2xpZGVVcmk+PiA9IG5ldyBNYXAoKTtcbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVOYW1lcykge1xuICAgIGNvbnN0IHNlcnZpY2UgPSBnZXRTZXJ2aWNlKGZpbGUpO1xuICAgIGxldCBmaWxlcyA9IHNlcnZpY2VUb0ZpbGVOYW1lcy5nZXQoc2VydmljZSk7XG4gICAgaWYgKGZpbGVzID09IG51bGwpIHtcbiAgICAgIGZpbGVzID0gW107XG4gICAgICBzZXJ2aWNlVG9GaWxlTmFtZXMuc2V0KHNlcnZpY2UsIGZpbGVzKTtcbiAgICB9XG4gICAgZmlsZXMucHVzaChmaWxlKTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdHM6IEFycmF5PFByb21pc2U8QXJyYXk8T2JqZWN0Pj4+ID0gW107XG4gIGZvciAoY29uc3QgW3NlcnZpY2UsIGZpbGVzXSBvZiBzZXJ2aWNlVG9GaWxlTmFtZXMpIHtcbiAgICByZXN1bHRzLnB1c2goc2VydmljZS5maW5kRGlhZ25vc3RpY3MoZmlsZXMsIHNraXApKTtcbiAgfVxuXG4gIHJldHVybiBbXS5jb25jYXQoLi4uKGF3YWl0IFByb21pc2UuYWxsKHJlc3VsdHMpKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVBoYWJyaWNhdG9yUmV2aXNpb24oXG4gIGZpbGVQYXRoOiBOdWNsaWRlVXJpXG4pOiBPYnNlcnZhYmxlPHtzdGRlcnI/OiBzdHJpbmc7IHN0ZG91dD86IHN0cmluZzt9PiB7XG4gIHJldHVybiBnZXRTZXJ2aWNlKGZpbGVQYXRoKVxuICAgIC5jcmVhdGVQaGFicmljYXRvclJldmlzaW9uKGZpbGVQYXRoKVxuICAgIC5zaGFyZSgpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVQaGFicmljYXRvclJldmlzaW9uKFxuICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgbWVzc2FnZTogc3RyaW5nLFxuICBhbGxvd1VudHJhY2tlZDogYm9vbGVhbixcbik6IE9ic2VydmFibGU8e3N0ZGVycj86IHN0cmluZzsgc3Rkb3V0Pzogc3RyaW5nO30+IHtcbiAgcmV0dXJuIGdldFNlcnZpY2UoZmlsZVBhdGgpXG4gICAgLnVwZGF0ZVBoYWJyaWNhdG9yUmV2aXNpb24oZmlsZVBhdGgsIG1lc3NhZ2UsIGFsbG93VW50cmFja2VkKVxuICAgIC5zaGFyZSgpO1xufVxuXG5mdW5jdGlvbiBnZXRQaGFicmljYXRvclJldmlzaW9uRnJvbUNvbW1pdE1lc3NhZ2UoY29tbWl0TWVzc2FnZTogc3RyaW5nKTogP1BoYWJyaWNhdG9yUmV2aXNpb25JbmZvIHtcbiAgY29uc3QgbWF0Y2ggPSBESUZGRVJFTlRJQUxfUkVWSVNJT05fUkVHRVguZXhlYyhjb21taXRNZXNzYWdlKTtcbiAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVybDogbWF0Y2hbMV0sXG4gICAgICBpZDogYEQke21hdGNoWzJdfWAsXG4gICAgfTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZmluZEFyY0NvbmZpZ0RpcmVjdG9yeSxcbiAgcmVhZEFyY0NvbmZpZyxcbiAgZmluZEFyY1Byb2plY3RJZE9mUGF0aCxcbiAgZ2V0UHJvamVjdFJlbGF0aXZlUGF0aCxcbiAgZmluZERpYWdub3N0aWNzLFxuICBjcmVhdGVQaGFicmljYXRvclJldmlzaW9uLFxuICB1cGRhdGVQaGFicmljYXRvclJldmlzaW9uLFxuICBnZXRQaGFicmljYXRvclJldmlzaW9uRnJvbUNvbW1pdE1lc3NhZ2UsXG59O1xuIl19