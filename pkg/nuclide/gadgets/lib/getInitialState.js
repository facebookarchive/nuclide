Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = getInitialState;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

/**
 * Get the initial state of the gadgets app.
 * TODO: Get this from deserialization.
 */

function getInitialState() {
  return _immutable2['default'].Map({
    gadgets: _immutable2['default'].Map(),
    components: _immutable2['default'].Map(),
    props: _immutable2['default'].Map()
  });
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdldEluaXRpYWxTdGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7cUJBaUJ3QixlQUFlOzs7Ozs7Ozs7Ozs7eUJBTmpCLFdBQVc7Ozs7Ozs7OztBQU1sQixTQUFTLGVBQWUsR0FBa0I7QUFDdkQsU0FBTyx1QkFBVSxHQUFHLENBQUM7QUFDbkIsV0FBTyxFQUFFLHVCQUFVLEdBQUcsRUFBRTtBQUN4QixjQUFVLEVBQUUsdUJBQVUsR0FBRyxFQUFFO0FBQzNCLFNBQUssRUFBRSx1QkFBVSxHQUFHLEVBQUU7R0FDdkIsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiZ2V0SW5pdGlhbFN0YXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuXG4vKipcbiAqIEdldCB0aGUgaW5pdGlhbCBzdGF0ZSBvZiB0aGUgZ2FkZ2V0cyBhcHAuXG4gKiBUT0RPOiBHZXQgdGhpcyBmcm9tIGRlc2VyaWFsaXphdGlvbi5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCk6IEltbXV0YWJsZS5NYXAge1xuICByZXR1cm4gSW1tdXRhYmxlLk1hcCh7XG4gICAgZ2FkZ2V0czogSW1tdXRhYmxlLk1hcCgpLFxuICAgIGNvbXBvbmVudHM6IEltbXV0YWJsZS5NYXAoKSxcbiAgICBwcm9wczogSW1tdXRhYmxlLk1hcCgpLFxuICB9KTtcbn1cbiJdfQ==