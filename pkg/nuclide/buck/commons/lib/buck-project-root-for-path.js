

/**
 * @return Promise that resolves to buck project or null if the
 *     specified filePath is not part of a Buck project.
 */

var buckProjectRootForPath = _asyncToGenerator(function* (filePath) {
  var service = (0, _client.getServiceByNuclideUri)('BuckUtils', filePath);
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

  directory = (0, _remoteUri.getPath)(directory);

  var buckService = (0, _client.getServiceByNuclideUri)('BuckProject', filePath);
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

var _remoteUri = require('../../../remote-uri');

var _client = require('../../../client');

var buckProjectForBuckProjectDirectory = {};

module.exports = buckProjectRootForPath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1Y2stcHJvamVjdC1yb290LWZvci1wYXRoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7SUF5QmUsc0JBQXNCLHFCQUFyQyxXQUFzQyxRQUFnQixFQUF5QjtBQUM3RSxNQUFNLE9BQTBCLEdBQUcsb0NBQXVCLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNqRiwyQkFBVSxPQUFPLENBQUMsQ0FBQztBQUNuQixNQUFNLFNBQVMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMxQyxNQUFJLFNBQVMsR0FBRyxNQUFNLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFN0QsTUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNkLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsTUFBSSxXQUFXLEdBQUcsa0NBQWtDLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEUsTUFBSSxXQUFXLEVBQUU7QUFDZixXQUFPLFdBQVcsQ0FBQztHQUNwQjs7QUFFRCxXQUFTLEdBQUcsd0JBQVEsU0FBUyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sV0FBZ0MsR0FBRyxvQ0FBdUIsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3pGLE1BQUksV0FBVyxFQUFFO0FBQ2YsZUFBVyxHQUFHLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDO0FBQ2pFLHNDQUFrQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztHQUM3RDtBQUNELFNBQU8sV0FBVyxDQUFDO0NBQ3BCOzs7Ozs7Ozs7Ozs7OztzQkFqQ3FCLFFBQVE7Ozs7eUJBQ1IscUJBQXFCOztzQkFDTixpQkFBaUI7O0FBRXRELElBQU0sa0NBQWdFLEdBQUcsRUFBRSxDQUFDOztBQStCNUUsTUFBTSxDQUFDLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQyIsImZpbGUiOiJidWNrLXByb2plY3Qtcm9vdC1mb3ItcGF0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdWNrUHJvamVjdH0gZnJvbSAnLi4vLi4vYmFzZS9saWIvQnVja1Byb2plY3QnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEJ1Y2tVdGlsc1NlcnZpY2UgZnJvbSAnLi4vLi4vYmFzZS9saWIvQnVja1V0aWxzJztcbmltcG9ydCB0eXBlb2YgKiBhcyBCdWNrUHJvamVjdFNlcnZpY2UgZnJvbSAnLi4vLi4vYmFzZS9saWIvQnVja1Byb2plY3QnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2dldFBhdGh9IGZyb20gJy4uLy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi8uLi9jbGllbnQnO1xuXG5jb25zdCBidWNrUHJvamVjdEZvckJ1Y2tQcm9qZWN0RGlyZWN0b3J5OiB7W2tleTogc3RyaW5nXTogQnVja1Byb2plY3R9ID0ge307XG5cbi8qKlxuICogQHJldHVybiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYnVjayBwcm9qZWN0IG9yIG51bGwgaWYgdGhlXG4gKiAgICAgc3BlY2lmaWVkIGZpbGVQYXRoIGlzIG5vdCBwYXJ0IG9mIGEgQnVjayBwcm9qZWN0LlxuICovXG5hc3luYyBmdW5jdGlvbiBidWNrUHJvamVjdFJvb3RGb3JQYXRoKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPD9CdWNrUHJvamVjdD4ge1xuICBjb25zdCBzZXJ2aWNlOiA/QnVja1V0aWxzU2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0J1Y2tVdGlscycsIGZpbGVQYXRoKTtcbiAgaW52YXJpYW50KHNlcnZpY2UpO1xuICBjb25zdCBidWNrVXRpbHMgPSBuZXcgc2VydmljZS5CdWNrVXRpbHMoKTtcbiAgbGV0IGRpcmVjdG9yeSA9IGF3YWl0IGJ1Y2tVdGlscy5nZXRCdWNrUHJvamVjdFJvb3QoZmlsZVBhdGgpO1xuXG4gIGlmICghZGlyZWN0b3J5KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZXQgYnVja1Byb2plY3QgPSBidWNrUHJvamVjdEZvckJ1Y2tQcm9qZWN0RGlyZWN0b3J5W2RpcmVjdG9yeV07XG4gIGlmIChidWNrUHJvamVjdCkge1xuICAgIHJldHVybiBidWNrUHJvamVjdDtcbiAgfVxuXG4gIGRpcmVjdG9yeSA9IGdldFBhdGgoZGlyZWN0b3J5KTtcblxuICBjb25zdCBidWNrU2VydmljZTogP0J1Y2tQcm9qZWN0U2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0J1Y2tQcm9qZWN0JywgZmlsZVBhdGgpO1xuICBpZiAoYnVja1NlcnZpY2UpIHtcbiAgICBidWNrUHJvamVjdCA9IG5ldyBidWNrU2VydmljZS5CdWNrUHJvamVjdCh7cm9vdFBhdGg6IGRpcmVjdG9yeX0pO1xuICAgIGJ1Y2tQcm9qZWN0Rm9yQnVja1Byb2plY3REaXJlY3RvcnlbZGlyZWN0b3J5XSA9IGJ1Y2tQcm9qZWN0O1xuICB9XG4gIHJldHVybiBidWNrUHJvamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBidWNrUHJvamVjdFJvb3RGb3JQYXRoO1xuIl19