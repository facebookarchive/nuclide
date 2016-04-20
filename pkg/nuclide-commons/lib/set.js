Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.intersect = intersect;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function intersect(a, b) {
  return new Set(Array.from(a).filter(function (e) {
    return b.has(e);
  }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBV08sU0FBUyxTQUFTLENBQUksQ0FBUyxFQUFFLENBQVMsRUFBVTtBQUN6RCxTQUFPLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQztXQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQUEsQ0FBQyxDQUFDLENBQUM7Q0FDckQiLCJmaWxlIjoic2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGludGVyc2VjdDxUPihhOiBTZXQ8VD4sIGI6IFNldDxUPik6IFNldDxUPiB7XG4gIHJldHVybiBuZXcgU2V0KEFycmF5LmZyb20oYSkuZmlsdGVyKGUgPT4gYi5oYXMoZSkpKTtcbn1cbiJdfQ==