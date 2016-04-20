Object.defineProperty(exports, '__esModule', {
  value: true
});

var

/* eslint-disable no-console */

// TODO(mbolin): This redefinition of console.log() does not appear to be bulletproof.
// For example, if you do: `./bin/atom-script ./samples/keybindings.js | head`, you get
// an error.

/**
 * Logic to work around this issue: https://github.com/atom/atom/issues/10952.
 * Specifically, we want to ensure that `console.log()` writes "clean" output to stdout.
 * This means we need to wrap the appropriate functions so they do not include the extra
 * information added by Chromium's chatty logger.
 *
 * @return a "notify when stdout is flushed" function that returns a Promise that will be resolved
 *   when all messages have been written to the UNIX domain socket.
 */
instrumentConsole = _asyncToGenerator(function* (stdout) {
  var connectedSocket = yield new Promise(function (resolve) {
    var socket = _net2['default'].connect({ path: stdout },
    // $FlowIgnore: Not sure what's up with this.
    function () {
      return resolve(socket);
    });
  });

  var emitter = new _events.EventEmitter();
  var QUEUE_CLEARED_EVENT_NAME = 'queue-cleared';

  function isQueueCleared() {
    // Until we can figure out a better way to do this, we have to rely on an internal Node API.
    return !connectedSocket._writableState.needDrain;
  }

  function dispatchWhenClear() {
    if (isQueueCleared()) {
      emitter.emit(QUEUE_CLEARED_EVENT_NAME);
    } else {
      setTimeout(dispatchWhenClear, 10);
    }
  }

  console.log = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var message = args.join(' ');
    connectedSocket.write(message + '\n');
    dispatchWhenClear();
  };

  return function () {
    if (isQueueCleared()) {
      return Promise.resolve();
    }

    return new Promise(function (resolve) {
      emitter.once(QUEUE_CLEARED_EVENT_NAME, resolve);
    });
  };
});

exports.instrumentConsole = instrumentConsole;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _events = require('events');

var _net = require('net');

var _net2 = _interopRequireDefault(_net);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnNvbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkJzQixpQkFBaUIscUJBQWhDLFdBQWlDLE1BQWMsRUFBZ0M7QUFDcEYsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFJLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUNuRCxRQUFNLE1BQU0sR0FBRyxpQkFBSSxPQUFPLENBQ3hCLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQzs7QUFFZDthQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FBQSxDQUN0QixDQUFDO0dBQ0gsQ0FBQyxDQUFDOztBQUVILE1BQU0sT0FBTyxHQUFHLDBCQUFrQixDQUFDO0FBQ25DLE1BQU0sd0JBQXdCLEdBQUcsZUFBZSxDQUFDOztBQUVqRCxXQUFTLGNBQWMsR0FBWTs7QUFFakMsV0FBTyxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDO0dBQ2xEOztBQUVELFdBQVMsaUJBQWlCLEdBQUc7QUFDM0IsUUFBSSxjQUFjLEVBQUUsRUFBRTtBQUNwQixhQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7S0FDeEMsTUFBTTtBQUNMLGdCQUFVLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDbkM7R0FDRjs7QUFFRCxTQUFPLENBQUMsR0FBRyxHQUFHLFlBQXVCO3NDQUFuQixJQUFJO0FBQUosVUFBSTs7O0FBQ3BCLFFBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0IsbUJBQWUsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ3RDLHFCQUFpQixFQUFFLENBQUM7R0FDckIsQ0FBQzs7QUFFRixTQUFPLFlBQU07QUFDWCxRQUFJLGNBQWMsRUFBRSxFQUFFO0FBQ3BCLGFBQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzFCOztBQUVELFdBQU8sSUFBSSxPQUFPLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDNUIsYUFBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNqRCxDQUFDLENBQUM7R0FDSixDQUFDO0NBQ0g7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBMUQwQixRQUFROzttQkFDbkIsS0FBSyIsImZpbGUiOiJjb25zb2xlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgbmV0IGZyb20gJ25ldCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuLy8gVE9ETyhtYm9saW4pOiBUaGlzIHJlZGVmaW5pdGlvbiBvZiBjb25zb2xlLmxvZygpIGRvZXMgbm90IGFwcGVhciB0byBiZSBidWxsZXRwcm9vZi5cbi8vIEZvciBleGFtcGxlLCBpZiB5b3UgZG86IGAuL2Jpbi9hdG9tLXNjcmlwdCAuL3NhbXBsZXMva2V5YmluZGluZ3MuanMgfCBoZWFkYCwgeW91IGdldFxuLy8gYW4gZXJyb3IuXG5cbi8qKlxuICogTG9naWMgdG8gd29yayBhcm91bmQgdGhpcyBpc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvMTA5NTIuXG4gKiBTcGVjaWZpY2FsbHksIHdlIHdhbnQgdG8gZW5zdXJlIHRoYXQgYGNvbnNvbGUubG9nKClgIHdyaXRlcyBcImNsZWFuXCIgb3V0cHV0IHRvIHN0ZG91dC5cbiAqIFRoaXMgbWVhbnMgd2UgbmVlZCB0byB3cmFwIHRoZSBhcHByb3ByaWF0ZSBmdW5jdGlvbnMgc28gdGhleSBkbyBub3QgaW5jbHVkZSB0aGUgZXh0cmFcbiAqIGluZm9ybWF0aW9uIGFkZGVkIGJ5IENocm9taXVtJ3MgY2hhdHR5IGxvZ2dlci5cbiAqXG4gKiBAcmV0dXJuIGEgXCJub3RpZnkgd2hlbiBzdGRvdXQgaXMgZmx1c2hlZFwiIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkXG4gKiAgIHdoZW4gYWxsIG1lc3NhZ2VzIGhhdmUgYmVlbiB3cml0dGVuIHRvIHRoZSBVTklYIGRvbWFpbiBzb2NrZXQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnN0cnVtZW50Q29uc29sZShzdGRvdXQ6IHN0cmluZyk6IFByb21pc2U8KCkgPT4gUHJvbWlzZTx2b2lkPj4ge1xuICBjb25zdCBjb25uZWN0ZWRTb2NrZXQgPSBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBjb25zdCBzb2NrZXQgPSBuZXQuY29ubmVjdChcbiAgICAgIHtwYXRoOiBzdGRvdXR9LFxuICAgICAgLy8gJEZsb3dJZ25vcmU6IE5vdCBzdXJlIHdoYXQncyB1cCB3aXRoIHRoaXMuXG4gICAgICAoKSA9PiByZXNvbHZlKHNvY2tldCksXG4gICAgKTtcbiAgfSk7XG5cbiAgY29uc3QgZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgY29uc3QgUVVFVUVfQ0xFQVJFRF9FVkVOVF9OQU1FID0gJ3F1ZXVlLWNsZWFyZWQnO1xuXG4gIGZ1bmN0aW9uIGlzUXVldWVDbGVhcmVkKCk6IGJvb2xlYW4ge1xuICAgIC8vIFVudGlsIHdlIGNhbiBmaWd1cmUgb3V0IGEgYmV0dGVyIHdheSB0byBkbyB0aGlzLCB3ZSBoYXZlIHRvIHJlbHkgb24gYW4gaW50ZXJuYWwgTm9kZSBBUEkuXG4gICAgcmV0dXJuICFjb25uZWN0ZWRTb2NrZXQuX3dyaXRhYmxlU3RhdGUubmVlZERyYWluO1xuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGF0Y2hXaGVuQ2xlYXIoKSB7XG4gICAgaWYgKGlzUXVldWVDbGVhcmVkKCkpIHtcbiAgICAgIGVtaXR0ZXIuZW1pdChRVUVVRV9DTEVBUkVEX0VWRU5UX05BTUUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRUaW1lb3V0KGRpc3BhdGNoV2hlbkNsZWFyLCAxMCk7XG4gICAgfVxuICB9XG5cbiAgY29uc29sZS5sb2cgPSAoLi4uYXJnczogc3RyaW5nW10pID0+IHtcbiAgICBjb25zdCBtZXNzYWdlID0gYXJncy5qb2luKCcgJyk7XG4gICAgY29ubmVjdGVkU29ja2V0LndyaXRlKG1lc3NhZ2UgKyAnXFxuJyk7XG4gICAgZGlzcGF0Y2hXaGVuQ2xlYXIoKTtcbiAgfTtcblxuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmIChpc1F1ZXVlQ2xlYXJlZCgpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgZW1pdHRlci5vbmNlKFFVRVVFX0NMRUFSRURfRVZFTlRfTkFNRSwgcmVzb2x2ZSk7XG4gICAgfSk7XG4gIH07XG59XG4iXX0=