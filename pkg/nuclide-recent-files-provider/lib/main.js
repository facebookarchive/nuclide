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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFlQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRXBDLElBQUksZ0JBQTJCLFlBQUEsQ0FBQztBQUNoQyxTQUFTLG1CQUFtQixHQUFhO0FBQ3ZDLE1BQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO21CQUNFLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQzs7UUFBdkQsbUJBQW1CLFlBQW5CLG1CQUFtQjs7QUFDMUIsb0JBQWdCLGdCQUFPLG1CQUFtQixDQUFDLENBQUM7R0FDN0M7QUFDRCxTQUFPLGdCQUFnQixDQUFDO0NBQ3pCOztxQkFFYzs7QUFFYixrQkFBZ0IsRUFBQSw0QkFBYTtBQUMzQixXQUFPLG1CQUFtQixFQUFFLENBQUM7R0FDOUI7O0FBRUQsMkJBQXlCLEVBQUEsbUNBQUMsT0FBYyxFQUFFO0FBQ3hDLFFBQU0sUUFBUSxHQUFHLG1CQUFtQixFQUFFLENBQUM7QUFDdkMsYUFBUyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUNsRCxZQUFRLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDekM7O0NBRUYiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcXVpY2stb3Blbi1pbnRlcmZhY2VzJztcblxuY29uc3QgaW52YXJpYW50ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5cbmxldCBwcm92aWRlckluc3RhbmNlOiA/UHJvdmlkZXI7XG5mdW5jdGlvbiBnZXRQcm92aWRlckluc3RhbmNlKCk6IFByb3ZpZGVyIHtcbiAgaWYgKHByb3ZpZGVySW5zdGFuY2UgPT0gbnVsbCkge1xuICAgIGNvbnN0IHtSZWNlbnRGaWxlc1Byb3ZpZGVyfSA9IHJlcXVpcmUoJy4vUmVjZW50RmlsZXNQcm92aWRlcicpO1xuICAgIHByb3ZpZGVySW5zdGFuY2UgPSB7Li4uUmVjZW50RmlsZXNQcm92aWRlcn07XG4gIH1cbiAgcmV0dXJuIHByb3ZpZGVySW5zdGFuY2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICByZWdpc3RlclByb3ZpZGVyKCk6IFByb3ZpZGVyIHtcbiAgICByZXR1cm4gZ2V0UHJvdmlkZXJJbnN0YW5jZSgpO1xuICB9LFxuXG4gIGNvbnN1bWVSZWNlbnRGaWxlc1NlcnZpY2Uoc2VydmljZTogbWl4ZWQpIHtcbiAgICBjb25zdCBpbnN0YW5jZSA9IGdldFByb3ZpZGVySW5zdGFuY2UoKTtcbiAgICBpbnZhcmlhbnQoaW5zdGFuY2Uuc2V0UmVjZW50RmlsZXNTZXJ2aWNlICE9IG51bGwpO1xuICAgIGluc3RhbmNlLnNldFJlY2VudEZpbGVzU2VydmljZShzZXJ2aWNlKTtcbiAgfSxcblxufTtcbiJdfQ==