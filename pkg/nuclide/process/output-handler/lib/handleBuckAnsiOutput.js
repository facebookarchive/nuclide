

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var STOP_OR_RESUME_WRAPPING_REGEX = /\u001B\[\?7[hl]/g;
var ERASE_PREVIOUS_LINE_REGEX = /\u001B\[1A\u001B\[2K/g;

/**
 * An implementation of ProcessOutputHandler that parses and applies the behavior
 * of ANSI escape characters that Buck uses.
 * According to https://github.com/facebook/buck/blob/master/src/com/facebook/buck/util/Ansi.java,
 * Buck uses the following non-style escape charaters:
 *   Resume wrapping: ESC[?7h
 *   Stop wrapping: ESC[?7l
 *   Cursor to previous line: ESC[1A
 *   Erase line: ESC[2K
 */
function handleBuckAnsiOutput(textBuffer, text) {
  // The chunk of new text may span several lines, each of which may contain
  // ANSI escape characters.
  var lines = text.split('\n');
  for (var lineNum = 0; lineNum < lines.length; lineNum++) {
    var line = lines[lineNum];

    // Simply strip the 'resume wrapping' and 'stop wrapping' escape characters.
    var newText = line.replace(STOP_OR_RESUME_WRAPPING_REGEX, '');

    // In Buck, the 'cursor to previous line' and 'erase line' escape characters
    // occur in pairs.
    var erasePreviousLineMatches = newText.match(ERASE_PREVIOUS_LINE_REGEX);
    if (erasePreviousLineMatches) {
      var numberOfLinesToRemove = erasePreviousLineMatches.length;
      // This represents 'moving the cursor to previous line':
      var endRemove = textBuffer.getLastRow() - 1;
      // TextBuffer::deleteRows is inclusive:
      var startRemove = endRemove - numberOfLinesToRemove + 1;
      textBuffer.deleteRows(startRemove, endRemove);

      // Remove these escape sequences.
      newText = newText.replace(ERASE_PREVIOUS_LINE_REGEX, '');
    }

    // There seem to be some invisible characters (not newlines) at the end of
    // lines that result in a newline. Remove these.
    newText = newText.trim();
    // Append the processed text to a new line.
    // `{undo: 'skip'}` disables the TextEditor's "undo system".
    textBuffer.append(newText, { undo: 'skip' });
    if (lineNum !== lines.length - 1) {
      // Don't append a newline to the last line. (Since we split by \n, the
      // last segment should not end in a newline.)
      // `{undo: 'skip'}` disables the TextEditor's "undo system".
      textBuffer.append('\n', { undo: 'skip' });
    }
  }
}

module.exports = handleBuckAnsiOutput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhhbmRsZUJ1Y2tBbnNpT3V0cHV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFXQSxJQUFNLDZCQUE2QixHQUFHLGtCQUFrQixDQUFDO0FBQ3pELElBQU0seUJBQXlCLEdBQUcsdUJBQXVCLENBQUM7Ozs7Ozs7Ozs7OztBQVkxRCxTQUFTLG9CQUFvQixDQUFDLFVBQTJCLEVBQUUsSUFBWSxFQUFFOzs7QUFHdkUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixPQUFLLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRTtBQUN2RCxRQUFNLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7OztBQUc1QixRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLDZCQUE2QixFQUFFLEVBQUUsQ0FBQyxDQUFDOzs7O0FBSTlELFFBQU0sd0JBQXdCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQzFFLFFBQUksd0JBQXdCLEVBQUU7QUFDNUIsVUFBTSxxQkFBcUIsR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLENBQUM7O0FBRTlELFVBQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7O0FBRTlDLFVBQU0sV0FBVyxHQUFHLFNBQVMsR0FBRyxxQkFBcUIsR0FBRyxDQUFDLENBQUM7QUFDMUQsZ0JBQVUsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDOzs7QUFHOUMsYUFBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMseUJBQXlCLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDMUQ7Ozs7QUFJRCxXQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDOzs7QUFHekIsY0FBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztBQUMzQyxRQUFJLE9BQU8sS0FBTSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFOzs7O0FBSWxDLGdCQUFVLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0tBQ3pDO0dBQ0Y7Q0FDRjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDIiwiZmlsZSI6ImhhbmRsZUJ1Y2tBbnNpT3V0cHV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgU1RPUF9PUl9SRVNVTUVfV1JBUFBJTkdfUkVHRVggPSAvXFx1MDAxQlxcW1xcPzdbaGxdL2c7XG5jb25zdCBFUkFTRV9QUkVWSU9VU19MSU5FX1JFR0VYID0gL1xcdTAwMUJcXFsxQVxcdTAwMUJcXFsySy9nO1xuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIFByb2Nlc3NPdXRwdXRIYW5kbGVyIHRoYXQgcGFyc2VzIGFuZCBhcHBsaWVzIHRoZSBiZWhhdmlvclxuICogb2YgQU5TSSBlc2NhcGUgY2hhcmFjdGVycyB0aGF0IEJ1Y2sgdXNlcy5cbiAqIEFjY29yZGluZyB0byBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svYnVjay9ibG9iL21hc3Rlci9zcmMvY29tL2ZhY2Vib29rL2J1Y2svdXRpbC9BbnNpLmphdmEsXG4gKiBCdWNrIHVzZXMgdGhlIGZvbGxvd2luZyBub24tc3R5bGUgZXNjYXBlIGNoYXJhdGVyczpcbiAqICAgUmVzdW1lIHdyYXBwaW5nOiBFU0NbPzdoXG4gKiAgIFN0b3Agd3JhcHBpbmc6IEVTQ1s/N2xcbiAqICAgQ3Vyc29yIHRvIHByZXZpb3VzIGxpbmU6IEVTQ1sxQVxuICogICBFcmFzZSBsaW5lOiBFU0NbMktcbiAqL1xuZnVuY3Rpb24gaGFuZGxlQnVja0Fuc2lPdXRwdXQodGV4dEJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyLCB0ZXh0OiBzdHJpbmcpIHtcbiAgLy8gVGhlIGNodW5rIG9mIG5ldyB0ZXh0IG1heSBzcGFuIHNldmVyYWwgbGluZXMsIGVhY2ggb2Ygd2hpY2ggbWF5IGNvbnRhaW5cbiAgLy8gQU5TSSBlc2NhcGUgY2hhcmFjdGVycy5cbiAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKTtcbiAgZm9yIChsZXQgbGluZU51bSA9IDA7IGxpbmVOdW0gPCBsaW5lcy5sZW5ndGg7IGxpbmVOdW0rKykge1xuICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tsaW5lTnVtXTtcblxuICAgIC8vIFNpbXBseSBzdHJpcCB0aGUgJ3Jlc3VtZSB3cmFwcGluZycgYW5kICdzdG9wIHdyYXBwaW5nJyBlc2NhcGUgY2hhcmFjdGVycy5cbiAgICBsZXQgbmV3VGV4dCA9IGxpbmUucmVwbGFjZShTVE9QX09SX1JFU1VNRV9XUkFQUElOR19SRUdFWCwgJycpO1xuXG4gICAgLy8gSW4gQnVjaywgdGhlICdjdXJzb3IgdG8gcHJldmlvdXMgbGluZScgYW5kICdlcmFzZSBsaW5lJyBlc2NhcGUgY2hhcmFjdGVyc1xuICAgIC8vIG9jY3VyIGluIHBhaXJzLlxuICAgIGNvbnN0IGVyYXNlUHJldmlvdXNMaW5lTWF0Y2hlcyA9IG5ld1RleHQubWF0Y2goRVJBU0VfUFJFVklPVVNfTElORV9SRUdFWCk7XG4gICAgaWYgKGVyYXNlUHJldmlvdXNMaW5lTWF0Y2hlcykge1xuICAgICAgY29uc3QgbnVtYmVyT2ZMaW5lc1RvUmVtb3ZlID0gZXJhc2VQcmV2aW91c0xpbmVNYXRjaGVzLmxlbmd0aDtcbiAgICAgIC8vIFRoaXMgcmVwcmVzZW50cyAnbW92aW5nIHRoZSBjdXJzb3IgdG8gcHJldmlvdXMgbGluZSc6XG4gICAgICBjb25zdCBlbmRSZW1vdmUgPSB0ZXh0QnVmZmVyLmdldExhc3RSb3coKSAtIDE7XG4gICAgICAvLyBUZXh0QnVmZmVyOjpkZWxldGVSb3dzIGlzIGluY2x1c2l2ZTpcbiAgICAgIGNvbnN0IHN0YXJ0UmVtb3ZlID0gZW5kUmVtb3ZlIC0gbnVtYmVyT2ZMaW5lc1RvUmVtb3ZlICsgMTtcbiAgICAgIHRleHRCdWZmZXIuZGVsZXRlUm93cyhzdGFydFJlbW92ZSwgZW5kUmVtb3ZlKTtcblxuICAgICAgLy8gUmVtb3ZlIHRoZXNlIGVzY2FwZSBzZXF1ZW5jZXMuXG4gICAgICBuZXdUZXh0ID0gbmV3VGV4dC5yZXBsYWNlKEVSQVNFX1BSRVZJT1VTX0xJTkVfUkVHRVgsICcnKTtcbiAgICB9XG5cbiAgICAvLyBUaGVyZSBzZWVtIHRvIGJlIHNvbWUgaW52aXNpYmxlIGNoYXJhY3RlcnMgKG5vdCBuZXdsaW5lcykgYXQgdGhlIGVuZCBvZlxuICAgIC8vIGxpbmVzIHRoYXQgcmVzdWx0IGluIGEgbmV3bGluZS4gUmVtb3ZlIHRoZXNlLlxuICAgIG5ld1RleHQgPSBuZXdUZXh0LnRyaW0oKTtcbiAgICAvLyBBcHBlbmQgdGhlIHByb2Nlc3NlZCB0ZXh0IHRvIGEgbmV3IGxpbmUuXG4gICAgLy8gYHt1bmRvOiAnc2tpcCd9YCBkaXNhYmxlcyB0aGUgVGV4dEVkaXRvcidzIFwidW5kbyBzeXN0ZW1cIi5cbiAgICB0ZXh0QnVmZmVyLmFwcGVuZChuZXdUZXh0LCB7dW5kbzogJ3NraXAnfSk7XG4gICAgaWYgKGxpbmVOdW0gIT09IChsaW5lcy5sZW5ndGggLSAxKSkge1xuICAgICAgLy8gRG9uJ3QgYXBwZW5kIGEgbmV3bGluZSB0byB0aGUgbGFzdCBsaW5lLiAoU2luY2Ugd2Ugc3BsaXQgYnkgXFxuLCB0aGVcbiAgICAgIC8vIGxhc3Qgc2VnbWVudCBzaG91bGQgbm90IGVuZCBpbiBhIG5ld2xpbmUuKVxuICAgICAgLy8gYHt1bmRvOiAnc2tpcCd9YCBkaXNhYmxlcyB0aGUgVGV4dEVkaXRvcidzIFwidW5kbyBzeXN0ZW1cIi5cbiAgICAgIHRleHRCdWZmZXIuYXBwZW5kKCdcXG4nLCB7dW5kbzogJ3NraXAnfSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFuZGxlQnVja0Fuc2lPdXRwdXQ7XG4iXX0=