var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var findDiagnostics = _asyncToGenerator(function* (fileNames) {
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

    results.push(service.findDiagnostics(files));
  }

  return (_ref4 = []).concat.apply(_ref4, _toConsumableArray((yield Promise.all(results))));
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function getService(fileName) {
  var _require = require('../../client');

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

module.exports = {
  findArcConfigDirectory: findArcConfigDirectory,
  readArcConfig: readArcConfig,
  findArcProjectIdOfPath: findArcProjectIdOfPath,
  getProjectRelativePath: getProjectRelativePath,
  findDiagnostics: findDiagnostics
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUF1Q2UsZUFBZSxxQkFBOUIsV0FBK0IsU0FBK0IsRUFBMEI7OztBQUN0RixNQUFNLGtCQUErRCxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbEYsT0FBSyxJQUFNLElBQUksSUFBSSxTQUFTLEVBQUU7QUFDNUIsUUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFFBQUksS0FBSyxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1QyxRQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDakIsV0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNYLHdCQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDeEM7QUFDRCxTQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ2xCOztBQUVELE1BQU0sT0FBc0MsR0FBRyxFQUFFLENBQUM7QUFDbEQsb0JBQStCLGtCQUFrQixFQUFFOzs7UUFBdkMsT0FBTztRQUFFLEtBQUs7O0FBQ3hCLFdBQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0dBQzlDOztBQUVELFNBQU8sU0FBQSxFQUFFLEVBQUMsTUFBTSxNQUFBLDRCQUFLLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQSxFQUFFLENBQUM7Q0FDbkQ7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBM0NxQixRQUFROzs7O0FBRTlCLFNBQVMsVUFBVSxDQUFDLFFBQW9CLEVBQXVCO2lCQUM1QixPQUFPLENBQUMsY0FBYyxDQUFDOztNQUFqRCxzQkFBc0IsWUFBdEIsc0JBQXNCOztBQUM3QixNQUFNLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQyxxQkFBcUIsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN4RSwyQkFBVSxPQUFPLENBQUMsQ0FBQztBQUNuQixTQUFPLE9BQU8sQ0FBQztDQUNoQjs7QUFFRCxTQUFTLHNCQUFzQixDQUFDLFFBQW9CLEVBQXdCO0FBQzFFLFNBQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQzlEOztBQUVELFNBQVMsYUFBYSxDQUFDLFFBQW9CLEVBQW9CO0FBQzdELFNBQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUNyRDs7QUFFRCxTQUFTLHNCQUFzQixDQUFDLFFBQW9CLEVBQW9CO0FBQ3RFLFNBQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQzlEOztBQUVELFNBQVMsc0JBQXNCLENBQUMsUUFBb0IsRUFBb0I7QUFDdEUsU0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDOUQ7O0FBc0JELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLGVBQWEsRUFBYixhQUFhO0FBQ2Isd0JBQXNCLEVBQXRCLHNCQUFzQjtBQUN0Qix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLGlCQUFlLEVBQWYsZUFBZTtDQUNoQixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZW9mICogYXMgQXJjYW5pc3RCYXNlU2VydmljZSBmcm9tICcuLi8uLi9hcmNhbmlzdC1iYXNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5mdW5jdGlvbiBnZXRTZXJ2aWNlKGZpbGVOYW1lOiBOdWNsaWRlVXJpKTogQXJjYW5pc3RCYXNlU2VydmljZSB7XG4gIGNvbnN0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uL2NsaWVudCcpO1xuICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnQXJjYW5pc3RCYXNlU2VydmljZScsIGZpbGVOYW1lKTtcbiAgaW52YXJpYW50KHNlcnZpY2UpO1xuICByZXR1cm4gc2VydmljZTtcbn1cblxuZnVuY3Rpb24gZmluZEFyY0NvbmZpZ0RpcmVjdG9yeShmaWxlTmFtZTogTnVjbGlkZVVyaSk6IFByb21pc2U8P051Y2xpZGVVcmk+IHtcbiAgcmV0dXJuIGdldFNlcnZpY2UoZmlsZU5hbWUpLmZpbmRBcmNDb25maWdEaXJlY3RvcnkoZmlsZU5hbWUpO1xufVxuXG5mdW5jdGlvbiByZWFkQXJjQ29uZmlnKGZpbGVOYW1lOiBOdWNsaWRlVXJpKTogUHJvbWlzZTw/T2JqZWN0PiB7XG4gIHJldHVybiBnZXRTZXJ2aWNlKGZpbGVOYW1lKS5yZWFkQXJjQ29uZmlnKGZpbGVOYW1lKTtcbn1cblxuZnVuY3Rpb24gZmluZEFyY1Byb2plY3RJZE9mUGF0aChmaWxlTmFtZTogTnVjbGlkZVVyaSk6IFByb21pc2U8P3N0cmluZz4ge1xuICByZXR1cm4gZ2V0U2VydmljZShmaWxlTmFtZSkuZmluZEFyY1Byb2plY3RJZE9mUGF0aChmaWxlTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGdldFByb2plY3RSZWxhdGl2ZVBhdGgoZmlsZU5hbWU6IE51Y2xpZGVVcmkpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgcmV0dXJuIGdldFNlcnZpY2UoZmlsZU5hbWUpLmdldFByb2plY3RSZWxhdGl2ZVBhdGgoZmlsZU5hbWUpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBmaW5kRGlhZ25vc3RpY3MoZmlsZU5hbWVzOiBJdGVyYWJsZTxOdWNsaWRlVXJpPik6IFByb21pc2U8QXJyYXk8T2JqZWN0Pj4ge1xuICBjb25zdCBzZXJ2aWNlVG9GaWxlTmFtZXM6IE1hcDxBcmNhbmlzdEJhc2VTZXJ2aWNlLCBBcnJheTxOdWNsaWRlVXJpPj4gPSBuZXcgTWFwKCk7XG4gIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlTmFtZXMpIHtcbiAgICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZShmaWxlKTtcbiAgICBsZXQgZmlsZXMgPSBzZXJ2aWNlVG9GaWxlTmFtZXMuZ2V0KHNlcnZpY2UpO1xuICAgIGlmIChmaWxlcyA9PSBudWxsKSB7XG4gICAgICBmaWxlcyA9IFtdO1xuICAgICAgc2VydmljZVRvRmlsZU5hbWVzLnNldChzZXJ2aWNlLCBmaWxlcyk7XG4gICAgfVxuICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gIH1cblxuICBjb25zdCByZXN1bHRzOiBBcnJheTxQcm9taXNlPEFycmF5PE9iamVjdD4+PiA9IFtdO1xuICBmb3IgKGNvbnN0IFtzZXJ2aWNlLCBmaWxlc10gb2Ygc2VydmljZVRvRmlsZU5hbWVzKSB7XG4gICAgcmVzdWx0cy5wdXNoKHNlcnZpY2UuZmluZERpYWdub3N0aWNzKGZpbGVzKSk7XG4gIH1cblxuICByZXR1cm4gW10uY29uY2F0KC4uLihhd2FpdCBQcm9taXNlLmFsbChyZXN1bHRzKSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZmluZEFyY0NvbmZpZ0RpcmVjdG9yeSxcbiAgcmVhZEFyY0NvbmZpZyxcbiAgZmluZEFyY1Byb2plY3RJZE9mUGF0aCxcbiAgZ2V0UHJvamVjdFJlbGF0aXZlUGF0aCxcbiAgZmluZERpYWdub3N0aWNzLFxufTtcbiJdfQ==