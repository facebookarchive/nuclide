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

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _createMessage = require('./createMessage');

var _plist = require('plist');

var _plist2 = _interopRequireDefault(_plist);

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

function createMessageStream(line$) {

  // Group the lines into valid plist strings.
  return (0, _nuclideCommons.bufferUntil)(line$, function (line) {
    return line.trim() === '</plist>';
  })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs4QkFhMEIsdUJBQXVCOztvQ0FDdkIsOEJBQThCOzs7OzZCQUM1QixpQkFBaUI7O3FCQUMzQixPQUFPOzs7OzZCQUNWLGlCQUFpQjs7OztBQUV6QixTQUFTLG1CQUFtQixDQUFDLEtBQTRCLEVBQTBCOzs7QUFHeEYsU0FBTyxpQ0FBWSxLQUFLLEVBQUUsVUFBQSxJQUFJO1dBQUksSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLFVBQVU7R0FBQSxDQUFDOzs7R0FHMUQsTUFBTSxDQUFDLFVBQUEsS0FBSztXQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQztHQUFBLENBQUMsQ0FFakMsR0FBRyxDQUFDLFVBQUEsS0FBSztXQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0dBQUEsQ0FBQzs7OztHQUk1QixPQUFPLENBQUMsVUFBQSxHQUFHO1dBQUksbUJBQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQztHQUFBLENBQUM7OztHQUdoQyxNQUFNLENBQUMsVUFBQSxNQUFNO1dBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUM7R0FBQSxDQUFDOzs7OztHQUtsRCxNQUFNLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDaEIsUUFBTSxTQUFTLEdBQ1gsa0NBQWMsR0FBRyxDQUFDLDRDQUE0QyxDQUFDLEFBQXNCLENBQUM7QUFDMUYsV0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztHQUNoRCxDQUFDOzs7R0FHRCxHQUFHLDhCQUFlLENBQUM7Q0FDdkIiLCJmaWxlIjoiY3JlYXRlTWVzc2FnZVN0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtNZXNzYWdlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbnNvbGUvbGliL3R5cGVzJztcblxuaW1wb3J0IHtidWZmZXJVbnRpbH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IHtjcmVhdGVNZXNzYWdlfSBmcm9tICcuL2NyZWF0ZU1lc3NhZ2UnO1xuaW1wb3J0IHBsaXN0IGZyb20gJ3BsaXN0JztcbmltcG9ydCBSeCBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWVzc2FnZVN0cmVhbShsaW5lJDogUnguT2JzZXJ2YWJsZTxzdHJpbmc+KTogUnguT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG5cbiAgLy8gR3JvdXAgdGhlIGxpbmVzIGludG8gdmFsaWQgcGxpc3Qgc3RyaW5ncy5cbiAgcmV0dXJuIGJ1ZmZlclVudGlsKGxpbmUkLCBsaW5lID0+IGxpbmUudHJpbSgpID09PSAnPC9wbGlzdD4nKVxuICAgIC8vIERvbid0IGluY2x1ZGUgZW1wdHkgYnVmZmVycy4gVGhpcyBoYXBwZW5zIGlmIHRoZSBzdHJlYW0gY29tcGxldGVzIHNpbmNlIHdlIG9wZW5lZCBhIG5ld1xuICAgIC8vIGJ1ZmZlciB3aGVuIHRoZSBwcmV2aW91cyByZWNvcmQgZW5kZWQuXG4gICAgLmZpbHRlcihsaW5lcyA9PiBsaW5lcy5sZW5ndGggPiAxKVxuXG4gICAgLm1hcChsaW5lcyA9PiBsaW5lcy5qb2luKCcnKSlcblxuICAgIC8vIFBhcnNlIHRoZSBwbGlzdHMuIEVhY2ggcGFyc2VkIHBsaXN0IGNvbnRhaW5zIGFuIGFycmF5IHdoaWNoLCBpbiB0dXJuLCAqbWF5KiBjb250YWluIGRpY3RzXG4gICAgLy8gKHRoYXQgY29ycmVzcG9uZCB0byByZWNvcmRzKS4gV2UganVzdCB3YW50IHRob3NlIGRpY3RzIHNvIHdlIHVzZSBgZmxhdE1hcCgpYC5cbiAgICAuZmxhdE1hcCh4bWwgPT4gcGxpc3QucGFyc2UoeG1sKSlcblxuICAgIC8vIEV4Y2x1ZGUgZGljdHMgdGhhdCBkb24ndCBoYXZlIGFueSBtZXNzYWdlIHByb3BlcnR5LlxuICAgIC5maWx0ZXIocmVjb3JkID0+IHJlY29yZC5oYXNPd25Qcm9wZXJ0eSgnTWVzc2FnZScpKVxuXG4gICAgLy8gRXhjbHVkZSBibGFja2xpc3RlZCBzZW5kZXJzLlxuICAgIC8vIEZJWE1FOiBUaGlzIGlzIGEgc3RvcGdhcC4gV2hhdCB3ZSByZWFsbHkgbmVlZCB0byBkbyBpcyBpZGVudGlmeSB0aGUgY3VycmVudGx5IHJ1bm5pbmcgYXBwIGFuZFxuICAgIC8vICAgb25seSBzaG93IGl0cyBtZXNzYWdlcy4gKTpcbiAgICAuZmlsdGVyKHJlY29yZCA9PiB7XG4gICAgICBjb25zdCBibGFja2xpc3QgPVxuICAgICAgICAoKGZlYXR1cmVDb25maWcuZ2V0KCdudWNsaWRlLWlvcy1zaW11bGF0b3ItbG9ncy5zZW5kZXJCbGFja2xpc3QnKTogYW55KTogQXJyYXk8c3RyaW5nPik7XG4gICAgICByZXR1cm4gYmxhY2tsaXN0LmluZGV4T2YocmVjb3JkLlNlbmRlcikgPT09IC0xO1xuICAgIH0pXG5cbiAgICAvLyBGb3JtYXQgdGhlIG1lc3NhZ2VzIGZvciBOdWNsaWRlLlxuICAgIC5tYXAoY3JlYXRlTWVzc2FnZSk7XG59XG4iXX0=