var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _HackSymbolProvider = require('./HackSymbolProvider');

var providerInstance = undefined;
function getProviderInstance() {
  if (providerInstance == null) {
    providerInstance = _extends({}, _HackSymbolProvider.HackSymbolProvider);
  }
  return providerInstance;
}

module.exports = {

  registerProvider: function registerProvider() {
    return getProviderInstance();
  },

  activate: function activate(state) {},

  deactivate: function deactivate() {}
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztrQ0FXaUMsc0JBQXNCOztBQUd2RCxJQUFJLGdCQUEyQixZQUFBLENBQUM7QUFDaEMsU0FBUyxtQkFBbUIsR0FBYTtBQUN2QyxNQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRTtBQUM1QixvQkFBZ0IsdURBQTBCLENBQUM7R0FDNUM7QUFDRCxTQUFPLGdCQUFnQixDQUFDO0NBQ3pCOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7O0FBRWYsa0JBQWdCLEVBQUEsNEJBQWE7QUFDM0IsV0FBTyxtQkFBbUIsRUFBRSxDQUFDO0dBQzlCOztBQUVELFVBQVEsRUFBQSxrQkFBQyxLQUFjLEVBQUUsRUFFeEI7O0FBRUQsWUFBVSxFQUFBLHNCQUFHLEVBRVo7Q0FDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0hhY2tTeW1ib2xQcm92aWRlcn0gZnJvbSAnLi9IYWNrU3ltYm9sUHJvdmlkZXInO1xudHlwZSBQcm92aWRlciA9IHR5cGVvZiBIYWNrU3ltYm9sUHJvdmlkZXI7XG5cbmxldCBwcm92aWRlckluc3RhbmNlOiA/UHJvdmlkZXI7XG5mdW5jdGlvbiBnZXRQcm92aWRlckluc3RhbmNlKCk6IFByb3ZpZGVyIHtcbiAgaWYgKHByb3ZpZGVySW5zdGFuY2UgPT0gbnVsbCkge1xuICAgIHByb3ZpZGVySW5zdGFuY2UgPSB7Li4uSGFja1N5bWJvbFByb3ZpZGVyfTtcbiAgfVxuICByZXR1cm4gcHJvdmlkZXJJbnN0YW5jZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgcmVnaXN0ZXJQcm92aWRlcigpOiBQcm92aWRlciB7XG4gICAgcmV0dXJuIGdldFByb3ZpZGVySW5zdGFuY2UoKTtcbiAgfSxcblxuICBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCkge1xuXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcblxuICB9LFxufTtcbiJdfQ==