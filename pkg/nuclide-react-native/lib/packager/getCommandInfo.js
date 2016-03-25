Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Get the command that will run the packager server based on the current workspace.
 * TODO: We need to have a solid concept of an "active project" that's consistent across Nuclide
 *       (i.e. where we should look for commands like this) and use that here. The current behavior
 *       of everything having its own algorithm is bad.
 */

var getCommandInfo = _asyncToGenerator(function* () {
  var localDirectories = atom.project.getDirectories().map(function (dir) {
    return dir.getPath();
  }).filter(function (uri) {
    return !RemoteUri.isRemote(uri);
  });

  for (var dir of localDirectories) {
    var commandInfo = yield getCommandFromNodePackage(dir); // eslint-disable-line babel/no-await-in-loop
    if (commandInfo != null) {
      return commandInfo;
    }
  }

  for (var dir of localDirectories) {
    var commandInfo = yield getCommandFromBuck(dir); // eslint-disable-line babel/no-await-in-loop
    if (commandInfo != null) {
      return commandInfo;
    }
  }
});

exports.getCommandInfo = getCommandInfo;

var getCommandFromNodePackage = _asyncToGenerator(function* (dir) {
  var projectRoot = yield findNearestFile('package.json', dir);
  if (projectRoot == null) {
    return null;
  }
  var filePath = _path2['default'].join(projectRoot, 'package.json');
  var content = yield _nuclideCommons.fsPromise.readFile(filePath);
  var parsed = JSON.parse(content);
  var isReactNative = parsed.dependencies && parsed.dependencies['react-native'];
  if (!isReactNative) {
    return null;
  }

  // TODO(matthewwithanm): In the future, agree on a specifically named scripts field in
  // package.json and use that?
  var packagerScriptPath = _path2['default'].join(projectRoot, 'node_modules', 'react-native', 'packager', 'packager.sh');
  var packagerScriptExists = yield _nuclideCommons.fsPromise.exists(packagerScriptPath);

  if (!packagerScriptExists) {
    return null;
  }

  return {
    cwd: projectRoot,
    command: packagerScriptPath
  };
});

var getCommandFromBuck = _asyncToGenerator(function* (dir) {
  var buckUtils = new _nuclideBuckBaseLibBuckUtils.BuckUtils();
  var projectRoot = yield buckUtils.getBuckProjectRoot(dir);
  if (projectRoot == null) {
    return null;
  }

  // TODO(matthewwithanm): Move this to BuckUtils?
  var filePath = _path2['default'].join(projectRoot, '.buckConfig');
  var content = yield _nuclideCommons.fsPromise.readFile(filePath);
  var parsed = _ini2['default'].parse('scope = global\n' + content);
  var section = parsed['react-native'];
  if (section == null || section.server == null) {
    return null;
  }
  return {
    cwd: projectRoot,
    command: section.server
  };
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _nuclideCommons = require('../../../nuclide-commons');

var _nuclideRemoteUri = require('../../../nuclide-remote-uri');

var RemoteUri = _interopRequireWildcard(_nuclideRemoteUri);

var _ini = require('ini');

var _ini2 = _interopRequireDefault(_ini);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nuclideBuckBaseLibBuckUtils = require('../../../nuclide-buck-base/lib/BuckUtils');

var findNearestFile = _nuclideCommons.fsPromise.findNearestFile;
//# sourceMappingURL=data:application/json;base64,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QUksT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUU7QUFDN0MsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELFNBQU87QUFDTCxPQUFHLEVBQUUsV0FBVztBQUNoQixXQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU07R0FDeEIsQ0FBQztDQUNIOzs7Ozs7Ozs4QkFuRnVCLDBCQUEwQjs7Z0NBQ3ZCLDZCQUE2Qjs7SUFBNUMsU0FBUzs7bUJBQ0wsS0FBSzs7OztvQkFDSixNQUFNOzs7OzJDQUNDLDBDQUEwQzs7SUFFM0QsZUFBZSw2QkFBZixlQUFlIiwiZmlsZSI6ImdldENvbW1hbmRJbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NvbW1hbmRJbmZvfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtmc1Byb21pc2V9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgKiBhcyBSZW1vdGVVcmkgZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCBpbmkgZnJvbSAnaW5pJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtCdWNrVXRpbHN9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtYnVjay1iYXNlL2xpYi9CdWNrVXRpbHMnO1xuXG5jb25zdCB7ZmluZE5lYXJlc3RGaWxlfSA9IGZzUHJvbWlzZTtcblxuLyoqXG4gKiBHZXQgdGhlIGNvbW1hbmQgdGhhdCB3aWxsIHJ1biB0aGUgcGFja2FnZXIgc2VydmVyIGJhc2VkIG9uIHRoZSBjdXJyZW50IHdvcmtzcGFjZS5cbiAqIFRPRE86IFdlIG5lZWQgdG8gaGF2ZSBhIHNvbGlkIGNvbmNlcHQgb2YgYW4gXCJhY3RpdmUgcHJvamVjdFwiIHRoYXQncyBjb25zaXN0ZW50IGFjcm9zcyBOdWNsaWRlXG4gKiAgICAgICAoaS5lLiB3aGVyZSB3ZSBzaG91bGQgbG9vayBmb3IgY29tbWFuZHMgbGlrZSB0aGlzKSBhbmQgdXNlIHRoYXQgaGVyZS4gVGhlIGN1cnJlbnQgYmVoYXZpb3JcbiAqICAgICAgIG9mIGV2ZXJ5dGhpbmcgaGF2aW5nIGl0cyBvd24gYWxnb3JpdGhtIGlzIGJhZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENvbW1hbmRJbmZvKCk6IFByb21pc2U8P0NvbW1hbmRJbmZvPiB7XG4gIGNvbnN0IGxvY2FsRGlyZWN0b3JpZXMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgIC5tYXAoZGlyID0+IGRpci5nZXRQYXRoKCkpXG4gICAgLmZpbHRlcih1cmkgPT4gIVJlbW90ZVVyaS5pc1JlbW90ZSh1cmkpKTtcblxuICBmb3IgKGNvbnN0IGRpciBvZiBsb2NhbERpcmVjdG9yaWVzKSB7XG4gICAgY29uc3QgY29tbWFuZEluZm8gPVxuICAgICAgYXdhaXQgZ2V0Q29tbWFuZEZyb21Ob2RlUGFja2FnZShkaXIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhYmVsL25vLWF3YWl0LWluLWxvb3BcbiAgICBpZiAoY29tbWFuZEluZm8gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGNvbW1hbmRJbmZvO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgZGlyIG9mIGxvY2FsRGlyZWN0b3JpZXMpIHtcbiAgICBjb25zdCBjb21tYW5kSW5mbyA9IGF3YWl0IGdldENvbW1hbmRGcm9tQnVjayhkaXIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhYmVsL25vLWF3YWl0LWluLWxvb3BcbiAgICBpZiAoY29tbWFuZEluZm8gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGNvbW1hbmRJbmZvO1xuICAgIH1cbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRDb21tYW5kRnJvbU5vZGVQYWNrYWdlKGRpcjogc3RyaW5nKTogUHJvbWlzZTw/Q29tbWFuZEluZm8+IHtcbiAgY29uc3QgcHJvamVjdFJvb3QgPSBhd2FpdCBmaW5kTmVhcmVzdEZpbGUoJ3BhY2thZ2UuanNvbicsIGRpcik7XG4gIGlmIChwcm9qZWN0Um9vdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFJvb3QsICdwYWNrYWdlLmpzb24nKTtcbiAgY29uc3QgY29udGVudCA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkRmlsZShmaWxlUGF0aCk7XG4gIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoY29udGVudCk7XG4gIGNvbnN0IGlzUmVhY3ROYXRpdmUgPSBwYXJzZWQuZGVwZW5kZW5jaWVzICYmIHBhcnNlZC5kZXBlbmRlbmNpZXNbJ3JlYWN0LW5hdGl2ZSddO1xuICBpZiAoIWlzUmVhY3ROYXRpdmUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFRPRE8obWF0dGhld3dpdGhhbm0pOiBJbiB0aGUgZnV0dXJlLCBhZ3JlZSBvbiBhIHNwZWNpZmljYWxseSBuYW1lZCBzY3JpcHRzIGZpZWxkIGluXG4gIC8vIHBhY2thZ2UuanNvbiBhbmQgdXNlIHRoYXQ/XG4gIGNvbnN0IHBhY2thZ2VyU2NyaXB0UGF0aCA9XG4gICAgcGF0aC5qb2luKHByb2plY3RSb290LCAnbm9kZV9tb2R1bGVzJywgJ3JlYWN0LW5hdGl2ZScsICdwYWNrYWdlcicsICdwYWNrYWdlci5zaCcpO1xuICBjb25zdCBwYWNrYWdlclNjcmlwdEV4aXN0cyA9IGF3YWl0IGZzUHJvbWlzZS5leGlzdHMocGFja2FnZXJTY3JpcHRQYXRoKTtcblxuICBpZiAoIXBhY2thZ2VyU2NyaXB0RXhpc3RzKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGN3ZDogcHJvamVjdFJvb3QsXG4gICAgY29tbWFuZDogcGFja2FnZXJTY3JpcHRQYXRoLFxuICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRDb21tYW5kRnJvbUJ1Y2soZGlyOiBzdHJpbmcpOiBQcm9taXNlPD9Db21tYW5kSW5mbz4ge1xuICBjb25zdCBidWNrVXRpbHMgPSBuZXcgQnVja1V0aWxzKCk7XG4gIGNvbnN0IHByb2plY3RSb290ID0gYXdhaXQgYnVja1V0aWxzLmdldEJ1Y2tQcm9qZWN0Um9vdChkaXIpO1xuICBpZiAocHJvamVjdFJvb3QgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gVE9ETyhtYXR0aGV3d2l0aGFubSk6IE1vdmUgdGhpcyB0byBCdWNrVXRpbHM/XG4gIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHByb2plY3RSb290LCAnLmJ1Y2tDb25maWcnKTtcbiAgY29uc3QgY29udGVudCA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkRmlsZShmaWxlUGF0aCk7XG4gIGNvbnN0IHBhcnNlZCA9IGluaS5wYXJzZShgc2NvcGUgPSBnbG9iYWxcXG4ke2NvbnRlbnR9YCk7XG4gIGNvbnN0IHNlY3Rpb24gPSBwYXJzZWRbJ3JlYWN0LW5hdGl2ZSddO1xuICBpZiAoc2VjdGlvbiA9PSBudWxsIHx8IHNlY3Rpb24uc2VydmVyID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge1xuICAgIGN3ZDogcHJvamVjdFJvb3QsXG4gICAgY29tbWFuZDogc2VjdGlvbi5zZXJ2ZXIsXG4gIH07XG59XG4iXX0=