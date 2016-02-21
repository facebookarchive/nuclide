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
var invariant = require('assert');

// Use a regex and not the "semver" module so the result here is the same
// as from python code.
var SEMVERISH_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([a-z0-9.-]+))?$/;
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
 * bump the version in package.json. This includes any client changes
 * (new feature or whatever) that do not work with the older servers.
 * It also includes server changes that break older clients.
 */

function getVersion() {
  if (!version) {
    // Don't use require() because it may be reading from the module cache.
    // Do use require.resolve so the paths can be codemoded in the future.
    var pkgFilename = require.resolve('../../../../package.json');
    var pkgJson = JSON.parse(fs.readFileSync(pkgFilename));
    var match = SEMVERISH_RE.exec(pkgJson.version);
    invariant(match);
    // const majorVersion = match[1];
    var minorVersion = match[2];
    // const patchVersion = match[3];
    // const prereleaseVersion = match[4];
    version = minorVersion;
  }
  return version;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQVdBLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Ozs7QUFJcEMsSUFBTSxZQUFZLEdBQUcsMENBQTBDLENBQUM7QUFDaEUsSUFBSSxPQUFPLFlBQUEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCTCxTQUFTLFVBQVUsR0FBVztBQUNuQyxNQUFJLENBQUMsT0FBTyxFQUFFOzs7QUFHWixRQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDaEUsUUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDekQsUUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDakQsYUFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVqQixRQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7OztBQUc5QixXQUFPLEdBQUcsWUFBWSxDQUFDO0dBQ3hCO0FBQ0QsU0FBTyxPQUFPLENBQUM7Q0FDaEIiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG4vLyBVc2UgYSByZWdleCBhbmQgbm90IHRoZSBcInNlbXZlclwiIG1vZHVsZSBzbyB0aGUgcmVzdWx0IGhlcmUgaXMgdGhlIHNhbWVcbi8vIGFzIGZyb20gcHl0aG9uIGNvZGUuXG5jb25zdCBTRU1WRVJJU0hfUkUgPSAvXihcXGQrKVxcLihcXGQrKVxcLihcXGQrKSg/Oi0oW2EtejAtOS4tXSspKT8kLztcbmxldCB2ZXJzaW9uO1xuXG4vKlxuICogVGhpcyBpcyB0aGUgdmVyc2lvbmluZyBvZiBOdWNsaWRlIGNsaWVudC1zZXJ2ZXIgcHJvdG9jb2wuXG4gKiBJdCBpcyBub3QgYSBjb21tdW5pY2F0aW9uIHByb3RvY29sIHBlciBzZS4gSXQgaXMgdGhlIHN1bSBvZiBjb21tdW5pY2F0aW9uIGFuZFxuICogc2VydmljZXMgQVBJLlxuICpcbiAqIEZpcnN0LCBubyBjb21taXQgc2hhbGwgYnJlYWsgdGhlIHByb3RvY29sIGluIHRoYXQgY2xpZW50IGFuZCBzZXJ2ZXJcbiAqIGZyb20gdGhlIHNhbWUgbWFzdGVyIHNoYWxsIGFsd2F5cyB3b3JrIHdpdGggZWFjaCBvdGhlci5cbiAqIFRoYXQgbWVhbnMsIG5vIGNsaWVudCBuZXcgZmVhdHVyZSBzaGFsbCBiZSBlbmFibGVkIGJlZm9yZSB0aGUgZGVwZW5kZW50XG4gKiBzZXJ2ZXIgc2VyaWNlIGlzIGluIHBsYWNlLCB3aGlsZSBpdCBpcyBPSyB0byBhZGQgYSBuZXcgc2VydmVyIHNlcnZpY2UgYmVmb3JlXG4gKiB0aGUgY2xpZW50IGlzIHJlYWR5LlxuICpcbiAqIFJ1bGUgbnVtYmVyIHR3by4gRXZlcnkgY29tbWl0IHRoYXQgYnJlYWtzIHRoZSBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHNoYWxsXG4gKiBidW1wIHRoZSB2ZXJzaW9uIGluIHBhY2thZ2UuanNvbi4gVGhpcyBpbmNsdWRlcyBhbnkgY2xpZW50IGNoYW5nZXNcbiAqIChuZXcgZmVhdHVyZSBvciB3aGF0ZXZlcikgdGhhdCBkbyBub3Qgd29yayB3aXRoIHRoZSBvbGRlciBzZXJ2ZXJzLlxuICogSXQgYWxzbyBpbmNsdWRlcyBzZXJ2ZXIgY2hhbmdlcyB0aGF0IGJyZWFrIG9sZGVyIGNsaWVudHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWZXJzaW9uKCk6IHN0cmluZyB7XG4gIGlmICghdmVyc2lvbikge1xuICAgIC8vIERvbid0IHVzZSByZXF1aXJlKCkgYmVjYXVzZSBpdCBtYXkgYmUgcmVhZGluZyBmcm9tIHRoZSBtb2R1bGUgY2FjaGUuXG4gICAgLy8gRG8gdXNlIHJlcXVpcmUucmVzb2x2ZSBzbyB0aGUgcGF0aHMgY2FuIGJlIGNvZGVtb2RlZCBpbiB0aGUgZnV0dXJlLlxuICAgIGNvbnN0IHBrZ0ZpbGVuYW1lID0gcmVxdWlyZS5yZXNvbHZlKCcuLi8uLi8uLi8uLi9wYWNrYWdlLmpzb24nKTtcbiAgICBjb25zdCBwa2dKc29uID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGtnRmlsZW5hbWUpKTtcbiAgICBjb25zdCBtYXRjaCA9IFNFTVZFUklTSF9SRS5leGVjKHBrZ0pzb24udmVyc2lvbik7XG4gICAgaW52YXJpYW50KG1hdGNoKTtcbiAgICAvLyBjb25zdCBtYWpvclZlcnNpb24gPSBtYXRjaFsxXTtcbiAgICBjb25zdCBtaW5vclZlcnNpb24gPSBtYXRjaFsyXTtcbiAgICAvLyBjb25zdCBwYXRjaFZlcnNpb24gPSBtYXRjaFszXTtcbiAgICAvLyBjb25zdCBwcmVyZWxlYXNlVmVyc2lvbiA9IG1hdGNoWzRdO1xuICAgIHZlcnNpb24gPSBtaW5vclZlcnNpb247XG4gIH1cbiAgcmV0dXJuIHZlcnNpb247XG59XG4iXX0=