var loadStyles = _asyncToGenerator(function* (stylesPath) {
  // TODO(jjiaa): If possible, check that `stylesPath` is also a directory.
  if (!(yield fsPromise.exists(stylesPath))) {
    return;
  }

  // TODO(jjiaa): Find a way to remove the stylesheets when they're unneeded.
  // Note: Disposing the values of the statement below removes the stylesheets.
  //
  // The stylesheets will be loaded asynchronously, so there might be a slight
  // visual glitch if the widget is drawn before the stylesheets are loaded.
  (yield fsPromise.readdir(stylesPath)).filter(function (filePath) {
    return filePath.endsWith('.less') || filePath.endsWith('.css');
  })
  // Styles should be loaded in alphabetical order according to
  // https://atom.io/docs/v0.186.0/creating-a-package
  .sort().map(function (filePath) {
    return atom.themes.requireStylesheet(path.join(stylesPath, filePath));
  });
}

/**
 * Load all of the grammars synchronously because the top-level load() function should be
 * synchronous so that it works as expected with require().
 */
);

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs-plus');
var path = require('path');

var _require = require('../../commons');

var fsPromise = _require.fsPromise;
function loadGrammarsSync(packagePath) {
  var grammarsDir = path.join(packagePath, 'grammars');
  if (!fs.isDirectorySync(grammarsDir)) {
    return;
  }

  fs.traverseTreeSync(grammarsDir, function (file) {
    return atom.grammars.loadGrammarSync(file);
  }, function (directory) {
    return null;
  });
}

module.exports = {
  load: function load(libPath, mainFilename) {
    // $FlowFixMe Non-Atom expando property 'nuclide' for our own private purposes.
    var nuclide = atom.nuclide;
    if (!nuclide) {
      // $FlowFixMe atom.nuclide expando-property.
      atom.nuclide = nuclide = {};
    }

    if (!nuclide[mainFilename]) {
      // $FlowIgnore
      nuclide[mainFilename] = require(path.join(libPath, mainFilename));

      var packagePath = path.dirname(libPath);
      loadStyles(path.join(packagePath, 'styles'));

      loadGrammarsSync(packagePath);
    }
    return nuclide[mainFilename];
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBZWUsVUFBVSxxQkFBekIsV0FBMEIsVUFBa0IsRUFBVzs7QUFFckQsTUFBSSxFQUFFLE1BQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQSxBQUFDLEVBQUU7QUFDekMsV0FBTztHQUNSOzs7Ozs7O0FBT0QsR0FBQyxNQUFNLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FDL0IsTUFBTSxDQUFDLFVBQUEsUUFBUTtXQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7R0FBQyxDQUFDOzs7R0FHN0UsSUFBSSxFQUFFLENBQ04sR0FBRyxDQUFDLFVBQUEsUUFBUTtXQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FBQSxDQUFDLENBQUM7Q0FDdEY7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXJCRCxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDOUIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztlQUNULE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBQXJDLFNBQVMsWUFBVCxTQUFTO0FBeUJoQixTQUFTLGdCQUFnQixDQUFDLFdBQW1CLEVBQUU7QUFDN0MsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdkQsTUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFDcEMsV0FBTztHQUNSOztBQUVELElBQUUsQ0FBQyxnQkFBZ0IsQ0FDakIsV0FBVyxFQUNYLFVBQUEsSUFBSTtXQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztHQUFBLEVBQzNDLFVBQUEsU0FBUztXQUFJLElBQUk7R0FBQSxDQUNsQixDQUFDO0NBQ0g7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLE1BQUksRUFBQSxjQUFDLE9BQWUsRUFBRSxZQUFvQixFQUFPOztBQUUvQyxRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxPQUFPLEVBQUU7O0FBRVosVUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLEdBQUcsRUFBRSxDQUFDO0tBQzdCOztBQUVELFFBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7O0FBRTFCLGFBQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQzs7QUFFbEUsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxnQkFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7O0FBRTdDLHNCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQy9CO0FBQ0QsV0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDOUI7Q0FDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB7ZnNQcm9taXNlfSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcblxuYXN5bmMgZnVuY3Rpb24gbG9hZFN0eWxlcyhzdHlsZXNQYXRoOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgLy8gVE9ETyhqamlhYSk6IElmIHBvc3NpYmxlLCBjaGVjayB0aGF0IGBzdHlsZXNQYXRoYCBpcyBhbHNvIGEgZGlyZWN0b3J5LlxuICBpZiAoIShhd2FpdCBmc1Byb21pc2UuZXhpc3RzKHN0eWxlc1BhdGgpKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFRPRE8oamppYWEpOiBGaW5kIGEgd2F5IHRvIHJlbW92ZSB0aGUgc3R5bGVzaGVldHMgd2hlbiB0aGV5J3JlIHVubmVlZGVkLlxuICAvLyBOb3RlOiBEaXNwb3NpbmcgdGhlIHZhbHVlcyBvZiB0aGUgc3RhdGVtZW50IGJlbG93IHJlbW92ZXMgdGhlIHN0eWxlc2hlZXRzLlxuICAvL1xuICAvLyBUaGUgc3R5bGVzaGVldHMgd2lsbCBiZSBsb2FkZWQgYXN5bmNocm9ub3VzbHksIHNvIHRoZXJlIG1pZ2h0IGJlIGEgc2xpZ2h0XG4gIC8vIHZpc3VhbCBnbGl0Y2ggaWYgdGhlIHdpZGdldCBpcyBkcmF3biBiZWZvcmUgdGhlIHN0eWxlc2hlZXRzIGFyZSBsb2FkZWQuXG4gIChhd2FpdCBmc1Byb21pc2UucmVhZGRpcihzdHlsZXNQYXRoKSlcbiAgICAgIC5maWx0ZXIoZmlsZVBhdGggPT4gKGZpbGVQYXRoLmVuZHNXaXRoKCcubGVzcycpIHx8IGZpbGVQYXRoLmVuZHNXaXRoKCcuY3NzJykpKVxuICAgICAgLy8gU3R5bGVzIHNob3VsZCBiZSBsb2FkZWQgaW4gYWxwaGFiZXRpY2FsIG9yZGVyIGFjY29yZGluZyB0b1xuICAgICAgLy8gaHR0cHM6Ly9hdG9tLmlvL2RvY3MvdjAuMTg2LjAvY3JlYXRpbmctYS1wYWNrYWdlXG4gICAgICAuc29ydCgpXG4gICAgICAubWFwKGZpbGVQYXRoID0+IGF0b20udGhlbWVzLnJlcXVpcmVTdHlsZXNoZWV0KHBhdGguam9pbihzdHlsZXNQYXRoLCBmaWxlUGF0aCkpKTtcbn1cblxuLyoqXG4gKiBMb2FkIGFsbCBvZiB0aGUgZ3JhbW1hcnMgc3luY2hyb25vdXNseSBiZWNhdXNlIHRoZSB0b3AtbGV2ZWwgbG9hZCgpIGZ1bmN0aW9uIHNob3VsZCBiZVxuICogc3luY2hyb25vdXMgc28gdGhhdCBpdCB3b3JrcyBhcyBleHBlY3RlZCB3aXRoIHJlcXVpcmUoKS5cbiAqL1xuZnVuY3Rpb24gbG9hZEdyYW1tYXJzU3luYyhwYWNrYWdlUGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IGdyYW1tYXJzRGlyID0gcGF0aC5qb2luKHBhY2thZ2VQYXRoLCAnZ3JhbW1hcnMnKTtcbiAgaWYgKCFmcy5pc0RpcmVjdG9yeVN5bmMoZ3JhbW1hcnNEaXIpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnMudHJhdmVyc2VUcmVlU3luYyhcbiAgICBncmFtbWFyc0RpcixcbiAgICBmaWxlID0+IGF0b20uZ3JhbW1hcnMubG9hZEdyYW1tYXJTeW5jKGZpbGUpLFxuICAgIGRpcmVjdG9yeSA9PiBudWxsXG4gICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2FkKGxpYlBhdGg6IHN0cmluZywgbWFpbkZpbGVuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIC8vICRGbG93Rml4TWUgTm9uLUF0b20gZXhwYW5kbyBwcm9wZXJ0eSAnbnVjbGlkZScgZm9yIG91ciBvd24gcHJpdmF0ZSBwdXJwb3Nlcy5cbiAgICBsZXQgbnVjbGlkZSA9IGF0b20ubnVjbGlkZTtcbiAgICBpZiAoIW51Y2xpZGUpIHtcbiAgICAgIC8vICRGbG93Rml4TWUgYXRvbS5udWNsaWRlIGV4cGFuZG8tcHJvcGVydHkuXG4gICAgICBhdG9tLm51Y2xpZGUgPSBudWNsaWRlID0ge307XG4gICAgfVxuXG4gICAgaWYgKCFudWNsaWRlW21haW5GaWxlbmFtZV0pIHtcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBudWNsaWRlW21haW5GaWxlbmFtZV0gPSByZXF1aXJlKHBhdGguam9pbihsaWJQYXRoLCBtYWluRmlsZW5hbWUpKTtcblxuICAgICAgY29uc3QgcGFja2FnZVBhdGggPSBwYXRoLmRpcm5hbWUobGliUGF0aCk7XG4gICAgICBsb2FkU3R5bGVzKHBhdGguam9pbihwYWNrYWdlUGF0aCwgJ3N0eWxlcycpKTtcblxuICAgICAgbG9hZEdyYW1tYXJzU3luYyhwYWNrYWdlUGF0aCk7XG4gICAgfVxuICAgIHJldHVybiBudWNsaWRlW21haW5GaWxlbmFtZV07XG4gIH0sXG59O1xuIl19