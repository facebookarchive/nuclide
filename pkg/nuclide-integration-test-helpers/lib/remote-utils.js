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

var _child_process2 = _interopRequireDefault(_child_process);

var DEFAULT_PORT = 9090;

/**
 * Starts a local version of the nuclide server in insecure mode on the specified port.
 * The server is started in a separate process than the caller's.
 */

function startNuclideServer() {
  _child_process2['default'].spawnSync(require.resolve('../../nuclide-server/nuclide-start-server'), ['-k', '--port=' + DEFAULT_PORT]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbW90ZS11dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFtQ3NCLGdCQUFnQixxQkFBL0IsV0FBZ0MsV0FBbUIsRUFBOEI7QUFDdEYsU0FBTyxNQUFNLDBDQUFpQixtQ0FBbUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Q0FDOUY7Ozs7Ozs7OztJQUtxQixpQkFBaUIscUJBQWhDLFdBQWlDLFVBQTRCLEVBQWlCO0FBQ25GLE1BQU0sT0FBTyxHQUNYLDJDQUF1QixhQUFhLEVBQUUsVUFBVSxDQUFDLGdDQUFnQyxFQUFFLENBQUMsQ0FBQztBQUN2RiwyQkFBVSxPQUFPLENBQUMsQ0FBQztBQUNuQixTQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7OztBQUdsQiwyQkFBVSxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQztBQUM3QixZQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0NBQ25DOzs7Ozs7Ozs7Ozs7Ozs7O3NCQXpDcUIsUUFBUTs7Ozt1Q0FDQyxpQ0FBaUM7OzZCQUMzQixzQkFBc0I7OzZCQUNqQyxlQUFlOzs7O0FBRXpDLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQzs7Ozs7OztBQU1uQixTQUFTLGtCQUFrQixHQUFTO0FBQ3pDLDZCQUFjLFNBQVMsQ0FDckIsT0FBTyxDQUFDLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQyxFQUM1RCxDQUFDLElBQUksY0FBWSxZQUFZLENBQUcsQ0FDakMsQ0FBQztDQUNIIiwiZmlsZSI6InJlbW90ZS11dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtY2xpZW50JztcbmltcG9ydCBjaGlsZF9wcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5jb25zdCBERUZBVUxUX1BPUlQgPSA5MDkwO1xuXG4vKipcbiAqIFN0YXJ0cyBhIGxvY2FsIHZlcnNpb24gb2YgdGhlIG51Y2xpZGUgc2VydmVyIGluIGluc2VjdXJlIG1vZGUgb24gdGhlIHNwZWNpZmllZCBwb3J0LlxuICogVGhlIHNlcnZlciBpcyBzdGFydGVkIGluIGEgc2VwYXJhdGUgcHJvY2VzcyB0aGFuIHRoZSBjYWxsZXIncy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0TnVjbGlkZVNlcnZlcigpOiB2b2lkIHtcbiAgY2hpbGRfcHJvY2Vzcy5zcGF3blN5bmMoXG4gICAgcmVxdWlyZS5yZXNvbHZlKCcuLi8uLi9udWNsaWRlLXNlcnZlci9udWNsaWRlLXN0YXJ0LXNlcnZlcicpLFxuICAgIFsnLWsnLCBgLS1wb3J0PSR7REVGQVVMVF9QT1JUfWBdLFxuICApO1xufVxuXG4vKipcbiAqIEFkZCBhIHJlbW90ZSBwcm9qZWN0IHRvIG51Y2xpZGUuICBUaGlzIGZ1bmN0aW9uIGJ5cGFzc2VzIHRoZSBTU0ggYXV0aGVudGljYXRpb24gdGhhdCB0aGVcbiAqIHNlcnZlciBub3JtYWxseSB1c2VzLiAgYHByb2plY3RQYXRoYCBpcyBhIHBhdGggdG8gYSBsb2NhbCBkaXJlY3RvcnkuICBUaGlzIGZ1bmN0aW9uIGFzc3VtZXNcbiAqIHRoYXQgdGhlIG51Y2xpZGUgc2VydmVyIGhhcyBiZWVuIHN0YXJ0ZWQgaW4gaW5zZWN1cmUgbW9kZSwgZS5nLiB3aXRoIHVzaW5nIHRoZVxuICogaW50ZWdyYXRpb24tdGVzdC1oZWxwZXJzLnN0YXJ0TnVjbGlkZVNlcnZlciBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFJlbW90ZVByb2plY3QocHJvamVjdFBhdGg6IHN0cmluZyk6IFByb21pc2U8P1JlbW90ZUNvbm5lY3Rpb24+IHtcbiAgcmV0dXJuIGF3YWl0IFJlbW90ZUNvbm5lY3Rpb24uX2NyZWF0ZUluc2VjdXJlQ29ubmVjdGlvbkZvclRlc3RpbmcocHJvamVjdFBhdGgsIERFRkFVTFRfUE9SVCk7XG59XG5cbi8qKlxuICogS2lsbHMgdGhlIG51Y2xpZGUgc2VydmVyIGFzc29jaWF0ZWQgd2l0aCBgY29ubmVjdGlvbmAsIGFuZCBjbG9zZXMgdGhlIGNvbm5lY3Rpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdG9wTnVjbGlkZVNlcnZlcihjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHNlcnZpY2UgPVxuICAgIGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0Zsb3dTZXJ2aWNlJywgY29ubmVjdGlvbi5nZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKTtcbiAgaW52YXJpYW50KHNlcnZpY2UpO1xuICBzZXJ2aWNlLmRpc3Bvc2UoKTtcbiAgLy8gSWYgdGhpcyBldmVyIGZpcmVzLCBlaXRoZXIgZW5zdXJlIHRoYXQgeW91ciB0ZXN0IGNsb3NlcyBhbGwgUmVtb3RlQ29ubmVjdGlvbnNcbiAgLy8gb3Igd2UgY2FuIGFkZCBhIGZvcmNlIHNodXRkb3duIG1ldGhvZCB0byBTZXJ2ZXJDb25uZWN0aW9uLlxuICBpbnZhcmlhbnQoY29ubmVjdGlvbi5pc09ubHlDb25uZWN0aW9uKCkpO1xuICBjb25zdCBhdHRlbXB0U2h1dGRvd24gPSB0cnVlO1xuICBjb25uZWN0aW9uLmNsb3NlKGF0dGVtcHRTaHV0ZG93bik7XG59XG4iXX0=