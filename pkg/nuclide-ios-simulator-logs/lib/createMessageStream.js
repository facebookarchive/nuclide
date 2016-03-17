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

exports.createMessageStream = createMessageStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _createMessage = require('./createMessage');

var _plist = require('plist');

var _plist2 = _interopRequireDefault(_plist);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

function createMessageStream(line$) {
  var sharedLine$ = line$.share();

  return sharedLine$
  // Group the lines into valid plist strings.
  .buffer(sharedLine$.filter(function (line) {
    return line.trim() === '</plist>';
  }))

  // Don't include empty buffers. This happens if the stream completes since we opened a new
  // buffer when the previous record ended.
  .filter(function (lines) {
    return lines.length > 1;
  }).map(function (lines) {
    return lines.join('');
  })

  // Parse the plists. Each parsed plist contains an array which, in turn, *may* contain dicts
  // (that correspond to records). We just want those dicts so we use `flatMap()`.
  .flatMap(function (xml) {
    return _plist2['default'].parse(xml);
  })

  // Exclude dicts that don't have any message property.
  .filter(function (record) {
    return record.hasOwnProperty('Message');
  })

  // Exclude blacklisted senders.
  // FIXME: This is a stopgap. What we really need to do is identify the currently running app and
  //   only show its messages. ):
  .filter(function (record) {
    var blacklist = _nuclideFeatureConfig2['default'].get('nuclide-ios-simulator-logs.senderBlacklist');
    return blacklist.indexOf(record.Sender) === -1;
  })

  // Format the messages for Nuclide.
  .map(_createMessage.createMessage);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztvQ0FhMEIsOEJBQThCOzs7OzZCQUM1QixpQkFBaUI7O3FCQUMzQixPQUFPOzs7O2tCQUNWLElBQUk7Ozs7QUFFWixTQUFTLG1CQUFtQixDQUFDLEtBQTRCLEVBQTBCO0FBQ3hGLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFbEMsU0FBTyxXQUFXOztHQUVmLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxVQUFVO0dBQUEsQ0FBQyxDQUFDOzs7O0dBSTlELE1BQU0sQ0FBQyxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7R0FBQSxDQUFDLENBRWpDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztHQUFBLENBQUM7Ozs7R0FJNUIsT0FBTyxDQUFDLFVBQUEsR0FBRztXQUFJLG1CQUFNLEtBQUssQ0FBQyxHQUFHLENBQUM7R0FBQSxDQUFDOzs7R0FHaEMsTUFBTSxDQUFDLFVBQUEsTUFBTTtXQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDO0dBQUEsQ0FBQzs7Ozs7R0FLbEQsTUFBTSxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ2hCLFFBQU0sU0FBUyxHQUNYLGtDQUFjLEdBQUcsQ0FBQyw0Q0FBNEMsQ0FBQyxBQUFzQixDQUFDO0FBQzFGLFdBQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7R0FDaEQsQ0FBQzs7O0dBR0QsR0FBRyw4QkFBZSxDQUFDO0NBQ3ZCIiwiZmlsZSI6ImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TWVzc2FnZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1vdXRwdXQvbGliL3R5cGVzJztcblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQge2NyZWF0ZU1lc3NhZ2V9IGZyb20gJy4vY3JlYXRlTWVzc2FnZSc7XG5pbXBvcnQgcGxpc3QgZnJvbSAncGxpc3QnO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VTdHJlYW0obGluZSQ6IFJ4Lk9ic2VydmFibGU8c3RyaW5nPik6IFJ4Lk9ic2VydmFibGU8TWVzc2FnZT4ge1xuICBjb25zdCBzaGFyZWRMaW5lJCA9IGxpbmUkLnNoYXJlKCk7XG5cbiAgcmV0dXJuIHNoYXJlZExpbmUkXG4gICAgLy8gR3JvdXAgdGhlIGxpbmVzIGludG8gdmFsaWQgcGxpc3Qgc3RyaW5ncy5cbiAgICAuYnVmZmVyKHNoYXJlZExpbmUkLmZpbHRlcihsaW5lID0+IGxpbmUudHJpbSgpID09PSAnPC9wbGlzdD4nKSlcblxuICAgIC8vIERvbid0IGluY2x1ZGUgZW1wdHkgYnVmZmVycy4gVGhpcyBoYXBwZW5zIGlmIHRoZSBzdHJlYW0gY29tcGxldGVzIHNpbmNlIHdlIG9wZW5lZCBhIG5ld1xuICAgIC8vIGJ1ZmZlciB3aGVuIHRoZSBwcmV2aW91cyByZWNvcmQgZW5kZWQuXG4gICAgLmZpbHRlcihsaW5lcyA9PiBsaW5lcy5sZW5ndGggPiAxKVxuXG4gICAgLm1hcChsaW5lcyA9PiBsaW5lcy5qb2luKCcnKSlcblxuICAgIC8vIFBhcnNlIHRoZSBwbGlzdHMuIEVhY2ggcGFyc2VkIHBsaXN0IGNvbnRhaW5zIGFuIGFycmF5IHdoaWNoLCBpbiB0dXJuLCAqbWF5KiBjb250YWluIGRpY3RzXG4gICAgLy8gKHRoYXQgY29ycmVzcG9uZCB0byByZWNvcmRzKS4gV2UganVzdCB3YW50IHRob3NlIGRpY3RzIHNvIHdlIHVzZSBgZmxhdE1hcCgpYC5cbiAgICAuZmxhdE1hcCh4bWwgPT4gcGxpc3QucGFyc2UoeG1sKSlcblxuICAgIC8vIEV4Y2x1ZGUgZGljdHMgdGhhdCBkb24ndCBoYXZlIGFueSBtZXNzYWdlIHByb3BlcnR5LlxuICAgIC5maWx0ZXIocmVjb3JkID0+IHJlY29yZC5oYXNPd25Qcm9wZXJ0eSgnTWVzc2FnZScpKVxuXG4gICAgLy8gRXhjbHVkZSBibGFja2xpc3RlZCBzZW5kZXJzLlxuICAgIC8vIEZJWE1FOiBUaGlzIGlzIGEgc3RvcGdhcC4gV2hhdCB3ZSByZWFsbHkgbmVlZCB0byBkbyBpcyBpZGVudGlmeSB0aGUgY3VycmVudGx5IHJ1bm5pbmcgYXBwIGFuZFxuICAgIC8vICAgb25seSBzaG93IGl0cyBtZXNzYWdlcy4gKTpcbiAgICAuZmlsdGVyKHJlY29yZCA9PiB7XG4gICAgICBjb25zdCBibGFja2xpc3QgPVxuICAgICAgICAoKGZlYXR1cmVDb25maWcuZ2V0KCdudWNsaWRlLWlvcy1zaW11bGF0b3ItbG9ncy5zZW5kZXJCbGFja2xpc3QnKTogYW55KTogQXJyYXk8c3RyaW5nPik7XG4gICAgICByZXR1cm4gYmxhY2tsaXN0LmluZGV4T2YocmVjb3JkLlNlbmRlcikgPT09IC0xO1xuICAgIH0pXG5cbiAgICAvLyBGb3JtYXQgdGhlIG1lc3NhZ2VzIGZvciBOdWNsaWRlLlxuICAgIC5tYXAoY3JlYXRlTWVzc2FnZSk7XG59XG4iXX0=