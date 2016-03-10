
// Swallow the error while runing in open sourced version.

var main = _asyncToGenerator(function* (args) {
  var serverStartTimer = (0, _analytics.startTracking)('nuclide-server:start');
  process.on('SIGHUP', function () {});

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
    logger.info('Using node ' + process.version + '.');
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
//# sourceMappingURL=data:application/json;base64,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LENBQzdCLElBQUksQ0FBQzs7QUFFVixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQge2dldExvZ2dlciwgZmx1c2hMb2dzQW5kQWJvcnQsIGluaXRpYWxVcGRhdGVDb25maWd9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHtzdGFydFRyYWNraW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IE51Y2xpZGVTZXJ2ZXIgZnJvbSAnLi9OdWNsaWRlU2VydmVyJztcbmltcG9ydCBTZXJ2aWNlRnJhbWV3b3JrIGZyb20gJy4vc2VydmljZWZyYW1ld29yayc7XG5cbmNvbnN0IERFRkFVTFRfUE9SVCA9IDkwOTA7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5mdW5jdGlvbiBzZXR1cFNlcnZlcigpOiB2b2lkIHtcbiAgdHJ5IHtcbiAgICByZXF1aXJlKCcuL2ZiL3NldHVwJykuc2V0dXBTZXJ2ZXIoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIFN3YWxsb3cgdGhlIGVycm9yIHdoaWxlIHJ1bmluZyBpbiBvcGVuIHNvdXJjZWQgdmVyc2lvbi5cbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBtYWluKGFyZ3MpIHtcbiAgY29uc3Qgc2VydmVyU3RhcnRUaW1lciA9IHN0YXJ0VHJhY2tpbmcoJ251Y2xpZGUtc2VydmVyOnN0YXJ0Jyk7XG4gIHByb2Nlc3Mub24oJ1NJR0hVUCcsICgpID0+IHt9KTtcblxuICB0cnkge1xuICAgIHNldHVwU2VydmVyKCk7XG4gICAgY29uc3Qge3BvcnR9ID0gYXJncztcbiAgICBsZXQge2tleSwgY2VydCwgY2F9ID0gYXJncztcbiAgICBpZiAoa2V5ICYmIGNlcnQgJiYgY2EpIHtcbiAgICAgIGtleSA9IGZzLnJlYWRGaWxlU3luYyhrZXkpO1xuICAgICAgY2VydCA9IGZzLnJlYWRGaWxlU3luYyhjZXJ0KTtcbiAgICAgIGNhID0gZnMucmVhZEZpbGVTeW5jKGNhKTtcbiAgICB9XG4gICAgY29uc3Qgc2VydmVyID0gbmV3IE51Y2xpZGVTZXJ2ZXIoe1xuICAgICAgcG9ydCxcbiAgICAgIHNlcnZlcktleToga2V5LFxuICAgICAgc2VydmVyQ2VydGlmaWNhdGU6IGNlcnQsXG4gICAgICBjZXJ0aWZpY2F0ZUF1dGhvcml0eUNlcnRpZmljYXRlOiBjYSxcbiAgICAgIHRyYWNrRXZlbnRMb29wOiB0cnVlLFxuICAgIH0sIFNlcnZpY2VGcmFtZXdvcmsubG9hZFNlcnZpY2VzQ29uZmlnKCkpO1xuICAgIGF3YWl0IHNlcnZlci5jb25uZWN0KCk7XG4gICAgc2VydmVyU3RhcnRUaW1lci5vblN1Y2Nlc3MoKTtcbiAgICBsb2dnZXIuaW5mbyhgTnVjbGlkZVNlcnZlciBzdGFydGVkIG9uIHBvcnQgJHtwb3J0fS5gKTtcbiAgICBsb2dnZXIuaW5mbyhgVXNpbmcgbm9kZSAke3Byb2Nlc3MudmVyc2lvbn0uYCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBFbnN1cmUgbG9nZ2luZyBpcyBjb25maWd1cmVkLlxuICAgIGF3YWl0IGluaXRpYWxVcGRhdGVDb25maWcoKTtcbiAgICBhd2FpdCBzZXJ2ZXJTdGFydFRpbWVyLm9uRXJyb3IoZSk7XG4gICAgbG9nZ2VyLmZhdGFsKGUpO1xuICAgIGZsdXNoTG9nc0FuZEFib3J0KCk7XG4gIH1cbn1cblxuLy8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIGJlY2F1c2UgdGhlIHNlcnZlciBtdXN0IGJlIHN0YXJ0ZWQgd2l0aCBzdGRlcnIgcmVkaXJlY3RlZCB0byBhIGxvZyBmaWxlLlxucHJvY2Vzcy5zdGRlcnIub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3Qgd3JpdGUgdG8gc3RkZXJyISA6JyArIGVycm9yKTtcbn0pO1xuXG5wcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIGVyciA9PiB7XG4gIC8vIExvZyB0aGUgZXJyb3IgYW5kIGNvbnRpbnVlIHRoZSBzZXJ2ZXIgY3Jhc2guXG4gIGxvZ2dlci5mYXRhbCgndW5jYXVnaHRFeGNlcHRpb246JywgZXJyKTtcbiAgLy8gQWNjb3JkaW5nIHRvIHRoZSBkb2NzLCB3ZSBuZWVkIHRvIGNsb3NlIG91ciBzZXJ2ZXIgd2hlbiB0aGlzIGhhcHBlbnMgb25jZSB3ZSBsb2dnZWQgb3JcbiAgLy8gaGFuZGxlZCBpdDogaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9wcm9jZXNzLmh0bWwjcHJvY2Vzc19ldmVudF91bmNhdWdodGV4Y2VwdGlvblxuICBmbHVzaExvZ3NBbmRBYm9ydCgpO1xufSk7XG5cbi8vIFRoaXMgd29ya3MgaW4gaW8uanMgYXMgb2YgdjIuNC4wIChwb3NzaWJseSBlYXJsaWVyIHZlcnNpb25zLCBhcyB3ZWxsKS4gU3VwcG9ydCBmb3IgdGhpcyB3YXNcbi8vIGludHJvZHVjZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9pby5qcy9wdWxsLzc1OCBpbiBpby5qcy5cbi8vXG4vLyBVbmZvcnR1bmF0ZWx5LCB0aGUgYW5hbG9nb3VzIGNoYW5nZSB3YXMgcmVqZWN0ZWQgaW4gTm9kZSB2MC4xMi54OlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2pveWVudC9ub2RlL2lzc3Vlcy84OTk3LlxuLy9cbi8vIFdlIGluY2x1ZGUgdGhpcyBjb2RlIGhlcmUgaW4gYW50aWNpcGF0aW9uIG9mIHRoZSBOb2RlL2lvLmpzIG1lcmdlci5cbnByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIChlcnJvciwgcHJvbWlzZSkgPT4ge1xuICBsb2dnZXIuZXJyb3IoYFVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbiAke3Byb21pc2V9LiBFcnJvcjpgLCBlcnJvcik7XG59KTtcblxuY29uc3QgYXJndiA9IHJlcXVpcmUoJ3lhcmdzJylcbiAgICAuZGVmYXVsdCgncG9ydCcsIERFRkFVTFRfUE9SVClcbiAgICAuYXJndjtcblxubWFpbihhcmd2KTtcbiJdfQ==