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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.registerProvider = registerProvider;
exports.activate = activate;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _nuclideClient = require('../../nuclide-client');

var providerInstance = undefined;
function getProviderInstance() {
  if (providerInstance == null) {
    var FuzzyFileNameProvider = require('./FuzzyFileNameProvider');
    providerInstance = _extends({}, FuzzyFileNameProvider);
  }
  return providerInstance;
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();
  }

  _createClass(Activation, [{
    key: 'activate',
    value: function activate() {
      // Do search preprocessing for all existing and future root directories.
      initSearch(atom.project.getPaths());
      this._disposables.add(atom.project.onDidChangePaths(initSearch));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;
function getActivation() {
  if (activation == null) {
    activation = new Activation();
    activation.activate();
  }
  return activation;
}
var projectRoots = new Set();

/**
 * @param projectPaths All the root directories in the Atom workspace.
 */
function initSearch(projectPaths) {
  var newProjectRoots = new Set();
  projectPaths.forEach(function (projectPath) {
    newProjectRoots.add(projectPath);
    if (projectRoots.has(projectPath)) {
      return;
    }
    var service = (0, _nuclideClient.getServiceByNuclideUri)('FuzzyFileSearchService', projectPath);
    if (service) {
      // It doesn't matter what the search term is. Empirically, doing an initial
      // search speeds up the next search much more than simply doing the setup
      // kicked off by 'fileSearchForDirectory'.
      service.isFuzzySearchAvailableFor(projectPath).then(function (isAvailable) {
        if (isAvailable) {
          service.queryFuzzyFile(projectPath, 'a');
        }
      });
    }
  });
  projectRoots = newProjectRoots;
}

function registerProvider() {
  return getProviderInstance();
}

function activate(state) {
  getActivation();
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFtQk8sTUFBTTs7NkJBRXdCLHNCQUFzQjs7QUFFM0QsSUFBSSxnQkFBMkIsWUFBQSxDQUFDO0FBQ2hDLFNBQVMsbUJBQW1CLEdBQWE7QUFDdkMsTUFBSSxnQkFBZ0IsSUFBSSxJQUFJLEVBQUU7QUFDNUIsUUFBTSxxQkFBcUIsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUNqRSxvQkFBZ0IsZ0JBQU8scUJBQXFCLENBQUMsQ0FBQztHQUMvQztBQUNELFNBQU8sZ0JBQWdCLENBQUM7Q0FDekI7O0lBRUssVUFBVTtBQUdILFdBSFAsVUFBVSxDQUdGLEtBQWMsRUFBRTswQkFIeEIsVUFBVTs7QUFJWixRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0dBQy9DOztlQUxHLFVBQVU7O1dBT04sb0JBQUc7O0FBRVQsZ0JBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDcEMsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0tBQ2xFOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztTQWZHLFVBQVU7OztBQWtCaEIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQztBQUNuQyxTQUFTLGFBQWEsR0FBRztBQUN2QixNQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsY0FBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7QUFDOUIsY0FBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0dBQ3ZCO0FBQ0QsU0FBTyxVQUFVLENBQUM7Q0FDbkI7QUFDRCxJQUFJLFlBQXlCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7Ozs7QUFLMUMsU0FBUyxVQUFVLENBQUMsWUFBMkIsRUFBUTtBQUNyRCxNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2xDLGNBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxXQUFXLEVBQUk7QUFDbEMsbUJBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDakMsUUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQ2pDLGFBQU87S0FDUjtBQUNELFFBQU0sT0FBZ0MsR0FBRywyQ0FDdkMsd0JBQXdCLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDekMsUUFBSSxPQUFPLEVBQUU7Ozs7QUFJWCxhQUFPLENBQUMseUJBQXlCLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsV0FBVyxFQUFJO0FBQ2pFLFlBQUksV0FBVyxFQUFFO0FBQ2YsaUJBQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzFDO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7R0FDRixDQUFDLENBQUM7QUFDSCxjQUFZLEdBQUcsZUFBZSxDQUFDO0NBQ2hDOztBQUVNLFNBQVMsZ0JBQWdCLEdBQWE7QUFDM0MsU0FBTyxtQkFBbUIsRUFBRSxDQUFDO0NBQzlCOztBQUVNLFNBQVMsUUFBUSxDQUFDLEtBQWMsRUFBRTtBQUN2QyxlQUFhLEVBQUUsQ0FBQztDQUNqQjs7QUFFTSxTQUFTLFVBQVUsR0FBRztBQUMzQixNQUFJLFVBQVUsRUFBRTtBQUNkLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0NBQ0YiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcXVpY2stb3Blbi1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHR5cGVvZiAqIGFzIEZ1enp5RmlsZVNlYXJjaFNlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1mdXp6eS1maWxlLXNlYXJjaC1zZXJ2aWNlJztcblxuaW1wb3J0IHtcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbn0gZnJvbSAnYXRvbSc7XG5cbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jbGllbnQnO1xuXG5sZXQgcHJvdmlkZXJJbnN0YW5jZTogP1Byb3ZpZGVyO1xuZnVuY3Rpb24gZ2V0UHJvdmlkZXJJbnN0YW5jZSgpOiBQcm92aWRlciB7XG4gIGlmIChwcm92aWRlckluc3RhbmNlID09IG51bGwpIHtcbiAgICBjb25zdCBGdXp6eUZpbGVOYW1lUHJvdmlkZXIgPSByZXF1aXJlKCcuL0Z1enp5RmlsZU5hbWVQcm92aWRlcicpO1xuICAgIHByb3ZpZGVySW5zdGFuY2UgPSB7Li4uRnV6enlGaWxlTmFtZVByb3ZpZGVyfTtcbiAgfVxuICByZXR1cm4gcHJvdmlkZXJJbnN0YW5jZTtcbn1cblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuICAgIC8vIERvIHNlYXJjaCBwcmVwcm9jZXNzaW5nIGZvciBhbGwgZXhpc3RpbmcgYW5kIGZ1dHVyZSByb290IGRpcmVjdG9yaWVzLlxuICAgIGluaXRTZWFyY2goYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocyhpbml0U2VhcmNoKSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuZnVuY3Rpb24gZ2V0QWN0aXZhdGlvbigpIHtcbiAgaWYgKGFjdGl2YXRpb24gPT0gbnVsbCkge1xuICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbigpO1xuICAgIGFjdGl2YXRpb24uYWN0aXZhdGUoKTtcbiAgfVxuICByZXR1cm4gYWN0aXZhdGlvbjtcbn1cbmxldCBwcm9qZWN0Um9vdHM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xuXG4vKipcbiAqIEBwYXJhbSBwcm9qZWN0UGF0aHMgQWxsIHRoZSByb290IGRpcmVjdG9yaWVzIGluIHRoZSBBdG9tIHdvcmtzcGFjZS5cbiAqL1xuZnVuY3Rpb24gaW5pdFNlYXJjaChwcm9qZWN0UGF0aHM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgY29uc3QgbmV3UHJvamVjdFJvb3RzID0gbmV3IFNldCgpO1xuICBwcm9qZWN0UGF0aHMuZm9yRWFjaChwcm9qZWN0UGF0aCA9PiB7XG4gICAgbmV3UHJvamVjdFJvb3RzLmFkZChwcm9qZWN0UGF0aCk7XG4gICAgaWYgKHByb2plY3RSb290cy5oYXMocHJvamVjdFBhdGgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHNlcnZpY2U6ID9GdXp6eUZpbGVTZWFyY2hTZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaShcbiAgICAgICdGdXp6eUZpbGVTZWFyY2hTZXJ2aWNlJywgcHJvamVjdFBhdGgpO1xuICAgIGlmIChzZXJ2aWNlKSB7XG4gICAgICAvLyBJdCBkb2Vzbid0IG1hdHRlciB3aGF0IHRoZSBzZWFyY2ggdGVybSBpcy4gRW1waXJpY2FsbHksIGRvaW5nIGFuIGluaXRpYWxcbiAgICAgIC8vIHNlYXJjaCBzcGVlZHMgdXAgdGhlIG5leHQgc2VhcmNoIG11Y2ggbW9yZSB0aGFuIHNpbXBseSBkb2luZyB0aGUgc2V0dXBcbiAgICAgIC8vIGtpY2tlZCBvZmYgYnkgJ2ZpbGVTZWFyY2hGb3JEaXJlY3RvcnknLlxuICAgICAgc2VydmljZS5pc0Z1enp5U2VhcmNoQXZhaWxhYmxlRm9yKHByb2plY3RQYXRoKS50aGVuKGlzQXZhaWxhYmxlID0+IHtcbiAgICAgICAgaWYgKGlzQXZhaWxhYmxlKSB7XG4gICAgICAgICAgc2VydmljZS5xdWVyeUZ1enp5RmlsZShwcm9qZWN0UGF0aCwgJ2EnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbiAgcHJvamVjdFJvb3RzID0gbmV3UHJvamVjdFJvb3RzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJQcm92aWRlcigpOiBQcm92aWRlciB7XG4gIHJldHVybiBnZXRQcm92aWRlckluc3RhbmNlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCkge1xuICBnZXRBY3RpdmF0aW9uKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBpZiAoYWN0aXZhdGlvbikge1xuICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICB9XG59XG4iXX0=