var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var providerInstance = undefined;
function getProviderInstance() {
  if (providerInstance == null) {
    var _require = require('./HackSymbolProvider');

    var HackSymbolProvider = _require.HackSymbolProvider;

    providerInstance = _extends({}, HackSymbolProvider);
  }
  return providerInstance;
}

module.exports = {

  registerProvider: function registerProvider() {
    return getProviderInstance();
  },

  activate: function activate(state) {}

};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQWFBLElBQUksZ0JBQTJCLFlBQUEsQ0FBQztBQUNoQyxTQUFTLG1CQUFtQixHQUFhO0FBQ3ZDLE1BQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO21CQUNDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQzs7UUFBckQsa0JBQWtCLFlBQWxCLGtCQUFrQjs7QUFDekIsb0JBQWdCLGdCQUFPLGtCQUFrQixDQUFDLENBQUM7R0FDNUM7QUFDRCxTQUFPLGdCQUFnQixDQUFDO0NBQ3pCOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7O0FBRWYsa0JBQWdCLEVBQUEsNEJBQWE7QUFDM0IsV0FBTyxtQkFBbUIsRUFBRSxDQUFDO0dBQzlCOztBQUVELFVBQVEsRUFBQSxrQkFBQyxLQUFjLEVBQUUsRUFDeEI7O0NBRUYsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1Byb3ZpZGVyfSBmcm9tICcuLi8uLi9udWNsaWRlLXF1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5cbmxldCBwcm92aWRlckluc3RhbmNlOiA/UHJvdmlkZXI7XG5mdW5jdGlvbiBnZXRQcm92aWRlckluc3RhbmNlKCk6IFByb3ZpZGVyIHtcbiAgaWYgKHByb3ZpZGVySW5zdGFuY2UgPT0gbnVsbCkge1xuICAgIGNvbnN0IHtIYWNrU3ltYm9sUHJvdmlkZXJ9ID0gcmVxdWlyZSgnLi9IYWNrU3ltYm9sUHJvdmlkZXInKTtcbiAgICBwcm92aWRlckluc3RhbmNlID0gey4uLkhhY2tTeW1ib2xQcm92aWRlcn07XG4gIH1cbiAgcmV0dXJuIHByb3ZpZGVySW5zdGFuY2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHJlZ2lzdGVyUHJvdmlkZXIoKTogUHJvdmlkZXIge1xuICAgIHJldHVybiBnZXRQcm92aWRlckluc3RhbmNlKCk7XG4gIH0sXG5cbiAgYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpIHtcbiAgfSxcblxufTtcbiJdfQ==