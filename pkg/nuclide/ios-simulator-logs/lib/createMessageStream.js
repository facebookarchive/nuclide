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

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

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
    var blacklist = _featureConfig2['default'].get('nuclide-ios-simulator-logs.senderBlacklist');
    return blacklist.indexOf(record.Sender) === -1;
  })

  // Format the messages for Nuclide.
  .map(_createMessage.createMessage);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFhMEIsc0JBQXNCOzs7OzZCQUNwQixpQkFBaUI7O3FCQUMzQixPQUFPOzs7O2tCQUNWLElBQUk7Ozs7QUFFWixTQUFTLG1CQUFtQixDQUFDLEtBQTRCLEVBQTBCO0FBQ3hGLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFbEMsU0FBTyxXQUFXOztHQUVmLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxVQUFVO0dBQUEsQ0FBQyxDQUFDOzs7O0dBSTlELE1BQU0sQ0FBQyxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7R0FBQSxDQUFDLENBRWpDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztHQUFBLENBQUM7Ozs7R0FJNUIsT0FBTyxDQUFDLFVBQUEsR0FBRztXQUFJLG1CQUFNLEtBQUssQ0FBQyxHQUFHLENBQUM7R0FBQSxDQUFDOzs7R0FHaEMsTUFBTSxDQUFDLFVBQUEsTUFBTTtXQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDO0dBQUEsQ0FBQzs7Ozs7R0FLbEQsTUFBTSxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ2hCLFFBQU0sU0FBUyxHQUNYLDJCQUFjLEdBQUcsQ0FBQyw0Q0FBNEMsQ0FBQyxBQUFzQixDQUFDO0FBQzFGLFdBQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7R0FDaEQsQ0FBQzs7O0dBR0QsR0FBRyw4QkFBZSxDQUFDO0NBQ3ZCIiwiZmlsZSI6ImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TWVzc2FnZX0gZnJvbSAnLi4vLi4vb3V0cHV0L2xpYi90eXBlcyc7XG5cbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL2ZlYXR1cmUtY29uZmlnJztcbmltcG9ydCB7Y3JlYXRlTWVzc2FnZX0gZnJvbSAnLi9jcmVhdGVNZXNzYWdlJztcbmltcG9ydCBwbGlzdCBmcm9tICdwbGlzdCc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWVzc2FnZVN0cmVhbShsaW5lJDogUnguT2JzZXJ2YWJsZTxzdHJpbmc+KTogUnguT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gIGNvbnN0IHNoYXJlZExpbmUkID0gbGluZSQuc2hhcmUoKTtcblxuICByZXR1cm4gc2hhcmVkTGluZSRcbiAgICAvLyBHcm91cCB0aGUgbGluZXMgaW50byB2YWxpZCBwbGlzdCBzdHJpbmdzLlxuICAgIC5idWZmZXIoc2hhcmVkTGluZSQuZmlsdGVyKGxpbmUgPT4gbGluZS50cmltKCkgPT09ICc8L3BsaXN0PicpKVxuXG4gICAgLy8gRG9uJ3QgaW5jbHVkZSBlbXB0eSBidWZmZXJzLiBUaGlzIGhhcHBlbnMgaWYgdGhlIHN0cmVhbSBjb21wbGV0ZXMgc2luY2Ugd2Ugb3BlbmVkIGEgbmV3XG4gICAgLy8gYnVmZmVyIHdoZW4gdGhlIHByZXZpb3VzIHJlY29yZCBlbmRlZC5cbiAgICAuZmlsdGVyKGxpbmVzID0+IGxpbmVzLmxlbmd0aCA+IDEpXG5cbiAgICAubWFwKGxpbmVzID0+IGxpbmVzLmpvaW4oJycpKVxuXG4gICAgLy8gUGFyc2UgdGhlIHBsaXN0cy4gRWFjaCBwYXJzZWQgcGxpc3QgY29udGFpbnMgYW4gYXJyYXkgd2hpY2gsIGluIHR1cm4sICptYXkqIGNvbnRhaW4gZGljdHNcbiAgICAvLyAodGhhdCBjb3JyZXNwb25kIHRvIHJlY29yZHMpLiBXZSBqdXN0IHdhbnQgdGhvc2UgZGljdHMgc28gd2UgdXNlIGBmbGF0TWFwKClgLlxuICAgIC5mbGF0TWFwKHhtbCA9PiBwbGlzdC5wYXJzZSh4bWwpKVxuXG4gICAgLy8gRXhjbHVkZSBkaWN0cyB0aGF0IGRvbid0IGhhdmUgYW55IG1lc3NhZ2UgcHJvcGVydHkuXG4gICAgLmZpbHRlcihyZWNvcmQgPT4gcmVjb3JkLmhhc093blByb3BlcnR5KCdNZXNzYWdlJykpXG5cbiAgICAvLyBFeGNsdWRlIGJsYWNrbGlzdGVkIHNlbmRlcnMuXG4gICAgLy8gRklYTUU6IFRoaXMgaXMgYSBzdG9wZ2FwLiBXaGF0IHdlIHJlYWxseSBuZWVkIHRvIGRvIGlzIGlkZW50aWZ5IHRoZSBjdXJyZW50bHkgcnVubmluZyBhcHAgYW5kXG4gICAgLy8gICBvbmx5IHNob3cgaXRzIG1lc3NhZ2VzLiApOlxuICAgIC5maWx0ZXIocmVjb3JkID0+IHtcbiAgICAgIGNvbnN0IGJsYWNrbGlzdCA9XG4gICAgICAgICgoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtaW9zLXNpbXVsYXRvci1sb2dzLnNlbmRlckJsYWNrbGlzdCcpOiBhbnkpOiBBcnJheTxzdHJpbmc+KTtcbiAgICAgIHJldHVybiBibGFja2xpc3QuaW5kZXhPZihyZWNvcmQuU2VuZGVyKSA9PT0gLTE7XG4gICAgfSlcblxuICAgIC8vIEZvcm1hdCB0aGUgbWVzc2FnZXMgZm9yIE51Y2xpZGUuXG4gICAgLm1hcChjcmVhdGVNZXNzYWdlKTtcbn1cbiJdfQ==