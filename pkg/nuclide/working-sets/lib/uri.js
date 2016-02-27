Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.normalizePathUri = normalizePathUri;
exports.dedupeNormalizedUris = dedupeNormalizedUris;
exports.splitUri = splitUri;
exports.isUriBelow = isUriBelow;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _remoteUri = require('../../remote-uri');

function normalizePathUri(uri) {
  var _parse = (0, _remoteUri.parse)(uri);

  var hostname = _parse.hostname;
  var path = _parse.path;

  if (hostname != null) {
    // TODO: advinsky replace with remote-uri.normalize() when task t10040084 is closed
    return 'nuclide://' + hostname + normalizePath(path);
  } else {
    return normalizePath(path);
  }
}

function dedupeNormalizedUris(uris) {
  var dedepped = uris.slice();
  dedepped.sort();

  var lastOkIndex = -1;

  return dedepped.filter(function (u, i) {
    if (i !== 0 && u.startsWith(dedepped[lastOkIndex] + '/')) {
      return false;
    }

    lastOkIndex = i;
    return true;
  });
}

function splitUri(uri) {
  // Can't user remote-uri.parse() here, as the (normzlized) URI might no longer conform

  var _url$parse = _url2['default'].parse(uri);

  var hostname = _url$parse.hostname;
  var path = _url$parse.path;

  var tokensInPath = path ? path.split('/') : [];

  if (hostname) {
    return [hostname, '/'].concat(_toConsumableArray(tokensInPath));
  }

  return ['localhost', '/'].concat(_toConsumableArray(tokensInPath));
}

function isUriBelow(ancestorUri, descendantUri) {
  return descendantUri.startsWith(ancestorUri) && (descendantUri[ancestorUri.length] === '/' || ancestorUri.length === descendantUri.length);
}

function normalizePath(path) {
  (0, _assert2['default'])(path);
  var normalized = (0, _remoteUri.normalize)(path);
  if (normalized.endsWith('/')) {
    return normalized.slice(0, -1);
  }

  return normalized;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVyaS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFXZ0IsS0FBSzs7OztzQkFDQyxRQUFROzs7O3lCQUNDLGtCQUFrQjs7QUFJMUMsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFlLEVBQVU7ZUFDL0Isc0JBQU0sR0FBRyxDQUFDOztNQUE1QixRQUFRLFVBQVIsUUFBUTtNQUFFLElBQUksVUFBSixJQUFJOztBQUNyQixNQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7O0FBRXBCLDBCQUFvQixRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFHO0dBQ3RELE1BQU07QUFDTCxXQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM1QjtDQUNGOztBQUVNLFNBQVMsb0JBQW9CLENBQUMsSUFBbUIsRUFBaUI7QUFDdkUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzlCLFVBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFaEIsTUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRXJCLFNBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDL0IsUUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFO0FBQ3hELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7O0FBRUQsZUFBVyxHQUFHLENBQUMsQ0FBQztBQUNoQixXQUFPLElBQUksQ0FBQztHQUNiLENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsUUFBUSxDQUFDLEdBQVcsRUFBaUI7OzttQkFFMUIsaUJBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQzs7TUFBaEMsUUFBUSxjQUFSLFFBQVE7TUFBRSxJQUFJLGNBQUosSUFBSTs7QUFDckIsTUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUVqRCxNQUFJLFFBQVEsRUFBRTtBQUNaLFlBQVEsUUFBUSxFQUFFLEdBQUcsNEJBQUssWUFBWSxHQUFFO0dBQ3pDOztBQUVELFVBQVEsV0FBVyxFQUFFLEdBQUcsNEJBQUssWUFBWSxHQUFFO0NBQzVDOztBQUVNLFNBQVMsVUFBVSxDQUFDLFdBQW1CLEVBQUUsYUFBcUIsRUFBVztBQUM5RSxTQUFPLGFBQWEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEtBQ3pDLGFBQWEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFLLFdBQVcsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLE1BQU0sQ0FBQSxBQUFDLENBQUM7Q0FDL0Y7O0FBRUQsU0FBUyxhQUFhLENBQUMsSUFBYSxFQUFVO0FBQzVDLDJCQUFVLElBQUksQ0FBQyxDQUFDO0FBQ2hCLE1BQU0sVUFBVSxHQUFHLDBCQUFVLElBQUksQ0FBQyxDQUFDO0FBQ25DLE1BQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUM1QixXQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDaEM7O0FBRUQsU0FBTyxVQUFVLENBQUM7Q0FDbkIiLCJmaWxlIjoidXJpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtwYXJzZSwgbm9ybWFsaXplfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUGF0aFVyaSh1cmk6IE51Y2xpZGVVcmkpOiBzdHJpbmcge1xuICBjb25zdCB7aG9zdG5hbWUsIHBhdGh9ID0gcGFyc2UodXJpKTtcbiAgaWYgKGhvc3RuYW1lICE9IG51bGwpIHtcbiAgICAvLyBUT0RPOiBhZHZpbnNreSByZXBsYWNlIHdpdGggcmVtb3RlLXVyaS5ub3JtYWxpemUoKSB3aGVuIHRhc2sgdDEwMDQwMDg0IGlzIGNsb3NlZFxuICAgIHJldHVybiBgbnVjbGlkZTovLyR7aG9zdG5hbWV9JHtub3JtYWxpemVQYXRoKHBhdGgpfWA7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVBhdGgocGF0aCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZHVwZU5vcm1hbGl6ZWRVcmlzKHVyaXM6IEFycmF5PHN0cmluZz4pOiBBcnJheTxzdHJpbmc+IHtcbiAgY29uc3QgZGVkZXBwZWQgPSB1cmlzLnNsaWNlKCk7XG4gIGRlZGVwcGVkLnNvcnQoKTtcblxuICBsZXQgbGFzdE9rSW5kZXggPSAtMTtcblxuICByZXR1cm4gZGVkZXBwZWQuZmlsdGVyKCh1LCBpKSA9PiB7XG4gICAgaWYgKGkgIT09IDAgJiYgdS5zdGFydHNXaXRoKGRlZGVwcGVkW2xhc3RPa0luZGV4XSArICcvJykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsYXN0T2tJbmRleCA9IGk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3BsaXRVcmkodXJpOiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+IHtcbiAgLy8gQ2FuJ3QgdXNlciByZW1vdGUtdXJpLnBhcnNlKCkgaGVyZSwgYXMgdGhlIChub3JtemxpemVkKSBVUkkgbWlnaHQgbm8gbG9uZ2VyIGNvbmZvcm1cbiAgY29uc3Qge2hvc3RuYW1lLCBwYXRofSA9IHVybC5wYXJzZSh1cmkpO1xuICBjb25zdCB0b2tlbnNJblBhdGggPSBwYXRoID8gcGF0aC5zcGxpdCgnLycpIDogW107XG5cbiAgaWYgKGhvc3RuYW1lKSB7XG4gICAgcmV0dXJuIFtob3N0bmFtZSwgJy8nLCAuLi50b2tlbnNJblBhdGhdO1xuICB9XG5cbiAgcmV0dXJuIFsnbG9jYWxob3N0JywgJy8nLCAuLi50b2tlbnNJblBhdGhdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNVcmlCZWxvdyhhbmNlc3RvclVyaTogc3RyaW5nLCBkZXNjZW5kYW50VXJpOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGRlc2NlbmRhbnRVcmkuc3RhcnRzV2l0aChhbmNlc3RvclVyaSkgJiZcbiAgICAoZGVzY2VuZGFudFVyaVthbmNlc3RvclVyaS5sZW5ndGhdID09PSAnLycgIHx8IGFuY2VzdG9yVXJpLmxlbmd0aCA9PT0gZGVzY2VuZGFudFVyaS5sZW5ndGgpO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVQYXRoKHBhdGg/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpbnZhcmlhbnQocGF0aCk7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemUocGF0aCk7XG4gIGlmIChub3JtYWxpemVkLmVuZHNXaXRoKCcvJykpIHtcbiAgICByZXR1cm4gbm9ybWFsaXplZC5zbGljZSgwLCAtMSk7XG4gIH1cblxuICByZXR1cm4gbm9ybWFsaXplZDtcbn1cbiJdfQ==