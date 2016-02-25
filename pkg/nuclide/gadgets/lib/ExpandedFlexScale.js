Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.get = get;
exports.set = set;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GadgetPlaceholder = require('./GadgetPlaceholder');

var _GadgetPlaceholder2 = _interopRequireDefault(_GadgetPlaceholder);

function get(container) {
  for (var item of container.getItems()) {
    if (item._expandedFlexScale) {
      return item._expandedFlexScale;
    }
  }
  return 1;
}

function set(container, value) {
  // Store the number on on every gadget item in the container just in case one gets moved or
  // destroyed. It would be nice to store the information on the container (Pane, PaneAxis) itself,
  // but Atom doesn't give us a way to persist metadata about those.
  container.getItems().forEach(function (item) {
    if (!('gadgetId' in item.constructor) && !(item instanceof _GadgetPlaceholder2['default'])) {
      // We don't control this item's serialization so no use in storing the size on it.
      return;
    }
    item._expandedFlexScale = value;
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkV4cGFuZGVkRmxleFNjYWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O2lDQWE4QixxQkFBcUI7Ozs7QUFFNUMsU0FBUyxHQUFHLENBQUMsU0FBNEIsRUFBVTtBQUN4RCxPQUFLLElBQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtBQUN2QyxRQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtBQUMzQixhQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztLQUNoQztHQUNGO0FBQ0QsU0FBTyxDQUFDLENBQUM7Q0FDVjs7QUFFTSxTQUFTLEdBQUcsQ0FBQyxTQUE0QixFQUFFLEtBQWEsRUFBUTs7OztBQUlyRSxXQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ25DLFFBQUksRUFBRSxVQUFVLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQSxBQUFDLElBQUksRUFBRSxJQUFJLDJDQUE2QixBQUFDLEVBQUU7O0FBRTdFLGFBQU87S0FDUjtBQUNELFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7R0FDakMsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiRXhwYW5kZWRGbGV4U2NhbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7UGFuZUl0ZW1Db250YWluZXJ9IGZyb20gJy4uL3R5cGVzL1BhbmVJdGVtQ29udGFpbmVyJztcblxuaW1wb3J0IEdhZGdldFBsYWNlaG9sZGVyIGZyb20gJy4vR2FkZ2V0UGxhY2Vob2xkZXInO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0KGNvbnRhaW5lcjogUGFuZUl0ZW1Db250YWluZXIpOiBudW1iZXIge1xuICBmb3IgKGNvbnN0IGl0ZW0gb2YgY29udGFpbmVyLmdldEl0ZW1zKCkpIHtcbiAgICBpZiAoaXRlbS5fZXhwYW5kZWRGbGV4U2NhbGUpIHtcbiAgICAgIHJldHVybiBpdGVtLl9leHBhbmRlZEZsZXhTY2FsZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQoY29udGFpbmVyOiBQYW5lSXRlbUNvbnRhaW5lciwgdmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAvLyBTdG9yZSB0aGUgbnVtYmVyIG9uIG9uIGV2ZXJ5IGdhZGdldCBpdGVtIGluIHRoZSBjb250YWluZXIganVzdCBpbiBjYXNlIG9uZSBnZXRzIG1vdmVkIG9yXG4gIC8vIGRlc3Ryb3llZC4gSXQgd291bGQgYmUgbmljZSB0byBzdG9yZSB0aGUgaW5mb3JtYXRpb24gb24gdGhlIGNvbnRhaW5lciAoUGFuZSwgUGFuZUF4aXMpIGl0c2VsZixcbiAgLy8gYnV0IEF0b20gZG9lc24ndCBnaXZlIHVzIGEgd2F5IHRvIHBlcnNpc3QgbWV0YWRhdGEgYWJvdXQgdGhvc2UuXG4gIGNvbnRhaW5lci5nZXRJdGVtcygpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgaWYgKCEoJ2dhZGdldElkJyBpbiBpdGVtLmNvbnN0cnVjdG9yKSAmJiAhKGl0ZW0gaW5zdGFuY2VvZiBHYWRnZXRQbGFjZWhvbGRlcikpIHtcbiAgICAgIC8vIFdlIGRvbid0IGNvbnRyb2wgdGhpcyBpdGVtJ3Mgc2VyaWFsaXphdGlvbiBzbyBubyB1c2UgaW4gc3RvcmluZyB0aGUgc2l6ZSBvbiBpdC5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaXRlbS5fZXhwYW5kZWRGbGV4U2NhbGUgPSB2YWx1ZTtcbiAgfSk7XG59XG4iXX0=