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

exports.registerProvider = registerProvider;
exports.activate = activate;
exports.deactivate = deactivate;

var providerInstance = undefined;
function getProviderInstance() {
  if (providerInstance == null) {
    var OpenFileNameProvider = require('./OpenFileNameProvider');
    providerInstance = _extends({}, OpenFileNameProvider);
  }
  return providerInstance;
}

function registerProvider() {
  return getProviderInstance();
}

function activate(state) {}

function deactivate() {}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsSUFBSSxnQkFBMkIsWUFBQSxDQUFDO0FBQ2hDLFNBQVMsbUJBQW1CLEdBQWE7QUFDdkMsTUFBSSxnQkFBZ0IsSUFBSSxJQUFJLEVBQUU7QUFDNUIsUUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUMvRCxvQkFBZ0IsZ0JBQU8sb0JBQW9CLENBQUMsQ0FBQztHQUM5QztBQUNELFNBQU8sZ0JBQWdCLENBQUM7Q0FDekI7O0FBRU0sU0FBUyxnQkFBZ0IsR0FBYTtBQUMzQyxTQUFPLG1CQUFtQixFQUFFLENBQUM7Q0FDOUI7O0FBRU0sU0FBUyxRQUFRLENBQUMsS0FBYyxFQUFFLEVBRXhDOztBQUVNLFNBQVMsVUFBVSxHQUFHLEVBRTVCIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIFByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXF1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5cbmxldCBwcm92aWRlckluc3RhbmNlOiA/UHJvdmlkZXI7XG5mdW5jdGlvbiBnZXRQcm92aWRlckluc3RhbmNlKCk6IFByb3ZpZGVyIHtcbiAgaWYgKHByb3ZpZGVySW5zdGFuY2UgPT0gbnVsbCkge1xuICAgIGNvbnN0IE9wZW5GaWxlTmFtZVByb3ZpZGVyID0gcmVxdWlyZSgnLi9PcGVuRmlsZU5hbWVQcm92aWRlcicpO1xuICAgIHByb3ZpZGVySW5zdGFuY2UgPSB7Li4uT3BlbkZpbGVOYW1lUHJvdmlkZXJ9O1xuICB9XG4gIHJldHVybiBwcm92aWRlckluc3RhbmNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJQcm92aWRlcigpOiBQcm92aWRlciB7XG4gIHJldHVybiBnZXRQcm92aWRlckluc3RhbmNlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCkge1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuXG59XG4iXX0=