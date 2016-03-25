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

exports['default'] = createMessage;

/**
 * Convert a structured logcat entry into the format that nuclide-output wants.
 */

function createMessage(entry) {
  var priority = entry.metadata && entry.metadata.priority || 'I';
  return {
    text: entry.message,
    level: priorityToLevel(priority)
  };
}

function priorityToLevel(priority) {
  switch (priority) {
    case 'W':
      // warn
      return 'warning';
    case 'E': // error
    case 'F':
      // fatal
      return 'error';
    case 'S':
      // silent
      throw new Error('Silent messages should be filtered');
    case 'V': // verbose
    case 'D': // debug
    case 'I': // info
    default:
      return 'info';
  }
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3FCQWlCd0IsYUFBYTs7Ozs7O0FBQXRCLFNBQVMsYUFBYSxDQUFDLEtBQWtCLEVBQVc7QUFDakUsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUM7QUFDbEUsU0FBTztBQUNMLFFBQUksRUFBRSxLQUFLLENBQUMsT0FBTztBQUNuQixTQUFLLEVBQUUsZUFBZSxDQUFDLFFBQVEsQ0FBQztHQUNqQyxDQUFDO0NBQ0g7O0FBRUQsU0FBUyxlQUFlLENBQUMsUUFBa0IsRUFBUztBQUNsRCxVQUFRLFFBQVE7QUFDZCxTQUFLLEdBQUc7O0FBQ04sYUFBTyxTQUFTLENBQUM7QUFBQSxBQUNuQixTQUFLLEdBQUcsQ0FBQztBQUNULFNBQUssR0FBRzs7QUFDTixhQUFPLE9BQU8sQ0FBQztBQUFBLEFBQ2pCLFNBQUssR0FBRzs7QUFDTixZQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFBQSxBQUN4RCxTQUFLLEdBQUcsQ0FBQztBQUNULFNBQUssR0FBRyxDQUFDO0FBQ1QsU0FBSyxHQUFHLENBQUM7QUFDVDtBQUNFLGFBQU8sTUFBTSxDQUFDO0FBQUEsR0FDakI7Q0FDRiIsImZpbGUiOiJjcmVhdGVNZXNzYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0xldmVsLCBNZXNzYWdlfSBmcm9tICcuLi8uLi9udWNsaWRlLW91dHB1dC9saWIvdHlwZXMnO1xuaW1wb3J0IHR5cGUge0xvZ2NhdEVudHJ5LCBQcmlvcml0eX0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogQ29udmVydCBhIHN0cnVjdHVyZWQgbG9nY2F0IGVudHJ5IGludG8gdGhlIGZvcm1hdCB0aGF0IG51Y2xpZGUtb3V0cHV0IHdhbnRzLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVNZXNzYWdlKGVudHJ5OiBMb2djYXRFbnRyeSk6IE1lc3NhZ2Uge1xuICBjb25zdCBwcmlvcml0eSA9IGVudHJ5Lm1ldGFkYXRhICYmIGVudHJ5Lm1ldGFkYXRhLnByaW9yaXR5IHx8ICdJJztcbiAgcmV0dXJuIHtcbiAgICB0ZXh0OiBlbnRyeS5tZXNzYWdlLFxuICAgIGxldmVsOiBwcmlvcml0eVRvTGV2ZWwocHJpb3JpdHkpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBwcmlvcml0eVRvTGV2ZWwocHJpb3JpdHk6IFByaW9yaXR5KTogTGV2ZWwge1xuICBzd2l0Y2ggKHByaW9yaXR5KSB7XG4gICAgY2FzZSAnVyc6IC8vIHdhcm5cbiAgICAgIHJldHVybiAnd2FybmluZyc7XG4gICAgY2FzZSAnRSc6IC8vIGVycm9yXG4gICAgY2FzZSAnRic6IC8vIGZhdGFsXG4gICAgICByZXR1cm4gJ2Vycm9yJztcbiAgICBjYXNlICdTJzogLy8gc2lsZW50XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NpbGVudCBtZXNzYWdlcyBzaG91bGQgYmUgZmlsdGVyZWQnKTtcbiAgICBjYXNlICdWJzogLy8gdmVyYm9zZVxuICAgIGNhc2UgJ0QnOiAvLyBkZWJ1Z1xuICAgIGNhc2UgJ0knOiAvLyBpbmZvXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnaW5mbyc7XG4gIH1cbn1cbiJdfQ==