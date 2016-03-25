var getProcessInfoList = _asyncToGenerator(function* () {
  var _require = require('./AttachProcessInfo');

  var AttachProcessInfo = _require.AttachProcessInfo;

  // TODO: Currently first local dir only.
  var remoteUri = require('../../nuclide-remote-uri');
  var localDirectory = atom.project.getDirectories().filter(function (directory) {
    return remoteUri.isLocal(directory.getPath());
  })[0];

  if (!localDirectory) {
    return [];
  }

  var _require2 = require('../../nuclide-client');

  var getServiceByNuclideUri = _require2.getServiceByNuclideUri;

  var localService = getServiceByNuclideUri('LLDBDebuggerRpcService', localDirectory.getPath());
  (0, _assert2['default'])(localService);
  var targetInfoList = yield localService.getAttachTargetInfoList();

  var processes = [];
  for (var targetInfo of targetInfoList) {
    processes.push(new AttachProcessInfo(localDirectory.getPath(), targetInfo));
  }
  return processes;
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

module.exports = {
  name: 'lldb',
  getProcessInfoList: getProcessInfoList
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBZWUsa0JBQWtCLHFCQUFqQyxhQUF5RTtpQkFDM0MsT0FBTyxDQUFDLHFCQUFxQixDQUFDOztNQUFuRCxpQkFBaUIsWUFBakIsaUJBQWlCOzs7QUFFeEIsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDdEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FDakQsTUFBTSxDQUFDLFVBQUEsU0FBUztXQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVsRSxNQUFJLENBQUMsY0FBYyxFQUFFO0FBQ25CLFdBQU8sRUFBRSxDQUFDO0dBQ1g7O2tCQUVnQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7O01BQXpELHNCQUFzQixhQUF0QixzQkFBc0I7O0FBQzdCLE1BQU0sWUFBWSxHQUFHLHNCQUFzQixDQUFDLHdCQUF3QixFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ2hHLDJCQUFVLFlBQVksQ0FBQyxDQUFDO0FBQ3hCLE1BQU0sY0FBYyxHQUFHLE1BQU0sWUFBWSxDQUFDLHVCQUF1QixFQUFFLENBQUM7O0FBRXBFLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixPQUFLLElBQU0sVUFBVSxJQUFJLGNBQWMsRUFBRTtBQUN2QyxhQUFTLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7R0FDN0U7QUFDRCxTQUFPLFNBQVMsQ0FBQztDQUNsQjs7Ozs7Ozs7Ozs7Ozs7c0JBdkJxQixRQUFROzs7O0FBeUI5QixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsTUFBSSxFQUFFLE1BQU07QUFDWixvQkFBa0IsRUFBbEIsa0JBQWtCO0NBQ25CLENBQUMiLCJmaWxlIjoiU2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEZWJ1Z2dlclByb2Nlc3NJbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWF0b20nO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFByb2Nlc3NJbmZvTGlzdCgpOiBQcm9taXNlPEFycmF5PERlYnVnZ2VyUHJvY2Vzc0luZm8+PiB7XG4gIGNvbnN0IHtBdHRhY2hQcm9jZXNzSW5mb30gPSByZXF1aXJlKCcuL0F0dGFjaFByb2Nlc3NJbmZvJyk7XG4gIC8vIFRPRE86IEN1cnJlbnRseSBmaXJzdCBsb2NhbCBkaXIgb25seS5cbiAgY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJyk7XG4gIGNvbnN0IGxvY2FsRGlyZWN0b3J5ID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClcbiAgICAuZmlsdGVyKGRpcmVjdG9yeSA9PiByZW1vdGVVcmkuaXNMb2NhbChkaXJlY3RvcnkuZ2V0UGF0aCgpKSlbMF07XG5cbiAgaWYgKCFsb2NhbERpcmVjdG9yeSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGNvbnN0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY2xpZW50Jyk7XG4gIGNvbnN0IGxvY2FsU2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0xMREJEZWJ1Z2dlclJwY1NlcnZpY2UnLCBsb2NhbERpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICBpbnZhcmlhbnQobG9jYWxTZXJ2aWNlKTtcbiAgY29uc3QgdGFyZ2V0SW5mb0xpc3QgPSBhd2FpdCBsb2NhbFNlcnZpY2UuZ2V0QXR0YWNoVGFyZ2V0SW5mb0xpc3QoKTtcblxuICBjb25zdCBwcm9jZXNzZXMgPSBbXTtcbiAgZm9yIChjb25zdCB0YXJnZXRJbmZvIG9mIHRhcmdldEluZm9MaXN0KSB7XG4gICAgcHJvY2Vzc2VzLnB1c2gobmV3IEF0dGFjaFByb2Nlc3NJbmZvKGxvY2FsRGlyZWN0b3J5LmdldFBhdGgoKSwgdGFyZ2V0SW5mbykpO1xuICB9XG4gIHJldHVybiBwcm9jZXNzZXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBuYW1lOiAnbGxkYicsXG4gIGdldFByb2Nlc3NJbmZvTGlzdCxcbn07XG4iXX0=