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
    var ProcessInfo = require('./ProcessInfo');
    return [new ProcessInfo(remoteDirectoryPath)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBaUJlLGtCQUFrQixxQkFBakMsYUFDeUQ7QUFDdkQsS0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7O0FBRWpDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUVqRCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQ3RELEdBQUcsQ0FBQyxVQUFBLGFBQWE7V0FBSSxhQUFhLENBQUMsT0FBTyxFQUFFO0dBQUEsQ0FBQyxDQUM3QyxNQUFNLENBQUMsVUFBQSxhQUFhO1dBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7R0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWpFLE1BQUksbUJBQW1CLEVBQUU7QUFDdkIsUUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzdDLFdBQU8sQ0FBRSxJQUFJLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUF3QyxDQUFDO0dBQ3ZGLE1BQU07QUFDTCxPQUFHLENBQUMsMENBQTBDLENBQUMsQ0FBQztBQUNoRCxXQUFPLEVBQUUsQ0FBQztHQUNYO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7O3FCQXBCaUIsU0FBUzs7OztJQUNwQixHQUFHLHNCQUFILEdBQUc7O0FBcUJWLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixNQUFJLEVBQUUsTUFBTTtBQUNaLG9CQUFrQixFQUFsQixrQkFBa0I7Q0FDbkIsQ0FBQyIsImZpbGUiOiJTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge251Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJQcm9jZXNzSW5mbyx9XG4gICAgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zZXJ2aWNlJztcblxuaW1wb3J0IHV0aWxzIGZyb20gJy4vdXRpbHMnO1xuY29uc3Qge2xvZ30gPSB1dGlscztcblxuYXN5bmMgZnVuY3Rpb24gZ2V0UHJvY2Vzc0luZm9MaXN0KCk6XG4gICAgUHJvbWlzZTxBcnJheTxudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VyUHJvY2Vzc0luZm8+PiB7XG4gIGxvZygnR2V0dGluZyBwcm9jZXNzIGluZm8gbGlzdCcpO1xuXG4gIGNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uLy4uL3JlbW90ZS11cmknKTtcbiAgLy8gVE9ETzogQ3VycmVudGx5IGZpcnN0IHJlbW90ZSBkaXIgb25seS5cbiAgY29uc3QgcmVtb3RlRGlyZWN0b3J5UGF0aCA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgLm1hcChkaXJlY3RvcnlQYXRoID0+IGRpcmVjdG9yeVBhdGguZ2V0UGF0aCgpKVxuICAgIC5maWx0ZXIoZGlyZWN0b3J5UGF0aCA9PiByZW1vdGVVcmkuaXNSZW1vdGUoZGlyZWN0b3J5UGF0aCkpWzBdO1xuXG4gIGlmIChyZW1vdGVEaXJlY3RvcnlQYXRoKSB7XG4gICAgY29uc3QgUHJvY2Vzc0luZm8gPSByZXF1aXJlKCcuL1Byb2Nlc3NJbmZvJyk7XG4gICAgcmV0dXJuIFsobmV3IFByb2Nlc3NJbmZvKHJlbW90ZURpcmVjdG9yeVBhdGgpOiBudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VyUHJvY2Vzc0luZm8pXTtcbiAgfSBlbHNlIHtcbiAgICBsb2coJ05vIHJlbW90ZSBkaXJzIGdldHRpbmcgcHJvY2VzcyBpbmZvIGxpc3QnKTtcbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5hbWU6ICdoaHZtJyxcbiAgZ2V0UHJvY2Vzc0luZm9MaXN0LFxufTtcbiJdfQ==