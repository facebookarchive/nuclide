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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztvQ0FhMEIsOEJBQThCOzs7OzZCQUM1QixpQkFBaUI7O3FCQUMzQixPQUFPOzs7O2tCQUNWLElBQUk7Ozs7QUFFWixTQUFTLG1CQUFtQixDQUFDLEtBQTRCLEVBQTBCO0FBQ3hGLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFbEMsU0FBTyxXQUFXOztHQUVmLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxVQUFVO0dBQUEsQ0FBQyxDQUFDOzs7O0dBSTlELE1BQU0sQ0FBQyxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7R0FBQSxDQUFDLENBRWpDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7V0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztHQUFBLENBQUM7Ozs7R0FJNUIsT0FBTyxDQUFDLFVBQUEsR0FBRztXQUFJLG1CQUFNLEtBQUssQ0FBQyxHQUFHLENBQUM7R0FBQSxDQUFDOzs7R0FHaEMsTUFBTSxDQUFDLFVBQUEsTUFBTTtXQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDO0dBQUEsQ0FBQzs7Ozs7R0FLbEQsTUFBTSxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQ2hCLFFBQU0sU0FBUyxHQUNYLGtDQUFjLEdBQUcsQ0FBQyw0Q0FBNEMsQ0FBQyxBQUFzQixDQUFDO0FBQzFGLFdBQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7R0FDaEQsQ0FBQzs7O0dBR0QsR0FBRyw4QkFBZSxDQUFDO0NBQ3ZCIiwiZmlsZSI6ImNyZWF0ZU1lc3NhZ2VTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TWVzc2FnZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb25zb2xlL2xpYi90eXBlcyc7XG5cbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IHtjcmVhdGVNZXNzYWdlfSBmcm9tICcuL2NyZWF0ZU1lc3NhZ2UnO1xuaW1wb3J0IHBsaXN0IGZyb20gJ3BsaXN0JztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNZXNzYWdlU3RyZWFtKGxpbmUkOiBSeC5PYnNlcnZhYmxlPHN0cmluZz4pOiBSeC5PYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgY29uc3Qgc2hhcmVkTGluZSQgPSBsaW5lJC5zaGFyZSgpO1xuXG4gIHJldHVybiBzaGFyZWRMaW5lJFxuICAgIC8vIEdyb3VwIHRoZSBsaW5lcyBpbnRvIHZhbGlkIHBsaXN0IHN0cmluZ3MuXG4gICAgLmJ1ZmZlcihzaGFyZWRMaW5lJC5maWx0ZXIobGluZSA9PiBsaW5lLnRyaW0oKSA9PT0gJzwvcGxpc3Q+JykpXG5cbiAgICAvLyBEb24ndCBpbmNsdWRlIGVtcHR5IGJ1ZmZlcnMuIFRoaXMgaGFwcGVucyBpZiB0aGUgc3RyZWFtIGNvbXBsZXRlcyBzaW5jZSB3ZSBvcGVuZWQgYSBuZXdcbiAgICAvLyBidWZmZXIgd2hlbiB0aGUgcHJldmlvdXMgcmVjb3JkIGVuZGVkLlxuICAgIC5maWx0ZXIobGluZXMgPT4gbGluZXMubGVuZ3RoID4gMSlcblxuICAgIC5tYXAobGluZXMgPT4gbGluZXMuam9pbignJykpXG5cbiAgICAvLyBQYXJzZSB0aGUgcGxpc3RzLiBFYWNoIHBhcnNlZCBwbGlzdCBjb250YWlucyBhbiBhcnJheSB3aGljaCwgaW4gdHVybiwgKm1heSogY29udGFpbiBkaWN0c1xuICAgIC8vICh0aGF0IGNvcnJlc3BvbmQgdG8gcmVjb3JkcykuIFdlIGp1c3Qgd2FudCB0aG9zZSBkaWN0cyBzbyB3ZSB1c2UgYGZsYXRNYXAoKWAuXG4gICAgLmZsYXRNYXAoeG1sID0+IHBsaXN0LnBhcnNlKHhtbCkpXG5cbiAgICAvLyBFeGNsdWRlIGRpY3RzIHRoYXQgZG9uJ3QgaGF2ZSBhbnkgbWVzc2FnZSBwcm9wZXJ0eS5cbiAgICAuZmlsdGVyKHJlY29yZCA9PiByZWNvcmQuaGFzT3duUHJvcGVydHkoJ01lc3NhZ2UnKSlcblxuICAgIC8vIEV4Y2x1ZGUgYmxhY2tsaXN0ZWQgc2VuZGVycy5cbiAgICAvLyBGSVhNRTogVGhpcyBpcyBhIHN0b3BnYXAuIFdoYXQgd2UgcmVhbGx5IG5lZWQgdG8gZG8gaXMgaWRlbnRpZnkgdGhlIGN1cnJlbnRseSBydW5uaW5nIGFwcCBhbmRcbiAgICAvLyAgIG9ubHkgc2hvdyBpdHMgbWVzc2FnZXMuICk6XG4gICAgLmZpbHRlcihyZWNvcmQgPT4ge1xuICAgICAgY29uc3QgYmxhY2tsaXN0ID1cbiAgICAgICAgKChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1pb3Mtc2ltdWxhdG9yLWxvZ3Muc2VuZGVyQmxhY2tsaXN0Jyk6IGFueSk6IEFycmF5PHN0cmluZz4pO1xuICAgICAgcmV0dXJuIGJsYWNrbGlzdC5pbmRleE9mKHJlY29yZC5TZW5kZXIpID09PSAtMTtcbiAgICB9KVxuXG4gICAgLy8gRm9ybWF0IHRoZSBtZXNzYWdlcyBmb3IgTnVjbGlkZS5cbiAgICAubWFwKGNyZWF0ZU1lc3NhZ2UpO1xufVxuIl19