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
  return yield _nuclideRemoteConnection.RemoteConnection._createInsecureConnectionForTesting(projectPath, DEFAULT_PORT);
}

/**
 * Kills the nuclide server associated with `connection`, and closes the connection.
 */
);

exports.addRemoteProject = addRemoteProject;

var stopNuclideServer = _asyncToGenerator(function* (connection) {
  var service = (0, _nuclideClient.getServiceByNuclideUri)('FlowService', connection.getUriForInitialWorkingDirectory());
  (0, _assert2['default'])(service);
  service.dispose();
  // If this ever fires, either ensure that your test closes all RemoteConnections
  // or we can add a force shutdown method to ServerConnection.
  (0, _assert2['default'])(connection.isOnlyConnection());
  var attemptShutdown = true;
  connection.close(attemptShutdown);
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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _nuclideClient = require('../../nuclide-client');

var _child_process = require('child_process');

var DEFAULT_PORT = 9090;

/**
 * Starts a local version of the nuclide server in insecure mode on the specified port.
 * The server is started in a separate process than the caller's.
 */

function startNuclideServer() {
  (0, _child_process.spawnSync)(require.resolve('../../nuclide-server/nuclide-start-server'), ['-k', '--port=' + DEFAULT_PORT]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbW90ZS11dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFtQ3NCLGdCQUFnQixxQkFBL0IsV0FBZ0MsV0FBbUIsRUFBOEI7QUFDdEYsU0FBTyxNQUFNLDBDQUFpQixtQ0FBbUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Q0FDOUY7Ozs7Ozs7OztJQUtxQixpQkFBaUIscUJBQWhDLFdBQWlDLFVBQTRCLEVBQWlCO0FBQ25GLE1BQU0sT0FBTyxHQUNYLDJDQUF1QixhQUFhLEVBQUUsVUFBVSxDQUFDLGdDQUFnQyxFQUFFLENBQUMsQ0FBQztBQUN2RiwyQkFBVSxPQUFPLENBQUMsQ0FBQztBQUNuQixTQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7OztBQUdsQiwyQkFBVSxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQztBQUM3QixZQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0NBQ25DOzs7Ozs7Ozs7Ozs7Ozs7O3NCQXpDcUIsUUFBUTs7Ozt1Q0FDQyxpQ0FBaUM7OzZCQUMzQixzQkFBc0I7OzZCQUNuQyxlQUFlOztBQUV2QyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUM7Ozs7Ozs7QUFNbkIsU0FBUyxrQkFBa0IsR0FBUztBQUN6QyxnQ0FDRSxPQUFPLENBQUMsT0FBTyxDQUFDLDJDQUEyQyxDQUFDLEVBQzVELENBQUMsSUFBSSxjQUFZLFlBQVksQ0FBRyxDQUNqQyxDQUFDO0NBQ0giLCJmaWxlIjoicmVtb3RlLXV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtSZW1vdGVDb25uZWN0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jbGllbnQnO1xuaW1wb3J0IHtzcGF3blN5bmN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5jb25zdCBERUZBVUxUX1BPUlQgPSA5MDkwO1xuXG4vKipcbiAqIFN0YXJ0cyBhIGxvY2FsIHZlcnNpb24gb2YgdGhlIG51Y2xpZGUgc2VydmVyIGluIGluc2VjdXJlIG1vZGUgb24gdGhlIHNwZWNpZmllZCBwb3J0LlxuICogVGhlIHNlcnZlciBpcyBzdGFydGVkIGluIGEgc2VwYXJhdGUgcHJvY2VzcyB0aGFuIHRoZSBjYWxsZXIncy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0TnVjbGlkZVNlcnZlcigpOiB2b2lkIHtcbiAgc3Bhd25TeW5jKFxuICAgIHJlcXVpcmUucmVzb2x2ZSgnLi4vLi4vbnVjbGlkZS1zZXJ2ZXIvbnVjbGlkZS1zdGFydC1zZXJ2ZXInKSxcbiAgICBbJy1rJywgYC0tcG9ydD0ke0RFRkFVTFRfUE9SVH1gXSxcbiAgKTtcbn1cblxuLyoqXG4gKiBBZGQgYSByZW1vdGUgcHJvamVjdCB0byBudWNsaWRlLiAgVGhpcyBmdW5jdGlvbiBieXBhc3NlcyB0aGUgU1NIIGF1dGhlbnRpY2F0aW9uIHRoYXQgdGhlXG4gKiBzZXJ2ZXIgbm9ybWFsbHkgdXNlcy4gIGBwcm9qZWN0UGF0aGAgaXMgYSBwYXRoIHRvIGEgbG9jYWwgZGlyZWN0b3J5LiAgVGhpcyBmdW5jdGlvbiBhc3N1bWVzXG4gKiB0aGF0IHRoZSBudWNsaWRlIHNlcnZlciBoYXMgYmVlbiBzdGFydGVkIGluIGluc2VjdXJlIG1vZGUsIGUuZy4gd2l0aCB1c2luZyB0aGVcbiAqIGludGVncmF0aW9uLXRlc3QtaGVscGVycy5zdGFydE51Y2xpZGVTZXJ2ZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhZGRSZW1vdGVQcm9qZWN0KHByb2plY3RQYXRoOiBzdHJpbmcpOiBQcm9taXNlPD9SZW1vdGVDb25uZWN0aW9uPiB7XG4gIHJldHVybiBhd2FpdCBSZW1vdGVDb25uZWN0aW9uLl9jcmVhdGVJbnNlY3VyZUNvbm5lY3Rpb25Gb3JUZXN0aW5nKHByb2plY3RQYXRoLCBERUZBVUxUX1BPUlQpO1xufVxuXG4vKipcbiAqIEtpbGxzIHRoZSBudWNsaWRlIHNlcnZlciBhc3NvY2lhdGVkIHdpdGggYGNvbm5lY3Rpb25gLCBhbmQgY2xvc2VzIHRoZSBjb25uZWN0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RvcE51Y2xpZGVTZXJ2ZXIoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBzZXJ2aWNlID1cbiAgICBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdGbG93U2VydmljZScsIGNvbm5lY3Rpb24uZ2V0VXJpRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKSk7XG4gIGludmFyaWFudChzZXJ2aWNlKTtcbiAgc2VydmljZS5kaXNwb3NlKCk7XG4gIC8vIElmIHRoaXMgZXZlciBmaXJlcywgZWl0aGVyIGVuc3VyZSB0aGF0IHlvdXIgdGVzdCBjbG9zZXMgYWxsIFJlbW90ZUNvbm5lY3Rpb25zXG4gIC8vIG9yIHdlIGNhbiBhZGQgYSBmb3JjZSBzaHV0ZG93biBtZXRob2QgdG8gU2VydmVyQ29ubmVjdGlvbi5cbiAgaW52YXJpYW50KGNvbm5lY3Rpb24uaXNPbmx5Q29ubmVjdGlvbigpKTtcbiAgY29uc3QgYXR0ZW1wdFNodXRkb3duID0gdHJ1ZTtcbiAgY29ubmVjdGlvbi5jbG9zZShhdHRlbXB0U2h1dGRvd24pO1xufVxuIl19