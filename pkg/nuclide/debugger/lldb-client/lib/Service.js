var getProcessInfoList = _asyncToGenerator(function* () {
  var _require = require('./LldbDebuggerProcessInfo');

  var LldbDebuggerProcessInfo = _require.LldbDebuggerProcessInfo;

  // TODO: Currently first local dir only.
  var remoteUri = require('../../../remote-uri');
  var localDirectory = atom.project.getDirectories().filter(function (directory) {
    return remoteUri.isLocal(directory.getPath());
  })[0];

  if (!localDirectory) {
    return [];
  }

  var localService = require('../../../client').getServiceByNuclideUri('LLDBDebuggerRpcService', localDirectory.getPath());
  var targetInfoList = yield localService.getAttachTargetInfoList();

  var processes = [];
  for (var targetInfo of targetInfoList) {
    processes.push(new LldbDebuggerProcessInfo(localDirectory.getPath(), targetInfo));
  }
  return processes;
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {
  name: 'lldb',
  getProcessInfoList: getProcessInfoList
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBYWUsa0JBQWtCLHFCQUFqQyxhQUF5RTtpQkFDckMsT0FBTyxDQUFDLDJCQUEyQixDQUFDOztNQUEvRCx1QkFBdUIsWUFBdkIsdUJBQXVCOzs7QUFFOUIsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDakQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FDakQsTUFBTSxDQUFDLFVBQUEsU0FBUztXQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVsRSxNQUFJLENBQUMsY0FBYyxFQUFFO0FBQ25CLFdBQU8sRUFBRSxDQUFDO0dBQ1g7O0FBRUQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQzNDLHNCQUFzQixDQUFDLHdCQUF3QixFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQy9FLE1BQU0sY0FBYyxHQUFHLE1BQU0sWUFBWSxDQUFDLHVCQUF1QixFQUFFLENBQUM7O0FBRXBFLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNyQixPQUFLLElBQU0sVUFBVSxJQUFJLGNBQWMsRUFBRTtBQUN2QyxhQUFTLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQXVCLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7R0FDbkY7QUFDRCxTQUFPLFNBQVMsQ0FBQztDQUNsQjs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLE1BQUksRUFBRSxNQUFNO0FBQ1osb0JBQWtCLEVBQWxCLGtCQUFrQjtDQUNuQixDQUFDIiwiZmlsZSI6IlNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vYXRvbSc7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFByb2Nlc3NJbmZvTGlzdCgpOiBQcm9taXNlPEFycmF5PERlYnVnZ2VyUHJvY2Vzc0luZm8+PiB7XG4gIGNvbnN0IHtMbGRiRGVidWdnZXJQcm9jZXNzSW5mb30gPSByZXF1aXJlKCcuL0xsZGJEZWJ1Z2dlclByb2Nlc3NJbmZvJyk7XG4gIC8vIFRPRE86IEN1cnJlbnRseSBmaXJzdCBsb2NhbCBkaXIgb25seS5cbiAgY29uc3QgcmVtb3RlVXJpID0gcmVxdWlyZSgnLi4vLi4vLi4vcmVtb3RlLXVyaScpO1xuICBjb25zdCBsb2NhbERpcmVjdG9yeSA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgLmZpbHRlcihkaXJlY3RvcnkgPT4gcmVtb3RlVXJpLmlzTG9jYWwoZGlyZWN0b3J5LmdldFBhdGgoKSkpWzBdO1xuXG4gIGlmICghbG9jYWxEaXJlY3RvcnkpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBsb2NhbFNlcnZpY2UgPSByZXF1aXJlKCcuLi8uLi8uLi9jbGllbnQnKS5cbiAgICAgIGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0xMREJEZWJ1Z2dlclJwY1NlcnZpY2UnLCBsb2NhbERpcmVjdG9yeS5nZXRQYXRoKCkpO1xuICBjb25zdCB0YXJnZXRJbmZvTGlzdCA9IGF3YWl0IGxvY2FsU2VydmljZS5nZXRBdHRhY2hUYXJnZXRJbmZvTGlzdCgpO1xuXG4gIGNvbnN0IHByb2Nlc3NlcyA9IFtdO1xuICBmb3IgKGNvbnN0IHRhcmdldEluZm8gb2YgdGFyZ2V0SW5mb0xpc3QpIHtcbiAgICBwcm9jZXNzZXMucHVzaChuZXcgTGxkYkRlYnVnZ2VyUHJvY2Vzc0luZm8obG9jYWxEaXJlY3RvcnkuZ2V0UGF0aCgpLCB0YXJnZXRJbmZvKSk7XG4gIH1cbiAgcmV0dXJuIHByb2Nlc3Nlcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5hbWU6ICdsbGRiJyxcbiAgZ2V0UHJvY2Vzc0luZm9MaXN0LFxufTtcbiJdfQ==