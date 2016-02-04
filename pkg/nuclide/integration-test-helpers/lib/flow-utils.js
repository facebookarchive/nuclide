Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Start the flow server in the specified directory, projectPath.
 */

var startFlowServer = _asyncToGenerator(function* (projectPath) {
  yield (0, _commons.asyncExecute)('flow', [projectPath]);
}

/**
 * Stop the flow server in the specified directory, projectPath.
 */
);

exports.startFlowServer = startFlowServer;

var stopFlowServer = _asyncToGenerator(function* (projectPath) {
  yield (0, _commons.asyncExecute)('flow', ['stop', projectPath]);
});

exports.stopFlowServer = stopFlowServer;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commons = require('../../commons');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZsb3ctdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7SUFnQnNCLGVBQWUscUJBQTlCLFdBQStCLFdBQW1CLEVBQWlCO0FBQ3hFLFFBQU0sMkJBQWEsTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztDQUMzQzs7Ozs7Ozs7O0lBS3FCLGNBQWMscUJBQTdCLFdBQThCLFdBQW1CLEVBQWlCO0FBQ3ZFLFFBQU0sMkJBQWEsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7Q0FDbkQ7Ozs7Ozs7Ozs7Ozs7O3VCQWQwQixlQUFlIiwiZmlsZSI6ImZsb3ctdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2FzeW5jRXhlY3V0ZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5cbi8qKlxuICogU3RhcnQgdGhlIGZsb3cgc2VydmVyIGluIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5LCBwcm9qZWN0UGF0aC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Rmxvd1NlcnZlcihwcm9qZWN0UGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGF3YWl0IGFzeW5jRXhlY3V0ZSgnZmxvdycsIFtwcm9qZWN0UGF0aF0pO1xufVxuXG4vKipcbiAqIFN0b3AgdGhlIGZsb3cgc2VydmVyIGluIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5LCBwcm9qZWN0UGF0aC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0b3BGbG93U2VydmVyKHByb2plY3RQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgYXdhaXQgYXN5bmNFeGVjdXRlKCdmbG93JywgWydzdG9wJywgcHJvamVjdFBhdGhdKTtcbn1cbiJdfQ==