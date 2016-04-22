var findVcsHelper = _asyncToGenerator(function* (src) {
  var options = {
    'cwd': path.dirname(src)
  };
  var hgResult = undefined;
  try {
    hgResult = yield asyncExecute('hg', ['root'], options);
  } catch (e) {
    hgResult = e;
  }

  if (hgResult.exitCode === 0) {
    return {
      vcs: 'hg',
      root: hgResult.stdout.trim()
    };
  }

  var gitResult = undefined;
  try {
    gitResult = yield asyncExecute('git', ['rev-parse', '--show-toplevel'], options);
  } catch (e) {
    gitResult = e;
  }

  if (gitResult.exitCode === 0) {
    return {
      vcs: 'git',
      root: gitResult.stdout.trim()
    };
  }

  throw new Error('Could not find VCS for: ' + src);
}

/**
 * For the given source file, find the type of vcs that is managing it as well
 * as the root directory for the VCS.
 */
);

var findVcs = _asyncToGenerator(function* (src) {
  var vcsInfo = vcsInfoCache[src];
  if (vcsInfo) {
    return vcsInfo;
  }

  vcsInfo = yield findVcsHelper(src);
  vcsInfoCache[src] = vcsInfo;
  return vcsInfo;
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('./process');

var asyncExecute = _require.asyncExecute;

var path = require('path');

var vcsInfoCache = {};

module.exports = {
  findVcs: findVcs
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZjcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiSUFxQmUsYUFBYSxxQkFBNUIsV0FBNkIsR0FBVyxFQUFvQjtBQUMxRCxNQUFNLE9BQU8sR0FBRztBQUNkLFNBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztHQUN6QixDQUFDO0FBQ0YsTUFBSSxRQUFRLFlBQUEsQ0FBQztBQUNiLE1BQUk7QUFDRixZQUFRLEdBQUcsTUFBTSxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDeEQsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFlBQVEsR0FBRyxDQUFDLENBQUM7R0FDZDs7QUFFRCxNQUFJLFFBQVEsQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO0FBQzNCLFdBQU87QUFDTCxTQUFHLEVBQUUsSUFBSTtBQUNULFVBQUksRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtLQUM3QixDQUFDO0dBQ0g7O0FBRUQsTUFBSSxTQUFTLFlBQUEsQ0FBQztBQUNkLE1BQUk7QUFDRixhQUFTLEdBQUcsTUFBTSxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsV0FBVyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDbEYsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGFBQVMsR0FBRyxDQUFDLENBQUM7R0FDZjs7QUFFRCxNQUFJLFNBQVMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO0FBQzVCLFdBQU87QUFDTCxTQUFHLEVBQUUsS0FBSztBQUNWLFVBQUksRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtLQUM5QixDQUFDO0dBQ0g7O0FBRUQsUUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsR0FBRyxHQUFHLENBQUMsQ0FBQztDQUNuRDs7Ozs7Ozs7SUFNYyxPQUFPLHFCQUF0QixXQUF1QixHQUFXLEVBQW9CO0FBQ3BELE1BQUksT0FBTyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxNQUFJLE9BQU8sRUFBRTtBQUNYLFdBQU8sT0FBTyxDQUFDO0dBQ2hCOztBQUVELFNBQU8sR0FBRyxNQUFNLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQyxjQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQzVCLFNBQU8sT0FBTyxDQUFDO0NBQ2hCOzs7Ozs7Ozs7Ozs7ZUExRHNCLE9BQU8sQ0FBQyxXQUFXLENBQUM7O0lBQXBDLFlBQVksWUFBWixZQUFZOztBQUNuQixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBTzdCLElBQU0sWUFBc0MsR0FBRyxFQUFFLENBQUM7O0FBb0RsRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsU0FBTyxFQUFQLE9BQU87Q0FDUixDQUFDIiwiZmlsZSI6InZjcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHthc3luY0V4ZWN1dGV9ID0gcmVxdWlyZSgnLi9wcm9jZXNzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG50eXBlIFZjc0luZm8gPSB7XG4gIHZjczogc3RyaW5nO1xuICByb290OiBzdHJpbmc7XG59O1xuXG5jb25zdCB2Y3NJbmZvQ2FjaGU6IHtbc3JjOiBzdHJpbmddOiBWY3NJbmZvfSA9IHt9O1xuXG5hc3luYyBmdW5jdGlvbiBmaW5kVmNzSGVscGVyKHNyYzogc3RyaW5nKTogUHJvbWlzZTxWY3NJbmZvPiB7XG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgJ2N3ZCc6IHBhdGguZGlybmFtZShzcmMpLFxuICB9O1xuICBsZXQgaGdSZXN1bHQ7XG4gIHRyeSB7XG4gICAgaGdSZXN1bHQgPSBhd2FpdCBhc3luY0V4ZWN1dGUoJ2hnJywgWydyb290J10sIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaGdSZXN1bHQgPSBlO1xuICB9XG5cbiAgaWYgKGhnUmVzdWx0LmV4aXRDb2RlID09PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZjczogJ2hnJyxcbiAgICAgIHJvb3Q6IGhnUmVzdWx0LnN0ZG91dC50cmltKCksXG4gICAgfTtcbiAgfVxuXG4gIGxldCBnaXRSZXN1bHQ7XG4gIHRyeSB7XG4gICAgZ2l0UmVzdWx0ID0gYXdhaXQgYXN5bmNFeGVjdXRlKCdnaXQnLCBbJ3Jldi1wYXJzZScsICctLXNob3ctdG9wbGV2ZWwnXSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBnaXRSZXN1bHQgPSBlO1xuICB9XG5cbiAgaWYgKGdpdFJlc3VsdC5leGl0Q29kZSA9PT0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICB2Y3M6ICdnaXQnLFxuICAgICAgcm9vdDogZ2l0UmVzdWx0LnN0ZG91dC50cmltKCksXG4gICAgfTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgVkNTIGZvcjogJyArIHNyYyk7XG59XG5cbi8qKlxuICogRm9yIHRoZSBnaXZlbiBzb3VyY2UgZmlsZSwgZmluZCB0aGUgdHlwZSBvZiB2Y3MgdGhhdCBpcyBtYW5hZ2luZyBpdCBhcyB3ZWxsXG4gKiBhcyB0aGUgcm9vdCBkaXJlY3RvcnkgZm9yIHRoZSBWQ1MuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZpbmRWY3Moc3JjOiBzdHJpbmcpOiBQcm9taXNlPFZjc0luZm8+IHtcbiAgbGV0IHZjc0luZm8gPSB2Y3NJbmZvQ2FjaGVbc3JjXTtcbiAgaWYgKHZjc0luZm8pIHtcbiAgICByZXR1cm4gdmNzSW5mbztcbiAgfVxuXG4gIHZjc0luZm8gPSBhd2FpdCBmaW5kVmNzSGVscGVyKHNyYyk7XG4gIHZjc0luZm9DYWNoZVtzcmNdID0gdmNzSW5mbztcbiAgcmV0dXJuIHZjc0luZm87XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmaW5kVmNzLFxufTtcbiJdfQ==