Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.remove = remove;
exports.equal = equal;
exports.compact = compact;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function remove(array, element) {
  var index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

function equal(array1, array2, equalComparator) {
  if (array1.length !== array2.length) {
    return false;
  }
  var equalFunction = equalComparator || function (a, b) {
    return a === b;
  };
  return array1.every(function (item1, i) {
    return equalFunction(item1, array2[i]);
  });
}

/**
 * Returns a copy of the input Array with all `null` and `undefined` values filtered out.
 * Allows Flow to typecheck the common `filter(x => x != null)` pattern.
 */

function compact(array) {
  var result = [];
  for (var elem of array) {
    if (elem != null) {
      result.push(elem);
    }
  }
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFycmF5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQVdPLFNBQVMsTUFBTSxDQUFJLEtBQWUsRUFBRSxPQUFVLEVBQVE7QUFDM0QsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyQyxNQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7QUFDZCxTQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztHQUN4QjtDQUNGOztBQUVNLFNBQVMsS0FBSyxDQUNuQixNQUFnQixFQUNoQixNQUFnQixFQUNoQixlQUF5QyxFQUNoQztBQUNULE1BQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQ25DLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7QUFDRCxNQUFNLGFBQWEsR0FBRyxlQUFlLElBQUssVUFBQyxDQUFDLEVBQU0sQ0FBQztXQUFRLENBQUMsS0FBSyxDQUFDO0dBQUEsQUFBQyxDQUFDO0FBQ3BFLFNBQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFDLEtBQUssRUFBRSxDQUFDO1dBQUssYUFBYSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQSxDQUFDLENBQUM7Q0FDcEU7Ozs7Ozs7QUFNTSxTQUFTLE9BQU8sQ0FBSSxLQUFnQixFQUFZO0FBQ3JELE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNsQixPQUFLLElBQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtBQUN4QixRQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsWUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNuQjtHQUNGO0FBQ0QsU0FBTyxNQUFNLENBQUM7Q0FDZiIsImZpbGUiOiJhcnJheS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmU8VD4oYXJyYXk6IEFycmF5PFQ+LCBlbGVtZW50OiBUKTogdm9pZCB7XG4gIGNvbnN0IGluZGV4ID0gYXJyYXkuaW5kZXhPZihlbGVtZW50KTtcbiAgaWYgKGluZGV4ID49IDApIHtcbiAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbDxUPihcbiAgYXJyYXkxOiBBcnJheTxUPixcbiAgYXJyYXkyOiBBcnJheTxUPixcbiAgZXF1YWxDb21wYXJhdG9yPzogKGE6IFQsIGI6IFQpID0+IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgaWYgKGFycmF5MS5sZW5ndGggIT09IGFycmF5Mi5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3QgZXF1YWxGdW5jdGlvbiA9IGVxdWFsQ29tcGFyYXRvciB8fCAoKGE6IFQsICBiOiBUKSA9PiBhID09PSBiKTtcbiAgcmV0dXJuIGFycmF5MS5ldmVyeSgoaXRlbTEsIGkpID0+IGVxdWFsRnVuY3Rpb24oaXRlbTEsIGFycmF5MltpXSkpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBjb3B5IG9mIHRoZSBpbnB1dCBBcnJheSB3aXRoIGFsbCBgbnVsbGAgYW5kIGB1bmRlZmluZWRgIHZhbHVlcyBmaWx0ZXJlZCBvdXQuXG4gKiBBbGxvd3MgRmxvdyB0byB0eXBlY2hlY2sgdGhlIGNvbW1vbiBgZmlsdGVyKHggPT4geCAhPSBudWxsKWAgcGF0dGVybi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBhY3Q8VD4oYXJyYXk6IEFycmF5PD9UPik6IEFycmF5PFQ+IHtcbiAgY29uc3QgcmVzdWx0ID0gW107XG4gIGZvciAoY29uc3QgZWxlbSBvZiBhcnJheSkge1xuICAgIGlmIChlbGVtICE9IG51bGwpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGVsZW0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19