var getProcessInfoList = _asyncToGenerator(function* () {
  var _require = require('./ProcessInfo');

  var ProcessInfo = _require.ProcessInfo;

  // TODO: Currently first dir only.
  var debuggerServices = atom.project.getDirectories().map(function (directory) {
    return require('../../../client').getServiceByNuclideUri('LLDBDebuggerRpcService', directory.getPath());
  });

  // TODO: currently first dir only
  var targetUri = atom.project.getDirectories()[0].getPath();

  var processes = [];
  yield Promise.all(debuggerServices.map(_asyncToGenerator(function* (service) {
    var targetInfoList = yield service.getAttachTargetInfoList();
    for (var targetInfo of targetInfoList) {
      processes.push(new ProcessInfo(targetUri, targetInfo));
    }
  })));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBY2Usa0JBQWtCLHFCQUFqQyxhQUN5RDtpQkFDakMsT0FBTyxDQUFDLGVBQWUsQ0FBQzs7TUFBdkMsV0FBVyxZQUFYLFdBQVc7OztBQUVsQixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsU0FBUyxFQUFJO0FBQ3RFLFdBQU8sT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQy9CLHNCQUFzQixDQUFDLHdCQUF3QixFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0dBQ3pFLENBQUMsQ0FBQzs7O0FBR0gsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFN0QsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFFBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLG1CQUFDLFdBQU8sT0FBTyxFQUFLO0FBQ3hELFFBQU0sY0FBYyxHQUFHLE1BQU0sT0FBTyxDQUFDLHVCQUF1QixFQUFFLENBQUM7QUFDL0QsU0FBSyxJQUFNLFVBQVUsSUFBSSxjQUFjLEVBQUU7QUFDdkMsZUFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztLQUN4RDtHQUNGLEVBQUMsQ0FBQyxDQUFDO0FBQ0osU0FBTyxTQUFTLENBQUM7Q0FDbEI7Ozs7Ozs7Ozs7OztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixNQUFJLEVBQUUsTUFBTTtBQUNaLG9CQUFrQixFQUFsQixrQkFBa0I7Q0FDbkIsQ0FBQyIsImZpbGUiOiJTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge251Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJQcm9jZXNzSW5mbyx9XG4gICAgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zZXJ2aWNlJztcblxuYXN5bmMgZnVuY3Rpb24gZ2V0UHJvY2Vzc0luZm9MaXN0KCk6XG4gICAgUHJvbWlzZTxBcnJheTxudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VyUHJvY2Vzc0luZm8+PiB7XG4gIGNvbnN0IHtQcm9jZXNzSW5mb30gPSByZXF1aXJlKCcuL1Byb2Nlc3NJbmZvJyk7XG4gIC8vIFRPRE86IEN1cnJlbnRseSBmaXJzdCBkaXIgb25seS5cbiAgY29uc3QgZGVidWdnZXJTZXJ2aWNlcyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLm1hcChkaXJlY3RvcnkgPT4ge1xuICAgIHJldHVybiByZXF1aXJlKCcuLi8uLi8uLi9jbGllbnQnKS5cbiAgICAgIGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0xMREJEZWJ1Z2dlclJwY1NlcnZpY2UnLCBkaXJlY3RvcnkuZ2V0UGF0aCgpKTtcbiAgfSk7XG5cbiAgLy8gVE9ETzogY3VycmVudGx5IGZpcnN0IGRpciBvbmx5XG4gIGNvbnN0IHRhcmdldFVyaSA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdLmdldFBhdGgoKTtcblxuICBjb25zdCBwcm9jZXNzZXMgPSBbXTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwoZGVidWdnZXJTZXJ2aWNlcy5tYXAoYXN5bmMgKHNlcnZpY2UpID0+IHtcbiAgICBjb25zdCB0YXJnZXRJbmZvTGlzdCA9IGF3YWl0IHNlcnZpY2UuZ2V0QXR0YWNoVGFyZ2V0SW5mb0xpc3QoKTtcbiAgICBmb3IgKGNvbnN0IHRhcmdldEluZm8gb2YgdGFyZ2V0SW5mb0xpc3QpIHtcbiAgICAgIHByb2Nlc3Nlcy5wdXNoKG5ldyBQcm9jZXNzSW5mbyh0YXJnZXRVcmksIHRhcmdldEluZm8pKTtcbiAgICB9XG4gIH0pKTtcbiAgcmV0dXJuIHByb2Nlc3Nlcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5hbWU6ICdsbGRiJyxcbiAgZ2V0UHJvY2Vzc0luZm9MaXN0LFxufTtcbiJdfQ==