Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getVersion = getVersion;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var path = require('path');

var TEST_VERSION = 'test-version';
var version = undefined;

/*
 * This is the versioning of Nuclide client-server protocol.
 * It is not a communication protocol per se. It is the sum of communication and
 * services API.
 *
 * First, no commit shall break the protocol in that client and server
 * from the same master shall always work with each other.
 * That means, no client new feature shall be enabled before the dependent
 * server serice is in place, while it is OK to add a new server service before
 * the client is ready.
 *
 * Rule number two. Every commit that breaks the backward compatibility shall
 * bump the version in version.json. This includes any client changes
 * (new feature or whatever) that do not work with the older servers.
 * It also includes server changes that break older clients.
 */

function getVersion() {
  if (!version) {
    try {
      // TODO: The reason we are using version.json file is for our Python
      // server scripts to read and parse. We shall at one point rewrite our
      // Python scripts in Node, and then we can hard code the version in code,
      // instead of reading from the json file.
      //
      // Cannot use require() who counts on extension (.json) for parsing file as json.
      var json = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../version.json')).toString());
      version = json.Version.toString();
    } catch (e) {
      version = TEST_VERSION;
      // No VERSION_INFO file, no version. e.g. in your development env.
    }
  }
  return version;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQVdBLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTdCLElBQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQztBQUNwQyxJQUFJLE9BQU8sWUFBQSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JMLFNBQVMsVUFBVSxHQUFXO0FBQ25DLE1BQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixRQUFJOzs7Ozs7O0FBT0YsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDckIsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ3ZFLENBQUM7QUFDRixhQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNuQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsYUFBTyxHQUFHLFlBQVksQ0FBQzs7S0FFeEI7R0FDRjtBQUNELFNBQU8sT0FBTyxDQUFDO0NBQ2hCIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG5jb25zdCBURVNUX1ZFUlNJT04gPSAndGVzdC12ZXJzaW9uJztcbmxldCB2ZXJzaW9uO1xuXG4vKlxuICogVGhpcyBpcyB0aGUgdmVyc2lvbmluZyBvZiBOdWNsaWRlIGNsaWVudC1zZXJ2ZXIgcHJvdG9jb2wuXG4gKiBJdCBpcyBub3QgYSBjb21tdW5pY2F0aW9uIHByb3RvY29sIHBlciBzZS4gSXQgaXMgdGhlIHN1bSBvZiBjb21tdW5pY2F0aW9uIGFuZFxuICogc2VydmljZXMgQVBJLlxuICpcbiAqIEZpcnN0LCBubyBjb21taXQgc2hhbGwgYnJlYWsgdGhlIHByb3RvY29sIGluIHRoYXQgY2xpZW50IGFuZCBzZXJ2ZXJcbiAqIGZyb20gdGhlIHNhbWUgbWFzdGVyIHNoYWxsIGFsd2F5cyB3b3JrIHdpdGggZWFjaCBvdGhlci5cbiAqIFRoYXQgbWVhbnMsIG5vIGNsaWVudCBuZXcgZmVhdHVyZSBzaGFsbCBiZSBlbmFibGVkIGJlZm9yZSB0aGUgZGVwZW5kZW50XG4gKiBzZXJ2ZXIgc2VyaWNlIGlzIGluIHBsYWNlLCB3aGlsZSBpdCBpcyBPSyB0byBhZGQgYSBuZXcgc2VydmVyIHNlcnZpY2UgYmVmb3JlXG4gKiB0aGUgY2xpZW50IGlzIHJlYWR5LlxuICpcbiAqIFJ1bGUgbnVtYmVyIHR3by4gRXZlcnkgY29tbWl0IHRoYXQgYnJlYWtzIHRoZSBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHNoYWxsXG4gKiBidW1wIHRoZSB2ZXJzaW9uIGluIHZlcnNpb24uanNvbi4gVGhpcyBpbmNsdWRlcyBhbnkgY2xpZW50IGNoYW5nZXNcbiAqIChuZXcgZmVhdHVyZSBvciB3aGF0ZXZlcikgdGhhdCBkbyBub3Qgd29yayB3aXRoIHRoZSBvbGRlciBzZXJ2ZXJzLlxuICogSXQgYWxzbyBpbmNsdWRlcyBzZXJ2ZXIgY2hhbmdlcyB0aGF0IGJyZWFrIG9sZGVyIGNsaWVudHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWZXJzaW9uKCk6IHN0cmluZyB7XG4gIGlmICghdmVyc2lvbikge1xuICAgIHRyeSB7XG4gICAgICAvLyBUT0RPOiBUaGUgcmVhc29uIHdlIGFyZSB1c2luZyB2ZXJzaW9uLmpzb24gZmlsZSBpcyBmb3Igb3VyIFB5dGhvblxuICAgICAgLy8gc2VydmVyIHNjcmlwdHMgdG8gcmVhZCBhbmQgcGFyc2UuIFdlIHNoYWxsIGF0IG9uZSBwb2ludCByZXdyaXRlIG91clxuICAgICAgLy8gUHl0aG9uIHNjcmlwdHMgaW4gTm9kZSwgYW5kIHRoZW4gd2UgY2FuIGhhcmQgY29kZSB0aGUgdmVyc2lvbiBpbiBjb2RlLFxuICAgICAgLy8gaW5zdGVhZCBvZiByZWFkaW5nIGZyb20gdGhlIGpzb24gZmlsZS5cbiAgICAgIC8vXG4gICAgICAvLyBDYW5ub3QgdXNlIHJlcXVpcmUoKSB3aG8gY291bnRzIG9uIGV4dGVuc2lvbiAoLmpzb24pIGZvciBwYXJzaW5nIGZpbGUgYXMganNvbi5cbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKFxuICAgICAgICBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL3ZlcnNpb24uanNvbicpKS50b1N0cmluZygpXG4gICAgICApO1xuICAgICAgdmVyc2lvbiA9IGpzb24uVmVyc2lvbi50b1N0cmluZygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHZlcnNpb24gPSBURVNUX1ZFUlNJT047XG4gICAgICAvLyBObyBWRVJTSU9OX0lORk8gZmlsZSwgbm8gdmVyc2lvbi4gZS5nLiBpbiB5b3VyIGRldmVsb3BtZW50IGVudi5cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZlcnNpb247XG59XG4iXX0=