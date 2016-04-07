Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createProcessStream = createProcessStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../nuclide-commons');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

function createProcessStream() {
  return (0, _nuclideCommons.observeProcess)(spawnAdbLogcat).map(function (event) {
    if (event.kind === 'exit') {
      throw new Error('adb logcat exited unexpectedly');
    }
    return event;
  })

  // Only get the text from stdout.
  .filter(function (event) {
    return event.kind === 'stdout';
  }).map(function (event) {
    return event.data && event.data.replace(/\r?\n$/, '');
  })

  // Skip the single historical log. Adb requires us to have at least one (`-T`) but (for now at
  // least) we only want to show live logs. Also, since we're automatically retrying, displaying
  // it would mean users would get an inexplicable old entry.
  .skip(1);
}

function spawnAdbLogcat() {
  return (0, _nuclideCommons.safeSpawn)('adb', ['logcat', '-v', 'long', '-T', '1']);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZVByb2Nlc3NTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OzhCQVd3Qyx1QkFBdUI7O2tCQUNoRCxJQUFJOzs7O0FBRVosU0FBUyxtQkFBbUIsR0FBMEI7QUFDM0QsU0FBTyxvQ0FBZSxjQUFjLENBQUMsQ0FDbEMsR0FBRyxDQUFDLFVBQUEsS0FBSyxFQUFJO0FBQ1osUUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtBQUN6QixZQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7S0FDbkQ7QUFDRCxXQUFPLEtBQUssQ0FBQztHQUNkLENBQUM7OztHQUdELE1BQU0sQ0FBQyxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVE7R0FBQSxDQUFDLENBQ3hDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7R0FBQSxDQUFDOzs7OztHQUs1RCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDWjs7QUFFRCxTQUFTLGNBQWMsR0FBd0M7QUFDN0QsU0FBTywrQkFBVSxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUM5RCIsImZpbGUiOiJjcmVhdGVQcm9jZXNzU3RyZWFtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtvYnNlcnZlUHJvY2Vzcywgc2FmZVNwYXdufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb2Nlc3NTdHJlYW0oKTogUnguT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgcmV0dXJuIG9ic2VydmVQcm9jZXNzKHNwYXduQWRiTG9nY2F0KVxuICAgIC5tYXAoZXZlbnQgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtpbmQgPT09ICdleGl0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FkYiBsb2djYXQgZXhpdGVkIHVuZXhwZWN0ZWRseScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH0pXG5cbiAgICAvLyBPbmx5IGdldCB0aGUgdGV4dCBmcm9tIHN0ZG91dC5cbiAgICAuZmlsdGVyKGV2ZW50ID0+IGV2ZW50LmtpbmQgPT09ICdzdGRvdXQnKVxuICAgIC5tYXAoZXZlbnQgPT4gZXZlbnQuZGF0YSAmJiBldmVudC5kYXRhLnJlcGxhY2UoL1xccj9cXG4kLywgJycpKVxuXG4gICAgLy8gU2tpcCB0aGUgc2luZ2xlIGhpc3RvcmljYWwgbG9nLiBBZGIgcmVxdWlyZXMgdXMgdG8gaGF2ZSBhdCBsZWFzdCBvbmUgKGAtVGApIGJ1dCAoZm9yIG5vdyBhdFxuICAgIC8vIGxlYXN0KSB3ZSBvbmx5IHdhbnQgdG8gc2hvdyBsaXZlIGxvZ3MuIEFsc28sIHNpbmNlIHdlJ3JlIGF1dG9tYXRpY2FsbHkgcmV0cnlpbmcsIGRpc3BsYXlpbmdcbiAgICAvLyBpdCB3b3VsZCBtZWFuIHVzZXJzIHdvdWxkIGdldCBhbiBpbmV4cGxpY2FibGUgb2xkIGVudHJ5LlxuICAgIC5za2lwKDEpO1xufVxuXG5mdW5jdGlvbiBzcGF3bkFkYkxvZ2NhdCgpOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gIHJldHVybiBzYWZlU3Bhd24oJ2FkYicsIFsnbG9nY2F0JywgJy12JywgJ2xvbmcnLCAnLVQnLCAnMSddKTtcbn1cbiJdfQ==