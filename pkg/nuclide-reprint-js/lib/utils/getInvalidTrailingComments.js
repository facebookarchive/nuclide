

var Immutable = require('immutable');

/**
 * This traverses an entire ast and determines which trailing comments are
 * duplicates of other leading comments. Comments are invalidated based on
 * their starting position.
 */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function getInvalidTrailingComments(node) {
  var result = [];
  traverse(node, result);
  return Immutable.Set(result);
}

/**
 * A dumb traversal method. It will break if node contains any sort of
 * circular structure.
 */
function traverse(node, result) {
  if (!node) {
    return;
  }

  if (Object.prototype.toString.call(node) === '[object Object]') {
    if (typeof node.type === 'string') {
      Object.keys(node).forEach(function (key) {
        var value = node[key];

        // Leading comments are invalid trailing comments.
        if (key === 'leadingComments' && value) {
          value.forEach(function (comment) {
            // Some sanity checks on the comments.
            if (comment && typeof comment.type === 'string' && comment.start != null) {
              result.push(comment.start);
            }
          });
        }

        traverse(value, result);
      });
    }
  }

  if (Array.isArray(node)) {
    node.forEach(function (value) {
      traverse(value, result);
    });
  }
}

module.exports = getInvalidTrailingComments;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdldEludmFsaWRUcmFpbGluZ0NvbW1lbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBYUEsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FBT3ZDLFNBQVMsMEJBQTBCLENBQUMsSUFBVSxFQUF5QjtBQUNyRSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDbEIsVUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN2QixTQUFPLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDOUI7Ozs7OztBQU1ELFNBQVMsUUFBUSxDQUFDLElBQVMsRUFBRSxNQUFxQixFQUFRO0FBQ3hELE1BQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxXQUFPO0dBQ1I7O0FBRUQsTUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssaUJBQWlCLEVBQUU7QUFDOUQsUUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ2pDLFlBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQy9CLFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O0FBR3hCLFlBQUksR0FBRyxLQUFLLGlCQUFpQixJQUFJLEtBQUssRUFBRTtBQUN0QyxlQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJOztBQUV2QixnQkFDRSxPQUFPLElBQ1AsT0FBTyxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFDaEMsT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQ3JCO0FBQ0Esb0JBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVCO1dBQ0YsQ0FBQyxDQUFDO1NBQ0o7O0FBRUQsZ0JBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDekIsQ0FBQyxDQUFDO0tBQ0o7R0FDRjs7QUFFRCxNQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDdkIsUUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUNwQixjQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3pCLENBQUMsQ0FBQztHQUNKO0NBQ0Y7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRywwQkFBMEIsQ0FBQyIsImZpbGUiOiJnZXRJbnZhbGlkVHJhaWxpbmdDb21tZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOb2RlfSBmcm9tICdhc3QtdHlwZXMtZmxvdyc7XG5cbmNvbnN0IEltbXV0YWJsZSA9IHJlcXVpcmUoJ2ltbXV0YWJsZScpO1xuXG4vKipcbiAqIFRoaXMgdHJhdmVyc2VzIGFuIGVudGlyZSBhc3QgYW5kIGRldGVybWluZXMgd2hpY2ggdHJhaWxpbmcgY29tbWVudHMgYXJlXG4gKiBkdXBsaWNhdGVzIG9mIG90aGVyIGxlYWRpbmcgY29tbWVudHMuIENvbW1lbnRzIGFyZSBpbnZhbGlkYXRlZCBiYXNlZCBvblxuICogdGhlaXIgc3RhcnRpbmcgcG9zaXRpb24uXG4gKi9cbmZ1bmN0aW9uIGdldEludmFsaWRUcmFpbGluZ0NvbW1lbnRzKG5vZGU6IE5vZGUpOiBJbW11dGFibGUuU2V0PG51bWJlcj4ge1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgdHJhdmVyc2Uobm9kZSwgcmVzdWx0KTtcbiAgcmV0dXJuIEltbXV0YWJsZS5TZXQocmVzdWx0KTtcbn1cblxuLyoqXG4gKiBBIGR1bWIgdHJhdmVyc2FsIG1ldGhvZC4gSXQgd2lsbCBicmVhayBpZiBub2RlIGNvbnRhaW5zIGFueSBzb3J0IG9mXG4gKiBjaXJjdWxhciBzdHJ1Y3R1cmUuXG4gKi9cbmZ1bmN0aW9uIHRyYXZlcnNlKG5vZGU6IGFueSwgcmVzdWx0OiBBcnJheTxudW1iZXI+KTogdm9pZCB7XG4gIGlmICghbm9kZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobm9kZSkgPT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgaWYgKHR5cGVvZiBub2RlLnR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBPYmplY3Qua2V5cyhub2RlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gbm9kZVtrZXldO1xuXG4gICAgICAgIC8vIExlYWRpbmcgY29tbWVudHMgYXJlIGludmFsaWQgdHJhaWxpbmcgY29tbWVudHMuXG4gICAgICAgIGlmIChrZXkgPT09ICdsZWFkaW5nQ29tbWVudHMnICYmIHZhbHVlKSB7XG4gICAgICAgICAgdmFsdWUuZm9yRWFjaChjb21tZW50ID0+IHtcbiAgICAgICAgICAgIC8vIFNvbWUgc2FuaXR5IGNoZWNrcyBvbiB0aGUgY29tbWVudHMuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGNvbW1lbnQgJiZcbiAgICAgICAgICAgICAgdHlwZW9mIGNvbW1lbnQudHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgY29tbWVudC5zdGFydCAhPSBudWxsXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goY29tbWVudC5zdGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cmF2ZXJzZSh2YWx1ZSwgcmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KG5vZGUpKSB7XG4gICAgbm9kZS5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICAgIHRyYXZlcnNlKHZhbHVlLCByZXN1bHQpO1xuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0SW52YWxpZFRyYWlsaW5nQ29tbWVudHM7XG4iXX0=