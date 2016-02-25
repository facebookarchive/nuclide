var getProcessInfoList = _asyncToGenerator(function* () {
  var _require = require('./AttachProcessInfo');

  var AttachProcessInfo = _require.AttachProcessInfo;

  // TODO: Currently first local dir only.
  var remoteUri = require('../../../remote-uri');
  var localDirectory = atom.project.getDirectories().filter(function (directory) {
    return remoteUri.isLocal(directory.getPath());
  })[0];

  if (!localDirectory) {
    return [];
  }

  var _require2 = require('../../../client');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBZWUsa0JBQWtCLHFCQUFqQyxhQUF5RTtpQkFDM0MsT0FBTyxDQUFDLHFCQUFxQixDQUFDOztNQUFuRCxpQkFBaUIsWUFBakIsaUJBQWlCOzs7QUFFeEIsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDakQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FDakQsTUFBTSxDQUFDLFVBQUEsU0FBUztXQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVsRSxNQUFJLENBQUMsY0FBYyxFQUFFO0FBQ25CLFdBQU8sRUFBRSxDQUFDO0dBQ1g7O2tCQUVnQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7O01BQXBELHNCQUFzQixhQUF0QixzQkFBc0I7O0FBQzdCLE1BQU0sWUFBWSxHQUFHLHNCQUFzQixDQUFDLHdCQUF3QixFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ2hHLDJCQUFVLFlBQVksQ0FBQyxDQUFDO0FBQ3hCLE1BQU0sY0FBYyxHQUFHLE1BQU0sWUFBWSxDQUFDLHVCQUF1QixFQUFFLENBQUM7O0FBRXBFLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixPQUFLLElBQU0sVUFBVSxJQUFJLGNBQWMsRUFBRTtBQUN2QyxhQUFTLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7R0FDN0U7QUFDRCxTQUFPLFNBQVMsQ0FBQztDQUNsQjs7Ozs7Ozs7Ozs7Ozs7c0JBdkJxQixRQUFROzs7O0FBeUI5QixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsTUFBSSxFQUFFLE1BQU07QUFDWixvQkFBa0IsRUFBbEIsa0JBQWtCO0NBQ25CLENBQUMiLCJmaWxlIjoiU2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEZWJ1Z2dlclByb2Nlc3NJbmZvfSBmcm9tICcuLi8uLi9hdG9tJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRQcm9jZXNzSW5mb0xpc3QoKTogUHJvbWlzZTxBcnJheTxEZWJ1Z2dlclByb2Nlc3NJbmZvPj4ge1xuICBjb25zdCB7QXR0YWNoUHJvY2Vzc0luZm99ID0gcmVxdWlyZSgnLi9BdHRhY2hQcm9jZXNzSW5mbycpO1xuICAvLyBUT0RPOiBDdXJyZW50bHkgZmlyc3QgbG9jYWwgZGlyIG9ubHkuXG4gIGNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbiAgY29uc3QgbG9jYWxEaXJlY3RvcnkgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgIC5maWx0ZXIoZGlyZWN0b3J5ID0+IHJlbW90ZVVyaS5pc0xvY2FsKGRpcmVjdG9yeS5nZXRQYXRoKCkpKVswXTtcblxuICBpZiAoIWxvY2FsRGlyZWN0b3J5KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3Qge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY2xpZW50Jyk7XG4gIGNvbnN0IGxvY2FsU2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0xMREJEZWJ1Z2dlclJwY1NlcnZpY2UnLCBsb2NhbERpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICBpbnZhcmlhbnQobG9jYWxTZXJ2aWNlKTtcbiAgY29uc3QgdGFyZ2V0SW5mb0xpc3QgPSBhd2FpdCBsb2NhbFNlcnZpY2UuZ2V0QXR0YWNoVGFyZ2V0SW5mb0xpc3QoKTtcblxuICBjb25zdCBwcm9jZXNzZXMgPSBbXTtcbiAgZm9yIChjb25zdCB0YXJnZXRJbmZvIG9mIHRhcmdldEluZm9MaXN0KSB7XG4gICAgcHJvY2Vzc2VzLnB1c2gobmV3IEF0dGFjaFByb2Nlc3NJbmZvKGxvY2FsRGlyZWN0b3J5LmdldFBhdGgoKSwgdGFyZ2V0SW5mbykpO1xuICB9XG4gIHJldHVybiBwcm9jZXNzZXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBuYW1lOiAnbGxkYicsXG4gIGdldFByb2Nlc3NJbmZvTGlzdCxcbn07XG4iXX0=