Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

/**
 * Copies a file to a new path.
 * @return true if the operation was successful; false if it wasn't.
 */

/**
 * The lstat endpoint is the same as the stat endpoint except it will return
 * the stat of a link instead of the file the link points to.
 */

/**
 * Creates a new directory with the given path.
 * Throws EEXIST error if the directory already exists.
 * Throws ENOENT if the path given is nested in a non-existing directory.
 */

/**
 * Runs the equivalent of `mkdir -p` with the given path.
 *
 * Like most implementations of mkdirp, if it fails, it is possible that
 * directories were created for some prefix of the given path.
 * @return true if the path was created; false if it already existed.
 */

/**
 * If no file (or directory) at the specified path exists, creates the parent
 * directories (if necessary) and then writes an empty file at the specified
 * path.
 *
 * @return A boolean indicating whether the file was created.
 */

/**
 * The readdir endpoint accepts the following query parameters:
 *
 *   path: path to the folder to list entries inside.
 *
 * Body contains a JSON encoded array of objects with file: and stats: entries.
 * file: has the file or directory name, stats: has the stats of the file/dir,
 * isSymbolicLink: true if the entry is a symlink to another filesystem location.
 */

/**
 * Gets the real path of a file path.
 * It could be different than the given path if the file is a symlink
 * or exists in a symlinked directory.
 */

/**
 * Runs the equivalent of `mv sourcePath destinationPath`.
 */

/**
 * Removes directories even if they are non-empty. Does not fail if the directory doesn't exist.
 */

/**
 * The stat endpoint accepts the following query parameters:
 *
 *   path: path to the file to read (that is it must be quoted)
 *
 * It returns a JSON encoded stats object that looks something like this:
 *
 * { dev: 2114,
 *  ino: 48064969,
 *  mode: 33188,
 *  nlink: 1,
 *  uid: 85,
 *  gid: 100,
 *  rdev: 0,
 *  size: 527,
 *  blksize: 4096,
 *  blocks: 8,
 *  atime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  mtime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  ctime: 'Mon, 10 Oct 2011 23:24:11 GMT',
 *  birthtime: 'Mon, 10 Oct 2011 23:24:11 GMT'
 * }
 *
 */

/**
 * Removes files. Does not fail if the file doesn't exist.
 */

/**
 *   path: the path to the file to read
 *   options: options to pass to fs.readFile.
 *      Note that options does NOT include 'encoding' this ensures that the return value
 *      is always a Buffer and never a string.
 *
 *   Callers who want a string should call buffer.toString('utf8').
 */

/**
 * The writeFile endpoint accepts the following query parameters:
 *
 *   path: path to the file to written.
 *   data: file contents to write.
 *   options: options to pass to fs.writeFile
 */

/**
 * Gets the real path of a file path, with home directory expansion.
 * It could be different than the given path if the file is a symlink
 * or exists in a symlinked directory.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVTeXN0ZW1TZXJ2aWNlVHlwZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztrQkFXZSxJQUFJIiwiZmlsZSI6IkZpbGVTeXN0ZW1TZXJ2aWNlVHlwZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmV4cG9ydCB0eXBlIEZpbGVXaXRoU3RhdHMgPSB7XG4gIGZpbGU6IHN0cmluZztcbiAgc3RhdHM6ID9mcy5TdGF0cztcbiAgaXNTeW1ib2xpY0xpbms6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBGaWxlU3lzdGVtU2VydmljZSA9IHtcblxuICAvKipcbiAgICogQ29waWVzIGEgZmlsZSB0byBhIG5ldyBwYXRoLlxuICAgKiBAcmV0dXJuIHRydWUgaWYgdGhlIG9wZXJhdGlvbiB3YXMgc3VjY2Vzc2Z1bDsgZmFsc2UgaWYgaXQgd2Fzbid0LlxuICAgKi9cbiAgY29weShvbGRQYXRoOiBzdHJpbmcsIG5ld1BhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj47XG5cbiAgZXhpc3RzKHBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj47XG5cbiAgZmluZE5lYXJlc3RGaWxlKGZpbGVOYW1lOiBzdHJpbmcsIHBhdGhUb0RpcmVjdG9yeTogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPjtcblxuICAvKipcbiAgICogVGhlIGxzdGF0IGVuZHBvaW50IGlzIHRoZSBzYW1lIGFzIHRoZSBzdGF0IGVuZHBvaW50IGV4Y2VwdCBpdCB3aWxsIHJldHVyblxuICAgKiB0aGUgc3RhdCBvZiBhIGxpbmsgaW5zdGVhZCBvZiB0aGUgZmlsZSB0aGUgbGluayBwb2ludHMgdG8uXG4gICAqL1xuICBsc3RhdChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGZzLlN0YXRzPjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBkaXJlY3Rvcnkgd2l0aCB0aGUgZ2l2ZW4gcGF0aC5cbiAgICogVGhyb3dzIEVFWElTVCBlcnJvciBpZiB0aGUgZGlyZWN0b3J5IGFscmVhZHkgZXhpc3RzLlxuICAgKiBUaHJvd3MgRU5PRU5UIGlmIHRoZSBwYXRoIGdpdmVuIGlzIG5lc3RlZCBpbiBhIG5vbi1leGlzdGluZyBkaXJlY3RvcnkuXG4gICAqL1xuICBta2RpcihwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBSdW5zIHRoZSBlcXVpdmFsZW50IG9mIGBta2RpciAtcGAgd2l0aCB0aGUgZ2l2ZW4gcGF0aC5cbiAgICpcbiAgICogTGlrZSBtb3N0IGltcGxlbWVudGF0aW9ucyBvZiBta2RpcnAsIGlmIGl0IGZhaWxzLCBpdCBpcyBwb3NzaWJsZSB0aGF0XG4gICAqIGRpcmVjdG9yaWVzIHdlcmUgY3JlYXRlZCBmb3Igc29tZSBwcmVmaXggb2YgdGhlIGdpdmVuIHBhdGguXG4gICAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgcGF0aCB3YXMgY3JlYXRlZDsgZmFsc2UgaWYgaXQgYWxyZWFkeSBleGlzdGVkLlxuICAgKi9cbiAgbWtkaXJwKHBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj47XG5cbiAgY2htb2QocGF0aDogc3RyaW5nLCBtb2RlOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBJZiBubyBmaWxlIChvciBkaXJlY3RvcnkpIGF0IHRoZSBzcGVjaWZpZWQgcGF0aCBleGlzdHMsIGNyZWF0ZXMgdGhlIHBhcmVudFxuICAgKiBkaXJlY3RvcmllcyAoaWYgbmVjZXNzYXJ5KSBhbmQgdGhlbiB3cml0ZXMgYW4gZW1wdHkgZmlsZSBhdCB0aGUgc3BlY2lmaWVkXG4gICAqIHBhdGguXG4gICAqXG4gICAqIEByZXR1cm4gQSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgZmlsZSB3YXMgY3JlYXRlZC5cbiAgICovXG4gIG5ld0ZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj47XG5cbiAgLyoqXG4gICAqIFRoZSByZWFkZGlyIGVuZHBvaW50IGFjY2VwdHMgdGhlIGZvbGxvd2luZyBxdWVyeSBwYXJhbWV0ZXJzOlxuICAgKlxuICAgKiAgIHBhdGg6IHBhdGggdG8gdGhlIGZvbGRlciB0byBsaXN0IGVudHJpZXMgaW5zaWRlLlxuICAgKlxuICAgKiBCb2R5IGNvbnRhaW5zIGEgSlNPTiBlbmNvZGVkIGFycmF5IG9mIG9iamVjdHMgd2l0aCBmaWxlOiBhbmQgc3RhdHM6IGVudHJpZXMuXG4gICAqIGZpbGU6IGhhcyB0aGUgZmlsZSBvciBkaXJlY3RvcnkgbmFtZSwgc3RhdHM6IGhhcyB0aGUgc3RhdHMgb2YgdGhlIGZpbGUvZGlyLFxuICAgKiBpc1N5bWJvbGljTGluazogdHJ1ZSBpZiB0aGUgZW50cnkgaXMgYSBzeW1saW5rIHRvIGFub3RoZXIgZmlsZXN5c3RlbSBsb2NhdGlvbi5cbiAgICovXG4gIHJlYWRkaXIocGF0aDogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxGaWxlV2l0aFN0YXRzPj47XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHJlYWwgcGF0aCBvZiBhIGZpbGUgcGF0aC5cbiAgICogSXQgY291bGQgYmUgZGlmZmVyZW50IHRoYW4gdGhlIGdpdmVuIHBhdGggaWYgdGhlIGZpbGUgaXMgYSBzeW1saW5rXG4gICAqIG9yIGV4aXN0cyBpbiBhIHN5bWxpbmtlZCBkaXJlY3RvcnkuXG4gICAqL1xuICByZWFscGF0aChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz47XG5cbiAgLyoqXG4gICAqIFJ1bnMgdGhlIGVxdWl2YWxlbnQgb2YgYG12IHNvdXJjZVBhdGggZGVzdGluYXRpb25QYXRoYC5cbiAgICovXG4gIHJlbmFtZShzb3VyY2VQYXRoOiBzdHJpbmcsIGRlc3RpbmF0aW9uUGF0aDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogUmVtb3ZlcyBkaXJlY3RvcmllcyBldmVuIGlmIHRoZXkgYXJlIG5vbi1lbXB0eS4gRG9lcyBub3QgZmFpbCBpZiB0aGUgZGlyZWN0b3J5IGRvZXNuJ3QgZXhpc3QuXG4gICAqL1xuICBybWRpcihwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBUaGUgc3RhdCBlbmRwb2ludCBhY2NlcHRzIHRoZSBmb2xsb3dpbmcgcXVlcnkgcGFyYW1ldGVyczpcbiAgICpcbiAgICogICBwYXRoOiBwYXRoIHRvIHRoZSBmaWxlIHRvIHJlYWQgKHRoYXQgaXMgaXQgbXVzdCBiZSBxdW90ZWQpXG4gICAqXG4gICAqIEl0IHJldHVybnMgYSBKU09OIGVuY29kZWQgc3RhdHMgb2JqZWN0IHRoYXQgbG9va3Mgc29tZXRoaW5nIGxpa2UgdGhpczpcbiAgICpcbiAgICogeyBkZXY6IDIxMTQsXG4gICAqICBpbm86IDQ4MDY0OTY5LFxuICAgKiAgbW9kZTogMzMxODgsXG4gICAqICBubGluazogMSxcbiAgICogIHVpZDogODUsXG4gICAqICBnaWQ6IDEwMCxcbiAgICogIHJkZXY6IDAsXG4gICAqICBzaXplOiA1MjcsXG4gICAqICBibGtzaXplOiA0MDk2LFxuICAgKiAgYmxvY2tzOiA4LFxuICAgKiAgYXRpbWU6ICdNb24sIDEwIE9jdCAyMDExIDIzOjI0OjExIEdNVCcsXG4gICAqICBtdGltZTogJ01vbiwgMTAgT2N0IDIwMTEgMjM6MjQ6MTEgR01UJyxcbiAgICogIGN0aW1lOiAnTW9uLCAxMCBPY3QgMjAxMSAyMzoyNDoxMSBHTVQnLFxuICAgKiAgYmlydGh0aW1lOiAnTW9uLCAxMCBPY3QgMjAxMSAyMzoyNDoxMSBHTVQnXG4gICAqIH1cbiAgICpcbiAgICovXG4gIHN0YXQocGF0aDogc3RyaW5nKTogUHJvbWlzZTxmcy5TdGF0cz47XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgZmlsZXMuIERvZXMgbm90IGZhaWwgaWYgdGhlIGZpbGUgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIHVubGluayhwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiAgIHBhdGg6IHRoZSBwYXRoIHRvIHRoZSBmaWxlIHRvIHJlYWRcbiAgICogICBvcHRpb25zOiBvcHRpb25zIHRvIHBhc3MgdG8gZnMucmVhZEZpbGUuXG4gICAqICAgICAgTm90ZSB0aGF0IG9wdGlvbnMgZG9lcyBOT1QgaW5jbHVkZSAnZW5jb2RpbmcnIHRoaXMgZW5zdXJlcyB0aGF0IHRoZSByZXR1cm4gdmFsdWVcbiAgICogICAgICBpcyBhbHdheXMgYSBCdWZmZXIgYW5kIG5ldmVyIGEgc3RyaW5nLlxuICAgKlxuICAgKiAgIENhbGxlcnMgd2hvIHdhbnQgYSBzdHJpbmcgc2hvdWxkIGNhbGwgYnVmZmVyLnRvU3RyaW5nKCd1dGY4JykuXG4gICAqL1xuICByZWFkRmlsZShwYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiB7ZmxhZz86c3RyaW5nfSk6XG4gICAgICBQcm9taXNlPEJ1ZmZlcj47XG5cbiAgLyoqXG4gICAqIFRoZSB3cml0ZUZpbGUgZW5kcG9pbnQgYWNjZXB0cyB0aGUgZm9sbG93aW5nIHF1ZXJ5IHBhcmFtZXRlcnM6XG4gICAqXG4gICAqICAgcGF0aDogcGF0aCB0byB0aGUgZmlsZSB0byB3cml0dGVuLlxuICAgKiAgIGRhdGE6IGZpbGUgY29udGVudHMgdG8gd3JpdGUuXG4gICAqICAgb3B0aW9uczogb3B0aW9ucyB0byBwYXNzIHRvIGZzLndyaXRlRmlsZVxuICAgKi9cbiAgd3JpdGVGaWxlKHBhdGg6IHN0cmluZywgZGF0YTogc3RyaW5nLFxuICAgICAgb3B0aW9uczogP3tlbmNvZGluZz86IHN0cmluZzsgbW9kZT86IG51bWJlcjsgZmxhZz86c3RyaW5nfSk6IFByb21pc2U8dm9pZD47XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSByZWFsIHBhdGggb2YgYSBmaWxlIHBhdGgsIHdpdGggaG9tZSBkaXJlY3RvcnkgZXhwYW5zaW9uLlxuICAgICAqIEl0IGNvdWxkIGJlIGRpZmZlcmVudCB0aGFuIHRoZSBnaXZlbiBwYXRoIGlmIHRoZSBmaWxlIGlzIGEgc3ltbGlua1xuICAgICAqIG9yIGV4aXN0cyBpbiBhIHN5bWxpbmtlZCBkaXJlY3RvcnkuXG4gICAgICovXG4gIHJlc29sdmVSZWFsUGF0aChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz47XG59O1xuIl19