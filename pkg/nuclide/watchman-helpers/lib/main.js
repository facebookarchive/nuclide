

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = Object.defineProperties({}, {
  WatchmanClient: {
    get: function get() {
      return require('./WatchmanClient');
    },
    configurable: true,
    enumerable: true
  },
  WatchmanSubscription: {

    // Exposed for testing.

    get: function get() {
      return require('./WatchmanSubscription');
    },
    configurable: true,
    enumerable: true
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVdBLE1BQU0sQ0FBQyxPQUFPLDJCQUFHLEVBU2hCO0FBUkssZ0JBQWM7U0FBQSxlQUFHO0FBQ25CLGFBQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7S0FDcEM7Ozs7QUFHRyxzQkFBb0I7Ozs7U0FBQSxlQUFHO0FBQ3pCLGFBQU8sT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7S0FDMUM7Ozs7RUFDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IFdhdGNobWFuQ2xpZW50KCkge1xuICAgIHJldHVybiByZXF1aXJlKCcuL1dhdGNobWFuQ2xpZW50Jyk7XG4gIH0sXG5cbiAgLy8gRXhwb3NlZCBmb3IgdGVzdGluZy5cbiAgZ2V0IFdhdGNobWFuU3Vic2NyaXB0aW9uKCkge1xuICAgIHJldHVybiByZXF1aXJlKCcuL1dhdGNobWFuU3Vic2NyaXB0aW9uJyk7XG4gIH0sXG59O1xuIl19