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
 * Convert a structured logcat entry into the format that nuclide-console wants.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJPLFNBQVMsYUFBYSxDQUFDLE1BQWlCLEVBQVc7QUFDeEQsU0FBTztBQUNMLFFBQUksRUFBRSxNQUFNLENBQUMsT0FBTztBQUNwQixTQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7R0FDOUIsQ0FBQztDQUNIOztBQUVELFNBQVMsUUFBUSxDQUFDLEtBQWUsRUFBUztBQUN4QyxVQUFRLEtBQUs7QUFDWCxTQUFLLEdBQUcsQ0FBQztBQUNULFNBQUssR0FBRyxDQUFDO0FBQ1QsU0FBSyxHQUFHLENBQUM7QUFDVCxTQUFLLEdBQUc7O0FBQ04sYUFBTyxPQUFPLENBQUM7QUFBQSxBQUNqQixTQUFLLEdBQUc7O0FBQ04sYUFBTyxTQUFTLENBQUM7QUFBQSxBQUNuQixTQUFLLEdBQUc7O0FBQ04sYUFBTyxLQUFLLENBQUM7QUFBQSxBQUNmLFNBQUssR0FBRzs7QUFDTixhQUFPLE1BQU0sQ0FBQztBQUFBLEFBQ2hCLFNBQUssR0FBRzs7QUFDTixhQUFPLE9BQU8sQ0FBQztBQUFBLEFBQ2pCO0FBQ0UsWUFBTSxJQUFJLEtBQUsseUJBQXVCLEtBQUssQ0FBRyxDQUFDO0FBQUEsR0FDbEQ7Q0FDRiIsImZpbGUiOiJjcmVhdGVNZXNzYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0xldmVsLCBNZXNzYWdlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbnNvbGUvbGliL3R5cGVzJztcbmltcG9ydCB0eXBlIHtBc2xMZXZlbCwgQXNsUmVjb3JkfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBDb252ZXJ0IGEgc3RydWN0dXJlZCBsb2djYXQgZW50cnkgaW50byB0aGUgZm9ybWF0IHRoYXQgbnVjbGlkZS1jb25zb2xlIHdhbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWVzc2FnZShyZWNvcmQ6IEFzbFJlY29yZCk6IE1lc3NhZ2Uge1xuICByZXR1cm4ge1xuICAgIHRleHQ6IHJlY29yZC5NZXNzYWdlLFxuICAgIGxldmVsOiBnZXRMZXZlbChyZWNvcmQuTGV2ZWwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRMZXZlbChsZXZlbDogQXNsTGV2ZWwpOiBMZXZlbCB7XG4gIHN3aXRjaCAobGV2ZWwpIHtcbiAgICBjYXNlICcwJzogLy8gRW1lcmdlbmN5XG4gICAgY2FzZSAnMSc6IC8vIEFsZXJ0XG4gICAgY2FzZSAnMic6IC8vIENyaXRpY2FsXG4gICAgY2FzZSAnMyc6IC8vIEVycm9yXG4gICAgICByZXR1cm4gJ2Vycm9yJztcbiAgICBjYXNlICc0JzogLy8gV2FybmluZ1xuICAgICAgcmV0dXJuICd3YXJuaW5nJztcbiAgICBjYXNlICc1JzogLy8gTm90aWNlXG4gICAgICByZXR1cm4gJ2xvZyc7XG4gICAgY2FzZSAnNic6IC8vIEluZm9cbiAgICAgIHJldHVybiAnaW5mbyc7XG4gICAgY2FzZSAnNyc6IC8vIERlYnVnXG4gICAgICByZXR1cm4gJ2RlYnVnJztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIEFTTCBsZXZlbDogJHtsZXZlbH1gKTtcbiAgfVxufVxuIl19