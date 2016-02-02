Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.startNuclideServer = startNuclideServer;

/**
 * Add a remote project to nuclide.  This function bypasses the SSH authentication that the
 * server normally uses.  `projectPath` is a path to a local directory.  This function assumes
 * that the nuclide server has been started in insecure mode, e.g. with using the
 * integration-test-helpers.startNuclideServer function.
 */

var addRemoteProject = _asyncToGenerator(function* (projectPath) {
  return yield _remoteConnection.RemoteConnection._createInsecureConnectionForTesting(projectPath, DEFAULT_PORT);
}

/**
 * Kills the nuclide server associated with `connection`, and closes the connection.
 */
);

exports.addRemoteProject = addRemoteProject;

var stopNuclideServer = _asyncToGenerator(function* (connection) {
  yield connection.getService('InfoService').shutdownServer();
  connection.close();
});

exports.stopNuclideServer = stopNuclideServer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _remoteConnection = require('../../remote-connection');

var _child_process = require('child_process');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var DEFAULT_PORT = 9090;

/**
 * Starts a local version of the nuclide server in insecure mode on the specified port.
 * The server is started in a separate process than the caller's.
 */

function startNuclideServer() {
  (0, _child_process.spawnSync)(_path2['default'].join(__dirname, '../../server/nuclide-start-server'), ['-k', '--port=' + DEFAULT_PORT]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbW90ZS11dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFrQ3NCLGdCQUFnQixxQkFBL0IsV0FBZ0MsV0FBbUIsRUFBOEI7QUFDdEYsU0FBTyxNQUFNLG1DQUFpQixtQ0FBbUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Q0FDOUY7Ozs7Ozs7OztJQUtxQixpQkFBaUIscUJBQWhDLFdBQWlDLFVBQTRCLEVBQWlCO0FBQ25GLFFBQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM1RCxZQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDcEI7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBakM4Qix5QkFBeUI7OzZCQUNoQyxlQUFlOztvQkFDdEIsTUFBTTs7OztBQUV2QixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUM7Ozs7Ozs7QUFNbkIsU0FBUyxrQkFBa0IsR0FBUztBQUN6QyxnQ0FDRSxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLG1DQUFtQyxDQUFDLEVBQ3pELENBQUMsSUFBSSxjQUFZLFlBQVksQ0FBRyxDQUNqQyxDQUFDO0NBQ0giLCJmaWxlIjoicmVtb3RlLXV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZW1vdGVDb25uZWN0aW9ufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge3NwYXduU3luY30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgREVGQVVMVF9QT1JUID0gOTA5MDtcblxuLyoqXG4gKiBTdGFydHMgYSBsb2NhbCB2ZXJzaW9uIG9mIHRoZSBudWNsaWRlIHNlcnZlciBpbiBpbnNlY3VyZSBtb2RlIG9uIHRoZSBzcGVjaWZpZWQgcG9ydC5cbiAqIFRoZSBzZXJ2ZXIgaXMgc3RhcnRlZCBpbiBhIHNlcGFyYXRlIHByb2Nlc3MgdGhhbiB0aGUgY2FsbGVyJ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFydE51Y2xpZGVTZXJ2ZXIoKTogdm9pZCB7XG4gIHNwYXduU3luYyhcbiAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vc2VydmVyL251Y2xpZGUtc3RhcnQtc2VydmVyJyksXG4gICAgWyctaycsIGAtLXBvcnQ9JHtERUZBVUxUX1BPUlR9YF0sXG4gICk7XG59XG5cbi8qKlxuICogQWRkIGEgcmVtb3RlIHByb2plY3QgdG8gbnVjbGlkZS4gIFRoaXMgZnVuY3Rpb24gYnlwYXNzZXMgdGhlIFNTSCBhdXRoZW50aWNhdGlvbiB0aGF0IHRoZVxuICogc2VydmVyIG5vcm1hbGx5IHVzZXMuICBgcHJvamVjdFBhdGhgIGlzIGEgcGF0aCB0byBhIGxvY2FsIGRpcmVjdG9yeS4gIFRoaXMgZnVuY3Rpb24gYXNzdW1lc1xuICogdGhhdCB0aGUgbnVjbGlkZSBzZXJ2ZXIgaGFzIGJlZW4gc3RhcnRlZCBpbiBpbnNlY3VyZSBtb2RlLCBlLmcuIHdpdGggdXNpbmcgdGhlXG4gKiBpbnRlZ3JhdGlvbi10ZXN0LWhlbHBlcnMuc3RhcnROdWNsaWRlU2VydmVyIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkUmVtb3RlUHJvamVjdChwcm9qZWN0UGF0aDogc3RyaW5nKTogUHJvbWlzZTw/UmVtb3RlQ29ubmVjdGlvbj4ge1xuICByZXR1cm4gYXdhaXQgUmVtb3RlQ29ubmVjdGlvbi5fY3JlYXRlSW5zZWN1cmVDb25uZWN0aW9uRm9yVGVzdGluZyhwcm9qZWN0UGF0aCwgREVGQVVMVF9QT1JUKTtcbn1cblxuLyoqXG4gKiBLaWxscyB0aGUgbnVjbGlkZSBzZXJ2ZXIgYXNzb2NpYXRlZCB3aXRoIGBjb25uZWN0aW9uYCwgYW5kIGNsb3NlcyB0aGUgY29ubmVjdGlvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0b3BOdWNsaWRlU2VydmVyKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgYXdhaXQgY29ubmVjdGlvbi5nZXRTZXJ2aWNlKCdJbmZvU2VydmljZScpLnNodXRkb3duU2VydmVyKCk7XG4gIGNvbm5lY3Rpb24uY2xvc2UoKTtcbn1cbiJdfQ==