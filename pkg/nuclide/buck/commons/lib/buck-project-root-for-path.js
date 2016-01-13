

/**
 * @return Promise that resolves to buck project or null if the
 *     specified filePath is not part of a Buck project.
 */

var buckProjectRootForPath = _asyncToGenerator(function* (filePath) {
  var service = (0, _client.getServiceByNuclideUri)('BuckUtils', filePath);
  var buckUtils = new service.BuckUtils();
  var directory = yield buckUtils.getBuckProjectRoot(filePath);

  if (!directory) {
    return null;
  }

  var buckProject = buckProjectForBuckProjectDirectory[directory];
  if (buckProject) {
    return buckProject;
  }

  directory = getPath(directory);

  var buckService = (0, _client.getServiceByNuclideUri)('BuckProject', filePath);
  if (buckService) {
    buckProject = new buckService.BuckProject({ rootPath: directory });
    buckProjectForBuckProjectDirectory[directory] = buckProject;
  }
  return buckProject;
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _client = require('../../../client');

var _require = require('../../../remote-uri');

var getPath = _require.getPath;

var buckProjectForBuckProjectDirectory = {};

module.exports = buckProjectRootForPath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1Y2stcHJvamVjdC1yb290LWZvci1wYXRoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7SUFxQmUsc0JBQXNCLHFCQUFyQyxXQUFzQyxRQUFnQixFQUF5QjtBQUM3RSxNQUFNLE9BQU8sR0FBRyxvQ0FBdUIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzlELE1BQU0sU0FBUyxHQUFHLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzFDLE1BQUksU0FBUyxHQUFHLE1BQU0sU0FBUyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUU3RCxNQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2QsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxNQUFJLFdBQVcsR0FBRyxrQ0FBa0MsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoRSxNQUFJLFdBQVcsRUFBRTtBQUNmLFdBQU8sV0FBVyxDQUFDO0dBQ3BCOztBQUVELFdBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sV0FBVyxHQUFHLG9DQUF1QixhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDcEUsTUFBSSxXQUFXLEVBQUU7QUFDZixlQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLEVBQUMsUUFBUSxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7QUFDakUsc0NBQWtDLENBQUMsU0FBUyxDQUFDLEdBQUcsV0FBVyxDQUFDO0dBQzdEO0FBQ0QsU0FBTyxXQUFXLENBQUM7Q0FDcEI7Ozs7Ozs7Ozs7OztzQkFoQ29DLGlCQUFpQjs7ZUFFcEMsT0FBTyxDQUFDLHFCQUFxQixDQUFDOztJQUF6QyxPQUFPLFlBQVAsT0FBTzs7QUFFZCxJQUFNLGtDQUEwRCxHQUFHLEVBQUUsQ0FBQzs7QUE4QnRFLE1BQU0sQ0FBQyxPQUFPLEdBQUcsc0JBQXNCLENBQUMiLCJmaWxlIjoiYnVjay1wcm9qZWN0LXJvb3QtZm9yLXBhdGguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uLy4uL2NsaWVudCc7XG5pbXBvcnQgdHlwZSB7QnVja1Byb2plY3R9IGZyb20gJy4uLy4uL2Jhc2UvbGliL0J1Y2tQcm9qZWN0JztcbmNvbnN0IHtnZXRQYXRofSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcblxuY29uc3QgYnVja1Byb2plY3RGb3JCdWNrUHJvamVjdERpcmVjdG9yeToge1trZXk6IHN0cmluZ106IG1peGVkfSA9IHt9O1xuXG4vKipcbiAqIEByZXR1cm4gUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGJ1Y2sgcHJvamVjdCBvciBudWxsIGlmIHRoZVxuICogICAgIHNwZWNpZmllZCBmaWxlUGF0aCBpcyBub3QgcGFydCBvZiBhIEJ1Y2sgcHJvamVjdC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gYnVja1Byb2plY3RSb290Rm9yUGF0aChmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTw/QnVja1Byb2plY3Q+IHtcbiAgY29uc3Qgc2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0J1Y2tVdGlscycsIGZpbGVQYXRoKTtcbiAgY29uc3QgYnVja1V0aWxzID0gbmV3IHNlcnZpY2UuQnVja1V0aWxzKCk7XG4gIGxldCBkaXJlY3RvcnkgPSBhd2FpdCBidWNrVXRpbHMuZ2V0QnVja1Byb2plY3RSb290KGZpbGVQYXRoKTtcblxuICBpZiAoIWRpcmVjdG9yeSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbGV0IGJ1Y2tQcm9qZWN0ID0gYnVja1Byb2plY3RGb3JCdWNrUHJvamVjdERpcmVjdG9yeVtkaXJlY3RvcnldO1xuICBpZiAoYnVja1Byb2plY3QpIHtcbiAgICByZXR1cm4gYnVja1Byb2plY3Q7XG4gIH1cblxuICBkaXJlY3RvcnkgPSBnZXRQYXRoKGRpcmVjdG9yeSk7XG5cbiAgY29uc3QgYnVja1NlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdCdWNrUHJvamVjdCcsIGZpbGVQYXRoKTtcbiAgaWYgKGJ1Y2tTZXJ2aWNlKSB7XG4gICAgYnVja1Byb2plY3QgPSBuZXcgYnVja1NlcnZpY2UuQnVja1Byb2plY3Qoe3Jvb3RQYXRoOiBkaXJlY3Rvcnl9KTtcbiAgICBidWNrUHJvamVjdEZvckJ1Y2tQcm9qZWN0RGlyZWN0b3J5W2RpcmVjdG9yeV0gPSBidWNrUHJvamVjdDtcbiAgfVxuICByZXR1cm4gYnVja1Byb2plY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYnVja1Byb2plY3RSb290Rm9yUGF0aDtcbiJdfQ==