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
  return (yield getCommandFromNodeModules(dir)) || (yield getCommandFromReactNative(dir));
}

/**
 * Look in the nearest node_modules directory for react-native and extract the packager script if
 * it's found.
 */
);

var getCommandFromNodeModules = _asyncToGenerator(function* (dir) {
  var nodeModulesParent = yield findNearestFile('node_modules', dir);
  if (nodeModulesParent == null) {
    return null;
  }
  var packagerScriptPath = _path2['default'].join(nodeModulesParent, 'node_modules', 'react-native', 'packager', 'packager.sh');
  var packagerScriptExists = yield _nuclideCommons.fsPromise.exists(packagerScriptPath);
  if (!packagerScriptExists) {
    return null;
  }
  return {
    cwd: nodeModulesParent,
    command: packagerScriptPath
  };
}

/**
 * See if this is React Native itself and, if so, return the command to run the packager. This is
 * special cased so that the bundled examples work out of the box.
 */
);

var getCommandFromReactNative = _asyncToGenerator(function* (dir) {
  var projectRoot = yield findNearestFile('package.json', dir);
  if (projectRoot == null) {
    return null;
  }
  var filePath = _path2['default'].join(projectRoot, 'package.json');
  var content = yield _nuclideCommons.fsPromise.readFile(filePath);
  var parsed = JSON.parse(content);
  var isReactNative = parsed.name === 'react-native';

  if (!isReactNative) {
    return null;
  }

  var packagerScriptPath = _path2['default'].join(projectRoot, 'packager', 'packager.sh');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdldENvbW1hbmRJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUEyQnNCLGNBQWMscUJBQTdCLGFBQXVEO0FBQzVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FDbkQsR0FBRyxDQUFDLFVBQUEsR0FBRztXQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUU7R0FBQSxDQUFDLENBQ3pCLE1BQU0sQ0FBQyxVQUFBLEdBQUc7V0FBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO0dBQUEsQ0FBQyxDQUFDOztBQUUzQyxPQUFLLElBQU0sR0FBRyxJQUFJLGdCQUFnQixFQUFFO0FBQ2xDLFFBQU0sV0FBVyxHQUNmLE1BQU0seUJBQXlCLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkMsUUFBSSxXQUFXLElBQUksSUFBSSxFQUFFO0FBQ3ZCLGFBQU8sV0FBVyxDQUFDO0tBQ3BCO0dBQ0Y7O0FBRUQsT0FBSyxJQUFNLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRTtBQUNsQyxRQUFNLFdBQVcsR0FBRyxNQUFNLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xELFFBQUksV0FBVyxJQUFJLElBQUksRUFBRTtBQUN2QixhQUFPLFdBQVcsQ0FBQztLQUNwQjtHQUNGO0NBQ0Y7Ozs7SUFFYyx5QkFBeUIscUJBQXhDLFdBQXlDLEdBQVcsRUFBeUI7QUFDM0UsU0FBTyxDQUFDLE1BQU0seUJBQXlCLENBQUMsR0FBRyxDQUFDLENBQUEsS0FBTSxNQUFNLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQztDQUN6Rjs7Ozs7Ozs7SUFNYyx5QkFBeUIscUJBQXhDLFdBQXlDLEdBQVcsRUFBeUI7QUFDM0UsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLGVBQWUsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDckUsTUFBSSxpQkFBaUIsSUFBSSxJQUFJLEVBQUU7QUFDN0IsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELE1BQU0sa0JBQWtCLEdBQ3RCLGtCQUFLLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUMxRixNQUFNLG9CQUFvQixHQUFHLE1BQU0sMEJBQVUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDeEUsTUFBSSxDQUFDLG9CQUFvQixFQUFFO0FBQ3pCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxTQUFPO0FBQ0wsT0FBRyxFQUFFLGlCQUFpQjtBQUN0QixXQUFPLEVBQUUsa0JBQWtCO0dBQzVCLENBQUM7Q0FDSDs7Ozs7Ozs7SUFNYyx5QkFBeUIscUJBQXhDLFdBQXlDLEdBQVcsRUFBeUI7QUFDM0UsTUFBTSxXQUFXLEdBQUcsTUFBTSxlQUFlLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQy9ELE1BQUksV0FBVyxJQUFJLElBQUksRUFBRTtBQUN2QixXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsTUFBTSxRQUFRLEdBQUcsa0JBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUN4RCxNQUFNLE9BQU8sR0FBRyxNQUFNLDBCQUFVLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNuRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25DLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEtBQUssY0FBYyxDQUFDOztBQUVyRCxNQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsTUFBTSxrQkFBa0IsR0FBRyxrQkFBSyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUM3RSxNQUFNLG9CQUFvQixHQUFHLE1BQU0sMEJBQVUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDeEUsTUFBSSxDQUFDLG9CQUFvQixFQUFFO0FBQ3pCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsU0FBTztBQUNMLE9BQUcsRUFBRSxXQUFXO0FBQ2hCLFdBQU8sRUFBRSxrQkFBa0I7R0FDNUIsQ0FBQztDQUNIOztJQUVjLGtCQUFrQixxQkFBakMsV0FBa0MsR0FBVyxFQUF5QjtBQUNwRSxNQUFNLFNBQVMsR0FBRyw0Q0FBZSxDQUFDO0FBQ2xDLE1BQU0sV0FBVyxHQUFHLE1BQU0sU0FBUyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVELE1BQUksV0FBVyxJQUFJLElBQUksRUFBRTtBQUN2QixXQUFPLElBQUksQ0FBQztHQUNiOzs7QUFHRCxNQUFNLFFBQVEsR0FBRyxrQkFBSyxJQUFJLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sT0FBTyxHQUFHLE1BQU0sMEJBQVUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sTUFBTSxHQUFHLGlCQUFJLEtBQUssc0JBQW9CLE9BQU8sQ0FBRyxDQUFDO0FBQ3ZELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN2QyxNQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUU7QUFDN0MsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELFNBQU87QUFDTCxPQUFHLEVBQUUsV0FBVztBQUNoQixXQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU07R0FDeEIsQ0FBQztDQUNIOzs7Ozs7Ozs4QkE3R3VCLDBCQUEwQjs7Z0NBQ3ZCLDZCQUE2Qjs7SUFBNUMsU0FBUzs7bUJBQ0wsS0FBSzs7OztvQkFDSixNQUFNOzs7OzJDQUNDLDBDQUEwQzs7SUFFM0QsZUFBZSw2QkFBZixlQUFlIiwiZmlsZSI6ImdldENvbW1hbmRJbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0NvbW1hbmRJbmZvfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtmc1Byb21pc2V9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgKiBhcyBSZW1vdGVVcmkgZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCBpbmkgZnJvbSAnaW5pJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtCdWNrVXRpbHN9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtYnVjay1iYXNlL2xpYi9CdWNrVXRpbHMnO1xuXG5jb25zdCB7ZmluZE5lYXJlc3RGaWxlfSA9IGZzUHJvbWlzZTtcblxuLyoqXG4gKiBHZXQgdGhlIGNvbW1hbmQgdGhhdCB3aWxsIHJ1biB0aGUgcGFja2FnZXIgc2VydmVyIGJhc2VkIG9uIHRoZSBjdXJyZW50IHdvcmtzcGFjZS5cbiAqIFRPRE86IFdlIG5lZWQgdG8gaGF2ZSBhIHNvbGlkIGNvbmNlcHQgb2YgYW4gXCJhY3RpdmUgcHJvamVjdFwiIHRoYXQncyBjb25zaXN0ZW50IGFjcm9zcyBOdWNsaWRlXG4gKiAgICAgICAoaS5lLiB3aGVyZSB3ZSBzaG91bGQgbG9vayBmb3IgY29tbWFuZHMgbGlrZSB0aGlzKSBhbmQgdXNlIHRoYXQgaGVyZS4gVGhlIGN1cnJlbnQgYmVoYXZpb3JcbiAqICAgICAgIG9mIGV2ZXJ5dGhpbmcgaGF2aW5nIGl0cyBvd24gYWxnb3JpdGhtIGlzIGJhZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENvbW1hbmRJbmZvKCk6IFByb21pc2U8P0NvbW1hbmRJbmZvPiB7XG4gIGNvbnN0IGxvY2FsRGlyZWN0b3JpZXMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgIC5tYXAoZGlyID0+IGRpci5nZXRQYXRoKCkpXG4gICAgLmZpbHRlcih1cmkgPT4gIVJlbW90ZVVyaS5pc1JlbW90ZSh1cmkpKTtcblxuICBmb3IgKGNvbnN0IGRpciBvZiBsb2NhbERpcmVjdG9yaWVzKSB7XG4gICAgY29uc3QgY29tbWFuZEluZm8gPVxuICAgICAgYXdhaXQgZ2V0Q29tbWFuZEZyb21Ob2RlUGFja2FnZShkaXIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhYmVsL25vLWF3YWl0LWluLWxvb3BcbiAgICBpZiAoY29tbWFuZEluZm8gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGNvbW1hbmRJbmZvO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgZGlyIG9mIGxvY2FsRGlyZWN0b3JpZXMpIHtcbiAgICBjb25zdCBjb21tYW5kSW5mbyA9IGF3YWl0IGdldENvbW1hbmRGcm9tQnVjayhkaXIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhYmVsL25vLWF3YWl0LWluLWxvb3BcbiAgICBpZiAoY29tbWFuZEluZm8gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGNvbW1hbmRJbmZvO1xuICAgIH1cbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRDb21tYW5kRnJvbU5vZGVQYWNrYWdlKGRpcjogc3RyaW5nKTogUHJvbWlzZTw/Q29tbWFuZEluZm8+IHtcbiAgcmV0dXJuIChhd2FpdCBnZXRDb21tYW5kRnJvbU5vZGVNb2R1bGVzKGRpcikpIHx8IChhd2FpdCBnZXRDb21tYW5kRnJvbVJlYWN0TmF0aXZlKGRpcikpO1xufVxuXG4vKipcbiAqIExvb2sgaW4gdGhlIG5lYXJlc3Qgbm9kZV9tb2R1bGVzIGRpcmVjdG9yeSBmb3IgcmVhY3QtbmF0aXZlIGFuZCBleHRyYWN0IHRoZSBwYWNrYWdlciBzY3JpcHQgaWZcbiAqIGl0J3MgZm91bmQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldENvbW1hbmRGcm9tTm9kZU1vZHVsZXMoZGlyOiBzdHJpbmcpOiBQcm9taXNlPD9Db21tYW5kSW5mbz4ge1xuICBjb25zdCBub2RlTW9kdWxlc1BhcmVudCA9IGF3YWl0IGZpbmROZWFyZXN0RmlsZSgnbm9kZV9tb2R1bGVzJywgZGlyKTtcbiAgaWYgKG5vZGVNb2R1bGVzUGFyZW50ID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBwYWNrYWdlclNjcmlwdFBhdGggPVxuICAgIHBhdGguam9pbihub2RlTW9kdWxlc1BhcmVudCwgJ25vZGVfbW9kdWxlcycsICdyZWFjdC1uYXRpdmUnLCAncGFja2FnZXInLCAncGFja2FnZXIuc2gnKTtcbiAgY29uc3QgcGFja2FnZXJTY3JpcHRFeGlzdHMgPSBhd2FpdCBmc1Byb21pc2UuZXhpc3RzKHBhY2thZ2VyU2NyaXB0UGF0aCk7XG4gIGlmICghcGFja2FnZXJTY3JpcHRFeGlzdHMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge1xuICAgIGN3ZDogbm9kZU1vZHVsZXNQYXJlbnQsXG4gICAgY29tbWFuZDogcGFja2FnZXJTY3JpcHRQYXRoLFxuICB9O1xufVxuXG4vKipcbiAqIFNlZSBpZiB0aGlzIGlzIFJlYWN0IE5hdGl2ZSBpdHNlbGYgYW5kLCBpZiBzbywgcmV0dXJuIHRoZSBjb21tYW5kIHRvIHJ1biB0aGUgcGFja2FnZXIuIFRoaXMgaXNcbiAqIHNwZWNpYWwgY2FzZWQgc28gdGhhdCB0aGUgYnVuZGxlZCBleGFtcGxlcyB3b3JrIG91dCBvZiB0aGUgYm94LlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRDb21tYW5kRnJvbVJlYWN0TmF0aXZlKGRpcjogc3RyaW5nKTogUHJvbWlzZTw/Q29tbWFuZEluZm8+IHtcbiAgY29uc3QgcHJvamVjdFJvb3QgPSBhd2FpdCBmaW5kTmVhcmVzdEZpbGUoJ3BhY2thZ2UuanNvbicsIGRpcik7XG4gIGlmIChwcm9qZWN0Um9vdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFJvb3QsICdwYWNrYWdlLmpzb24nKTtcbiAgY29uc3QgY29udGVudCA9IGF3YWl0IGZzUHJvbWlzZS5yZWFkRmlsZShmaWxlUGF0aCk7XG4gIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoY29udGVudCk7XG4gIGNvbnN0IGlzUmVhY3ROYXRpdmUgPSBwYXJzZWQubmFtZSA9PT0gJ3JlYWN0LW5hdGl2ZSc7XG5cbiAgaWYgKCFpc1JlYWN0TmF0aXZlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBwYWNrYWdlclNjcmlwdFBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFJvb3QsICdwYWNrYWdlcicsICdwYWNrYWdlci5zaCcpO1xuICBjb25zdCBwYWNrYWdlclNjcmlwdEV4aXN0cyA9IGF3YWl0IGZzUHJvbWlzZS5leGlzdHMocGFja2FnZXJTY3JpcHRQYXRoKTtcbiAgaWYgKCFwYWNrYWdlclNjcmlwdEV4aXN0cykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjd2Q6IHByb2plY3RSb290LFxuICAgIGNvbW1hbmQ6IHBhY2thZ2VyU2NyaXB0UGF0aCxcbiAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0Q29tbWFuZEZyb21CdWNrKGRpcjogc3RyaW5nKTogUHJvbWlzZTw/Q29tbWFuZEluZm8+IHtcbiAgY29uc3QgYnVja1V0aWxzID0gbmV3IEJ1Y2tVdGlscygpO1xuICBjb25zdCBwcm9qZWN0Um9vdCA9IGF3YWl0IGJ1Y2tVdGlscy5nZXRCdWNrUHJvamVjdFJvb3QoZGlyKTtcbiAgaWYgKHByb2plY3RSb290ID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFRPRE8obWF0dGhld3dpdGhhbm0pOiBNb3ZlIHRoaXMgdG8gQnVja1V0aWxzP1xuICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihwcm9qZWN0Um9vdCwgJy5idWNrQ29uZmlnJyk7XG4gIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmc1Byb21pc2UucmVhZEZpbGUoZmlsZVBhdGgpO1xuICBjb25zdCBwYXJzZWQgPSBpbmkucGFyc2UoYHNjb3BlID0gZ2xvYmFsXFxuJHtjb250ZW50fWApO1xuICBjb25zdCBzZWN0aW9uID0gcGFyc2VkWydyZWFjdC1uYXRpdmUnXTtcbiAgaWYgKHNlY3Rpb24gPT0gbnVsbCB8fCBzZWN0aW9uLnNlcnZlciA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBjd2Q6IHByb2plY3RSb290LFxuICAgIGNvbW1hbmQ6IHNlY3Rpb24uc2VydmVyLFxuICB9O1xufVxuIl19