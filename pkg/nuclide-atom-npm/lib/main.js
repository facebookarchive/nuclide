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

var _require = require('../../nuclide-commons');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBZWUsVUFBVSxxQkFBekIsV0FBMEIsVUFBa0IsRUFBVzs7QUFFckQsTUFBSSxFQUFFLE1BQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQSxBQUFDLEVBQUU7QUFDekMsV0FBTztHQUNSOzs7Ozs7O0FBT0QsR0FBQyxNQUFNLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUEsQ0FDL0IsTUFBTSxDQUFDLFVBQUEsUUFBUTtXQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7R0FBQyxDQUFDOzs7R0FHN0UsSUFBSSxFQUFFLENBQ04sR0FBRyxDQUFDLFVBQUEsUUFBUTtXQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FBQSxDQUFDLENBQUM7Q0FDdEY7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXJCRCxJQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDOUIsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztlQUNULE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7SUFBN0MsU0FBUyxZQUFULFNBQVM7QUF5QmhCLFNBQVMsZ0JBQWdCLENBQUMsV0FBbUIsRUFBRTtBQUM3QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RCxNQUFJLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUNwQyxXQUFPO0dBQ1I7O0FBRUQsSUFBRSxDQUFDLGdCQUFnQixDQUNqQixXQUFXLEVBQ1gsVUFBQSxJQUFJO1dBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO0dBQUEsRUFDM0MsVUFBQSxTQUFTO1dBQUksSUFBSTtHQUFBLENBQ2xCLENBQUM7Q0FDSDs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsTUFBSSxFQUFBLGNBQUMsT0FBZSxFQUFFLFlBQW9CLEVBQU87O0FBRS9DLFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDM0IsUUFBSSxDQUFDLE9BQU8sRUFBRTs7QUFFWixVQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sR0FBRyxFQUFFLENBQUM7S0FDN0I7O0FBRUQsUUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTs7QUFFMUIsYUFBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDOztBQUVsRSxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzFDLGdCQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzs7QUFFN0Msc0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDL0I7QUFDRCxXQUFPLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUM5QjtDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMtcGx1cycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHtmc1Byb21pc2V9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJyk7XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRTdHlsZXMoc3R5bGVzUGF0aDogc3RyaW5nKTogUHJvbWlzZSB7XG4gIC8vIFRPRE8oamppYWEpOiBJZiBwb3NzaWJsZSwgY2hlY2sgdGhhdCBgc3R5bGVzUGF0aGAgaXMgYWxzbyBhIGRpcmVjdG9yeS5cbiAgaWYgKCEoYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhzdHlsZXNQYXRoKSkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBUT0RPKGpqaWFhKTogRmluZCBhIHdheSB0byByZW1vdmUgdGhlIHN0eWxlc2hlZXRzIHdoZW4gdGhleSdyZSB1bm5lZWRlZC5cbiAgLy8gTm90ZTogRGlzcG9zaW5nIHRoZSB2YWx1ZXMgb2YgdGhlIHN0YXRlbWVudCBiZWxvdyByZW1vdmVzIHRoZSBzdHlsZXNoZWV0cy5cbiAgLy9cbiAgLy8gVGhlIHN0eWxlc2hlZXRzIHdpbGwgYmUgbG9hZGVkIGFzeW5jaHJvbm91c2x5LCBzbyB0aGVyZSBtaWdodCBiZSBhIHNsaWdodFxuICAvLyB2aXN1YWwgZ2xpdGNoIGlmIHRoZSB3aWRnZXQgaXMgZHJhd24gYmVmb3JlIHRoZSBzdHlsZXNoZWV0cyBhcmUgbG9hZGVkLlxuICAoYXdhaXQgZnNQcm9taXNlLnJlYWRkaXIoc3R5bGVzUGF0aCkpXG4gICAgICAuZmlsdGVyKGZpbGVQYXRoID0+IChmaWxlUGF0aC5lbmRzV2l0aCgnLmxlc3MnKSB8fCBmaWxlUGF0aC5lbmRzV2l0aCgnLmNzcycpKSlcbiAgICAgIC8vIFN0eWxlcyBzaG91bGQgYmUgbG9hZGVkIGluIGFscGhhYmV0aWNhbCBvcmRlciBhY2NvcmRpbmcgdG9cbiAgICAgIC8vIGh0dHBzOi8vYXRvbS5pby9kb2NzL3YwLjE4Ni4wL2NyZWF0aW5nLWEtcGFja2FnZVxuICAgICAgLnNvcnQoKVxuICAgICAgLm1hcChmaWxlUGF0aCA9PiBhdG9tLnRoZW1lcy5yZXF1aXJlU3R5bGVzaGVldChwYXRoLmpvaW4oc3R5bGVzUGF0aCwgZmlsZVBhdGgpKSk7XG59XG5cbi8qKlxuICogTG9hZCBhbGwgb2YgdGhlIGdyYW1tYXJzIHN5bmNocm9ub3VzbHkgYmVjYXVzZSB0aGUgdG9wLWxldmVsIGxvYWQoKSBmdW5jdGlvbiBzaG91bGQgYmVcbiAqIHN5bmNocm9ub3VzIHNvIHRoYXQgaXQgd29ya3MgYXMgZXhwZWN0ZWQgd2l0aCByZXF1aXJlKCkuXG4gKi9cbmZ1bmN0aW9uIGxvYWRHcmFtbWFyc1N5bmMocGFja2FnZVBhdGg6IHN0cmluZykge1xuICBjb25zdCBncmFtbWFyc0RpciA9IHBhdGguam9pbihwYWNrYWdlUGF0aCwgJ2dyYW1tYXJzJyk7XG4gIGlmICghZnMuaXNEaXJlY3RvcnlTeW5jKGdyYW1tYXJzRGlyKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZzLnRyYXZlcnNlVHJlZVN5bmMoXG4gICAgZ3JhbW1hcnNEaXIsXG4gICAgZmlsZSA9PiBhdG9tLmdyYW1tYXJzLmxvYWRHcmFtbWFyU3luYyhmaWxlKSxcbiAgICBkaXJlY3RvcnkgPT4gbnVsbFxuICApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9hZChsaWJQYXRoOiBzdHJpbmcsIG1haW5GaWxlbmFtZTogc3RyaW5nKTogYW55IHtcbiAgICAvLyAkRmxvd0ZpeE1lIE5vbi1BdG9tIGV4cGFuZG8gcHJvcGVydHkgJ251Y2xpZGUnIGZvciBvdXIgb3duIHByaXZhdGUgcHVycG9zZXMuXG4gICAgbGV0IG51Y2xpZGUgPSBhdG9tLm51Y2xpZGU7XG4gICAgaWYgKCFudWNsaWRlKSB7XG4gICAgICAvLyAkRmxvd0ZpeE1lIGF0b20ubnVjbGlkZSBleHBhbmRvLXByb3BlcnR5LlxuICAgICAgYXRvbS5udWNsaWRlID0gbnVjbGlkZSA9IHt9O1xuICAgIH1cblxuICAgIGlmICghbnVjbGlkZVttYWluRmlsZW5hbWVdKSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgbnVjbGlkZVttYWluRmlsZW5hbWVdID0gcmVxdWlyZShwYXRoLmpvaW4obGliUGF0aCwgbWFpbkZpbGVuYW1lKSk7XG5cbiAgICAgIGNvbnN0IHBhY2thZ2VQYXRoID0gcGF0aC5kaXJuYW1lKGxpYlBhdGgpO1xuICAgICAgbG9hZFN0eWxlcyhwYXRoLmpvaW4ocGFja2FnZVBhdGgsICdzdHlsZXMnKSk7XG5cbiAgICAgIGxvYWRHcmFtbWFyc1N5bmMocGFja2FnZVBhdGgpO1xuICAgIH1cbiAgICByZXR1cm4gbnVjbGlkZVttYWluRmlsZW5hbWVdO1xuICB9LFxufTtcbiJdfQ==