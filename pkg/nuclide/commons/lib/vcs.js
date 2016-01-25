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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZjcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiSUFxQmUsYUFBYSxxQkFBNUIsV0FBNkIsR0FBVyxFQUFvQjtBQUMxRCxNQUFNLE9BQU8sR0FBRztBQUNkLFNBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztHQUN6QixDQUFDO0FBQ0YsTUFBSSxRQUFRLFlBQUEsQ0FBQztBQUNiLE1BQUk7QUFDRixZQUFRLEdBQUcsTUFBTSxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDeEQsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLFlBQVEsR0FBRyxDQUFDLENBQUM7R0FDZDs7QUFFRCxNQUFJLFFBQVEsQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO0FBQzNCLFdBQU87QUFDTCxTQUFHLEVBQUUsSUFBSTtBQUNULFVBQUksRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtLQUM3QixDQUFDO0dBQ0g7O0FBRUQsTUFBSSxTQUFTLFlBQUEsQ0FBQztBQUNkLE1BQUk7QUFDRixhQUFTLEdBQUcsTUFBTSxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsV0FBVyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDbEYsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGFBQVMsR0FBRyxDQUFDLENBQUM7R0FDZjs7QUFFRCxNQUFJLFNBQVMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO0FBQzVCLFdBQU87QUFDTCxTQUFHLEVBQUUsS0FBSztBQUNWLFVBQUksRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtLQUM5QixDQUFDO0dBQ0g7O0FBRUQsUUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsR0FBRyxHQUFHLENBQUMsQ0FBQztDQUNuRDs7Ozs7Ozs7SUFNYyxPQUFPLHFCQUF0QixXQUF1QixHQUFXLEVBQW9CO0FBQ3BELE1BQUksT0FBTyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxNQUFJLE9BQU8sRUFBRTtBQUNYLFdBQU8sT0FBTyxDQUFDO0dBQ2hCOztBQUVELFNBQU8sR0FBRyxNQUFNLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQyxjQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQzVCLFNBQU8sT0FBTyxDQUFDO0NBQ2hCOzs7Ozs7Ozs7Ozs7ZUExRHNCLE9BQU8sQ0FBQyxXQUFXLENBQUM7O0lBQXBDLFlBQVksWUFBWixZQUFZOztBQUNuQixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBTzdCLElBQU0sWUFBc0MsR0FBRyxFQUFFLENBQUM7O0FBb0RsRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsU0FBTyxFQUFQLE9BQU87Q0FDUixDQUFDIiwiZmlsZSI6InZjcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHthc3luY0V4ZWN1dGV9ID0gcmVxdWlyZSgnLi9wcm9jZXNzJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG50eXBlIFZjc0luZm8gPSB7XG4gIHZjczogc3RyaW5nO1xuICByb290OiBzdHJpbmc7XG59XG5cbmNvbnN0IHZjc0luZm9DYWNoZToge1tzcmM6IHN0cmluZ106IFZjc0luZm99ID0ge307XG5cbmFzeW5jIGZ1bmN0aW9uIGZpbmRWY3NIZWxwZXIoc3JjOiBzdHJpbmcpOiBQcm9taXNlPFZjc0luZm8+IHtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAnY3dkJzogcGF0aC5kaXJuYW1lKHNyYyksXG4gIH07XG4gIGxldCBoZ1Jlc3VsdDtcbiAgdHJ5IHtcbiAgICBoZ1Jlc3VsdCA9IGF3YWl0IGFzeW5jRXhlY3V0ZSgnaGcnLCBbJ3Jvb3QnXSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBoZ1Jlc3VsdCA9IGU7XG4gIH1cblxuICBpZiAoaGdSZXN1bHQuZXhpdENvZGUgPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmNzOiAnaGcnLFxuICAgICAgcm9vdDogaGdSZXN1bHQuc3Rkb3V0LnRyaW0oKSxcbiAgICB9O1xuICB9XG5cbiAgbGV0IGdpdFJlc3VsdDtcbiAgdHJ5IHtcbiAgICBnaXRSZXN1bHQgPSBhd2FpdCBhc3luY0V4ZWN1dGUoJ2dpdCcsIFsncmV2LXBhcnNlJywgJy0tc2hvdy10b3BsZXZlbCddLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGdpdFJlc3VsdCA9IGU7XG4gIH1cblxuICBpZiAoZ2l0UmVzdWx0LmV4aXRDb2RlID09PSAwKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZjczogJ2dpdCcsXG4gICAgICByb290OiBnaXRSZXN1bHQuc3Rkb3V0LnRyaW0oKSxcbiAgICB9O1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBWQ1MgZm9yOiAnICsgc3JjKTtcbn1cblxuLyoqXG4gKiBGb3IgdGhlIGdpdmVuIHNvdXJjZSBmaWxlLCBmaW5kIHRoZSB0eXBlIG9mIHZjcyB0aGF0IGlzIG1hbmFnaW5nIGl0IGFzIHdlbGxcbiAqIGFzIHRoZSByb290IGRpcmVjdG9yeSBmb3IgdGhlIFZDUy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZmluZFZjcyhzcmM6IHN0cmluZyk6IFByb21pc2U8VmNzSW5mbz4ge1xuICBsZXQgdmNzSW5mbyA9IHZjc0luZm9DYWNoZVtzcmNdO1xuICBpZiAodmNzSW5mbykge1xuICAgIHJldHVybiB2Y3NJbmZvO1xuICB9XG5cbiAgdmNzSW5mbyA9IGF3YWl0IGZpbmRWY3NIZWxwZXIoc3JjKTtcbiAgdmNzSW5mb0NhY2hlW3NyY10gPSB2Y3NJbmZvO1xuICByZXR1cm4gdmNzSW5mbztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGZpbmRWY3MsXG59O1xuIl19