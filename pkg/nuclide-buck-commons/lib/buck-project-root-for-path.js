

/**
 * @return Promise that resolves to buck project or null if the
 *     specified filePath is not part of a Buck project.
 */

var buckProjectRootForPath = _asyncToGenerator(function* (filePath) {
  var service = (0, _nuclideClient.getServiceByNuclideUri)('BuckUtils', filePath);
  (0, _assert2['default'])(service);
  var buckUtils = new service.BuckUtils();
  var directory = yield buckUtils.getBuckProjectRoot(filePath);

  if (!directory) {
    return null;
  }

  var buckProject = buckProjectForBuckProjectDirectory[directory];
  if (buckProject) {
    return buckProject;
  }

  directory = (0, _nuclideRemoteUri.getPath)(directory);

  var buckService = (0, _nuclideClient.getServiceByNuclideUri)('BuckProject', filePath);
  if (buckService) {
    buckProject = new buckService.BuckProject({ rootPath: directory });
    buckProjectForBuckProjectDirectory[directory] = buckProject;
  }
  return buckProject;
});

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

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideClient = require('../../nuclide-client');

var buckProjectForBuckProjectDirectory = {};

module.exports = buckProjectRootForPath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1Y2stcHJvamVjdC1yb290LWZvci1wYXRoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7SUF5QmUsc0JBQXNCLHFCQUFyQyxXQUFzQyxRQUFnQixFQUF5QjtBQUM3RSxNQUFNLE9BQTBCLEdBQUcsMkNBQXVCLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNqRiwyQkFBVSxPQUFPLENBQUMsQ0FBQztBQUNuQixNQUFNLFNBQVMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMxQyxNQUFJLFNBQVMsR0FBRyxNQUFNLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFN0QsTUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNkLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsTUFBSSxXQUFXLEdBQUcsa0NBQWtDLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEUsTUFBSSxXQUFXLEVBQUU7QUFDZixXQUFPLFdBQVcsQ0FBQztHQUNwQjs7QUFFRCxXQUFTLEdBQUcsK0JBQVEsU0FBUyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sV0FBZ0MsR0FBRywyQ0FBdUIsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3pGLE1BQUksV0FBVyxFQUFFO0FBQ2YsZUFBVyxHQUFHLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDO0FBQ2pFLHNDQUFrQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztHQUM3RDtBQUNELFNBQU8sV0FBVyxDQUFDO0NBQ3BCOzs7Ozs7Ozs7Ozs7OztzQkFqQ3FCLFFBQVE7Ozs7Z0NBQ1IsMEJBQTBCOzs2QkFDWCxzQkFBc0I7O0FBRTNELElBQU0sa0NBQWdFLEdBQUcsRUFBRSxDQUFDOztBQStCNUUsTUFBTSxDQUFDLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQyIsImZpbGUiOiJidWNrLXByb2plY3Qtcm9vdC1mb3ItcGF0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdWNrUHJvamVjdH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1idWNrLWJhc2UvbGliL0J1Y2tQcm9qZWN0JztcbmltcG9ydCB0eXBlb2YgKiBhcyBCdWNrVXRpbHNTZXJ2aWNlIGZyb20gJy4uLy4uL251Y2xpZGUtYnVjay1iYXNlL2xpYi9CdWNrVXRpbHMnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEJ1Y2tQcm9qZWN0U2VydmljZSBmcm9tICcuLi8uLi9udWNsaWRlLWJ1Y2stYmFzZS9saWIvQnVja1Byb2plY3QnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2dldFBhdGh9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtY2xpZW50JztcblxuY29uc3QgYnVja1Byb2plY3RGb3JCdWNrUHJvamVjdERpcmVjdG9yeToge1trZXk6IHN0cmluZ106IEJ1Y2tQcm9qZWN0fSA9IHt9O1xuXG4vKipcbiAqIEByZXR1cm4gUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGJ1Y2sgcHJvamVjdCBvciBudWxsIGlmIHRoZVxuICogICAgIHNwZWNpZmllZCBmaWxlUGF0aCBpcyBub3QgcGFydCBvZiBhIEJ1Y2sgcHJvamVjdC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gYnVja1Byb2plY3RSb290Rm9yUGF0aChmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTw/QnVja1Byb2plY3Q+IHtcbiAgY29uc3Qgc2VydmljZTogP0J1Y2tVdGlsc1NlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdCdWNrVXRpbHMnLCBmaWxlUGF0aCk7XG4gIGludmFyaWFudChzZXJ2aWNlKTtcbiAgY29uc3QgYnVja1V0aWxzID0gbmV3IHNlcnZpY2UuQnVja1V0aWxzKCk7XG4gIGxldCBkaXJlY3RvcnkgPSBhd2FpdCBidWNrVXRpbHMuZ2V0QnVja1Byb2plY3RSb290KGZpbGVQYXRoKTtcblxuICBpZiAoIWRpcmVjdG9yeSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgbGV0IGJ1Y2tQcm9qZWN0ID0gYnVja1Byb2plY3RGb3JCdWNrUHJvamVjdERpcmVjdG9yeVtkaXJlY3RvcnldO1xuICBpZiAoYnVja1Byb2plY3QpIHtcbiAgICByZXR1cm4gYnVja1Byb2plY3Q7XG4gIH1cblxuICBkaXJlY3RvcnkgPSBnZXRQYXRoKGRpcmVjdG9yeSk7XG5cbiAgY29uc3QgYnVja1NlcnZpY2U6ID9CdWNrUHJvamVjdFNlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdCdWNrUHJvamVjdCcsIGZpbGVQYXRoKTtcbiAgaWYgKGJ1Y2tTZXJ2aWNlKSB7XG4gICAgYnVja1Byb2plY3QgPSBuZXcgYnVja1NlcnZpY2UuQnVja1Byb2plY3Qoe3Jvb3RQYXRoOiBkaXJlY3Rvcnl9KTtcbiAgICBidWNrUHJvamVjdEZvckJ1Y2tQcm9qZWN0RGlyZWN0b3J5W2RpcmVjdG9yeV0gPSBidWNrUHJvamVjdDtcbiAgfVxuICByZXR1cm4gYnVja1Byb2plY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYnVja1Byb2plY3RSb290Rm9yUGF0aDtcbiJdfQ==