var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var Immutable = require('immutable');

var OptionsRecord = Immutable.Record({

  // Line length settings.

  /**
   * This is the length with which reprint will try to keep each line within.
   *
   * Note: It's not guaranteed to keep lines within this length, but it will
   * do its best.
   */
  maxLineLength: 80,

  // Tab Settings.

  /**
   * The width of a tab. If using spaces this is how many spaces will be
   * inserted. If using tab charcters this is how many spaces a single tab
   * is expected to be displayed as.
   */
  tabWidth: 2,
  /**
   * If true spaces will be used for indentation, otherwise tabs will be used.
   */
  useSpaces: true

});

/**
 * Set up a class to get strong type checking.
 */

var Options = (function (_OptionsRecord) {
  _inherits(Options, _OptionsRecord);

  function Options(init) {
    _classCallCheck(this, Options);

    _get(Object.getPrototypeOf(Options.prototype), 'constructor', this).call(this, init);
  }

  return Options;
})(OptionsRecord);

module.exports = Options;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk9wdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRXZDLElBQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7Ozs7Ozs7Ozs7QUFVckMsZUFBYSxFQUFFLEVBQUU7Ozs7Ozs7OztBQVNqQixVQUFRLEVBQUUsQ0FBQzs7OztBQUlYLFdBQVMsRUFBRSxJQUFJOztDQUVoQixDQUFDLENBQUM7Ozs7OztJQUtHLE9BQU87WUFBUCxPQUFPOztBQU1BLFdBTlAsT0FBTyxDQU1DLElBSVgsRUFBRTswQkFWQyxPQUFPOztBQVdULCtCQVhFLE9BQU8sNkNBV0gsSUFBSSxFQUFFO0dBQ2I7O1NBWkcsT0FBTztHQUFTLGFBQWE7O0FBZW5DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDIiwiZmlsZSI6Ik9wdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBJbW11dGFibGUgPSByZXF1aXJlKCdpbW11dGFibGUnKTtcblxuY29uc3QgT3B0aW9uc1JlY29yZCA9IEltbXV0YWJsZS5SZWNvcmQoe1xuXG4gIC8vIExpbmUgbGVuZ3RoIHNldHRpbmdzLlxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHRoZSBsZW5ndGggd2l0aCB3aGljaCByZXByaW50IHdpbGwgdHJ5IHRvIGtlZXAgZWFjaCBsaW5lIHdpdGhpbi5cbiAgICpcbiAgICogTm90ZTogSXQncyBub3QgZ3VhcmFudGVlZCB0byBrZWVwIGxpbmVzIHdpdGhpbiB0aGlzIGxlbmd0aCwgYnV0IGl0IHdpbGxcbiAgICogZG8gaXRzIGJlc3QuXG4gICAqL1xuICBtYXhMaW5lTGVuZ3RoOiA4MCxcblxuICAvLyBUYWIgU2V0dGluZ3MuXG5cbiAgLyoqXG4gICAqIFRoZSB3aWR0aCBvZiBhIHRhYi4gSWYgdXNpbmcgc3BhY2VzIHRoaXMgaXMgaG93IG1hbnkgc3BhY2VzIHdpbGwgYmVcbiAgICogaW5zZXJ0ZWQuIElmIHVzaW5nIHRhYiBjaGFyY3RlcnMgdGhpcyBpcyBob3cgbWFueSBzcGFjZXMgYSBzaW5nbGUgdGFiXG4gICAqIGlzIGV4cGVjdGVkIHRvIGJlIGRpc3BsYXllZCBhcy5cbiAgICovXG4gIHRhYldpZHRoOiAyLFxuICAvKipcbiAgICogSWYgdHJ1ZSBzcGFjZXMgd2lsbCBiZSB1c2VkIGZvciBpbmRlbnRhdGlvbiwgb3RoZXJ3aXNlIHRhYnMgd2lsbCBiZSB1c2VkLlxuICAgKi9cbiAgdXNlU3BhY2VzOiB0cnVlLFxuXG59KTtcblxuLyoqXG4gKiBTZXQgdXAgYSBjbGFzcyB0byBnZXQgc3Ryb25nIHR5cGUgY2hlY2tpbmcuXG4gKi9cbmNsYXNzIE9wdGlvbnMgZXh0ZW5kcyBPcHRpb25zUmVjb3JkIHtcblxuICBtYXhMaW5lTGVuZ3RoOiBudW1iZXI7XG4gIHRhYldpZHRoOiBudW1iZXI7XG4gIHVzZVNwYWNlczogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihpbml0Pzoge1xuICAgIG1heExpbmVMZW5ndGg/OiBudW1iZXIsXG4gICAgdGFiV2lkdGg/OiBudW1iZXIsXG4gICAgdXNlU3BhY2VzPzogYm9vbGVhbixcbiAgfSkge1xuICAgIHN1cGVyKGluaXQpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT3B0aW9ucztcbiJdfQ==