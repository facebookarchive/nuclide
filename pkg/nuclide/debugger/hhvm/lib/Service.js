var getProcessInfoList = _asyncToGenerator(function* () {
  log('Getting process info list');

  var remoteUri = require('../../../remote-uri');
  // TODO: Currently first remote dir only.
  var remoteDirectoryPath = atom.project.getDirectories().map(function (directoryPath) {
    return directoryPath.getPath();
  }).filter(function (directoryPath) {
    return remoteUri.isRemote(directoryPath);
  })[0];

  if (remoteDirectoryPath) {
    var _require = require('./HhvmDebuggerProcessInfo');

    var HhvmDebuggerProcessInfo = _require.HhvmDebuggerProcessInfo;

    return [new HhvmDebuggerProcessInfo(remoteDirectoryPath)];
  } else {
    log('No remote dirs getting process info list');
    return [];
  }
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

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var log = _utils2['default'].log;

module.exports = {
  name: 'hhvm',
  getProcessInfoList: getProcessInfoList
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBZ0JlLGtCQUFrQixxQkFBakMsYUFBeUU7QUFDdkUsS0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7O0FBRWpDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUVqRCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQ3RELEdBQUcsQ0FBQyxVQUFBLGFBQWE7V0FBSSxhQUFhLENBQUMsT0FBTyxFQUFFO0dBQUEsQ0FBQyxDQUM3QyxNQUFNLENBQUMsVUFBQSxhQUFhO1dBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7R0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWpFLE1BQUksbUJBQW1CLEVBQUU7bUJBQ1csT0FBTyxDQUFDLDJCQUEyQixDQUFDOztRQUEvRCx1QkFBdUIsWUFBdkIsdUJBQXVCOztBQUM5QixXQUFPLENBQUUsSUFBSSx1QkFBdUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUF1QixDQUFDO0dBQ2xGLE1BQU07QUFDTCxPQUFHLENBQUMsMENBQTBDLENBQUMsQ0FBQztBQUNoRCxXQUFPLEVBQUUsQ0FBQztHQUNYO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7O3FCQXJCaUIsU0FBUzs7OztJQUNwQixHQUFHLHNCQUFILEdBQUc7O0FBc0JWLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixNQUFJLEVBQUUsTUFBTTtBQUNaLG9CQUFrQixFQUFsQixrQkFBa0I7Q0FDbkIsQ0FBQyIsImZpbGUiOiJTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHV0aWxzIGZyb20gJy4vdXRpbHMnO1xuY29uc3Qge2xvZ30gPSB1dGlscztcblxuaW1wb3J0IHR5cGUge0RlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uL2F0b20nO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRQcm9jZXNzSW5mb0xpc3QoKTogUHJvbWlzZTxBcnJheTxEZWJ1Z2dlclByb2Nlc3NJbmZvPj4ge1xuICBsb2coJ0dldHRpbmcgcHJvY2VzcyBpbmZvIGxpc3QnKTtcblxuICBjb25zdCByZW1vdGVVcmkgPSByZXF1aXJlKCcuLi8uLi8uLi9yZW1vdGUtdXJpJyk7XG4gIC8vIFRPRE86IEN1cnJlbnRseSBmaXJzdCByZW1vdGUgZGlyIG9ubHkuXG4gIGNvbnN0IHJlbW90ZURpcmVjdG9yeVBhdGggPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgIC5tYXAoZGlyZWN0b3J5UGF0aCA9PiBkaXJlY3RvcnlQYXRoLmdldFBhdGgoKSlcbiAgICAuZmlsdGVyKGRpcmVjdG9yeVBhdGggPT4gcmVtb3RlVXJpLmlzUmVtb3RlKGRpcmVjdG9yeVBhdGgpKVswXTtcblxuICBpZiAocmVtb3RlRGlyZWN0b3J5UGF0aCkge1xuICAgIGNvbnN0IHtIaHZtRGVidWdnZXJQcm9jZXNzSW5mb30gPSByZXF1aXJlKCcuL0hodm1EZWJ1Z2dlclByb2Nlc3NJbmZvJyk7XG4gICAgcmV0dXJuIFsobmV3IEhodm1EZWJ1Z2dlclByb2Nlc3NJbmZvKHJlbW90ZURpcmVjdG9yeVBhdGgpOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKV07XG4gIH0gZWxzZSB7XG4gICAgbG9nKCdObyByZW1vdGUgZGlycyBnZXR0aW5nIHByb2Nlc3MgaW5mbyBsaXN0Jyk7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBuYW1lOiAnaGh2bScsXG4gIGdldFByb2Nlc3NJbmZvTGlzdCxcbn07XG4iXX0=