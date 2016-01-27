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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function getService(fileName) {
  return require('../../client').getServiceByNuclideUri('ArcanistBaseService', fileName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFrQ2UsZUFBZSxxQkFBOUIsV0FBK0IsU0FBK0IsRUFBMEI7OztBQUN0RixNQUFNLGtCQUErRCxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbEYsT0FBSyxJQUFNLElBQUksSUFBSSxTQUFTLEVBQUU7QUFDNUIsUUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFFBQUksS0FBSyxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1QyxRQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDakIsV0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNYLHdCQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDeEM7QUFDRCxTQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ2xCOztBQUVELE1BQU0sT0FBc0MsR0FBRyxFQUFFLENBQUM7QUFDbEQsb0JBQStCLGtCQUFrQixFQUFFOzs7UUFBdkMsT0FBTztRQUFFLEtBQUs7O0FBQ3hCLFdBQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0dBQzlDOztBQUVELFNBQU8sU0FBQSxFQUFFLEVBQUMsTUFBTSxNQUFBLDRCQUFLLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQSxFQUFFLENBQUM7Q0FDbkQ7Ozs7Ozs7Ozs7Ozs7O0FBdENELFNBQVMsVUFBVSxDQUFDLFFBQW9CLEVBQXVCO0FBQzdELFNBQU8sT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLHFCQUFxQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQ3hGOztBQUVELFNBQVMsc0JBQXNCLENBQUMsUUFBb0IsRUFBd0I7QUFDMUUsU0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDOUQ7O0FBRUQsU0FBUyxhQUFhLENBQUMsUUFBb0IsRUFBb0I7QUFDN0QsU0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ3JEOztBQUVELFNBQVMsc0JBQXNCLENBQUMsUUFBb0IsRUFBb0I7QUFDdEUsU0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDOUQ7O0FBRUQsU0FBUyxzQkFBc0IsQ0FBQyxRQUFvQixFQUFvQjtBQUN0RSxTQUFPLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM5RDs7QUFzQkQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsZUFBYSxFQUFiLGFBQWE7QUFDYix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsaUJBQWUsRUFBZixlQUFlO0NBQ2hCLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlb2YgKiBhcyBBcmNhbmlzdEJhc2VTZXJ2aWNlIGZyb20gJy4uLy4uL2FyY2FuaXN0LWJhc2UnO1xuXG5mdW5jdGlvbiBnZXRTZXJ2aWNlKGZpbGVOYW1lOiBOdWNsaWRlVXJpKTogQXJjYW5pc3RCYXNlU2VydmljZSB7XG4gIHJldHVybiByZXF1aXJlKCcuLi8uLi9jbGllbnQnKS5nZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdBcmNhbmlzdEJhc2VTZXJ2aWNlJywgZmlsZU5hbWUpO1xufVxuXG5mdW5jdGlvbiBmaW5kQXJjQ29uZmlnRGlyZWN0b3J5KGZpbGVOYW1lOiBOdWNsaWRlVXJpKTogUHJvbWlzZTw/TnVjbGlkZVVyaT4ge1xuICByZXR1cm4gZ2V0U2VydmljZShmaWxlTmFtZSkuZmluZEFyY0NvbmZpZ0RpcmVjdG9yeShmaWxlTmFtZSk7XG59XG5cbmZ1bmN0aW9uIHJlYWRBcmNDb25maWcoZmlsZU5hbWU6IE51Y2xpZGVVcmkpOiBQcm9taXNlPD9PYmplY3Q+IHtcbiAgcmV0dXJuIGdldFNlcnZpY2UoZmlsZU5hbWUpLnJlYWRBcmNDb25maWcoZmlsZU5hbWUpO1xufVxuXG5mdW5jdGlvbiBmaW5kQXJjUHJvamVjdElkT2ZQYXRoKGZpbGVOYW1lOiBOdWNsaWRlVXJpKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gIHJldHVybiBnZXRTZXJ2aWNlKGZpbGVOYW1lKS5maW5kQXJjUHJvamVjdElkT2ZQYXRoKGZpbGVOYW1lKTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvamVjdFJlbGF0aXZlUGF0aChmaWxlTmFtZTogTnVjbGlkZVVyaSk6IFByb21pc2U8P3N0cmluZz4ge1xuICByZXR1cm4gZ2V0U2VydmljZShmaWxlTmFtZSkuZ2V0UHJvamVjdFJlbGF0aXZlUGF0aChmaWxlTmFtZSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpbmREaWFnbm9zdGljcyhmaWxlTmFtZXM6IEl0ZXJhYmxlPE51Y2xpZGVVcmk+KTogUHJvbWlzZTxBcnJheTxPYmplY3Q+PiB7XG4gIGNvbnN0IHNlcnZpY2VUb0ZpbGVOYW1lczogTWFwPEFyY2FuaXN0QmFzZVNlcnZpY2UsIEFycmF5PE51Y2xpZGVVcmk+PiA9IG5ldyBNYXAoKTtcbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVOYW1lcykge1xuICAgIGNvbnN0IHNlcnZpY2UgPSBnZXRTZXJ2aWNlKGZpbGUpO1xuICAgIGxldCBmaWxlcyA9IHNlcnZpY2VUb0ZpbGVOYW1lcy5nZXQoc2VydmljZSk7XG4gICAgaWYgKGZpbGVzID09IG51bGwpIHtcbiAgICAgIGZpbGVzID0gW107XG4gICAgICBzZXJ2aWNlVG9GaWxlTmFtZXMuc2V0KHNlcnZpY2UsIGZpbGVzKTtcbiAgICB9XG4gICAgZmlsZXMucHVzaChmaWxlKTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdHM6IEFycmF5PFByb21pc2U8QXJyYXk8T2JqZWN0Pj4+ID0gW107XG4gIGZvciAoY29uc3QgW3NlcnZpY2UsIGZpbGVzXSBvZiBzZXJ2aWNlVG9GaWxlTmFtZXMpIHtcbiAgICByZXN1bHRzLnB1c2goc2VydmljZS5maW5kRGlhZ25vc3RpY3MoZmlsZXMpKTtcbiAgfVxuXG4gIHJldHVybiBbXS5jb25jYXQoLi4uKGF3YWl0IFByb21pc2UuYWxsKHJlc3VsdHMpKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmaW5kQXJjQ29uZmlnRGlyZWN0b3J5LFxuICByZWFkQXJjQ29uZmlnLFxuICBmaW5kQXJjUHJvamVjdElkT2ZQYXRoLFxuICBnZXRQcm9qZWN0UmVsYXRpdmVQYXRoLFxuICBmaW5kRGlhZ25vc3RpY3MsXG59O1xuIl19