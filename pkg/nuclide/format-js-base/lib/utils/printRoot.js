

var NewLine = require('./NewLine');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function printRoot(root) {
  // Print the new source.
  var output = root.toSource({ quote: 'single', trailingComma: true });

  // Remove all new lines between require fences that are not explicitly added
  // by the NewLine module.
  var lines = output.split('\n');
  var first = lines.length - 1;
  var last = 0;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf(NewLine.literal) !== -1) {
      first = Math.min(first, i);
      last = Math.max(last, i);
    }
  }

  // Filter out the empty lines that are between NewLine markers.
  output = lines.filter(function (line, index) {
    return line || index < first || index > last;
  }).join('\n');

  // Remove the NewLine markers.
  output = NewLine.replace(output);

  // Remove new lines at the start.
  output = output.replace(/^\n{1,}/, '');

  // Make sure there is a new line at the end.
  if (!/^[\w\W]*\n$/.test(output)) {
    output = output + '\n';
  }

  return output;
}

module.exports = printRoot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaW50Um9vdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWFBLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7Ozs7Ozs7OztBQUVyQyxTQUFTLFNBQVMsQ0FBQyxJQUFnQixFQUFVOztBQUUzQyxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQzs7OztBQUluRSxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLE1BQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLE1BQUksSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNiLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3JDLFFBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDNUMsV0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFVBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMxQjtHQUNGOzs7QUFHRCxRQUFNLEdBQUcsS0FBSyxDQUNYLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBRSxLQUFLO1dBQUssSUFBSSxJQUFJLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxHQUFHLElBQUk7R0FBQSxDQUFDLENBQzlELElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O0FBR2QsUUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7OztBQUdqQyxRQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7OztBQUd2QyxNQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMvQixVQUFNLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztHQUN4Qjs7QUFFRCxTQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDIiwiZmlsZSI6InByaW50Um9vdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtDb2xsZWN0aW9ufSBmcm9tICcuLi90eXBlcy9hc3QnO1xuXG5jb25zdCBOZXdMaW5lID0gcmVxdWlyZSgnLi9OZXdMaW5lJyk7XG5cbmZ1bmN0aW9uIHByaW50Um9vdChyb290OiBDb2xsZWN0aW9uKTogc3RyaW5nIHtcbiAgLy8gUHJpbnQgdGhlIG5ldyBzb3VyY2UuXG4gIGxldCBvdXRwdXQgPSByb290LnRvU291cmNlKHtxdW90ZTogJ3NpbmdsZScsIHRyYWlsaW5nQ29tbWE6IHRydWV9KTtcblxuICAvLyBSZW1vdmUgYWxsIG5ldyBsaW5lcyBiZXR3ZWVuIHJlcXVpcmUgZmVuY2VzIHRoYXQgYXJlIG5vdCBleHBsaWNpdGx5IGFkZGVkXG4gIC8vIGJ5IHRoZSBOZXdMaW5lIG1vZHVsZS5cbiAgY29uc3QgbGluZXMgPSBvdXRwdXQuc3BsaXQoJ1xcbicpO1xuICBsZXQgZmlyc3QgPSBsaW5lcy5sZW5ndGggLSAxO1xuICBsZXQgbGFzdCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobGluZXNbaV0uaW5kZXhPZihOZXdMaW5lLmxpdGVyYWwpICE9PSAtMSkge1xuICAgICAgZmlyc3QgPSBNYXRoLm1pbihmaXJzdCwgaSk7XG4gICAgICBsYXN0ID0gTWF0aC5tYXgobGFzdCwgaSk7XG4gICAgfVxuICB9XG5cbiAgLy8gRmlsdGVyIG91dCB0aGUgZW1wdHkgbGluZXMgdGhhdCBhcmUgYmV0d2VlbiBOZXdMaW5lIG1hcmtlcnMuXG4gIG91dHB1dCA9IGxpbmVzXG4gICAgLmZpbHRlcigobGluZSwgaW5kZXgpID0+IGxpbmUgfHwgaW5kZXggPCBmaXJzdCB8fCBpbmRleCA+IGxhc3QpXG4gICAgLmpvaW4oJ1xcbicpO1xuXG4gIC8vIFJlbW92ZSB0aGUgTmV3TGluZSBtYXJrZXJzLlxuICBvdXRwdXQgPSBOZXdMaW5lLnJlcGxhY2Uob3V0cHV0KTtcblxuICAvLyBSZW1vdmUgbmV3IGxpbmVzIGF0IHRoZSBzdGFydC5cbiAgb3V0cHV0ID0gb3V0cHV0LnJlcGxhY2UoL15cXG57MSx9LywgJycpO1xuXG4gIC8vIE1ha2Ugc3VyZSB0aGVyZSBpcyBhIG5ldyBsaW5lIGF0IHRoZSBlbmQuXG4gIGlmICghL15bXFx3XFxXXSpcXG4kLy50ZXN0KG91dHB1dCkpIHtcbiAgICBvdXRwdXQgPSBvdXRwdXQgKyAnXFxuJztcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcHJpbnRSb290O1xuIl19