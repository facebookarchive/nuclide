Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.mkdir = mkdir;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

// Automatically track and cleanup files at exit.
var tempWithAutoCleanup = _temp2['default'].track();

/**
 * Creates a temporary directory with the given name.
 */

function mkdir(dirname) {
  return new Promise(function (resolve, reject) {
    tempWithAutoCleanup.mkdir(dirname, function (err, dirPath) {
      if (err) {
        reject(err);
      } else {
        resolve(dirPath);
      }
    });
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBkaXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O29CQVdpQixNQUFNOzs7OztBQUd2QixJQUFNLG1CQUFtQixHQUFHLGtCQUFLLEtBQUssRUFBRSxDQUFDOzs7Ozs7QUFLbEMsU0FBUyxLQUFLLENBQUMsT0FBZSxFQUFtQjtBQUN0RCxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0Qyx1QkFBbUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQUMsR0FBRyxFQUFVLE9BQU8sRUFBSztBQUM1RCxVQUFJLEdBQUcsRUFBRTtBQUNQLGNBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNiLE1BQU07QUFDTCxlQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDbEI7S0FDRCxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJ0ZW1wZGlyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHRlbXAgZnJvbSAndGVtcCc7XG5cbi8vIEF1dG9tYXRpY2FsbHkgdHJhY2sgYW5kIGNsZWFudXAgZmlsZXMgYXQgZXhpdC5cbmNvbnN0IHRlbXBXaXRoQXV0b0NsZWFudXAgPSB0ZW1wLnRyYWNrKCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHRlbXBvcmFyeSBkaXJlY3Rvcnkgd2l0aCB0aGUgZ2l2ZW4gbmFtZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1rZGlyKGRpcm5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdGVtcFdpdGhBdXRvQ2xlYW51cC5ta2RpcihkaXJuYW1lLCAoZXJyOiA/RXJyb3IsIGRpclBhdGgpID0+IHtcbiAgICAgaWYgKGVycikge1xuICAgICAgIHJlamVjdChlcnIpO1xuICAgICB9IGVsc2Uge1xuICAgICAgIHJlc29sdmUoZGlyUGF0aCk7XG4gICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG4iXX0=