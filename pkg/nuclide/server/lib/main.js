
// Swallow the error while runing in open sourced version.

var main = _asyncToGenerator(function* (args) {
  var serverStartTimer = (0, _analytics.startTracking)('nuclide-server:start');
  try {
    setupServer();
    var port = args.port;
    var key = args.key;
    var cert = args.cert;
    var ca = args.ca;

    if (key && cert && ca) {
      key = _fs2['default'].readFileSync(key);
      cert = _fs2['default'].readFileSync(cert);
      ca = _fs2['default'].readFileSync(ca);
    }
    var server = new _NuclideServer2['default']({
      port: port,
      serverKey: key,
      serverCertificate: cert,
      certificateAuthorityCertificate: ca,
      trackEventLoop: true
    }, _serviceframework2['default'].loadServicesConfig());
    yield server.connect();
    serverStartTimer.onSuccess();
    logger.info('NuclideServer started on port ' + port + '.');
  } catch (e) {
    // Ensure logging is configured.
    yield (0, _logging.initialUpdateConfig)();
    yield serverStartTimer.onError(e);
    logger.fatal(e);
    (0, _logging.flushLogsAndAbort)();
  }
}

// This should never happen because the server must be started with stderr redirected to a log file.
);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _logging = require('../../logging');

var _analytics = require('../../analytics');

var _NuclideServer = require('./NuclideServer');

var _NuclideServer2 = _interopRequireDefault(_NuclideServer);

var _serviceframework = require('./serviceframework');

var _serviceframework2 = _interopRequireDefault(_serviceframework);

var DEFAULT_PORT = 9090;

var logger = (0, _logging.getLogger)();

function setupServer() {
  try {
    require('./fb/setup').setupServer();
  } catch (e) {}
}

process.stderr.on('error', function (error) {
  throw new Error('Can not write to stderr! :' + error);
});

process.on('uncaughtException', function (err) {
  // Log the error and continue the server crash.
  logger.fatal('uncaughtException:', err);
  // According to the docs, we need to close our server when this happens once we logged or
  // handled it: https://nodejs.org/api/process.html#process_event_uncaughtexception
  (0, _logging.flushLogsAndAbort)();
});

// This works in io.js as of v2.4.0 (possibly earlier versions, as well). Support for this was
// introduced by https://github.com/nodejs/io.js/pull/758 in io.js.
//
// Unfortunately, the analogous change was rejected in Node v0.12.x:
// https://github.com/joyent/node/issues/8997.
//
// We include this code here in anticipation of the Node/io.js merger.
process.on('unhandledRejection', function (error, promise) {
  logger.error('Unhandled promise rejection ' + promise + '. Error:', error);
});

var argv = require('yargs')['default']('port', DEFAULT_PORT).argv;

main(argv);
//# sourceMappingURL=data:application/json;base64,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IGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHtnZXRMb2dnZXIsIGZsdXNoTG9nc0FuZEFib3J0LCBpbml0aWFsVXBkYXRlQ29uZmlnfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcbmltcG9ydCB7c3RhcnRUcmFja2luZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCBOdWNsaWRlU2VydmVyIGZyb20gJy4vTnVjbGlkZVNlcnZlcic7XG5pbXBvcnQgU2VydmljZUZyYW1ld29yayBmcm9tICcuL3NlcnZpY2VmcmFtZXdvcmsnO1xuXG5jb25zdCBERUZBVUxUX1BPUlQgPSA5MDkwO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuZnVuY3Rpb24gc2V0dXBTZXJ2ZXIoKTogdm9pZCB7XG4gIHRyeSB7XG4gICAgcmVxdWlyZSgnLi9mYi9zZXR1cCcpLnNldHVwU2VydmVyKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBTd2FsbG93IHRoZSBlcnJvciB3aGlsZSBydW5pbmcgaW4gb3BlbiBzb3VyY2VkIHZlcnNpb24uXG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWFpbihhcmdzKSB7XG4gIGNvbnN0IHNlcnZlclN0YXJ0VGltZXIgPSBzdGFydFRyYWNraW5nKCdudWNsaWRlLXNlcnZlcjpzdGFydCcpO1xuICB0cnkge1xuICAgIHNldHVwU2VydmVyKCk7XG4gICAgY29uc3Qge3BvcnR9ID0gYXJncztcbiAgICBsZXQge2tleSwgY2VydCwgY2F9ID0gYXJncztcbiAgICBpZiAoa2V5ICYmIGNlcnQgJiYgY2EpIHtcbiAgICAgIGtleSA9IGZzLnJlYWRGaWxlU3luYyhrZXkpO1xuICAgICAgY2VydCA9IGZzLnJlYWRGaWxlU3luYyhjZXJ0KTtcbiAgICAgIGNhID0gZnMucmVhZEZpbGVTeW5jKGNhKTtcbiAgICB9XG4gICAgY29uc3Qgc2VydmVyID0gbmV3IE51Y2xpZGVTZXJ2ZXIoe1xuICAgICAgcG9ydCxcbiAgICAgIHNlcnZlcktleToga2V5LFxuICAgICAgc2VydmVyQ2VydGlmaWNhdGU6IGNlcnQsXG4gICAgICBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlOiBjYSxcbiAgICAgIHRyYWNrRXZlbnRMb29wOiB0cnVlLFxuICAgIH0sIFNlcnZpY2VGcmFtZXdvcmsubG9hZFNlcnZpY2VzQ29uZmlnKCkpO1xuICAgIGF3YWl0IHNlcnZlci5jb25uZWN0KCk7XG4gICAgc2VydmVyU3RhcnRUaW1lci5vblN1Y2Nlc3MoKTtcbiAgICBsb2dnZXIuaW5mbygnTnVjbGlkZVNlcnZlciBzdGFydGVkIG9uIHBvcnQgJyArIHBvcnQgKyAnLicpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gRW5zdXJlIGxvZ2dpbmcgaXMgY29uZmlndXJlZC5cbiAgICBhd2FpdCBpbml0aWFsVXBkYXRlQ29uZmlnKCk7XG4gICAgYXdhaXQgc2VydmVyU3RhcnRUaW1lci5vbkVycm9yKGUpO1xuICAgIGxvZ2dlci5mYXRhbChlKTtcbiAgICBmbHVzaExvZ3NBbmRBYm9ydCgpO1xuICB9XG59XG5cbi8vIFRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiBiZWNhdXNlIHRoZSBzZXJ2ZXIgbXVzdCBiZSBzdGFydGVkIHdpdGggc3RkZXJyIHJlZGlyZWN0ZWQgdG8gYSBsb2cgZmlsZS5cbnByb2Nlc3Muc3RkZXJyLm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3Qgd3JpdGUgdG8gc3RkZXJyISA6JyArIGVycm9yKTtcbn0pO1xuXG5wcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIChlcnIpID0+IHtcbiAgLy8gTG9nIHRoZSBlcnJvciBhbmQgY29udGludWUgdGhlIHNlcnZlciBjcmFzaC5cbiAgbG9nZ2VyLmZhdGFsKCd1bmNhdWdodEV4Y2VwdGlvbjonLCBlcnIpO1xuICAvLyBBY2NvcmRpbmcgdG8gdGhlIGRvY3MsIHdlIG5lZWQgdG8gY2xvc2Ugb3VyIHNlcnZlciB3aGVuIHRoaXMgaGFwcGVucyBvbmNlIHdlIGxvZ2dlZCBvclxuICAvLyBoYW5kbGVkIGl0OiBodHRwczovL25vZGVqcy5vcmcvYXBpL3Byb2Nlc3MuaHRtbCNwcm9jZXNzX2V2ZW50X3VuY2F1Z2h0ZXhjZXB0aW9uXG4gIGZsdXNoTG9nc0FuZEFib3J0KCk7XG59KTtcblxuLy8gVGhpcyB3b3JrcyBpbiBpby5qcyBhcyBvZiB2Mi40LjAgKHBvc3NpYmx5IGVhcmxpZXIgdmVyc2lvbnMsIGFzIHdlbGwpLiBTdXBwb3J0IGZvciB0aGlzIHdhc1xuLy8gaW50cm9kdWNlZCBieSBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL2lvLmpzL3B1bGwvNzU4IGluIGlvLmpzLlxuLy9cbi8vIFVuZm9ydHVuYXRlbHksIHRoZSBhbmFsb2dvdXMgY2hhbmdlIHdhcyByZWplY3RlZCBpbiBOb2RlIHYwLjEyLng6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzg5OTcuXG4vL1xuLy8gV2UgaW5jbHVkZSB0aGlzIGNvZGUgaGVyZSBpbiBhbnRpY2lwYXRpb24gb2YgdGhlIE5vZGUvaW8uanMgbWVyZ2VyLlxucHJvY2Vzcy5vbigndW5oYW5kbGVkUmVqZWN0aW9uJywgKGVycm9yLCBwcm9taXNlKSA9PiB7XG4gIGxvZ2dlci5lcnJvcihgVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uICR7cHJvbWlzZX0uIEVycm9yOmAsIGVycm9yKTtcbn0pO1xuXG5jb25zdCBhcmd2ID0gcmVxdWlyZSgneWFyZ3MnKVxuICAgIC5kZWZhdWx0KCdwb3J0JywgREVGQVVMVF9QT1JUKVxuICAgIC5hcmd2O1xuXG5tYWluKGFyZ3YpO1xuIl19