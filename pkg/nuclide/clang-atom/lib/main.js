function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _analytics = require('../../analytics');

var busySignalProvider = null;
var diagnosticProvider = null;
var subscriptions = null;

function getBusySignalProvider() {
  if (!busySignalProvider) {
    var _require = require('../../busy-signal-provider-base');

    var BusySignalProviderBase = _require.BusySignalProviderBase;

    busySignalProvider = new BusySignalProviderBase();
  }
  return busySignalProvider;
}

function getDiagnosticsProvider() {
  if (!diagnosticProvider) {
    var provider = require('./ClangDiagnosticsProvider');
    diagnosticProvider = new provider(getBusySignalProvider());
  }
  return diagnosticProvider;
}

module.exports = {
  activate: function activate() {
    var _require2 = require('../../atom-helpers');

    var projects = _require2.projects;

    subscriptions = new _atom.CompositeDisposable();
    // Provide a 'Clean and rebuild' command to restart the Clang server for the current file
    // and reset all compilation flags. Useful when BUCK targets or headers change,
    // since those are heavily cached for performance. Also great for testing!
    subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-clang:clean-and-rebuild', _asyncToGenerator(function* () {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      var path = editor.getPath();
      if (path == null) {
        return;
      }

      var _require3 = require('./libclang');

      var reset = _require3.reset;

      yield reset(editor);
      if (diagnosticProvider != null) {
        diagnosticProvider.invalidatePath(path);
        diagnosticProvider.runDiagnostics(editor);
      }
    })));
    // Invalidate all diagnostics when closing the project.
    subscriptions.add(projects.onDidRemoveProjectPath(function (projectPath) {
      if (diagnosticProvider != null) {
        diagnosticProvider.invalidateProjectPath(projectPath);
      }
    }));
  },

  /** Provider for autocomplete service. */
  createAutocompleteProvider: function createAutocompleteProvider() {
    var _require4 = require('./AutocompleteProvider');

    var AutocompleteProvider = _require4.AutocompleteProvider;

    var autocompleteProvider = new AutocompleteProvider();

    return {
      selector: '.source.objc, .source.objcpp, .source.cpp, .source.c',
      inclusionPriority: 1,
      suggestionPriority: 5, // Higher than the snippets provider.

      getSuggestions: function getSuggestions(request) {
        return (0, _analytics.trackOperationTiming)('nuclide-clang-atom:getAutocompleteSuggestions', function () {
          return autocompleteProvider.getAutocompleteSuggestions(request);
        });
      }
    };
  },

  deactivate: function deactivate() {
    if (diagnosticProvider != null) {
      diagnosticProvider.dispose();
      diagnosticProvider = null;
    }
    if (subscriptions != null) {
      subscriptions.dispose();
      subscriptions = null;
    }
  },

  getHyperclickProvider: function getHyperclickProvider() {
    return require('./HyperclickProvider');
  },

  provideBusySignal: function provideBusySignal() {
    return getBusySignalProvider();
  },

  provideDiagnostics: function provideDiagnostics() {
    return getDiagnosticsProvider();
  }
};
//# sourceMappingURL=data:application/json;base64,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QUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdCLHdCQUFrQixHQUFHLElBQUksQ0FBQztLQUMzQjtBQUNELFFBQUksYUFBYSxJQUFJLElBQUksRUFBRTtBQUN6QixtQkFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLG1CQUFhLEdBQUcsSUFBSSxDQUFDO0tBQ3RCO0dBQ0Y7O0FBRUQsdUJBQXFCLEVBQUEsaUNBQXVCO0FBQzFDLFdBQU8sT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7R0FDeEM7O0FBRUQsbUJBQWlCLEVBQUEsNkJBQStCO0FBQzlDLFdBQU8scUJBQXFCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxvQkFBa0IsRUFBQSw4QkFBdUI7QUFDdkMsV0FBTyxzQkFBc0IsRUFBRSxDQUFDO0dBQ2pDO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tQcm92aWRlcn0gZnJvbSAnLi4vLi4vaHlwZXJjbGljay1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtcbiAgQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSBhcyBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlVHlwZSxcbn0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtcHJvdmlkZXItYmFzZSc7XG5pbXBvcnQgdHlwZSB7RGlhZ25vc3RpY1Byb3ZpZGVyfSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcy9iYXNlJztcbmltcG9ydCB0eXBlIENsYW5nRGlhZ25vc3RpY3NQcm92aWRlciBmcm9tICcuL0NsYW5nRGlhZ25vc3RpY3NQcm92aWRlcic7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5sZXQgYnVzeVNpZ25hbFByb3ZpZGVyOiA/QnVzeVNpZ25hbFByb3ZpZGVyQmFzZVR5cGUgPSBudWxsO1xubGV0IGRpYWdub3N0aWNQcm92aWRlcjogP0NsYW5nRGlhZ25vc3RpY3NQcm92aWRlciA9IG51bGw7XG5sZXQgc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGUgPSBudWxsO1xuXG5mdW5jdGlvbiBnZXRCdXN5U2lnbmFsUHJvdmlkZXIoKTogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZVR5cGUge1xuICBpZiAoIWJ1c3lTaWduYWxQcm92aWRlcikge1xuICAgIGNvbnN0IHtCdXN5U2lnbmFsUHJvdmlkZXJCYXNlfSA9IHJlcXVpcmUoJy4uLy4uL2J1c3ktc2lnbmFsLXByb3ZpZGVyLWJhc2UnKTtcbiAgICBidXN5U2lnbmFsUHJvdmlkZXIgPSBuZXcgQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSgpO1xuICB9XG4gIHJldHVybiBidXN5U2lnbmFsUHJvdmlkZXI7XG59XG5cbmZ1bmN0aW9uIGdldERpYWdub3N0aWNzUHJvdmlkZXIoKTogQ2xhbmdEaWFnbm9zdGljc1Byb3ZpZGVyIHtcbiAgaWYgKCFkaWFnbm9zdGljUHJvdmlkZXIpIHtcbiAgICBjb25zdCBwcm92aWRlciA9IHJlcXVpcmUoJy4vQ2xhbmdEaWFnbm9zdGljc1Byb3ZpZGVyJyk7XG4gICAgZGlhZ25vc3RpY1Byb3ZpZGVyID0gbmV3IHByb3ZpZGVyKGdldEJ1c3lTaWduYWxQcm92aWRlcigpKTtcbiAgfVxuICByZXR1cm4gZGlhZ25vc3RpY1Byb3ZpZGVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoKSB7XG4gICAgY29uc3Qge3Byb2plY3RzfSA9IHJlcXVpcmUoJy4uLy4uL2F0b20taGVscGVycycpO1xuICAgIHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIC8vIFByb3ZpZGUgYSAnQ2xlYW4gYW5kIHJlYnVpbGQnIGNvbW1hbmQgdG8gcmVzdGFydCB0aGUgQ2xhbmcgc2VydmVyIGZvciB0aGUgY3VycmVudCBmaWxlXG4gICAgLy8gYW5kIHJlc2V0IGFsbCBjb21waWxhdGlvbiBmbGFncy4gVXNlZnVsIHdoZW4gQlVDSyB0YXJnZXRzIG9yIGhlYWRlcnMgY2hhbmdlLFxuICAgIC8vIHNpbmNlIHRob3NlIGFyZSBoZWF2aWx5IGNhY2hlZCBmb3IgcGVyZm9ybWFuY2UuIEFsc28gZ3JlYXQgZm9yIHRlc3RpbmchXG4gICAgc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnbnVjbGlkZS1jbGFuZzpjbGVhbi1hbmQtcmVidWlsZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICBpZiAoZWRpdG9yID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIGlmIChwYXRoID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qge3Jlc2V0fSA9IHJlcXVpcmUoJy4vbGliY2xhbmcnKTtcbiAgICAgICAgYXdhaXQgcmVzZXQoZWRpdG9yKTtcbiAgICAgICAgaWYgKGRpYWdub3N0aWNQcm92aWRlciAhPSBudWxsKSB7XG4gICAgICAgICAgZGlhZ25vc3RpY1Byb3ZpZGVyLmludmFsaWRhdGVQYXRoKHBhdGgpO1xuICAgICAgICAgIGRpYWdub3N0aWNQcm92aWRlci5ydW5EaWFnbm9zdGljcyhlZGl0b3IpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICAgIC8vIEludmFsaWRhdGUgYWxsIGRpYWdub3N0aWNzIHdoZW4gY2xvc2luZyB0aGUgcHJvamVjdC5cbiAgICBzdWJzY3JpcHRpb25zLmFkZChwcm9qZWN0cy5vbkRpZFJlbW92ZVByb2plY3RQYXRoKChwcm9qZWN0UGF0aCkgPT4ge1xuICAgICAgaWYgKGRpYWdub3N0aWNQcm92aWRlciAhPSBudWxsKSB7XG4gICAgICAgIGRpYWdub3N0aWNQcm92aWRlci5pbnZhbGlkYXRlUHJvamVjdFBhdGgocHJvamVjdFBhdGgpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgfSxcblxuICAvKiogUHJvdmlkZXIgZm9yIGF1dG9jb21wbGV0ZSBzZXJ2aWNlLiAqL1xuICBjcmVhdGVBdXRvY29tcGxldGVQcm92aWRlcigpOiBhdG9tJEF1dG9jb21wbGV0ZVByb3ZpZGVyIHtcbiAgICBjb25zdCB7QXV0b2NvbXBsZXRlUHJvdmlkZXJ9ID0gcmVxdWlyZSgnLi9BdXRvY29tcGxldGVQcm92aWRlcicpO1xuICAgIGNvbnN0IGF1dG9jb21wbGV0ZVByb3ZpZGVyID0gbmV3IEF1dG9jb21wbGV0ZVByb3ZpZGVyKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2VsZWN0b3I6ICcuc291cmNlLm9iamMsIC5zb3VyY2Uub2JqY3BwLCAuc291cmNlLmNwcCwgLnNvdXJjZS5jJyxcbiAgICAgIGluY2x1c2lvblByaW9yaXR5OiAxLFxuICAgICAgc3VnZ2VzdGlvblByaW9yaXR5OiA1LCAgLy8gSGlnaGVyIHRoYW4gdGhlIHNuaXBwZXRzIHByb3ZpZGVyLlxuXG4gICAgICBnZXRTdWdnZXN0aW9ucyhcbiAgICAgICAgcmVxdWVzdDogYXRvbSRBdXRvY29tcGxldGVSZXF1ZXN0XG4gICAgICApOiBQcm9taXNlPEFycmF5PGF0b20kQXV0b2NvbXBsZXRlU3VnZ2VzdGlvbj4+IHtcbiAgICAgICAgcmV0dXJuIHRyYWNrT3BlcmF0aW9uVGltaW5nKCdudWNsaWRlLWNsYW5nLWF0b206Z2V0QXV0b2NvbXBsZXRlU3VnZ2VzdGlvbnMnLFxuICAgICAgICAgICgpID0+IGF1dG9jb21wbGV0ZVByb3ZpZGVyLmdldEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zKHJlcXVlc3QpKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmIChkaWFnbm9zdGljUHJvdmlkZXIgIT0gbnVsbCkge1xuICAgICAgZGlhZ25vc3RpY1Byb3ZpZGVyLmRpc3Bvc2UoKTtcbiAgICAgIGRpYWdub3N0aWNQcm92aWRlciA9IG51bGw7XG4gICAgfVxuICAgIGlmIChzdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIGdldEh5cGVyY2xpY2tQcm92aWRlcigpOiBIeXBlcmNsaWNrUHJvdmlkZXIge1xuICAgIHJldHVybiByZXF1aXJlKCcuL0h5cGVyY2xpY2tQcm92aWRlcicpO1xuICB9LFxuXG4gIHByb3ZpZGVCdXN5U2lnbmFsKCk6IEJ1c3lTaWduYWxQcm92aWRlckJhc2VUeXBlIHtcbiAgICByZXR1cm4gZ2V0QnVzeVNpZ25hbFByb3ZpZGVyKCk7XG4gIH0sXG5cbiAgcHJvdmlkZURpYWdub3N0aWNzKCk6IERpYWdub3N0aWNQcm92aWRlciB7XG4gICAgcmV0dXJuIGdldERpYWdub3N0aWNzUHJvdmlkZXIoKTtcbiAgfSxcbn07XG4iXX0=