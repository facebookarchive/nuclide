var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

module.exports = {
  registerProvider: function registerProvider() {
    return getProviderInstance();
  },

  activate: function activate(state) {
    getActivation();
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBbUJPLE1BQU07OzZCQUV3QixzQkFBc0I7O0FBRTNELElBQUksZ0JBQTJCLFlBQUEsQ0FBQztBQUNoQyxTQUFTLG1CQUFtQixHQUFhO0FBQ3ZDLE1BQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO0FBQzVCLFFBQU0scUJBQXFCLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDakUsb0JBQWdCLGdCQUFPLHFCQUFxQixDQUFDLENBQUM7R0FDL0M7QUFDRCxTQUFPLGdCQUFnQixDQUFDO0NBQ3pCOztJQUVLLFVBQVU7QUFHSCxXQUhQLFVBQVUsQ0FHRixLQUFjLEVBQUU7MEJBSHhCLFVBQVU7O0FBSVosUUFBSSxDQUFDLFlBQVksR0FBRywrQkFBeUIsQ0FBQztHQUMvQzs7ZUFMRyxVQUFVOztXQU9OLG9CQUFHOztBQUVULGdCQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3BDLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztLQUNsRTs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0FmRyxVQUFVOzs7QUFrQmhCLElBQUksVUFBdUIsR0FBRyxJQUFJLENBQUM7QUFDbkMsU0FBUyxhQUFhLEdBQUc7QUFDdkIsTUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0FBQzlCLGNBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztHQUN2QjtBQUNELFNBQU8sVUFBVSxDQUFDO0NBQ25CO0FBQ0QsSUFBSSxZQUF5QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Ozs7O0FBSzFDLFNBQVMsVUFBVSxDQUFDLFlBQTJCLEVBQVE7QUFDckQsTUFBTSxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNsQyxjQUFZLENBQUMsT0FBTyxDQUFDLFVBQUEsV0FBVyxFQUFJO0FBQ2xDLG1CQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2pDLFFBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUNqQyxhQUFPO0tBQ1I7QUFDRCxRQUFNLE9BQWdDLEdBQUcsMkNBQ3ZDLHdCQUF3QixFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ3pDLFFBQUksT0FBTyxFQUFFOzs7O0FBSVgsYUFBTyxDQUFDLHlCQUF5QixDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUNqRSxZQUFJLFdBQVcsRUFBRTtBQUNmLGlCQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUMxQztPQUNGLENBQUMsQ0FBQztLQUNKO0dBQ0YsQ0FBQyxDQUFDO0FBQ0gsY0FBWSxHQUFHLGVBQWUsQ0FBQztDQUNoQzs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2Ysa0JBQWdCLEVBQUEsNEJBQWE7QUFDM0IsV0FBTyxtQkFBbUIsRUFBRSxDQUFDO0dBQzlCOztBQUVELFVBQVEsRUFBQSxrQkFBQyxLQUFjLEVBQUU7QUFDdkIsaUJBQWEsRUFBRSxDQUFDO0dBQ2pCOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksVUFBVSxFQUFFO0FBQ2QsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBQcm92aWRlcixcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1xdWljay1vcGVuLWludGVyZmFjZXMnO1xuXG5pbXBvcnQgdHlwZW9mICogYXMgRnV6enlGaWxlU2VhcmNoU2VydmljZSBmcm9tICcuLi8uLi9udWNsaWRlLWZ1enp5LWZpbGUtc2VhcmNoLXNlcnZpY2UnO1xuXG5pbXBvcnQge1xuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxufSBmcm9tICdhdG9tJztcblxuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWNsaWVudCc7XG5cbmxldCBwcm92aWRlckluc3RhbmNlOiA/UHJvdmlkZXI7XG5mdW5jdGlvbiBnZXRQcm92aWRlckluc3RhbmNlKCk6IFByb3ZpZGVyIHtcbiAgaWYgKHByb3ZpZGVySW5zdGFuY2UgPT0gbnVsbCkge1xuICAgIGNvbnN0IEZ1enp5RmlsZU5hbWVQcm92aWRlciA9IHJlcXVpcmUoJy4vRnV6enlGaWxlTmFtZVByb3ZpZGVyJyk7XG4gICAgcHJvdmlkZXJJbnN0YW5jZSA9IHsuLi5GdXp6eUZpbGVOYW1lUHJvdmlkZXJ9O1xuICB9XG4gIHJldHVybiBwcm92aWRlckluc3RhbmNlO1xufVxuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgLy8gRG8gc2VhcmNoIHByZXByb2Nlc3NpbmcgZm9yIGFsbCBleGlzdGluZyBhbmQgZnV0dXJlIHJvb3QgZGlyZWN0b3JpZXMuXG4gICAgaW5pdFNlYXJjaChhdG9tLnByb2plY3QuZ2V0UGF0aHMoKSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKGluaXRTZWFyY2gpKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5mdW5jdGlvbiBnZXRBY3RpdmF0aW9uKCkge1xuICBpZiAoYWN0aXZhdGlvbiA9PSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKCk7XG4gICAgYWN0aXZhdGlvbi5hY3RpdmF0ZSgpO1xuICB9XG4gIHJldHVybiBhY3RpdmF0aW9uO1xufVxubGV0IHByb2plY3RSb290czogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG5cbi8qKlxuICogQHBhcmFtIHByb2plY3RQYXRocyBBbGwgdGhlIHJvb3QgZGlyZWN0b3JpZXMgaW4gdGhlIEF0b20gd29ya3NwYWNlLlxuICovXG5mdW5jdGlvbiBpbml0U2VhcmNoKHByb2plY3RQYXRoczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICBjb25zdCBuZXdQcm9qZWN0Um9vdHMgPSBuZXcgU2V0KCk7XG4gIHByb2plY3RQYXRocy5mb3JFYWNoKHByb2plY3RQYXRoID0+IHtcbiAgICBuZXdQcm9qZWN0Um9vdHMuYWRkKHByb2plY3RQYXRoKTtcbiAgICBpZiAocHJvamVjdFJvb3RzLmhhcyhwcm9qZWN0UGF0aCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc2VydmljZTogP0Z1enp5RmlsZVNlYXJjaFNlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKFxuICAgICAgJ0Z1enp5RmlsZVNlYXJjaFNlcnZpY2UnLCBwcm9qZWN0UGF0aCk7XG4gICAgaWYgKHNlcnZpY2UpIHtcbiAgICAgIC8vIEl0IGRvZXNuJ3QgbWF0dGVyIHdoYXQgdGhlIHNlYXJjaCB0ZXJtIGlzLiBFbXBpcmljYWxseSwgZG9pbmcgYW4gaW5pdGlhbFxuICAgICAgLy8gc2VhcmNoIHNwZWVkcyB1cCB0aGUgbmV4dCBzZWFyY2ggbXVjaCBtb3JlIHRoYW4gc2ltcGx5IGRvaW5nIHRoZSBzZXR1cFxuICAgICAgLy8ga2lja2VkIG9mZiBieSAnZmlsZVNlYXJjaEZvckRpcmVjdG9yeScuXG4gICAgICBzZXJ2aWNlLmlzRnV6enlTZWFyY2hBdmFpbGFibGVGb3IocHJvamVjdFBhdGgpLnRoZW4oaXNBdmFpbGFibGUgPT4ge1xuICAgICAgICBpZiAoaXNBdmFpbGFibGUpIHtcbiAgICAgICAgICBzZXJ2aWNlLnF1ZXJ5RnV6enlGaWxlKHByb2plY3RQYXRoLCAnYScpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICBwcm9qZWN0Um9vdHMgPSBuZXdQcm9qZWN0Um9vdHM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByZWdpc3RlclByb3ZpZGVyKCk6IFByb3ZpZGVyIHtcbiAgICByZXR1cm4gZ2V0UHJvdmlkZXJJbnN0YW5jZSgpO1xuICB9LFxuXG4gIGFjdGl2YXRlKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgZ2V0QWN0aXZhdGlvbigpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICB9LFxufTtcbiJdfQ==