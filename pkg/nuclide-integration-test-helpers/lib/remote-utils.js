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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbW90ZS11dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFtQ3NCLGdCQUFnQixxQkFBL0IsV0FBZ0MsV0FBbUIsRUFBOEI7QUFDdEYsU0FBTyxNQUFNLDBDQUFpQixtQ0FBbUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Q0FDOUY7Ozs7Ozs7OztJQUtxQixpQkFBaUIscUJBQWhDLFdBQWlDLFVBQTRCLEVBQWlCO0FBQ25GLE1BQU0sT0FBTyxHQUNYLDJDQUF1QixhQUFhLEVBQUUsVUFBVSxDQUFDLGdDQUFnQyxFQUFFLENBQUMsQ0FBQztBQUN2RiwyQkFBVSxPQUFPLENBQUMsQ0FBQztBQUNuQixTQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEIsUUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzVELFlBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNwQjs7Ozs7Ozs7Ozs7Ozs7OztzQkF0Q3FCLFFBQVE7Ozs7dUNBQ0MsaUNBQWlDOzs2QkFDM0Isc0JBQXNCOzs2QkFDbkMsZUFBZTs7QUFFdkMsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDOzs7Ozs7O0FBTW5CLFNBQVMsa0JBQWtCLEdBQVM7QUFDekMsZ0NBQ0UsT0FBTyxDQUFDLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQyxFQUM1RCxDQUFDLElBQUksY0FBWSxZQUFZLENBQUcsQ0FDakMsQ0FBQztDQUNIIiwiZmlsZSI6InJlbW90ZS11dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7UmVtb3RlQ29ubmVjdGlvbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtY2xpZW50JztcbmltcG9ydCB7c3Bhd25TeW5jfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuY29uc3QgREVGQVVMVF9QT1JUID0gOTA5MDtcblxuLyoqXG4gKiBTdGFydHMgYSBsb2NhbCB2ZXJzaW9uIG9mIHRoZSBudWNsaWRlIHNlcnZlciBpbiBpbnNlY3VyZSBtb2RlIG9uIHRoZSBzcGVjaWZpZWQgcG9ydC5cbiAqIFRoZSBzZXJ2ZXIgaXMgc3RhcnRlZCBpbiBhIHNlcGFyYXRlIHByb2Nlc3MgdGhhbiB0aGUgY2FsbGVyJ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFydE51Y2xpZGVTZXJ2ZXIoKTogdm9pZCB7XG4gIHNwYXduU3luYyhcbiAgICByZXF1aXJlLnJlc29sdmUoJy4uLy4uL251Y2xpZGUtc2VydmVyL251Y2xpZGUtc3RhcnQtc2VydmVyJyksXG4gICAgWyctaycsIGAtLXBvcnQ9JHtERUZBVUxUX1BPUlR9YF0sXG4gICk7XG59XG5cbi8qKlxuICogQWRkIGEgcmVtb3RlIHByb2plY3QgdG8gbnVjbGlkZS4gIFRoaXMgZnVuY3Rpb24gYnlwYXNzZXMgdGhlIFNTSCBhdXRoZW50aWNhdGlvbiB0aGF0IHRoZVxuICogc2VydmVyIG5vcm1hbGx5IHVzZXMuICBgcHJvamVjdFBhdGhgIGlzIGEgcGF0aCB0byBhIGxvY2FsIGRpcmVjdG9yeS4gIFRoaXMgZnVuY3Rpb24gYXNzdW1lc1xuICogdGhhdCB0aGUgbnVjbGlkZSBzZXJ2ZXIgaGFzIGJlZW4gc3RhcnRlZCBpbiBpbnNlY3VyZSBtb2RlLCBlLmcuIHdpdGggdXNpbmcgdGhlXG4gKiBpbnRlZ3JhdGlvbi10ZXN0LWhlbHBlcnMuc3RhcnROdWNsaWRlU2VydmVyIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkUmVtb3RlUHJvamVjdChwcm9qZWN0UGF0aDogc3RyaW5nKTogUHJvbWlzZTw/UmVtb3RlQ29ubmVjdGlvbj4ge1xuICByZXR1cm4gYXdhaXQgUmVtb3RlQ29ubmVjdGlvbi5fY3JlYXRlSW5zZWN1cmVDb25uZWN0aW9uRm9yVGVzdGluZyhwcm9qZWN0UGF0aCwgREVGQVVMVF9QT1JUKTtcbn1cblxuLyoqXG4gKiBLaWxscyB0aGUgbnVjbGlkZSBzZXJ2ZXIgYXNzb2NpYXRlZCB3aXRoIGBjb25uZWN0aW9uYCwgYW5kIGNsb3NlcyB0aGUgY29ubmVjdGlvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0b3BOdWNsaWRlU2VydmVyKGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3Qgc2VydmljZSA9XG4gICAgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnRmxvd1NlcnZpY2UnLCBjb25uZWN0aW9uLmdldFVyaUZvckluaXRpYWxXb3JraW5nRGlyZWN0b3J5KCkpO1xuICBpbnZhcmlhbnQoc2VydmljZSk7XG4gIHNlcnZpY2UuZGlzcG9zZSgpO1xuICBhd2FpdCBjb25uZWN0aW9uLmdldFNlcnZpY2UoJ0luZm9TZXJ2aWNlJykuc2h1dGRvd25TZXJ2ZXIoKTtcbiAgY29ubmVjdGlvbi5jbG9zZSgpO1xufVxuIl19