

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// These are special markers that can be used to identify special handling.
//
// TODO: This is not technically correct. Really we should create references
// to unique objects so when we insert a marker it's impossible that it has
// appeared elsewhere in the source. This may make flow types annoying though.
module.exports = {
  // Hard break that must exist here. We are explicit about breaks because we
  // generally want the algorithm to condense lines for us.
  hardBreak: '$$hardBreak$$',

  // This is like a hard break except duplicates will be preserved. Use this if
  // you need multiple line breaks to be preserved.
  multiHardBreak: '$$multiHardBreak$$',

  // Prefix a token with this to indicate that no breaks should happen here.
  // This is stronger than any kind of break, a break will not happen if a
  // noBreak is within the break's contiguous chain of markers.
  noBreak: '$$noBreak$$',

  // These represent groups of soft breaks. A break doesn't have to happen here
  // but whenever we choose to break at a scopeBreak we must also break at
  // all other scopeBreaks within the same scope. (Not child scopes though).
  openScope: '$$openScope$$',
  scopeIndent: '$$scopeIndent$$',
  scopeBreak: '$$scopeBreak$$',
  // This is like scope break but is replaced with a space if not broken.
  scopeSpaceBreak: '$$scopeSpaceBreak$$',
  // Replace this with a comma if the scope is broken.
  scopeComma: '$$scopeComma$$',
  scopeDedent: '$$scopeDedent$$',
  closeScope: '$$closeScope$$',

  // Decrease the indentation after this line.
  dedent: '$$dedent$$',

  // Increase the indentation after this line.
  indent: '$$indent$$',

  // These are necessary to maintain contiguous runs of markers when relevant.
  comma: '$$comma$$',
  space: '$$space$$',
  empty: '$$empty$$'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hcmtlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLE1BQU0sQ0FBQyxPQUFPLEdBQUc7OztBQUdmLFdBQVMsRUFBRSxlQUFlOzs7O0FBSTFCLGdCQUFjLEVBQUUsb0JBQW9COzs7OztBQUtwQyxTQUFPLEVBQUUsYUFBYTs7Ozs7QUFLdEIsV0FBUyxFQUFFLGVBQWU7QUFDMUIsYUFBVyxFQUFFLGlCQUFpQjtBQUM5QixZQUFVLEVBQUUsZ0JBQWdCOztBQUU1QixpQkFBZSxFQUFFLHFCQUFxQjs7QUFFdEMsWUFBVSxFQUFFLGdCQUFnQjtBQUM1QixhQUFXLEVBQUUsaUJBQWlCO0FBQzlCLFlBQVUsRUFBRSxnQkFBZ0I7OztBQUc1QixRQUFNLEVBQUUsWUFBWTs7O0FBR3BCLFFBQU0sRUFBRSxZQUFZOzs7QUFHcEIsT0FBSyxFQUFFLFdBQVc7QUFDbEIsT0FBSyxFQUFFLFdBQVc7QUFDbEIsT0FBSyxFQUFFLFdBQVc7Q0FDbkIsQ0FBQyIsImZpbGUiOiJtYXJrZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gVGhlc2UgYXJlIHNwZWNpYWwgbWFya2VycyB0aGF0IGNhbiBiZSB1c2VkIHRvIGlkZW50aWZ5IHNwZWNpYWwgaGFuZGxpbmcuXG4vL1xuLy8gVE9ETzogVGhpcyBpcyBub3QgdGVjaG5pY2FsbHkgY29ycmVjdC4gUmVhbGx5IHdlIHNob3VsZCBjcmVhdGUgcmVmZXJlbmNlc1xuLy8gdG8gdW5pcXVlIG9iamVjdHMgc28gd2hlbiB3ZSBpbnNlcnQgYSBtYXJrZXIgaXQncyBpbXBvc3NpYmxlIHRoYXQgaXQgaGFzXG4vLyBhcHBlYXJlZCBlbHNld2hlcmUgaW4gdGhlIHNvdXJjZS4gVGhpcyBtYXkgbWFrZSBmbG93IHR5cGVzIGFubm95aW5nIHRob3VnaC5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBIYXJkIGJyZWFrIHRoYXQgbXVzdCBleGlzdCBoZXJlLiBXZSBhcmUgZXhwbGljaXQgYWJvdXQgYnJlYWtzIGJlY2F1c2Ugd2VcbiAgLy8gZ2VuZXJhbGx5IHdhbnQgdGhlIGFsZ29yaXRobSB0byBjb25kZW5zZSBsaW5lcyBmb3IgdXMuXG4gIGhhcmRCcmVhazogJyQkaGFyZEJyZWFrJCQnLFxuXG4gIC8vIFRoaXMgaXMgbGlrZSBhIGhhcmQgYnJlYWsgZXhjZXB0IGR1cGxpY2F0ZXMgd2lsbCBiZSBwcmVzZXJ2ZWQuIFVzZSB0aGlzIGlmXG4gIC8vIHlvdSBuZWVkIG11bHRpcGxlIGxpbmUgYnJlYWtzIHRvIGJlIHByZXNlcnZlZC5cbiAgbXVsdGlIYXJkQnJlYWs6ICckJG11bHRpSGFyZEJyZWFrJCQnLFxuXG4gIC8vIFByZWZpeCBhIHRva2VuIHdpdGggdGhpcyB0byBpbmRpY2F0ZSB0aGF0IG5vIGJyZWFrcyBzaG91bGQgaGFwcGVuIGhlcmUuXG4gIC8vIFRoaXMgaXMgc3Ryb25nZXIgdGhhbiBhbnkga2luZCBvZiBicmVhaywgYSBicmVhayB3aWxsIG5vdCBoYXBwZW4gaWYgYVxuICAvLyBub0JyZWFrIGlzIHdpdGhpbiB0aGUgYnJlYWsncyBjb250aWd1b3VzIGNoYWluIG9mIG1hcmtlcnMuXG4gIG5vQnJlYWs6ICckJG5vQnJlYWskJCcsXG5cbiAgLy8gVGhlc2UgcmVwcmVzZW50IGdyb3VwcyBvZiBzb2Z0IGJyZWFrcy4gQSBicmVhayBkb2Vzbid0IGhhdmUgdG8gaGFwcGVuIGhlcmVcbiAgLy8gYnV0IHdoZW5ldmVyIHdlIGNob29zZSB0byBicmVhayBhdCBhIHNjb3BlQnJlYWsgd2UgbXVzdCBhbHNvIGJyZWFrIGF0XG4gIC8vIGFsbCBvdGhlciBzY29wZUJyZWFrcyB3aXRoaW4gdGhlIHNhbWUgc2NvcGUuIChOb3QgY2hpbGQgc2NvcGVzIHRob3VnaCkuXG4gIG9wZW5TY29wZTogJyQkb3BlblNjb3BlJCQnLFxuICBzY29wZUluZGVudDogJyQkc2NvcGVJbmRlbnQkJCcsXG4gIHNjb3BlQnJlYWs6ICckJHNjb3BlQnJlYWskJCcsXG4gIC8vIFRoaXMgaXMgbGlrZSBzY29wZSBicmVhayBidXQgaXMgcmVwbGFjZWQgd2l0aCBhIHNwYWNlIGlmIG5vdCBicm9rZW4uXG4gIHNjb3BlU3BhY2VCcmVhazogJyQkc2NvcGVTcGFjZUJyZWFrJCQnLFxuICAvLyBSZXBsYWNlIHRoaXMgd2l0aCBhIGNvbW1hIGlmIHRoZSBzY29wZSBpcyBicm9rZW4uXG4gIHNjb3BlQ29tbWE6ICckJHNjb3BlQ29tbWEkJCcsXG4gIHNjb3BlRGVkZW50OiAnJCRzY29wZURlZGVudCQkJyxcbiAgY2xvc2VTY29wZTogJyQkY2xvc2VTY29wZSQkJyxcblxuICAvLyBEZWNyZWFzZSB0aGUgaW5kZW50YXRpb24gYWZ0ZXIgdGhpcyBsaW5lLlxuICBkZWRlbnQ6ICckJGRlZGVudCQkJyxcblxuICAvLyBJbmNyZWFzZSB0aGUgaW5kZW50YXRpb24gYWZ0ZXIgdGhpcyBsaW5lLlxuICBpbmRlbnQ6ICckJGluZGVudCQkJyxcblxuICAvLyBUaGVzZSBhcmUgbmVjZXNzYXJ5IHRvIG1haW50YWluIGNvbnRpZ3VvdXMgcnVucyBvZiBtYXJrZXJzIHdoZW4gcmVsZXZhbnQuXG4gIGNvbW1hOiAnJCRjb21tYSQkJyxcbiAgc3BhY2U6ICckJHNwYWNlJCQnLFxuICBlbXB0eTogJyQkZW1wdHkkJCcsXG59O1xuIl19