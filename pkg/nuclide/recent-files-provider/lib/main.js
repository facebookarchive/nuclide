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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var invariant = require('assert');

var providerInstance = undefined;
function getProviderInstance() {
  if (providerInstance == null) {
    var _require = require('./RecentFilesProvider');

    var RecentFilesProvider = _require.RecentFilesProvider;

    providerInstance = _extends({}, RecentFilesProvider);
  }
  return providerInstance;
}

exports['default'] = {

  registerProvider: function registerProvider() {
    return getProviderInstance();
  },

  consumeRecentFilesService: function consumeRecentFilesService(service) {
    var instance = getProviderInstance();
    invariant(instance.setRecentFilesService != null);
    instance.setRecentFilesService(service);
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFlQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRXBDLElBQUksZ0JBQTJCLFlBQUEsQ0FBQztBQUNoQyxTQUFTLG1CQUFtQixHQUFhO0FBQ3ZDLE1BQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO21CQUNFLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7UUFBdkQsbUJBQW1CLFlBQW5CLG1CQUFtQjs7QUFDMUIsb0JBQWdCLGdCQUFPLG1CQUFtQixDQUFDLENBQUM7R0FDN0M7QUFDRCxTQUFPLGdCQUFnQixDQUFDO0NBQ3pCOztxQkFFYzs7QUFFYixrQkFBZ0IsRUFBQSw0QkFBYTtBQUMzQixXQUFPLG1CQUFtQixFQUFFLENBQUM7R0FDOUI7O0FBRUQsMkJBQXlCLEVBQUEsbUNBQUMsT0FBYyxFQUFFO0FBQ3hDLFFBQU0sUUFBUSxHQUFHLG1CQUFtQixFQUFFLENBQUM7QUFDdkMsYUFBUyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUNsRCxZQUFRLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDekM7O0NBRUYiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL3F1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5cbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG5sZXQgcHJvdmlkZXJJbnN0YW5jZTogP1Byb3ZpZGVyO1xuZnVuY3Rpb24gZ2V0UHJvdmlkZXJJbnN0YW5jZSgpOiBQcm92aWRlciB7XG4gIGlmIChwcm92aWRlckluc3RhbmNlID09IG51bGwpIHtcbiAgICBjb25zdCB7UmVjZW50RmlsZXNQcm92aWRlcn0gPSByZXF1aXJlKCcuL1JlY2VudEZpbGVzUHJvdmlkZXInKTtcbiAgICBwcm92aWRlckluc3RhbmNlID0gey4uLlJlY2VudEZpbGVzUHJvdmlkZXJ9O1xuICB9XG4gIHJldHVybiBwcm92aWRlckluc3RhbmNlO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgcmVnaXN0ZXJQcm92aWRlcigpOiBQcm92aWRlciB7XG4gICAgcmV0dXJuIGdldFByb3ZpZGVySW5zdGFuY2UoKTtcbiAgfSxcblxuICBjb25zdW1lUmVjZW50RmlsZXNTZXJ2aWNlKHNlcnZpY2U6IG1peGVkKSB7XG4gICAgY29uc3QgaW5zdGFuY2UgPSBnZXRQcm92aWRlckluc3RhbmNlKCk7XG4gICAgaW52YXJpYW50KGluc3RhbmNlLnNldFJlY2VudEZpbGVzU2VydmljZSAhPSBudWxsKTtcbiAgICBpbnN0YW5jZS5zZXRSZWNlbnRGaWxlc1NlcnZpY2Uoc2VydmljZSk7XG4gIH0sXG5cbn07XG4iXX0=