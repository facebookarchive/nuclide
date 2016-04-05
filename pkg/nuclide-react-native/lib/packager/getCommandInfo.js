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
  var isReactNativeProject = parsed.dependencies && parsed.dependencies['react-native'];
  var isReactNative = parsed.name === 'react-native';

  if (!isReactNativeProject && !isReactNative) {
    return null;
  }

  // Figure out where the packager script is. We special case react-native itself so that the
  // bundled examples work out of the box.
  // TODO(matthewwithanm): In the future, agree on a specifically named scripts field in
  // package.json and use that?
  var packagerScriptPath = undefined;
  if (isReactNativeProject) {
    packagerScriptPath = _path2['default'].join(projectRoot, 'node_modules', 'react-native', 'packager', 'packager.sh');
  } else {
    packagerScriptPath = _path2['default'].join(projectRoot, 'packager', 'packager.sh');
  }

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
//# sourceMappingURL=data:application/json;base64,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QUUsYUFBYSxDQUFDLENBQUM7QUFDdkQsTUFBTSxPQUFPLEdBQUcsTUFBTSwwQkFBVSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbkQsTUFBTSxNQUFNLEdBQUcsaUJBQUksS0FBSyxzQkFBb0IsT0FBTyxDQUFHLENBQUM7QUFDdkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQUksT0FBTyxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLElBQUksRUFBRTtBQUM3QyxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsU0FBTztBQUNMLE9BQUcsRUFBRSxXQUFXO0FBQ2hCLFdBQU8sRUFBRSxPQUFPLENBQUMsTUFBTTtHQUN4QixDQUFDO0NBQ0g7Ozs7Ozs7OzhCQTVGdUIsMEJBQTBCOztnQ0FDdkIsNkJBQTZCOztJQUE1QyxTQUFTOzttQkFDTCxLQUFLOzs7O29CQUNKLE1BQU07Ozs7MkNBQ0MsMENBQTBDOztJQUUzRCxlQUFlLDZCQUFmLGVBQWUiLCJmaWxlIjoiZ2V0Q29tbWFuZEluZm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Q29tbWFuZEluZm99IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge2ZzUHJvbWlzZX0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCAqIGFzIFJlbW90ZVVyaSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IGluaSBmcm9tICdpbmknO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge0J1Y2tVdGlsc30gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1idWNrLWJhc2UvbGliL0J1Y2tVdGlscyc7XG5cbmNvbnN0IHtmaW5kTmVhcmVzdEZpbGV9ID0gZnNQcm9taXNlO1xuXG4vKipcbiAqIEdldCB0aGUgY29tbWFuZCB0aGF0IHdpbGwgcnVuIHRoZSBwYWNrYWdlciBzZXJ2ZXIgYmFzZWQgb24gdGhlIGN1cnJlbnQgd29ya3NwYWNlLlxuICogVE9ETzogV2UgbmVlZCB0byBoYXZlIGEgc29saWQgY29uY2VwdCBvZiBhbiBcImFjdGl2ZSBwcm9qZWN0XCIgdGhhdCdzIGNvbnNpc3RlbnQgYWNyb3NzIE51Y2xpZGVcbiAqICAgICAgIChpLmUuIHdoZXJlIHdlIHNob3VsZCBsb29rIGZvciBjb21tYW5kcyBsaWtlIHRoaXMpIGFuZCB1c2UgdGhhdCBoZXJlLiBUaGUgY3VycmVudCBiZWhhdmlvclxuICogICAgICAgb2YgZXZlcnl0aGluZyBoYXZpbmcgaXRzIG93biBhbGdvcml0aG0gaXMgYmFkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q29tbWFuZEluZm8oKTogUHJvbWlzZTw/Q29tbWFuZEluZm8+IHtcbiAgY29uc3QgbG9jYWxEaXJlY3RvcmllcyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgLm1hcChkaXIgPT4gZGlyLmdldFBhdGgoKSlcbiAgICAuZmlsdGVyKHVyaSA9PiAhUmVtb3RlVXJpLmlzUmVtb3RlKHVyaSkpO1xuXG4gIGZvciAoY29uc3QgZGlyIG9mIGxvY2FsRGlyZWN0b3JpZXMpIHtcbiAgICBjb25zdCBjb21tYW5kSW5mbyA9XG4gICAgICBhd2FpdCBnZXRDb21tYW5kRnJvbU5vZGVQYWNrYWdlKGRpcik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgIGlmIChjb21tYW5kSW5mbyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gY29tbWFuZEluZm87XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBkaXIgb2YgbG9jYWxEaXJlY3Rvcmllcykge1xuICAgIGNvbnN0IGNvbW1hbmRJbmZvID0gYXdhaXQgZ2V0Q29tbWFuZEZyb21CdWNrKGRpcik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgIGlmIChjb21tYW5kSW5mbyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gY29tbWFuZEluZm87XG4gICAgfVxuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldENvbW1hbmRGcm9tTm9kZVBhY2thZ2UoZGlyOiBzdHJpbmcpOiBQcm9taXNlPD9Db21tYW5kSW5mbz4ge1xuICBjb25zdCBwcm9qZWN0Um9vdCA9IGF3YWl0IGZpbmROZWFyZXN0RmlsZSgncGFja2FnZS5qc29uJywgZGlyKTtcbiAgaWYgKHByb2plY3RSb290ID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihwcm9qZWN0Um9vdCwgJ3BhY2thZ2UuanNvbicpO1xuICBjb25zdCBjb250ZW50ID0gYXdhaXQgZnNQcm9taXNlLnJlYWRGaWxlKGZpbGVQYXRoKTtcbiAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgY29uc3QgaXNSZWFjdE5hdGl2ZVByb2plY3QgPSBwYXJzZWQuZGVwZW5kZW5jaWVzICYmIHBhcnNlZC5kZXBlbmRlbmNpZXNbJ3JlYWN0LW5hdGl2ZSddO1xuICBjb25zdCBpc1JlYWN0TmF0aXZlID0gcGFyc2VkLm5hbWUgPT09ICdyZWFjdC1uYXRpdmUnO1xuXG4gIGlmICghaXNSZWFjdE5hdGl2ZVByb2plY3QgJiYgIWlzUmVhY3ROYXRpdmUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIEZpZ3VyZSBvdXQgd2hlcmUgdGhlIHBhY2thZ2VyIHNjcmlwdCBpcy4gV2Ugc3BlY2lhbCBjYXNlIHJlYWN0LW5hdGl2ZSBpdHNlbGYgc28gdGhhdCB0aGVcbiAgLy8gYnVuZGxlZCBleGFtcGxlcyB3b3JrIG91dCBvZiB0aGUgYm94LlxuICAvLyBUT0RPKG1hdHRoZXd3aXRoYW5tKTogSW4gdGhlIGZ1dHVyZSwgYWdyZWUgb24gYSBzcGVjaWZpY2FsbHkgbmFtZWQgc2NyaXB0cyBmaWVsZCBpblxuICAvLyBwYWNrYWdlLmpzb24gYW5kIHVzZSB0aGF0P1xuICBsZXQgcGFja2FnZXJTY3JpcHRQYXRoO1xuICBpZiAoaXNSZWFjdE5hdGl2ZVByb2plY3QpIHtcbiAgICBwYWNrYWdlclNjcmlwdFBhdGggPVxuICAgICAgcGF0aC5qb2luKHByb2plY3RSb290LCAnbm9kZV9tb2R1bGVzJywgJ3JlYWN0LW5hdGl2ZScsICdwYWNrYWdlcicsICdwYWNrYWdlci5zaCcpO1xuICB9IGVsc2Uge1xuICAgIHBhY2thZ2VyU2NyaXB0UGF0aCA9IHBhdGguam9pbihwcm9qZWN0Um9vdCwgJ3BhY2thZ2VyJywgJ3BhY2thZ2VyLnNoJyk7XG4gIH1cblxuICBjb25zdCBwYWNrYWdlclNjcmlwdEV4aXN0cyA9IGF3YWl0IGZzUHJvbWlzZS5leGlzdHMocGFja2FnZXJTY3JpcHRQYXRoKTtcbiAgaWYgKCFwYWNrYWdlclNjcmlwdEV4aXN0cykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjd2Q6IHByb2plY3RSb290LFxuICAgIGNvbW1hbmQ6IHBhY2thZ2VyU2NyaXB0UGF0aCxcbiAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0Q29tbWFuZEZyb21CdWNrKGRpcjogc3RyaW5nKTogUHJvbWlzZTw/Q29tbWFuZEluZm8+IHtcbiAgY29uc3QgYnVja1V0aWxzID0gbmV3IEJ1Y2tVdGlscygpO1xuICBjb25zdCBwcm9qZWN0Um9vdCA9IGF3YWl0IGJ1Y2tVdGlscy5nZXRCdWNrUHJvamVjdFJvb3QoZGlyKTtcbiAgaWYgKHByb2plY3RSb290ID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIFRPRE8obWF0dGhld3dpdGhhbm0pOiBNb3ZlIHRoaXMgdG8gQnVja1V0aWxzP1xuICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihwcm9qZWN0Um9vdCwgJy5idWNrQ29uZmlnJyk7XG4gIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmc1Byb21pc2UucmVhZEZpbGUoZmlsZVBhdGgpO1xuICBjb25zdCBwYXJzZWQgPSBpbmkucGFyc2UoYHNjb3BlID0gZ2xvYmFsXFxuJHtjb250ZW50fWApO1xuICBjb25zdCBzZWN0aW9uID0gcGFyc2VkWydyZWFjdC1uYXRpdmUnXTtcbiAgaWYgKHNlY3Rpb24gPT0gbnVsbCB8fCBzZWN0aW9uLnNlcnZlciA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBjd2Q6IHByb2plY3RSb290LFxuICAgIGNvbW1hbmQ6IHNlY3Rpb24uc2VydmVyLFxuICB9O1xufVxuIl19