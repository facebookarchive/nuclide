
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
//# sourceMappingURL=data:application/json;base64,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IGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHtnZXRMb2dnZXIsIGZsdXNoTG9nc0FuZEFib3J0LCBpbml0aWFsVXBkYXRlQ29uZmlnfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcbmltcG9ydCB7c3RhcnRUcmFja2luZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCBOdWNsaWRlU2VydmVyIGZyb20gJy4vTnVjbGlkZVNlcnZlcic7XG5pbXBvcnQgU2VydmljZUZyYW1ld29yayBmcm9tICcuL3NlcnZpY2VmcmFtZXdvcmsnO1xuXG5jb25zdCBERUZBVUxUX1BPUlQgPSA5MDkwO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuZnVuY3Rpb24gc2V0dXBTZXJ2ZXIoKTogdm9pZCB7XG4gIHRyeSB7XG4gICAgcmVxdWlyZSgnLi9mYi9zZXR1cCcpLnNldHVwU2VydmVyKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBTd2FsbG93IHRoZSBlcnJvciB3aGlsZSBydW5pbmcgaW4gb3BlbiBzb3VyY2VkIHZlcnNpb24uXG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWFpbihhcmdzKSB7XG4gIGNvbnN0IHNlcnZlclN0YXJ0VGltZXIgPSBzdGFydFRyYWNraW5nKCdudWNsaWRlLXNlcnZlcjpzdGFydCcpO1xuICB0cnkge1xuICAgIHNldHVwU2VydmVyKCk7XG4gICAgY29uc3Qge3BvcnR9ID0gYXJncztcbiAgICBsZXQge2tleSwgY2VydCwgY2F9ID0gYXJncztcbiAgICBpZiAoa2V5ICYmIGNlcnQgJiYgY2EpIHtcbiAgICAgIGtleSA9IGZzLnJlYWRGaWxlU3luYyhrZXkpO1xuICAgICAgY2VydCA9IGZzLnJlYWRGaWxlU3luYyhjZXJ0KTtcbiAgICAgIGNhID0gZnMucmVhZEZpbGVTeW5jKGNhKTtcbiAgICB9XG4gICAgY29uc3Qgc2VydmVyID0gbmV3IE51Y2xpZGVTZXJ2ZXIoe1xuICAgICAgcG9ydCxcbiAgICAgIHNlcnZlcktleToga2V5LFxuICAgICAgc2VydmVyQ2VydGlmaWNhdGU6IGNlcnQsXG4gICAgICBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlOiBjYSxcbiAgICAgIHRyYWNrRXZlbnRMb29wOiB0cnVlLFxuICAgIH0sIFNlcnZpY2VGcmFtZXdvcmsubG9hZFNlcnZpY2VzQ29uZmlnKCkpO1xuICAgIGF3YWl0IHNlcnZlci5jb25uZWN0KCk7XG4gICAgc2VydmVyU3RhcnRUaW1lci5vblN1Y2Nlc3MoKTtcbiAgICBsb2dnZXIuaW5mbygnTnVjbGlkZVNlcnZlciBzdGFydGVkIG9uIHBvcnQgJyArIHBvcnQgKyAnLicpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gRW5zdXJlIGxvZ2dpbmcgaXMgY29uZmlndXJlZC5cbiAgICBhd2FpdCBpbml0aWFsVXBkYXRlQ29uZmlnKCk7XG4gICAgYXdhaXQgc2VydmVyU3RhcnRUaW1lci5vbkVycm9yKGUpO1xuICAgIGxvZ2dlci5mYXRhbChlKTtcbiAgICBmbHVzaExvZ3NBbmRBYm9ydCgpO1xuICB9XG59XG5cbi8vIFRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiBiZWNhdXNlIHRoZSBzZXJ2ZXIgbXVzdCBiZSBzdGFydGVkIHdpdGggc3RkZXJyIHJlZGlyZWN0ZWQgdG8gYSBsb2cgZmlsZS5cbnByb2Nlc3Muc3RkZXJyLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IHdyaXRlIHRvIHN0ZGVyciEgOicgKyBlcnJvcik7XG59KTtcblxucHJvY2Vzcy5vbigndW5jYXVnaHRFeGNlcHRpb24nLCBlcnIgPT4ge1xuICAvLyBMb2cgdGhlIGVycm9yIGFuZCBjb250aW51ZSB0aGUgc2VydmVyIGNyYXNoLlxuICBsb2dnZXIuZmF0YWwoJ3VuY2F1Z2h0RXhjZXB0aW9uOicsIGVycik7XG4gIC8vIEFjY29yZGluZyB0byB0aGUgZG9jcywgd2UgbmVlZCB0byBjbG9zZSBvdXIgc2VydmVyIHdoZW4gdGhpcyBoYXBwZW5zIG9uY2Ugd2UgbG9nZ2VkIG9yXG4gIC8vIGhhbmRsZWQgaXQ6IGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvcHJvY2Vzcy5odG1sI3Byb2Nlc3NfZXZlbnRfdW5jYXVnaHRleGNlcHRpb25cbiAgZmx1c2hMb2dzQW5kQWJvcnQoKTtcbn0pO1xuXG4vLyBUaGlzIHdvcmtzIGluIGlvLmpzIGFzIG9mIHYyLjQuMCAocG9zc2libHkgZWFybGllciB2ZXJzaW9ucywgYXMgd2VsbCkuIFN1cHBvcnQgZm9yIHRoaXMgd2FzXG4vLyBpbnRyb2R1Y2VkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvaW8uanMvcHVsbC83NTggaW4gaW8uanMuXG4vL1xuLy8gVW5mb3J0dW5hdGVseSwgdGhlIGFuYWxvZ291cyBjaGFuZ2Ugd2FzIHJlamVjdGVkIGluIE5vZGUgdjAuMTIueDpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9pc3N1ZXMvODk5Ny5cbi8vXG4vLyBXZSBpbmNsdWRlIHRoaXMgY29kZSBoZXJlIGluIGFudGljaXBhdGlvbiBvZiB0aGUgTm9kZS9pby5qcyBtZXJnZXIuXG5wcm9jZXNzLm9uKCd1bmhhbmRsZWRSZWplY3Rpb24nLCAoZXJyb3IsIHByb21pc2UpID0+IHtcbiAgbG9nZ2VyLmVycm9yKGBVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb24gJHtwcm9taXNlfS4gRXJyb3I6YCwgZXJyb3IpO1xufSk7XG5cbmNvbnN0IGFyZ3YgPSByZXF1aXJlKCd5YXJncycpXG4gICAgLmRlZmF1bHQoJ3BvcnQnLCBERUZBVUxUX1BPUlQpXG4gICAgLmFyZ3Y7XG5cbm1haW4oYXJndik7XG4iXX0=