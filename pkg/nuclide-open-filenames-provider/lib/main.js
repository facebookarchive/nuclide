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
    var OpenFileNameProvider = require('./OpenFileNameProvider');
    providerInstance = _extends({}, OpenFileNameProvider);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQWVBLElBQUksZ0JBQTJCLFlBQUEsQ0FBQztBQUNoQyxTQUFTLG1CQUFtQixHQUFhO0FBQ3ZDLE1BQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO0FBQzVCLFFBQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDL0Qsb0JBQWdCLGdCQUFPLG9CQUFvQixDQUFDLENBQUM7R0FDOUM7QUFDRCxTQUFPLGdCQUFnQixDQUFDO0NBQ3pCOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7O0FBRWYsa0JBQWdCLEVBQUEsNEJBQWE7QUFDM0IsV0FBTyxtQkFBbUIsRUFBRSxDQUFDO0dBQzlCOztBQUVELFVBQVEsRUFBQSxrQkFBQyxLQUFjLEVBQUUsRUFFeEI7O0FBRUQsWUFBVSxFQUFBLHNCQUFHLEVBRVo7Q0FDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIFByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXF1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5cbmxldCBwcm92aWRlckluc3RhbmNlOiA/UHJvdmlkZXI7XG5mdW5jdGlvbiBnZXRQcm92aWRlckluc3RhbmNlKCk6IFByb3ZpZGVyIHtcbiAgaWYgKHByb3ZpZGVySW5zdGFuY2UgPT0gbnVsbCkge1xuICAgIGNvbnN0IE9wZW5GaWxlTmFtZVByb3ZpZGVyID0gcmVxdWlyZSgnLi9PcGVuRmlsZU5hbWVQcm92aWRlcicpO1xuICAgIHByb3ZpZGVySW5zdGFuY2UgPSB7Li4uT3BlbkZpbGVOYW1lUHJvdmlkZXJ9O1xuICB9XG4gIHJldHVybiBwcm92aWRlckluc3RhbmNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICByZWdpc3RlclByb3ZpZGVyKCk6IFByb3ZpZGVyIHtcbiAgICByZXR1cm4gZ2V0UHJvdmlkZXJJbnN0YW5jZSgpO1xuICB9LFxuXG4gIGFjdGl2YXRlKHN0YXRlOiA/T2JqZWN0KSB7XG5cbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuXG4gIH0sXG59O1xuIl19