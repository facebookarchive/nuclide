

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
    _fsExtra2['default'].copy(sourceDirectory, tempDir, function (err) {
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

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _tempdir = require('./tempdir');

module.exports = {
  copyFixture: copyFixture
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpeHR1cmVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQXdCZSxXQUFXLHFCQUExQixXQUEyQixXQUFtQixFQUFFLE9BQWUsRUFBbUI7QUFDaEYsTUFBTSxPQUFPLEdBQUcsTUFBTSxvQkFBTSxXQUFXLENBQUMsQ0FBQzs7O0FBR3pDLFFBQU0sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3JDLFFBQU0sZUFBZSxHQUFHLGtCQUFLLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ3BFLHlCQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsT0FBTyxFQUFFLFVBQUMsR0FBRyxFQUFhO0FBQ2xELFVBQUksR0FBRyxFQUFFO0FBQ1AsY0FBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ2IsTUFBTTtBQUNMLGVBQU8sRUFBRSxDQUFDO09BQ1g7S0FDRixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsU0FBTyxPQUFPLENBQUM7Q0FDaEI7Ozs7Ozs7Ozs7Ozs7O3VCQTdCZSxVQUFVOzs7O29CQUNULE1BQU07Ozs7dUJBQ0gsV0FBVzs7QUE2Qi9CLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixhQUFXLEVBQVgsV0FBVztDQUNaLENBQUMiLCJmaWxlIjoiZml4dHVyZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZnNlIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtta2Rpcn0gZnJvbSAnLi90ZW1wZGlyJztcblxuLyoqXG4gKiBXaGVuIGNhbGxlZCBmcm9tIGEgZmlsZSBpbiBhIHNwZWMvIGRpcmVjdG9yeSB0aGF0IGhhcyBhIHN1YmRpcmVjdG9yeSBuYW1lZCBmaXh0dXJlcy8sIGl0IGNvcGllc1xuICogdGhlIHNwZWNpZmllZCBzdWJkaXJlY3Rvcnkgb2YgZml4dHVyZXMgaW50byBhIHRlbXAgZGlyZWN0b3J5LiBUaGUgdGVtcCBkaXJlY3Rvcnkgd2lsbCBiZSBkZWxldGVkXG4gKiBhdXRvbWF0aWNhbGx5IHdoZW4gdGhlIGN1cnJlbnQgcHJvY2VzcyBleGl0cy5cbiAqXG4gKiBAcGFyYW0gZml4dHVyZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHN1YmRpcmVjdG9yeSBvZiB0aGUgZml4dHVyZXMvIGRpcmVjdG9yeSB0aGF0IHNob3VsZCBiZSBjb3BpZWQuXG4gKiBAcGFyYW0gZGlybmFtZSBUaGUgY2FsbGluZyBmdW5jdGlvbiBzaG91bGQgY2FsbCBgX19kaXJuYW1lYCBhcyB0aGlzIGFyZ3VtZW50LiBUaGlzIHNob3VsZFxuICogICBjb3JyZXNwb25kIHRvIHRoZSBzcGVjLyBkaXJlY3Rvcnkgd2l0aCBhIGZpeHR1cmVzLyBzdWJkaXJlY3RvcnkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNvcHlGaXh0dXJlKGZpeHR1cmVOYW1lOiBzdHJpbmcsIGRpcm5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHRlbXBEaXIgPSBhd2FpdCBta2RpcihmaXh0dXJlTmFtZSk7XG5cbiAgLy8gUmVjdXJzaXZlbHkgY29weSB0aGUgY29udGVudHMgb2YgdGhlIGZpeHR1cmUgdG8gdGhlIHRlbXAgZGlyZWN0b3J5LlxuICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc291cmNlRGlyZWN0b3J5ID0gcGF0aC5qb2luKGRpcm5hbWUsICdmaXh0dXJlcycsIGZpeHR1cmVOYW1lKTtcbiAgICBmc2UuY29weShzb3VyY2VEaXJlY3RvcnksIHRlbXBEaXIsIChlcnI6ID9FcnJvcikgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRlbXBEaXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjb3B5Rml4dHVyZSxcbn07XG4iXX0=