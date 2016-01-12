Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createComponentItem;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

/**
 * Create an object suitable for use as an Atom pane item from a React element.
 */

function createComponentItem(reactElement) {
  // In order to get the stateful object with the methods that Atom wants for items, we actually
  // have to mount it.
  var container = document.createElement('div');

  // For some reason, setting `container.style.display` to `"flex"` directly here doesn't work
  // (something clears it) so we add a class to style it instead.
  container.className = 'nuclide-gadgets--gadget-container';

  var mountedComponent = _reactForAtom2['default'].render(reactElement, container);

  // Add the element as a property of the mounted component. This is a special property that Atom's
  // view registry knows to look for. (See [View Resolution
  // Algorithm](https://atom.io/docs/api/v1.2.4/ViewRegistry#instance-getView) for more details.)
  mountedComponent.element = container;

  return mountedComponent;
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUNvbXBvbmVudEl0ZW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O3FCQWdCd0IsbUJBQW1COzs7Ozs7Ozs7Ozs7NEJBTHpCLGdCQUFnQjs7Ozs7Ozs7QUFLbkIsU0FBUyxtQkFBbUIsQ0FBQyxZQUEyQixFQUFlOzs7QUFHcEYsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7OztBQUloRCxXQUFTLENBQUMsU0FBUyxHQUFHLG1DQUFtQyxDQUFDOztBQUUxRCxNQUFNLGdCQUFnQixHQUFHLDBCQUFNLE1BQU0sQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7Ozs7O0FBSy9ELGtCQUFnQixDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7O0FBRXJDLFNBQU8sZ0JBQWdCLENBQUM7Q0FDekIiLCJmaWxlIjoiY3JlYXRlQ29tcG9uZW50SXRlbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbi8qKlxuICogQ3JlYXRlIGFuIG9iamVjdCBzdWl0YWJsZSBmb3IgdXNlIGFzIGFuIEF0b20gcGFuZSBpdGVtIGZyb20gYSBSZWFjdCBlbGVtZW50LlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRJdGVtKHJlYWN0RWxlbWVudDogP1JlYWN0RWxlbWVudCk6IEhUTUxFbGVtZW50IHtcbiAgLy8gSW4gb3JkZXIgdG8gZ2V0IHRoZSBzdGF0ZWZ1bCBvYmplY3Qgd2l0aCB0aGUgbWV0aG9kcyB0aGF0IEF0b20gd2FudHMgZm9yIGl0ZW1zLCB3ZSBhY3R1YWxseVxuICAvLyBoYXZlIHRvIG1vdW50IGl0LlxuICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAvLyBGb3Igc29tZSByZWFzb24sIHNldHRpbmcgYGNvbnRhaW5lci5zdHlsZS5kaXNwbGF5YCB0byBgXCJmbGV4XCJgIGRpcmVjdGx5IGhlcmUgZG9lc24ndCB3b3JrXG4gIC8vIChzb21ldGhpbmcgY2xlYXJzIGl0KSBzbyB3ZSBhZGQgYSBjbGFzcyB0byBzdHlsZSBpdCBpbnN0ZWFkLlxuICBjb250YWluZXIuY2xhc3NOYW1lID0gJ251Y2xpZGUtZ2FkZ2V0cy0tZ2FkZ2V0LWNvbnRhaW5lcic7XG5cbiAgY29uc3QgbW91bnRlZENvbXBvbmVudCA9IFJlYWN0LnJlbmRlcihyZWFjdEVsZW1lbnQsIGNvbnRhaW5lcik7XG5cbiAgLy8gQWRkIHRoZSBlbGVtZW50IGFzIGEgcHJvcGVydHkgb2YgdGhlIG1vdW50ZWQgY29tcG9uZW50LiBUaGlzIGlzIGEgc3BlY2lhbCBwcm9wZXJ0eSB0aGF0IEF0b20nc1xuICAvLyB2aWV3IHJlZ2lzdHJ5IGtub3dzIHRvIGxvb2sgZm9yLiAoU2VlIFtWaWV3IFJlc29sdXRpb25cbiAgLy8gQWxnb3JpdGhtXShodHRwczovL2F0b20uaW8vZG9jcy9hcGkvdjEuMi40L1ZpZXdSZWdpc3RyeSNpbnN0YW5jZS1nZXRWaWV3KSBmb3IgbW9yZSBkZXRhaWxzLilcbiAgbW91bnRlZENvbXBvbmVudC5lbGVtZW50ID0gY29udGFpbmVyO1xuXG4gIHJldHVybiBtb3VudGVkQ29tcG9uZW50O1xufVxuIl19