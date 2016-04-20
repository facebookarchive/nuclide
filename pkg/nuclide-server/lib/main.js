
// Swallow the error while runing in open sourced version.

var main = _asyncToGenerator(function* (args) {
  var serverStartTimer = (0, _nuclideAnalytics.startTracking)('nuclide-server:start');
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
    }, _serviceframeworkIndex2['default'].loadServicesConfig());
    yield server.connect();
    serverStartTimer.onSuccess();
    logger.info('NuclideServer started on port ' + port + '.');
    logger.info('Using node ' + process.version + '.');
    logger.info('Server ready time: ' + process.uptime() * 1000 + 'ms');
  } catch (e) {
    // Ensure logging is configured.
    yield (0, _nuclideLogging.initialUpdateConfig)();
    yield serverStartTimer.onError(e);
    logger.fatal(e);
    (0, _nuclideLogging.flushLogsAndAbort)();
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

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _NuclideServer = require('./NuclideServer');

var _NuclideServer2 = _interopRequireDefault(_NuclideServer);

var _serviceframeworkIndex = require('./serviceframework/index');

var _serviceframeworkIndex2 = _interopRequireDefault(_serviceframeworkIndex);

var DEFAULT_PORT = 9090;

var logger = (0, _nuclideLogging.getLogger)();

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
  (0, _nuclideLogging.flushLogsAndAbort)();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBNkJlLElBQUkscUJBQW5CLFdBQW9CLElBQUksRUFBRTtBQUN4QixNQUFNLGdCQUFnQixHQUFHLHFDQUFjLHNCQUFzQixDQUFDLENBQUM7QUFDL0QsU0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBTSxFQUFFLENBQUMsQ0FBQzs7QUFFL0IsTUFBSTtBQUNGLGVBQVcsRUFBRSxDQUFDO1FBQ1AsSUFBSSxHQUFJLElBQUksQ0FBWixJQUFJO1FBQ04sR0FBRyxHQUFjLElBQUksQ0FBckIsR0FBRztRQUFFLElBQUksR0FBUSxJQUFJLENBQWhCLElBQUk7UUFBRSxFQUFFLEdBQUksSUFBSSxDQUFWLEVBQUU7O0FBQ2xCLFFBQUksR0FBRyxJQUFJLElBQUksSUFBSSxFQUFFLEVBQUU7QUFDckIsU0FBRyxHQUFHLGdCQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixVQUFJLEdBQUcsZ0JBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdCLFFBQUUsR0FBRyxnQkFBRyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDMUI7QUFDRCxRQUFNLE1BQU0sR0FBRywrQkFBa0I7QUFDL0IsVUFBSSxFQUFKLElBQUk7QUFDSixlQUFTLEVBQUUsR0FBRztBQUNkLHVCQUFpQixFQUFFLElBQUk7QUFDdkIscUNBQStCLEVBQUUsRUFBRTtBQUNuQyxvQkFBYyxFQUFFLElBQUk7S0FDckIsRUFBRSxtQ0FBaUIsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLFVBQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZCLG9CQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzdCLFVBQU0sQ0FBQyxJQUFJLG9DQUFrQyxJQUFJLE9BQUksQ0FBQztBQUN0RCxVQUFNLENBQUMsSUFBSSxpQkFBZSxPQUFPLENBQUMsT0FBTyxPQUFJLENBQUM7QUFDOUMsVUFBTSxDQUFDLElBQUkseUJBQXVCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLFFBQUssQ0FBQztHQUNoRSxDQUFDLE9BQU8sQ0FBQyxFQUFFOztBQUVWLFVBQU0sMENBQXFCLENBQUM7QUFDNUIsVUFBTSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsVUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQiw0Q0FBbUIsQ0FBQztHQUNyQjtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7OztrQkFsRGMsSUFBSTs7Ozs4QkFDNkMsdUJBQXVCOztnQ0FDM0QseUJBQXlCOzs2QkFDM0IsaUJBQWlCOzs7O3FDQUNkLDBCQUEwQjs7OztBQUV2RCxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUM7O0FBRTFCLElBQU0sTUFBTSxHQUFHLGdDQUFXLENBQUM7O0FBRTNCLFNBQVMsV0FBVyxHQUFTO0FBQzNCLE1BQUk7QUFDRixXQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7R0FDckMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUVYO0NBQ0Y7O0FBcUNELE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFBLEtBQUssRUFBSTtBQUNsQyxRQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixHQUFHLEtBQUssQ0FBQyxDQUFDO0NBQ3ZELENBQUMsQ0FBQzs7QUFFSCxPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLFVBQUEsR0FBRyxFQUFJOztBQUVyQyxRQUFNLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDOzs7QUFHeEMsMENBQW1CLENBQUM7Q0FDckIsQ0FBQyxDQUFDOzs7Ozs7Ozs7QUFTSCxPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLFVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBSztBQUNuRCxRQUFNLENBQUMsS0FBSyxrQ0FBZ0MsT0FBTyxlQUFZLEtBQUssQ0FBQyxDQUFDO0NBQ3ZFLENBQUMsQ0FBQzs7QUFFSCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQ2pCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUM3QixJQUFJLENBQUM7O0FBRVYsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHtnZXRMb2dnZXIsIGZsdXNoTG9nc0FuZEFib3J0LCBpbml0aWFsVXBkYXRlQ29uZmlnfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHtzdGFydFRyYWNraW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQgTnVjbGlkZVNlcnZlciBmcm9tICcuL051Y2xpZGVTZXJ2ZXInO1xuaW1wb3J0IFNlcnZpY2VGcmFtZXdvcmsgZnJvbSAnLi9zZXJ2aWNlZnJhbWV3b3JrL2luZGV4JztcblxuY29uc3QgREVGQVVMVF9QT1JUID0gOTA5MDtcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbmZ1bmN0aW9uIHNldHVwU2VydmVyKCk6IHZvaWQge1xuICB0cnkge1xuICAgIHJlcXVpcmUoJy4vZmIvc2V0dXAnKS5zZXR1cFNlcnZlcigpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gU3dhbGxvdyB0aGUgZXJyb3Igd2hpbGUgcnVuaW5nIGluIG9wZW4gc291cmNlZCB2ZXJzaW9uLlxuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oYXJncykge1xuICBjb25zdCBzZXJ2ZXJTdGFydFRpbWVyID0gc3RhcnRUcmFja2luZygnbnVjbGlkZS1zZXJ2ZXI6c3RhcnQnKTtcbiAgcHJvY2Vzcy5vbignU0lHSFVQJywgKCkgPT4ge30pO1xuXG4gIHRyeSB7XG4gICAgc2V0dXBTZXJ2ZXIoKTtcbiAgICBjb25zdCB7cG9ydH0gPSBhcmdzO1xuICAgIGxldCB7a2V5LCBjZXJ0LCBjYX0gPSBhcmdzO1xuICAgIGlmIChrZXkgJiYgY2VydCAmJiBjYSkge1xuICAgICAga2V5ID0gZnMucmVhZEZpbGVTeW5jKGtleSk7XG4gICAgICBjZXJ0ID0gZnMucmVhZEZpbGVTeW5jKGNlcnQpO1xuICAgICAgY2EgPSBmcy5yZWFkRmlsZVN5bmMoY2EpO1xuICAgIH1cbiAgICBjb25zdCBzZXJ2ZXIgPSBuZXcgTnVjbGlkZVNlcnZlcih7XG4gICAgICBwb3J0LFxuICAgICAgc2VydmVyS2V5OiBrZXksXG4gICAgICBzZXJ2ZXJDZXJ0aWZpY2F0ZTogY2VydCxcbiAgICAgIGNlcnRpZmljYXRlQXV0aG9yaXR5Q2VydGlmaWNhdGU6IGNhLFxuICAgICAgdHJhY2tFdmVudExvb3A6IHRydWUsXG4gICAgfSwgU2VydmljZUZyYW1ld29yay5sb2FkU2VydmljZXNDb25maWcoKSk7XG4gICAgYXdhaXQgc2VydmVyLmNvbm5lY3QoKTtcbiAgICBzZXJ2ZXJTdGFydFRpbWVyLm9uU3VjY2VzcygpO1xuICAgIGxvZ2dlci5pbmZvKGBOdWNsaWRlU2VydmVyIHN0YXJ0ZWQgb24gcG9ydCAke3BvcnR9LmApO1xuICAgIGxvZ2dlci5pbmZvKGBVc2luZyBub2RlICR7cHJvY2Vzcy52ZXJzaW9ufS5gKTtcbiAgICBsb2dnZXIuaW5mbyhgU2VydmVyIHJlYWR5IHRpbWU6ICR7cHJvY2Vzcy51cHRpbWUoKSAqIDEwMDB9bXNgKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIEVuc3VyZSBsb2dnaW5nIGlzIGNvbmZpZ3VyZWQuXG4gICAgYXdhaXQgaW5pdGlhbFVwZGF0ZUNvbmZpZygpO1xuICAgIGF3YWl0IHNlcnZlclN0YXJ0VGltZXIub25FcnJvcihlKTtcbiAgICBsb2dnZXIuZmF0YWwoZSk7XG4gICAgZmx1c2hMb2dzQW5kQWJvcnQoKTtcbiAgfVxufVxuXG4vLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gYmVjYXVzZSB0aGUgc2VydmVyIG11c3QgYmUgc3RhcnRlZCB3aXRoIHN0ZGVyciByZWRpcmVjdGVkIHRvIGEgbG9nIGZpbGUuXG5wcm9jZXNzLnN0ZGVyci5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCB3cml0ZSB0byBzdGRlcnIhIDonICsgZXJyb3IpO1xufSk7XG5cbnByb2Nlc3Mub24oJ3VuY2F1Z2h0RXhjZXB0aW9uJywgZXJyID0+IHtcbiAgLy8gTG9nIHRoZSBlcnJvciBhbmQgY29udGludWUgdGhlIHNlcnZlciBjcmFzaC5cbiAgbG9nZ2VyLmZhdGFsKCd1bmNhdWdodEV4Y2VwdGlvbjonLCBlcnIpO1xuICAvLyBBY2NvcmRpbmcgdG8gdGhlIGRvY3MsIHdlIG5lZWQgdG8gY2xvc2Ugb3VyIHNlcnZlciB3aGVuIHRoaXMgaGFwcGVucyBvbmNlIHdlIGxvZ2dlZCBvclxuICAvLyBoYW5kbGVkIGl0OiBodHRwczovL25vZGVqcy5vcmcvYXBpL3Byb2Nlc3MuaHRtbCNwcm9jZXNzX2V2ZW50X3VuY2F1Z2h0ZXhjZXB0aW9uXG4gIGZsdXNoTG9nc0FuZEFib3J0KCk7XG59KTtcblxuLy8gVGhpcyB3b3JrcyBpbiBpby5qcyBhcyBvZiB2Mi40LjAgKHBvc3NpYmx5IGVhcmxpZXIgdmVyc2lvbnMsIGFzIHdlbGwpLiBTdXBwb3J0IGZvciB0aGlzIHdhc1xuLy8gaW50cm9kdWNlZCBieSBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL2lvLmpzL3B1bGwvNzU4IGluIGlvLmpzLlxuLy9cbi8vIFVuZm9ydHVuYXRlbHksIHRoZSBhbmFsb2dvdXMgY2hhbmdlIHdhcyByZWplY3RlZCBpbiBOb2RlIHYwLjEyLng6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzg5OTcuXG4vL1xuLy8gV2UgaW5jbHVkZSB0aGlzIGNvZGUgaGVyZSBpbiBhbnRpY2lwYXRpb24gb2YgdGhlIE5vZGUvaW8uanMgbWVyZ2VyLlxucHJvY2Vzcy5vbigndW5oYW5kbGVkUmVqZWN0aW9uJywgKGVycm9yLCBwcm9taXNlKSA9PiB7XG4gIGxvZ2dlci5lcnJvcihgVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uICR7cHJvbWlzZX0uIEVycm9yOmAsIGVycm9yKTtcbn0pO1xuXG5jb25zdCBhcmd2ID0gcmVxdWlyZSgneWFyZ3MnKVxuICAgIC5kZWZhdWx0KCdwb3J0JywgREVGQVVMVF9QT1JUKVxuICAgIC5hcmd2O1xuXG5tYWluKGFyZ3YpO1xuIl19