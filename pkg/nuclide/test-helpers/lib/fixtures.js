

/**
 * When called from a file in a spec/ directory that has a subdirectory named fixtures/, it copies
 * the specified subdirectory of fixtures into a temp directory. The temp directory will be deleted
 * automatically when the current process exits.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory that should be copied.
 * @param dirname The calling function should call `__dirname` as this argument. This should
 *   correspond to the spec/ directory with a fixtures/ subdirectory.
 */

var copyFixture = _asyncToGenerator(function* (fixtureName, dirname) {
  var tempDir = yield (0, _tempdir.mkdir)(fixtureName);

  // Recursively copy the contents of the fixture to the temp directory.
  yield new Promise(function (resolve, reject) {
    var sourceDirectory = _path2['default'].join(dirname, 'fixtures', fixtureName);
    (0, _ncp2['default'])(sourceDirectory, tempDir, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return tempDir;
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ncp = require('ncp');

var _ncp2 = _interopRequireDefault(_ncp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _tempdir = require('./tempdir');

module.exports = {
  copyFixture: copyFixture
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpeHR1cmVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQXdCZSxXQUFXLHFCQUExQixXQUEyQixXQUFtQixFQUFFLE9BQWUsRUFBbUI7QUFDaEYsTUFBTSxPQUFPLEdBQUcsTUFBTSxvQkFBTSxXQUFXLENBQUMsQ0FBQzs7O0FBR3pDLFFBQU0sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3JDLFFBQU0sZUFBZSxHQUFHLGtCQUFLLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ3BFLDBCQUFJLGVBQWUsRUFBRSxPQUFPLEVBQUUsVUFBQyxHQUFHLEVBQWE7QUFDN0MsVUFBSSxHQUFHLEVBQUU7QUFDUCxjQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDYixNQUFNO0FBQ0wsZUFBTyxFQUFFLENBQUM7T0FDWDtLQUNGLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxTQUFPLE9BQU8sQ0FBQztDQUNoQjs7Ozs7Ozs7Ozs7Ozs7bUJBN0JlLEtBQUs7Ozs7b0JBQ0osTUFBTTs7Ozt1QkFDSCxXQUFXOztBQTZCL0IsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGFBQVcsRUFBWCxXQUFXO0NBQ1osQ0FBQyIsImZpbGUiOiJmaXh0dXJlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBuY3AgZnJvbSAnbmNwJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtta2Rpcn0gZnJvbSAnLi90ZW1wZGlyJztcblxuLyoqXG4gKiBXaGVuIGNhbGxlZCBmcm9tIGEgZmlsZSBpbiBhIHNwZWMvIGRpcmVjdG9yeSB0aGF0IGhhcyBhIHN1YmRpcmVjdG9yeSBuYW1lZCBmaXh0dXJlcy8sIGl0IGNvcGllc1xuICogdGhlIHNwZWNpZmllZCBzdWJkaXJlY3Rvcnkgb2YgZml4dHVyZXMgaW50byBhIHRlbXAgZGlyZWN0b3J5LiBUaGUgdGVtcCBkaXJlY3Rvcnkgd2lsbCBiZSBkZWxldGVkXG4gKiBhdXRvbWF0aWNhbGx5IHdoZW4gdGhlIGN1cnJlbnQgcHJvY2VzcyBleGl0cy5cbiAqXG4gKiBAcGFyYW0gZml4dHVyZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHN1YmRpcmVjdG9yeSBvZiB0aGUgZml4dHVyZXMvIGRpcmVjdG9yeSB0aGF0IHNob3VsZCBiZSBjb3BpZWQuXG4gKiBAcGFyYW0gZGlybmFtZSBUaGUgY2FsbGluZyBmdW5jdGlvbiBzaG91bGQgY2FsbCBgX19kaXJuYW1lYCBhcyB0aGlzIGFyZ3VtZW50LiBUaGlzIHNob3VsZFxuICogICBjb3JyZXNwb25kIHRvIHRoZSBzcGVjLyBkaXJlY3Rvcnkgd2l0aCBhIGZpeHR1cmVzLyBzdWJkaXJlY3RvcnkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNvcHlGaXh0dXJlKGZpeHR1cmVOYW1lOiBzdHJpbmcsIGRpcm5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHRlbXBEaXIgPSBhd2FpdCBta2RpcihmaXh0dXJlTmFtZSk7XG5cbiAgLy8gUmVjdXJzaXZlbHkgY29weSB0aGUgY29udGVudHMgb2YgdGhlIGZpeHR1cmUgdG8gdGhlIHRlbXAgZGlyZWN0b3J5LlxuICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc291cmNlRGlyZWN0b3J5ID0gcGF0aC5qb2luKGRpcm5hbWUsICdmaXh0dXJlcycsIGZpeHR1cmVOYW1lKTtcbiAgICBuY3Aoc291cmNlRGlyZWN0b3J5LCB0ZW1wRGlyLCAoZXJyOiA/RXJyb3IpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiB0ZW1wRGlyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29weUZpeHR1cmUsXG59O1xuIl19