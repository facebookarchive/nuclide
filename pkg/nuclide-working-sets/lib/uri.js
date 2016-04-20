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

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

function normalizePathUri(uri) {
  var _parse = (0, _nuclideRemoteUri.parse)(uri);

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
  var normalized = (0, _nuclideRemoteUri.normalize)(path);
  if (normalized.endsWith('/')) {
    return normalized.slice(0, -1);
  }

  return normalized;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVyaS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFXZ0IsS0FBSzs7OztzQkFDQyxRQUFROzs7O2dDQUNDLDBCQUEwQjs7QUFJbEQsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFlLEVBQVU7ZUFDL0IsNkJBQU0sR0FBRyxDQUFDOztNQUE1QixRQUFRLFVBQVIsUUFBUTtNQUFFLElBQUksVUFBSixJQUFJOztBQUNyQixNQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7O0FBRXBCLDBCQUFvQixRQUFRLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFHO0dBQ3RELE1BQU07QUFDTCxXQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM1QjtDQUNGOztBQUVNLFNBQVMsb0JBQW9CLENBQUMsSUFBbUIsRUFBaUI7QUFDdkUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzlCLFVBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFaEIsTUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRXJCLFNBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDL0IsUUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFO0FBQ3hELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7O0FBRUQsZUFBVyxHQUFHLENBQUMsQ0FBQztBQUNoQixXQUFPLElBQUksQ0FBQztHQUNiLENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsUUFBUSxDQUFDLEdBQVcsRUFBaUI7OzttQkFFMUIsaUJBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQzs7TUFBaEMsUUFBUSxjQUFSLFFBQVE7TUFBRSxJQUFJLGNBQUosSUFBSTs7QUFDckIsTUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUVqRCxNQUFJLFFBQVEsRUFBRTtBQUNaLFlBQVEsUUFBUSxFQUFFLEdBQUcsNEJBQUssWUFBWSxHQUFFO0dBQ3pDOztBQUVELFVBQVEsV0FBVyxFQUFFLEdBQUcsNEJBQUssWUFBWSxHQUFFO0NBQzVDOztBQUVNLFNBQVMsVUFBVSxDQUFDLFdBQW1CLEVBQUUsYUFBcUIsRUFBVztBQUM5RSxTQUFPLGFBQWEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEtBQ3pDLGFBQWEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFLLFdBQVcsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLE1BQU0sQ0FBQSxBQUFDLENBQUM7Q0FDL0Y7O0FBRUQsU0FBUyxhQUFhLENBQUMsSUFBYSxFQUFVO0FBQzVDLDJCQUFVLElBQUksQ0FBQyxDQUFDO0FBQ2hCLE1BQU0sVUFBVSxHQUFHLGlDQUFVLElBQUksQ0FBQyxDQUFDO0FBQ25DLE1BQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUM1QixXQUFPLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDaEM7O0FBRUQsU0FBTyxVQUFVLENBQUM7Q0FDbkIiLCJmaWxlIjoidXJpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtwYXJzZSwgbm9ybWFsaXplfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVBhdGhVcmkodXJpOiBOdWNsaWRlVXJpKTogc3RyaW5nIHtcbiAgY29uc3Qge2hvc3RuYW1lLCBwYXRofSA9IHBhcnNlKHVyaSk7XG4gIGlmIChob3N0bmFtZSAhPSBudWxsKSB7XG4gICAgLy8gVE9ETzogYWR2aW5za3kgcmVwbGFjZSB3aXRoIHJlbW90ZS11cmkubm9ybWFsaXplKCkgd2hlbiB0YXNrIHQxMDA0MDA4NCBpcyBjbG9zZWRcbiAgICByZXR1cm4gYG51Y2xpZGU6Ly8ke2hvc3RuYW1lfSR7bm9ybWFsaXplUGF0aChwYXRoKX1gO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBub3JtYWxpemVQYXRoKHBhdGgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWR1cGVOb3JtYWxpemVkVXJpcyh1cmlzOiBBcnJheTxzdHJpbmc+KTogQXJyYXk8c3RyaW5nPiB7XG4gIGNvbnN0IGRlZGVwcGVkID0gdXJpcy5zbGljZSgpO1xuICBkZWRlcHBlZC5zb3J0KCk7XG5cbiAgbGV0IGxhc3RPa0luZGV4ID0gLTE7XG5cbiAgcmV0dXJuIGRlZGVwcGVkLmZpbHRlcigodSwgaSkgPT4ge1xuICAgIGlmIChpICE9PSAwICYmIHUuc3RhcnRzV2l0aChkZWRlcHBlZFtsYXN0T2tJbmRleF0gKyAnLycpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGFzdE9rSW5kZXggPSBpO1xuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0VXJpKHVyaTogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiB7XG4gIC8vIENhbid0IHVzZXIgcmVtb3RlLXVyaS5wYXJzZSgpIGhlcmUsIGFzIHRoZSAobm9ybXpsaXplZCkgVVJJIG1pZ2h0IG5vIGxvbmdlciBjb25mb3JtXG4gIGNvbnN0IHtob3N0bmFtZSwgcGF0aH0gPSB1cmwucGFyc2UodXJpKTtcbiAgY29uc3QgdG9rZW5zSW5QYXRoID0gcGF0aCA/IHBhdGguc3BsaXQoJy8nKSA6IFtdO1xuXG4gIGlmIChob3N0bmFtZSkge1xuICAgIHJldHVybiBbaG9zdG5hbWUsICcvJywgLi4udG9rZW5zSW5QYXRoXTtcbiAgfVxuXG4gIHJldHVybiBbJ2xvY2FsaG9zdCcsICcvJywgLi4udG9rZW5zSW5QYXRoXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVXJpQmVsb3coYW5jZXN0b3JVcmk6IHN0cmluZywgZGVzY2VuZGFudFVyaTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBkZXNjZW5kYW50VXJpLnN0YXJ0c1dpdGgoYW5jZXN0b3JVcmkpICYmXG4gICAgKGRlc2NlbmRhbnRVcmlbYW5jZXN0b3JVcmkubGVuZ3RoXSA9PT0gJy8nICB8fCBhbmNlc3RvclVyaS5sZW5ndGggPT09IGRlc2NlbmRhbnRVcmkubGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplUGF0aChwYXRoPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgaW52YXJpYW50KHBhdGgpO1xuICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplKHBhdGgpO1xuICBpZiAobm9ybWFsaXplZC5lbmRzV2l0aCgnLycpKSB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWQuc2xpY2UoMCwgLTEpO1xuICB9XG5cbiAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG59XG4iXX0=