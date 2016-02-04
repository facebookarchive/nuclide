

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {
  activate: function activate(state) {},

  provideNuclideDebuggerHhvm: function provideNuclideDebuggerHhvm() {
    var Service = require('./Service');
    return Service;
  },

  getHomeFragments: function getHomeFragments() {
    return {
      feature: {
        title: 'HHVM Debugger',
        icon: 'plug',
        description: 'Connect to a HHVM server process and debug Hack code from within Nuclide.',
        command: 'nuclide-debugger:toggle'
      },
      priority: 6
    };
  }

};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQWNBLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUEsa0JBQUMsS0FBWSxFQUFRLEVBQzVCOztBQUVELDRCQUEwQixFQUFBLHNDQUE2QjtBQUNyRCxRQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDckMsV0FBTyxPQUFPLENBQUM7R0FDaEI7O0FBRUQsa0JBQWdCLEVBQUEsNEJBQWtCO0FBQ2hDLFdBQU87QUFDTCxhQUFPLEVBQUU7QUFDUCxhQUFLLEVBQUUsZUFBZTtBQUN0QixZQUFJLEVBQUUsTUFBTTtBQUNaLG1CQUFXLEVBQUUsMkVBQTJFO0FBQ3hGLGVBQU8sRUFBRSx5QkFBeUI7T0FDbkM7QUFDRCxjQUFRLEVBQUUsQ0FBQztLQUNaLENBQUM7R0FDSDs7Q0FFRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SG9tZUZyYWdtZW50c30gZnJvbSAnLi4vLi4vLi4vaG9tZS1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2V9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc2VydmljZSc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZShzdGF0ZTogbWl4ZWQpOiB2b2lkIHtcbiAgfSxcblxuICBwcm92aWRlTnVjbGlkZURlYnVnZ2VySGh2bSgpOiBudWNsaWRlX2RlYnVnZ2VyJFNlcnZpY2Uge1xuICAgIGNvbnN0IFNlcnZpY2UgPSByZXF1aXJlKCcuL1NlcnZpY2UnKTtcbiAgICByZXR1cm4gU2VydmljZTtcbiAgfSxcblxuICBnZXRIb21lRnJhZ21lbnRzKCk6IEhvbWVGcmFnbWVudHMge1xuICAgIHJldHVybiB7XG4gICAgICBmZWF0dXJlOiB7XG4gICAgICAgIHRpdGxlOiAnSEhWTSBEZWJ1Z2dlcicsXG4gICAgICAgIGljb246ICdwbHVnJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDb25uZWN0IHRvIGEgSEhWTSBzZXJ2ZXIgcHJvY2VzcyBhbmQgZGVidWcgSGFjayBjb2RlIGZyb20gd2l0aGluIE51Y2xpZGUuJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZGVidWdnZXI6dG9nZ2xlJyxcbiAgICAgIH0sXG4gICAgICBwcmlvcml0eTogNixcbiAgICB9O1xuICB9LFxuXG59O1xuIl19