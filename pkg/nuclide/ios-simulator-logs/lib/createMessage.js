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

exports.createMessage = createMessage;

/**
 * Convert a structured logcat entry into the format that nuclide-output wants.
 */

function createMessage(record) {
  return {
    text: record.Message,
    level: getLevel(record.Level)
  };
}

function getLevel(level) {
  switch (level) {
    case '0': // Emergency
    case '1': // Alert
    case '2': // Critical
    case '3':
      // Error
      return 'error';
    case '4':
      // Warning
      return 'warning';
    case '5':
      // Notice
      return 'log';
    case '6':
      // Info
      return 'info';
    case '7':
      // Debug
      return 'debug';
    default:
      throw new Error('Invalid ASL level: ' + level);
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJPLFNBQVMsYUFBYSxDQUFDLE1BQWlCLEVBQVc7QUFDeEQsU0FBTztBQUNMLFFBQUksRUFBRSxNQUFNLENBQUMsT0FBTztBQUNwQixTQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7R0FDOUIsQ0FBQztDQUNIOztBQUVELFNBQVMsUUFBUSxDQUFDLEtBQWUsRUFBUztBQUN4QyxVQUFRLEtBQUs7QUFDWCxTQUFLLEdBQUcsQ0FBQztBQUNULFNBQUssR0FBRyxDQUFDO0FBQ1QsU0FBSyxHQUFHLENBQUM7QUFDVCxTQUFLLEdBQUc7O0FBQ04sYUFBTyxPQUFPLENBQUM7QUFBQSxBQUNqQixTQUFLLEdBQUc7O0FBQ04sYUFBTyxTQUFTLENBQUM7QUFBQSxBQUNuQixTQUFLLEdBQUc7O0FBQ04sYUFBTyxLQUFLLENBQUM7QUFBQSxBQUNmLFNBQUssR0FBRzs7QUFDTixhQUFPLE1BQU0sQ0FBQztBQUFBLEFBQ2hCLFNBQUssR0FBRzs7QUFDTixhQUFPLE9BQU8sQ0FBQztBQUFBLEFBQ2pCO0FBQ0UsWUFBTSxJQUFJLEtBQUsseUJBQXVCLEtBQUssQ0FBRyxDQUFDO0FBQUEsR0FDbEQ7Q0FDRiIsImZpbGUiOiJjcmVhdGVNZXNzYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0xldmVsLCBNZXNzYWdlfSBmcm9tICcuLi8uLi9vdXRwdXQvbGliL3R5cGVzJztcbmltcG9ydCB0eXBlIHtBc2xMZXZlbCwgQXNsUmVjb3JkfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBDb252ZXJ0IGEgc3RydWN0dXJlZCBsb2djYXQgZW50cnkgaW50byB0aGUgZm9ybWF0IHRoYXQgbnVjbGlkZS1vdXRwdXQgd2FudHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNZXNzYWdlKHJlY29yZDogQXNsUmVjb3JkKTogTWVzc2FnZSB7XG4gIHJldHVybiB7XG4gICAgdGV4dDogcmVjb3JkLk1lc3NhZ2UsXG4gICAgbGV2ZWw6IGdldExldmVsKHJlY29yZC5MZXZlbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldExldmVsKGxldmVsOiBBc2xMZXZlbCk6IExldmVsIHtcbiAgc3dpdGNoIChsZXZlbCkge1xuICAgIGNhc2UgJzAnOiAvLyBFbWVyZ2VuY3lcbiAgICBjYXNlICcxJzogLy8gQWxlcnRcbiAgICBjYXNlICcyJzogLy8gQ3JpdGljYWxcbiAgICBjYXNlICczJzogLy8gRXJyb3JcbiAgICAgIHJldHVybiAnZXJyb3InO1xuICAgIGNhc2UgJzQnOiAvLyBXYXJuaW5nXG4gICAgICByZXR1cm4gJ3dhcm5pbmcnO1xuICAgIGNhc2UgJzUnOiAvLyBOb3RpY2VcbiAgICAgIHJldHVybiAnbG9nJztcbiAgICBjYXNlICc2JzogLy8gSW5mb1xuICAgICAgcmV0dXJuICdpbmZvJztcbiAgICBjYXNlICc3JzogLy8gRGVidWdcbiAgICAgIHJldHVybiAnZGVidWcnO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgQVNMIGxldmVsOiAke2xldmVsfWApO1xuICB9XG59XG4iXX0=