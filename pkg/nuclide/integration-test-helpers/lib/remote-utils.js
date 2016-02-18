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
  (0, _client.getServiceByNuclideUri)('FlowService', connection.getUriForInitialWorkingDirectory()).dispose();
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

var _client = require('../../client');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbW90ZS11dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFtQ3NCLGdCQUFnQixxQkFBL0IsV0FBZ0MsV0FBbUIsRUFBOEI7QUFDdEYsU0FBTyxNQUFNLG1DQUFpQixtQ0FBbUMsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Q0FDOUY7Ozs7Ozs7OztJQUtxQixpQkFBaUIscUJBQWhDLFdBQWlDLFVBQTRCLEVBQWlCO0FBQ25GLHNDQUF1QixhQUFhLEVBQUUsVUFBVSxDQUFDLGdDQUFnQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMvRixRQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDNUQsWUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQ3BCOzs7Ozs7Ozs7Ozs7Ozs7O2dDQW5DOEIseUJBQXlCOztzQkFDbkIsY0FBYzs7NkJBQzNCLGVBQWU7O29CQUN0QixNQUFNOzs7O0FBRXZCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQzs7Ozs7OztBQU1uQixTQUFTLGtCQUFrQixHQUFTO0FBQ3pDLGdDQUNFLGtCQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsbUNBQW1DLENBQUMsRUFDekQsQ0FBQyxJQUFJLGNBQVksWUFBWSxDQUFHLENBQ2pDLENBQUM7Q0FDSCIsImZpbGUiOiJyZW1vdGUtdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vY2xpZW50JztcbmltcG9ydCB7c3Bhd25TeW5jfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5jb25zdCBERUZBVUxUX1BPUlQgPSA5MDkwO1xuXG4vKipcbiAqIFN0YXJ0cyBhIGxvY2FsIHZlcnNpb24gb2YgdGhlIG51Y2xpZGUgc2VydmVyIGluIGluc2VjdXJlIG1vZGUgb24gdGhlIHNwZWNpZmllZCBwb3J0LlxuICogVGhlIHNlcnZlciBpcyBzdGFydGVkIGluIGEgc2VwYXJhdGUgcHJvY2VzcyB0aGFuIHRoZSBjYWxsZXIncy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0TnVjbGlkZVNlcnZlcigpOiB2b2lkIHtcbiAgc3Bhd25TeW5jKFxuICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi9zZXJ2ZXIvbnVjbGlkZS1zdGFydC1zZXJ2ZXInKSxcbiAgICBbJy1rJywgYC0tcG9ydD0ke0RFRkFVTFRfUE9SVH1gXSxcbiAgKTtcbn1cblxuLyoqXG4gKiBBZGQgYSByZW1vdGUgcHJvamVjdCB0byBudWNsaWRlLiAgVGhpcyBmdW5jdGlvbiBieXBhc3NlcyB0aGUgU1NIIGF1dGhlbnRpY2F0aW9uIHRoYXQgdGhlXG4gKiBzZXJ2ZXIgbm9ybWFsbHkgdXNlcy4gIGBwcm9qZWN0UGF0aGAgaXMgYSBwYXRoIHRvIGEgbG9jYWwgZGlyZWN0b3J5LiAgVGhpcyBmdW5jdGlvbiBhc3N1bWVzXG4gKiB0aGF0IHRoZSBudWNsaWRlIHNlcnZlciBoYXMgYmVlbiBzdGFydGVkIGluIGluc2VjdXJlIG1vZGUsIGUuZy4gd2l0aCB1c2luZyB0aGVcbiAqIGludGVncmF0aW9uLXRlc3QtaGVscGVycy5zdGFydE51Y2xpZGVTZXJ2ZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhZGRSZW1vdGVQcm9qZWN0KHByb2plY3RQYXRoOiBzdHJpbmcpOiBQcm9taXNlPD9SZW1vdGVDb25uZWN0aW9uPiB7XG4gIHJldHVybiBhd2FpdCBSZW1vdGVDb25uZWN0aW9uLl9jcmVhdGVJbnNlY3VyZUNvbm5lY3Rpb25Gb3JUZXN0aW5nKHByb2plY3RQYXRoLCBERUZBVUxUX1BPUlQpO1xufVxuXG4vKipcbiAqIEtpbGxzIHRoZSBudWNsaWRlIHNlcnZlciBhc3NvY2lhdGVkIHdpdGggYGNvbm5lY3Rpb25gLCBhbmQgY2xvc2VzIHRoZSBjb25uZWN0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RvcE51Y2xpZGVTZXJ2ZXIoY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbik6IFByb21pc2U8dm9pZD4ge1xuICBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdGbG93U2VydmljZScsIGNvbm5lY3Rpb24uZ2V0VXJpRm9ySW5pdGlhbFdvcmtpbmdEaXJlY3RvcnkoKSkuZGlzcG9zZSgpO1xuICBhd2FpdCBjb25uZWN0aW9uLmdldFNlcnZpY2UoJ0luZm9TZXJ2aWNlJykuc2h1dGRvd25TZXJ2ZXIoKTtcbiAgY29ubmVjdGlvbi5jbG9zZSgpO1xufVxuIl19