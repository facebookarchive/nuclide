

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = Object.defineProperties({}, {
  hgConstants: {
    get: function get() {
      return require('./hg-constants');
    },
    configurable: true,
    enumerable: true
  },
  HgService: {
    get: function get() {
      return require('./HgService');
    },
    configurable: true,
    enumerable: true
  },
  MockHgService: {

    // Exposed for testing

    get: function get() {
      return require('../spec/MockHgService');
    },
    configurable: true,
    enumerable: true
  },
  revisions: {
    get: function get() {
      return require('./hg-revision-expression-helpers');
    },
    configurable: true,
    enumerable: true
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVdBLE1BQU0sQ0FBQyxPQUFPLDJCQUFHLEVBaUJoQjtBQWhCSyxhQUFXO1NBQUEsZUFBRztBQUNoQixhQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQ2xDOzs7O0FBRUcsV0FBUztTQUFBLGVBQUc7QUFDZCxhQUFPLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUMvQjs7OztBQUdHLGVBQWE7Ozs7U0FBQSxlQUFHO0FBQ2xCLGFBQU8sT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7S0FDekM7Ozs7QUFFRyxXQUFTO1NBQUEsZUFBRztBQUNkLGFBQU8sT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7S0FDcEQ7Ozs7RUFDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IGhnQ29uc3RhbnRzKCkge1xuICAgIHJldHVybiByZXF1aXJlKCcuL2hnLWNvbnN0YW50cycpO1xuICB9LFxuXG4gIGdldCBIZ1NlcnZpY2UoKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJy4vSGdTZXJ2aWNlJyk7XG4gIH0sXG5cbiAgLy8gRXhwb3NlZCBmb3IgdGVzdGluZ1xuICBnZXQgTW9ja0hnU2VydmljZSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi4vc3BlYy9Nb2NrSGdTZXJ2aWNlJyk7XG4gIH0sXG5cbiAgZ2V0IHJldmlzaW9ucygpIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi9oZy1yZXZpc2lvbi1leHByZXNzaW9uLWhlbHBlcnMnKTtcbiAgfSxcbn07XG4iXX0=