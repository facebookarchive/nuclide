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
  var content = yield _commons.fsPromise.readFile(filePath);
  var parsed = JSON.parse(content);
  var isReactNative = parsed.dependencies && parsed.dependencies['react-native'];
  if (!isReactNative) {
    return null;
  }

  // TODO(matthewwithanm): In the future, agree on a specifically named scripts field in
  // package.json and use that?
  var packagerScriptPath = _path2['default'].join(projectRoot, 'node_modules', 'react-native', 'packager', 'packager.sh');
  var packagerScriptExists = yield _commons.fsPromise.exists(packagerScriptPath);

  if (!packagerScriptExists) {
    return null;
  }

  return {
    cwd: projectRoot,
    command: packagerScriptPath
  };
});

var getCommandFromBuck = _asyncToGenerator(function* (dir) {
  var buckUtils = new _buckBaseLibBuckUtils.BuckUtils();
  var projectRoot = yield buckUtils.getBuckProjectRoot(dir);
  if (projectRoot == null) {
    return null;
  }

  // TODO(matthewwithanm): Move this to BuckUtils?
  var filePath = _path2['default'].join(projectRoot, '.buckConfig');
  var content = yield _commons.fsPromise.readFile(filePath);
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

var _commons = require('../../../commons');

var _remoteUri = require('../../../remote-uri');

var RemoteUri = _interopRequireWildcard(_remoteUri);

var _ini = require('ini');

var _ini2 = _interopRequireDefault(_ini);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _buckBaseLibBuckUtils = require('../../../buck/base/lib/BuckUtils');

var findNearestFile = _commons.fsPromise.findNearestFile;
//# sourceMappingURL=data:application/json;base64,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QUksT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUU7QUFDN0MsV0FBTyxJQUFJLENBQUM7R0FDYjtBQUNELFNBQU87QUFDTCxPQUFHLEVBQUUsV0FBVztBQUNoQixXQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU07R0FDeEIsQ0FBQztDQUNIOzs7Ozs7Ozt1QkFuRnVCLGtCQUFrQjs7eUJBQ2YscUJBQXFCOztJQUFwQyxTQUFTOzttQkFDTCxLQUFLOzs7O29CQUNKLE1BQU07Ozs7b0NBQ0Msa0NBQWtDOztJQUVuRCxlQUFlLHNCQUFmLGVBQWUiLCJmaWxlIjoiZ2V0Q29tbWFuZEluZm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Q29tbWFuZEluZm99IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge2ZzUHJvbWlzZX0gZnJvbSAnLi4vLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgKiBhcyBSZW1vdGVVcmkgZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgaW5pIGZyb20gJ2luaSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7QnVja1V0aWxzfSBmcm9tICcuLi8uLi8uLi9idWNrL2Jhc2UvbGliL0J1Y2tVdGlscyc7XG5cbmNvbnN0IHtmaW5kTmVhcmVzdEZpbGV9ID0gZnNQcm9taXNlO1xuXG4vKipcbiAqIEdldCB0aGUgY29tbWFuZCB0aGF0IHdpbGwgcnVuIHRoZSBwYWNrYWdlciBzZXJ2ZXIgYmFzZWQgb24gdGhlIGN1cnJlbnQgd29ya3NwYWNlLlxuICogVE9ETzogV2UgbmVlZCB0byBoYXZlIGEgc29saWQgY29uY2VwdCBvZiBhbiBcImFjdGl2ZSBwcm9qZWN0XCIgdGhhdCdzIGNvbnNpc3RlbnQgYWNyb3NzIE51Y2xpZGVcbiAqICAgICAgIChpLmUuIHdoZXJlIHdlIHNob3VsZCBsb29rIGZvciBjb21tYW5kcyBsaWtlIHRoaXMpIGFuZCB1c2UgdGhhdCBoZXJlLiBUaGUgY3VycmVudCBiZWhhdmlvclxuICogICAgICAgb2YgZXZlcnl0aGluZyBoYXZpbmcgaXRzIG93biBhbGdvcml0aG0gaXMgYmFkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q29tbWFuZEluZm8oKTogUHJvbWlzZTw/Q29tbWFuZEluZm8+IHtcbiAgY29uc3QgbG9jYWxEaXJlY3RvcmllcyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgLm1hcChkaXIgPT4gZGlyLmdldFBhdGgoKSlcbiAgICAuZmlsdGVyKHVyaSA9PiAhUmVtb3RlVXJpLmlzUmVtb3RlKHVyaSkpO1xuXG4gIGZvciAoY29uc3QgZGlyIG9mIGxvY2FsRGlyZWN0b3JpZXMpIHtcbiAgICBjb25zdCBjb21tYW5kSW5mbyA9XG4gICAgICBhd2FpdCBnZXRDb21tYW5kRnJvbU5vZGVQYWNrYWdlKGRpcik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgIGlmIChjb21tYW5kSW5mbyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gY29tbWFuZEluZm87XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBkaXIgb2YgbG9jYWxEaXJlY3Rvcmllcykge1xuICAgIGNvbnN0IGNvbW1hbmRJbmZvID0gYXdhaXQgZ2V0Q29tbWFuZEZyb21CdWNrKGRpcik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgIGlmIChjb21tYW5kSW5mbyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gY29tbWFuZEluZm87XG4gICAgfVxuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldENvbW1hbmRGcm9tTm9kZVBhY2thZ2UoZGlyOiBzdHJpbmcpOiBQcm9taXNlPD9Db21tYW5kSW5mbz4ge1xuICBjb25zdCBwcm9qZWN0Um9vdCA9IGF3YWl0IGZpbmROZWFyZXN0RmlsZSgncGFja2FnZS5qc29uJywgZGlyKTtcbiAgaWYgKHByb2plY3RSb290ID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihwcm9qZWN0Um9vdCwgJ3BhY2thZ2UuanNvbicpO1xuICBjb25zdCBjb250ZW50ID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKGZpbGVQYXRoKTtcbiAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgY29uc3QgaXNSZWFjdE5hdGl2ZSA9IHBhcnNlZC5kZXBlbmRlbmNpZXMgJiYgcGFyc2VkLmRlcGVuZGVuY2llc1sncmVhY3QtbmF0aXZlJ107XG4gIGlmICghaXNSZWFjdE5hdGl2ZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gVE9ETyhtYXR0aGV3d2l0aGFubSk6IEluIHRoZSBmdXR1cmUsIGFncmVlIG9uIGEgc3BlY2lmaWNhbGx5IG5hbWVkIHNjcmlwdHMgZmllbGQgaW5cbiAgLy8gcGFja2FnZS5qc29uIGFuZCB1c2UgdGhhdD9cbiAgY29uc3QgcGFja2FnZXJTY3JpcHRQYXRoID1cbiAgICBwYXRoLmpvaW4ocHJvamVjdFJvb3QsICdub2RlX21vZHVsZXMnLCAncmVhY3QtbmF0aXZlJywgJ3BhY2thZ2VyJywgJ3BhY2thZ2VyLnNoJyk7XG4gIGNvbnN0IHBhY2thZ2VyU2NyaXB0RXhpc3RzID0gYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhwYWNrYWdlclNjcmlwdFBhdGgpO1xuXG4gIGlmICghcGFja2FnZXJTY3JpcHRFeGlzdHMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY3dkOiBwcm9qZWN0Um9vdCxcbiAgICBjb21tYW5kOiBwYWNrYWdlclNjcmlwdFBhdGgsXG4gIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldENvbW1hbmRGcm9tQnVjayhkaXI6IHN0cmluZyk6IFByb21pc2U8P0NvbW1hbmRJbmZvPiB7XG4gIGNvbnN0IGJ1Y2tVdGlscyA9IG5ldyBCdWNrVXRpbHMoKTtcbiAgY29uc3QgcHJvamVjdFJvb3QgPSBhd2FpdCBidWNrVXRpbHMuZ2V0QnVja1Byb2plY3RSb290KGRpcik7XG4gIGlmIChwcm9qZWN0Um9vdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBUT0RPKG1hdHRoZXd3aXRoYW5tKTogTW92ZSB0aGlzIHRvIEJ1Y2tVdGlscz9cbiAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFJvb3QsICcuYnVja0NvbmZpZycpO1xuICBjb25zdCBjb250ZW50ID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKGZpbGVQYXRoKTtcbiAgY29uc3QgcGFyc2VkID0gaW5pLnBhcnNlKGBzY29wZSA9IGdsb2JhbFxcbiR7Y29udGVudH1gKTtcbiAgY29uc3Qgc2VjdGlvbiA9IHBhcnNlZFsncmVhY3QtbmF0aXZlJ107XG4gIGlmIChzZWN0aW9uID09IG51bGwgfHwgc2VjdGlvbi5zZXJ2ZXIgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiB7XG4gICAgY3dkOiBwcm9qZWN0Um9vdCxcbiAgICBjb21tYW5kOiBzZWN0aW9uLnNlcnZlcixcbiAgfTtcbn1cbiJdfQ==