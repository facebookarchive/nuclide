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
  var service = (0, _client.getServiceByNuclideUri)('FlowService', connection.getUriForInitialWorkingDirectory());
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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _remoteConnection = require('../../remote-connection');

var _client = require('../../client');

var _child_process = require('child_process');

var DEFAULT_PORT = 9090;

/**
 * Starts a local version of the nuclide server in insecure mode on the specified port.
 * The server is started in a separate process than the caller's.
 */

function startNuclideServer() {
  (0, _child_process.spawnSync)(_path2['default'].join(__dirname, '../../server/nuclide-start-server'), ['-k', '--port=' + DEFAULT_PORT]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbW90ZS11dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFvQ3NCLGdCQUFnQixxQkFBL0IsV0FBZ0MsV0FBbUIsRUFBOEI7QUFDdEYsU0FBTyxNQUFNLG1DQUFpQixtQ0FBbUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Q0FDOUY7Ozs7Ozs7OztJQUtxQixpQkFBaUIscUJBQWhDLFdBQWlDLFVBQTRCLEVBQWlCO0FBQ25GLE1BQU0sT0FBTyxHQUNYLG9DQUF1QixhQUFhLEVBQUUsVUFBVSxDQUFDLGdDQUFnQyxFQUFFLENBQUMsQ0FBQztBQUN2RiwyQkFBVSxPQUFPLENBQUMsQ0FBQztBQUNuQixTQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEIsUUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzVELFlBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNwQjs7Ozs7Ozs7Ozs7Ozs7OztzQkF2Q3FCLFFBQVE7Ozs7b0JBQ2IsTUFBTTs7OztnQ0FDUSx5QkFBeUI7O3NCQUNuQixjQUFjOzs2QkFDM0IsZUFBZTs7QUFFdkMsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDOzs7Ozs7O0FBTW5CLFNBQVMsa0JBQWtCLEdBQVM7QUFDekMsZ0NBQ0Usa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxtQ0FBbUMsQ0FBQyxFQUN6RCxDQUFDLElBQUksY0FBWSxZQUFZLENBQUcsQ0FDakMsQ0FBQztDQUNIIiwiZmlsZSI6InJlbW90ZS11dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtSZW1vdGVDb25uZWN0aW9ufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbic7XG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uL2NsaWVudCc7XG5pbXBvcnQge3NwYXduU3luY30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IERFRkFVTFRfUE9SVCA9IDkwOTA7XG5cbi8qKlxuICogU3RhcnRzIGEgbG9jYWwgdmVyc2lvbiBvZiB0aGUgbnVjbGlkZSBzZXJ2ZXIgaW4gaW5zZWN1cmUgbW9kZSBvbiB0aGUgc3BlY2lmaWVkIHBvcnQuXG4gKiBUaGUgc2VydmVyIGlzIHN0YXJ0ZWQgaW4gYSBzZXBhcmF0ZSBwcm9jZXNzIHRoYW4gdGhlIGNhbGxlcidzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhcnROdWNsaWRlU2VydmVyKCk6IHZvaWQge1xuICBzcGF3blN5bmMoXG4gICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL3NlcnZlci9udWNsaWRlLXN0YXJ0LXNlcnZlcicpLFxuICAgIFsnLWsnLCBgLS1wb3J0PSR7REVGQVVMVF9QT1JUfWBdLFxuICApO1xufVxuXG4vKipcbiAqIEFkZCBhIHJlbW90ZSBwcm9qZWN0IHRvIG51Y2xpZGUuICBUaGlzIGZ1bmN0aW9uIGJ5cGFzc2VzIHRoZSBTU0ggYXV0aGVudGljYXRpb24gdGhhdCB0aGVcbiAqIHNlcnZlciBub3JtYWxseSB1c2VzLiAgYHByb2plY3RQYXRoYCBpcyBhIHBhdGggdG8gYSBsb2NhbCBkaXJlY3RvcnkuICBUaGlzIGZ1bmN0aW9uIGFzc3VtZXNcbiAqIHRoYXQgdGhlIG51Y2xpZGUgc2VydmVyIGhhcyBiZWVuIHN0YXJ0ZWQgaW4gaW5zZWN1cmUgbW9kZSwgZS5nLiB3aXRoIHVzaW5nIHRoZVxuICogaW50ZWdyYXRpb24tdGVzdC1oZWxwZXJzLnN0YXJ0TnVjbGlkZVNlcnZlciBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFJlbW90ZVByb2plY3QocHJvamVjdFBhdGg6IHN0cmluZyk6IFByb21pc2U8P1JlbW90ZUNvbm5lY3Rpb24+IHtcbiAgcmV0dXJuIGF3YWl0IFJlbW90ZUNvbm5lY3Rpb24uX2NyZWF0ZUluc2VjdXJlQ29ubmVjdGlvbkZvclRlc3RpbmcocHJvamVjdFBhdGgsIERFRkFVTFRfUE9SVCk7XG59XG5cbi8qKlxuICogS2lsbHMgdGhlIG51Y2xpZGUgc2VydmVyIGFzc29jaWF0ZWQgd2l0aCBgY29ubmVjdGlvbmAsIGFuZCBjbG9zZXMgdGhlIGNvbm5lY3Rpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdG9wTnVjbGlkZVNlcnZlcihjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHNlcnZpY2UgPVxuICAgIGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0Zsb3dTZXJ2aWNlJywgY29ubmVjdGlvbi5nZXRVcmlGb3JJbml0aWFsV29ya2luZ0RpcmVjdG9yeSgpKTtcbiAgaW52YXJpYW50KHNlcnZpY2UpO1xuICBzZXJ2aWNlLmRpc3Bvc2UoKTtcbiAgYXdhaXQgY29ubmVjdGlvbi5nZXRTZXJ2aWNlKCdJbmZvU2VydmljZScpLnNodXRkb3duU2VydmVyKCk7XG4gIGNvbm5lY3Rpb24uY2xvc2UoKTtcbn1cbiJdfQ==