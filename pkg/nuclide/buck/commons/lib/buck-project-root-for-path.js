

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1Y2stcHJvamVjdC1yb290LWZvci1wYXRoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7SUF3QmUsc0JBQXNCLHFCQUFyQyxXQUFzQyxRQUFnQixFQUF5QjtBQUM3RSxNQUFNLE9BQXlCLEdBQUcsb0NBQXVCLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNoRixNQUFNLFNBQVMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMxQyxNQUFJLFNBQVMsR0FBRyxNQUFNLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFN0QsTUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNkLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsTUFBSSxXQUFXLEdBQUcsa0NBQWtDLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEUsTUFBSSxXQUFXLEVBQUU7QUFDZixXQUFPLFdBQVcsQ0FBQztHQUNwQjs7QUFFRCxXQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUvQixNQUFNLFdBQStCLEdBQUcsb0NBQXVCLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN4RixNQUFJLFdBQVcsRUFBRTtBQUNmLGVBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztBQUNqRSxzQ0FBa0MsQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFXLENBQUM7R0FDN0Q7QUFDRCxTQUFPLFdBQVcsQ0FBQztDQUNwQjs7Ozs7Ozs7Ozs7O3NCQW5Db0MsaUJBQWlCOztlQUVwQyxPQUFPLENBQUMscUJBQXFCLENBQUM7O0lBQXpDLE9BQU8sWUFBUCxPQUFPOztBQUtkLElBQU0sa0NBQWdFLEdBQUcsRUFBRSxDQUFDOztBQThCNUUsTUFBTSxDQUFDLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQyIsImZpbGUiOiJidWNrLXByb2plY3Qtcm9vdC1mb3ItcGF0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vY2xpZW50JztcbmltcG9ydCB0eXBlIHtCdWNrUHJvamVjdH0gZnJvbSAnLi4vLi4vYmFzZS9saWIvQnVja1Byb2plY3QnO1xuY29uc3Qge2dldFBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vLi4vcmVtb3RlLXVyaScpO1xuXG5pbXBvcnQgdHlwZW9mICogYXMgQnVja1V0aWxzU2VydmljZSBmcm9tICcuLi8uLi9iYXNlL2xpYi9CdWNrVXRpbHMnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEJ1Y2tQcm9qZWN0U2VydmljZSBmcm9tICcuLi8uLi9iYXNlL2xpYi9CdWNrUHJvamVjdCc7XG5cbmNvbnN0IGJ1Y2tQcm9qZWN0Rm9yQnVja1Byb2plY3REaXJlY3Rvcnk6IHtba2V5OiBzdHJpbmddOiBCdWNrUHJvamVjdH0gPSB7fTtcblxuLyoqXG4gKiBAcmV0dXJuIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBidWNrIHByb2plY3Qgb3IgbnVsbCBpZiB0aGVcbiAqICAgICBzcGVjaWZpZWQgZmlsZVBhdGggaXMgbm90IHBhcnQgb2YgYSBCdWNrIHByb2plY3QuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGJ1Y2tQcm9qZWN0Um9vdEZvclBhdGgoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8P0J1Y2tQcm9qZWN0PiB7XG4gIGNvbnN0IHNlcnZpY2U6IEJ1Y2tVdGlsc1NlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdCdWNrVXRpbHMnLCBmaWxlUGF0aCk7XG4gIGNvbnN0IGJ1Y2tVdGlscyA9IG5ldyBzZXJ2aWNlLkJ1Y2tVdGlscygpO1xuICBsZXQgZGlyZWN0b3J5ID0gYXdhaXQgYnVja1V0aWxzLmdldEJ1Y2tQcm9qZWN0Um9vdChmaWxlUGF0aCk7XG5cbiAgaWYgKCFkaXJlY3RvcnkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBidWNrUHJvamVjdCA9IGJ1Y2tQcm9qZWN0Rm9yQnVja1Byb2plY3REaXJlY3RvcnlbZGlyZWN0b3J5XTtcbiAgaWYgKGJ1Y2tQcm9qZWN0KSB7XG4gICAgcmV0dXJuIGJ1Y2tQcm9qZWN0O1xuICB9XG5cbiAgZGlyZWN0b3J5ID0gZ2V0UGF0aChkaXJlY3RvcnkpO1xuXG4gIGNvbnN0IGJ1Y2tTZXJ2aWNlOiBCdWNrUHJvamVjdFNlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdCdWNrUHJvamVjdCcsIGZpbGVQYXRoKTtcbiAgaWYgKGJ1Y2tTZXJ2aWNlKSB7XG4gICAgYnVja1Byb2plY3QgPSBuZXcgYnVja1NlcnZpY2UuQnVja1Byb2plY3Qoe3Jvb3RQYXRoOiBkaXJlY3Rvcnl9KTtcbiAgICBidWNrUHJvamVjdEZvckJ1Y2tQcm9qZWN0RGlyZWN0b3J5W2RpcmVjdG9yeV0gPSBidWNrUHJvamVjdDtcbiAgfVxuICByZXR1cm4gYnVja1Byb2plY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYnVja1Byb2plY3RSb290Rm9yUGF0aDtcbiJdfQ==