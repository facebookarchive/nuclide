Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isRunningInTest = isRunningInTest;
exports.isRunningInClient = isRunningInClient;
exports.getAtomVersion = getAtomVersion;
exports.getNuclideVersion = getNuclideVersion;
exports.getNuclideDir = getNuclideDir;

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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _once = require('./once');

var _once2 = _interopRequireDefault(_once);

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

function getAtomVersion() {
  if (!isRunningInClient()) {
    throw Error('Not running in Atom.');
  }
  return atom.getVersion();
}

function getNuclideVersion() {
  return pkgJson.version;
}

function getNuclideDir() {
  return NUCLIDE_BASEDIR;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsaWVudEluZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkFXZSxJQUFJOzs7O29CQUNGLE1BQU07Ozs7b0JBQ04sUUFBUTs7OztBQUV6QixJQUFNLHlCQUF5QixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUM5RSxJQUFNLGVBQWUsR0FBRyxrQkFBSyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQzs7QUFFaEUsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBRyxZQUFZLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDOzs7OztBQUtoRSxJQUFNLGFBQWEsR0FBRyx1QkFBSyxZQUFvQjtBQUNwRCxNQUFJO0FBQ0Ysb0JBQUcsUUFBUSxDQUFDLGtCQUFLLElBQUksQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUN2RCxXQUFPLElBQUksQ0FBQztHQUNiLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixXQUFPLEtBQUssQ0FBQztHQUNkO0NBQ0YsQ0FBQyxDQUFDOzs7O0FBRUksU0FBUyxlQUFlLEdBQVk7QUFDekMsTUFBSSxpQkFBaUIsRUFBRSxFQUFFO0FBQ3ZCLFdBQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0dBQzFCLE1BQU07QUFDTCxXQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLE1BQU0sQ0FBQztHQUN4QztDQUNGOztBQUVNLFNBQVMsaUJBQWlCLEdBQVk7QUFDM0MsU0FBTyxPQUFPLElBQUksS0FBSyxXQUFXLENBQUM7Q0FDcEM7O0FBRU0sU0FBUyxjQUFjLEdBQVc7QUFDdkMsTUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7QUFDeEIsVUFBTSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztHQUNyQztBQUNELFNBQU8sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0NBQzFCOztBQUVNLFNBQVMsaUJBQWlCLEdBQVc7QUFDMUMsU0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDO0NBQ3hCOztBQUVNLFNBQVMsYUFBYSxHQUFXO0FBQ3RDLFNBQU8sZUFBZSxDQUFDO0NBQ3hCIiwiZmlsZSI6ImNsaWVudEluZm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgb25jZSBmcm9tICcuL29uY2UnO1xuXG5jb25zdCBOVUNMSURFX1BBQ0tBR0VfSlNPTl9QQVRIID0gcmVxdWlyZS5yZXNvbHZlKCcuLi8uLi8uLi8uLi9wYWNrYWdlLmpzb24nKTtcbmNvbnN0IE5VQ0xJREVfQkFTRURJUiA9IHBhdGguZGlybmFtZShOVUNMSURFX1BBQ0tBR0VfSlNPTl9QQVRIKTtcblxuY29uc3QgcGtnSnNvbiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKE5VQ0xJREVfUEFDS0FHRV9KU09OX1BBVEgpKTtcblxuLy8gXCJEZXZlbG9wbWVudFwiIGlzIGRlZmluZWQgYXMgd29ya2luZyBmcm9tIHNvdXJjZSAtIG5vdCBwYWNrYWdlZCBjb2RlLlxuLy8gYXBtL25wbSBhbmQgaW50ZXJuYWwgcmVsZWFzZXMgZG9uJ3QgcGFja2FnZSB0aGUgYmFzZSBgLmZsb3djb25maWdgLCBzb1xuLy8gd2UgdXNlIHRoaXMgdG8gZmlndXJlIGlmIHdlJ3JlIHBhY2thZ2VkIG9yIG5vdC5cbmV4cG9ydCBjb25zdCBpc0RldmVsb3BtZW50ID0gb25jZShmdW5jdGlvbigpOiBib29sZWFuIHtcbiAgdHJ5IHtcbiAgICBmcy5zdGF0U3luYyhwYXRoLmpvaW4oTlVDTElERV9CQVNFRElSLCAnLmZsb3djb25maWcnKSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1J1bm5pbmdJblRlc3QoKTogYm9vbGVhbiB7XG4gIGlmIChpc1J1bm5pbmdJbkNsaWVudCgpKSB7XG4gICAgcmV0dXJuIGF0b20uaW5TcGVjTW9kZSgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Rlc3QnO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1J1bm5pbmdJbkNsaWVudCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBhdG9tICE9PSAndW5kZWZpbmVkJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEF0b21WZXJzaW9uKCk6IHN0cmluZyB7XG4gIGlmICghaXNSdW5uaW5nSW5DbGllbnQoKSkge1xuICAgIHRocm93IEVycm9yKCdOb3QgcnVubmluZyBpbiBBdG9tLicpO1xuICB9XG4gIHJldHVybiBhdG9tLmdldFZlcnNpb24oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE51Y2xpZGVWZXJzaW9uKCk6IHN0cmluZyB7XG4gIHJldHVybiBwa2dKc29uLnZlcnNpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROdWNsaWRlRGlyKCk6IHN0cmluZyB7XG4gIHJldHVybiBOVUNMSURFX0JBU0VESVI7XG59XG4iXX0=