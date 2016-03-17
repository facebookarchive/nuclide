

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var isMarker = require('./isMarker');

/**
 * This returns a list of all the contiguous runs of markers within this set
 * of lines. Runs are [inclusive, exclusive).
 */
function buildRuns(lines) {
  var runs = [];
  var start = null;
  for (var i = 0; i < lines.length; i++) {
    if (!isMarker(lines[i])) {
      if (start != null) {
        runs.push([start, i]);
        start = null;
      }
    } else {
      if (start == null) {
        start = i;
      }
    }
  }
  if (start != null) {
    runs.push([start, lines.length]);
  }
  return runs;
}

module.exports = buildRuns;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1aWxkUnVucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBV0EsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOzs7Ozs7QUFNdkMsU0FBUyxTQUFTLENBQUMsS0FBaUIsRUFBMkI7QUFDN0QsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLE1BQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNyQyxRQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3ZCLFVBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixZQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsYUFBSyxHQUFHLElBQUksQ0FBQztPQUNkO0tBQ0YsTUFBTTtBQUNMLFVBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixhQUFLLEdBQUcsQ0FBQyxDQUFDO09BQ1g7S0FDRjtHQUNGO0FBQ0QsTUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2pCLFFBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7R0FDbEM7QUFDRCxTQUFPLElBQUksQ0FBQztDQUNiOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDIiwiZmlsZSI6ImJ1aWxkUnVucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IGlzTWFya2VyID0gcmVxdWlyZSgnLi9pc01hcmtlcicpO1xuXG4vKipcbiAqIFRoaXMgcmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBjb250aWd1b3VzIHJ1bnMgb2YgbWFya2VycyB3aXRoaW4gdGhpcyBzZXRcbiAqIG9mIGxpbmVzLiBSdW5zIGFyZSBbaW5jbHVzaXZlLCBleGNsdXNpdmUpLlxuICovXG5mdW5jdGlvbiBidWlsZFJ1bnMobGluZXM6IEFycmF5PGFueT4pOiBBcnJheTxbbnVtYmVyLCBudW1iZXJdPiB7XG4gIGNvbnN0IHJ1bnMgPSBbXTtcbiAgbGV0IHN0YXJ0ID0gbnVsbDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIGlmICghaXNNYXJrZXIobGluZXNbaV0pKSB7XG4gICAgICBpZiAoc3RhcnQgIT0gbnVsbCkge1xuICAgICAgICBydW5zLnB1c2goW3N0YXJ0LCBpXSk7XG4gICAgICAgIHN0YXJ0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHN0YXJ0ID09IG51bGwpIHtcbiAgICAgICAgc3RhcnQgPSBpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoc3RhcnQgIT0gbnVsbCkge1xuICAgIHJ1bnMucHVzaChbc3RhcnQsIGxpbmVzLmxlbmd0aF0pO1xuICB9XG4gIHJldHVybiBydW5zO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJ1aWxkUnVucztcbiJdfQ==