Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isRunningInTest = isRunningInTest;
exports.isRunningInClient = isRunningInClient;
exports.getAtomNuclideDir = getAtomNuclideDir;
exports.getAtomVersion = getAtomVersion;
exports.getNuclideVersion = getNuclideVersion;
exports.getNuclideRealDir = getNuclideRealDir;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _once = require('./once');

var _once2 = _interopRequireDefault(_once);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var NUCLIDE_PACKAGE_JSON_PATH = require.resolve('../../../../package.json');
var NUCLIDE_BASEDIR = _path2['default'].dirname(NUCLIDE_PACKAGE_JSON_PATH);

var pkgJson = JSON.parse(_fs2['default'].readFileSync(NUCLIDE_PACKAGE_JSON_PATH));

// "Development" is defined as working from source - not packaged code.
// apm/npm and internal releases don't package the base `.flowconfig`, so
// we use this to figure if we're packaged or not.
var isDevelopment = (0, _once2['default'])(function () {
  try {
    _fs2['default'].statSync(_path2['default'].join(NUCLIDE_BASEDIR, '.flowconfig'));
    return true;
  } catch (err) {
    return false;
  }
});

exports.isDevelopment = isDevelopment;

function isRunningInTest() {
  if (isRunningInClient()) {
    return atom.inSpecMode();
  } else {
    return process.env.NODE_ENV === 'test';
  }
}

function isRunningInClient() {
  return typeof atom !== 'undefined';
}

// This path may be a symlink.

function getAtomNuclideDir() {
  if (!isRunningInClient()) {
    throw Error('Not running in Atom.');
  }
  var nuclidePackageModule = atom.packages.getLoadedPackage('nuclide');
  (0, _assert2['default'])(nuclidePackageModule);
  return nuclidePackageModule.path;
}

function getAtomVersion() {
  if (!isRunningInClient()) {
    throw Error('Not running in Atom.');
  }
  return atom.getVersion();
}

function getNuclideVersion() {
  return pkgJson.version;
}

function getNuclideRealDir() {
  return NUCLIDE_BASEDIR;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsaWVudEluZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBV2UsSUFBSTs7OztzQkFDRyxRQUFROzs7O29CQUNiLFFBQVE7Ozs7b0JBQ1IsTUFBTTs7OztBQUV2QixJQUFNLHlCQUF5QixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUM5RSxJQUFNLGVBQWUsR0FBRyxrQkFBSyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQzs7QUFFaEUsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBRyxZQUFZLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDOzs7OztBQUtoRSxJQUFNLGFBQWEsR0FBRyx1QkFBSyxZQUFvQjtBQUNwRCxNQUFJO0FBQ0Ysb0JBQUcsUUFBUSxDQUFDLGtCQUFLLElBQUksQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUN2RCxXQUFPLElBQUksQ0FBQztHQUNiLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixXQUFPLEtBQUssQ0FBQztHQUNkO0NBQ0YsQ0FBQyxDQUFDOzs7O0FBRUksU0FBUyxlQUFlLEdBQVk7QUFDekMsTUFBSSxpQkFBaUIsRUFBRSxFQUFFO0FBQ3ZCLFdBQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0dBQzFCLE1BQU07QUFDTCxXQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLE1BQU0sQ0FBQztHQUN4QztDQUNGOztBQUVNLFNBQVMsaUJBQWlCLEdBQVk7QUFDM0MsU0FBTyxPQUFPLElBQUksS0FBSyxXQUFXLENBQUM7Q0FDcEM7Ozs7QUFHTSxTQUFTLGlCQUFpQixHQUFXO0FBQzFDLE1BQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO0FBQ3hCLFVBQU0sS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7R0FDckM7QUFDRCxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdkUsMkJBQVUsb0JBQW9CLENBQUMsQ0FBQztBQUNoQyxTQUFPLG9CQUFvQixDQUFDLElBQUksQ0FBQztDQUNsQzs7QUFFTSxTQUFTLGNBQWMsR0FBVztBQUN2QyxNQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtBQUN4QixVQUFNLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0dBQ3JDO0FBQ0QsU0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Q0FDMUI7O0FBRU0sU0FBUyxpQkFBaUIsR0FBVztBQUMxQyxTQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7Q0FDeEI7O0FBRU0sU0FBUyxpQkFBaUIsR0FBVztBQUMxQyxTQUFPLGVBQWUsQ0FBQztDQUN4QiIsImZpbGUiOiJjbGllbnRJbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBvbmNlIGZyb20gJy4vb25jZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgTlVDTElERV9QQUNLQUdFX0pTT05fUEFUSCA9IHJlcXVpcmUucmVzb2x2ZSgnLi4vLi4vLi4vLi4vcGFja2FnZS5qc29uJyk7XG5jb25zdCBOVUNMSURFX0JBU0VESVIgPSBwYXRoLmRpcm5hbWUoTlVDTElERV9QQUNLQUdFX0pTT05fUEFUSCk7XG5cbmNvbnN0IHBrZ0pzb24gPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhOVUNMSURFX1BBQ0tBR0VfSlNPTl9QQVRIKSk7XG5cbi8vIFwiRGV2ZWxvcG1lbnRcIiBpcyBkZWZpbmVkIGFzIHdvcmtpbmcgZnJvbSBzb3VyY2UgLSBub3QgcGFja2FnZWQgY29kZS5cbi8vIGFwbS9ucG0gYW5kIGludGVybmFsIHJlbGVhc2VzIGRvbid0IHBhY2thZ2UgdGhlIGJhc2UgYC5mbG93Y29uZmlnYCwgc29cbi8vIHdlIHVzZSB0aGlzIHRvIGZpZ3VyZSBpZiB3ZSdyZSBwYWNrYWdlZCBvciBub3QuXG5leHBvcnQgY29uc3QgaXNEZXZlbG9wbWVudCA9IG9uY2UoZnVuY3Rpb24oKTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgZnMuc3RhdFN5bmMocGF0aC5qb2luKE5VQ0xJREVfQkFTRURJUiwgJy5mbG93Y29uZmlnJykpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn0pO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNSdW5uaW5nSW5UZXN0KCk6IGJvb2xlYW4ge1xuICBpZiAoaXNSdW5uaW5nSW5DbGllbnQoKSkge1xuICAgIHJldHVybiBhdG9tLmluU3BlY01vZGUoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICd0ZXN0JztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSdW5uaW5nSW5DbGllbnQoKTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgYXRvbSAhPT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8vIFRoaXMgcGF0aCBtYXkgYmUgYSBzeW1saW5rLlxuZXhwb3J0IGZ1bmN0aW9uIGdldEF0b21OdWNsaWRlRGlyKCk6IHN0cmluZyB7XG4gIGlmICghaXNSdW5uaW5nSW5DbGllbnQoKSkge1xuICAgIHRocm93IEVycm9yKCdOb3QgcnVubmluZyBpbiBBdG9tLicpO1xuICB9XG4gIGNvbnN0IG51Y2xpZGVQYWNrYWdlTW9kdWxlID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCdudWNsaWRlJyk7XG4gIGludmFyaWFudChudWNsaWRlUGFja2FnZU1vZHVsZSk7XG4gIHJldHVybiBudWNsaWRlUGFja2FnZU1vZHVsZS5wYXRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXRvbVZlcnNpb24oKTogc3RyaW5nIHtcbiAgaWYgKCFpc1J1bm5pbmdJbkNsaWVudCgpKSB7XG4gICAgdGhyb3cgRXJyb3IoJ05vdCBydW5uaW5nIGluIEF0b20uJyk7XG4gIH1cbiAgcmV0dXJuIGF0b20uZ2V0VmVyc2lvbigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TnVjbGlkZVZlcnNpb24oKTogc3RyaW5nIHtcbiAgcmV0dXJuIHBrZ0pzb24udmVyc2lvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE51Y2xpZGVSZWFsRGlyKCk6IHN0cmluZyB7XG4gIHJldHVybiBOVUNMSURFX0JBU0VESVI7XG59XG4iXX0=