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

var _bind = Function.prototype.bind;
exports['default'] = createAtomCommands;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _atom = require('atom');

var _normalizeEventString = require('./normalizeEventString');

var _normalizeEventString2 = _interopRequireDefault(_normalizeEventString);

function createAtomCommands(gadgets, appCommands) {
  var commands = gadgets.valueSeq().flatMap(function (gadget) {
    return [atom.commands.add('atom-workspace', formatCommandName(gadget.gadgetId, 'Show'), function () {
      return appCommands.showGadget(gadget.gadgetId);
    }), atom.commands.add('atom-workspace', formatCommandName(gadget.gadgetId, 'Hide'), function () {
      return appCommands.hideGadget(gadget.gadgetId);
    }), atom.commands.add('atom-workspace', formatCommandName(gadget.gadgetId, 'Toggle'), function () {
      return appCommands.toggleGadget(gadget.gadgetId);
    })];
  }).toArray();
  return new (_bind.apply(_atom.CompositeDisposable, [null].concat(_toConsumableArray(commands))))();
}

function formatCommandName(gadgetId, action) {
  return (0, _normalizeEventString2['default'])(gadgetId) + ':' + (0, _normalizeEventString2['default'])(action);
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUF0b21Db21tYW5kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O3FCQWdCd0Isa0JBQWtCOzs7Ozs7b0JBSFIsTUFBTTs7b0NBQ1Asd0JBQXdCOzs7O0FBRTFDLFNBQVMsa0JBQWtCLENBQ3hDLE9BQXNCLEVBQ3RCLFdBQW1CLEVBQ047QUFDYixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQ3JCLFFBQVEsRUFBRSxDQUNWLE9BQU8sQ0FBQyxVQUFBLE1BQU07V0FBSyxDQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDZixnQkFBZ0IsRUFDaEIsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFDMUM7YUFBTSxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7S0FBQSxDQUM5QyxFQUNELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNmLGdCQUFnQixFQUNoQixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUMxQzthQUFNLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztLQUFBLENBQzlDLEVBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ2YsZ0JBQWdCLEVBQ2hCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQzVDO2FBQU0sV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0tBQUEsQ0FDaEQsQ0FDRjtHQUFDLENBQUMsQ0FDRixPQUFPLEVBQUUsQ0FBQztBQUNiLHNGQUFrQyxRQUFRLE9BQUU7Q0FDN0M7O0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxRQUFnQixFQUFFLE1BQWMsRUFBVTtBQUNuRSxTQUFVLHVDQUFxQixRQUFRLENBQUMsU0FBSSx1Q0FBcUIsTUFBTSxDQUFDLENBQUc7Q0FDNUUiLCJmaWxlIjoiY3JlYXRlQXRvbUNvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgbm9ybWFsaXplRXZlbnRTdHJpbmcgZnJvbSAnLi9ub3JtYWxpemVFdmVudFN0cmluZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUF0b21Db21tYW5kcyhcbiAgZ2FkZ2V0czogSW1tdXRhYmxlLk1hcCxcbiAgYXBwQ29tbWFuZHM6IE9iamVjdCxcbik6IElEaXNwb3NhYmxlIHtcbiAgY29uc3QgY29tbWFuZHMgPSBnYWRnZXRzXG4gICAgLnZhbHVlU2VxKClcbiAgICAuZmxhdE1hcChnYWRnZXQgPT4gKFtcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgICBmb3JtYXRDb21tYW5kTmFtZShnYWRnZXQuZ2FkZ2V0SWQsICdTaG93JyksXG4gICAgICAgICgpID0+IGFwcENvbW1hbmRzLnNob3dHYWRnZXQoZ2FkZ2V0LmdhZGdldElkKSxcbiAgICAgICksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICAgZm9ybWF0Q29tbWFuZE5hbWUoZ2FkZ2V0LmdhZGdldElkLCAnSGlkZScpLFxuICAgICAgICAoKSA9PiBhcHBDb21tYW5kcy5oaWRlR2FkZ2V0KGdhZGdldC5nYWRnZXRJZCksXG4gICAgICApLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAgIGZvcm1hdENvbW1hbmROYW1lKGdhZGdldC5nYWRnZXRJZCwgJ1RvZ2dsZScpLFxuICAgICAgICAoKSA9PiBhcHBDb21tYW5kcy50b2dnbGVHYWRnZXQoZ2FkZ2V0LmdhZGdldElkKSxcbiAgICAgICksXG4gICAgXSkpXG4gICAgLnRvQXJyYXkoKTtcbiAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKC4uLmNvbW1hbmRzKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0Q29tbWFuZE5hbWUoZ2FkZ2V0SWQ6IHN0cmluZywgYWN0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7bm9ybWFsaXplRXZlbnRTdHJpbmcoZ2FkZ2V0SWQpfToke25vcm1hbGl6ZUV2ZW50U3RyaW5nKGFjdGlvbil9YDtcbn1cbiJdfQ==