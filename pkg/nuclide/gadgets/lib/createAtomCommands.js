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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyZWF0ZUF0b21Db21tYW5kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O3FCQWdCd0Isa0JBQWtCOzs7Ozs7b0JBSFIsTUFBTTs7b0NBQ1Asd0JBQXdCOzs7O0FBRTFDLFNBQVMsa0JBQWtCLENBQ3hDLE9BQXNCLEVBQ3RCLFdBQW1CLEVBQ0Q7QUFDbEIsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUNyQixRQUFRLEVBQUUsQ0FDVixPQUFPLENBQUMsVUFBQSxNQUFNO1dBQUssQ0FDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ2YsZ0JBQWdCLEVBQ2hCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQzFDO2FBQU0sV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0tBQUEsQ0FDOUMsRUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDZixnQkFBZ0IsRUFDaEIsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFDMUM7YUFBTSxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7S0FBQSxDQUM5QyxFQUNELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUNmLGdCQUFnQixFQUNoQixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxFQUM1QzthQUFNLFdBQVcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztLQUFBLENBQ2hELENBQ0Y7R0FBQyxDQUFDLENBQ0YsT0FBTyxFQUFFLENBQUM7QUFDYixzRkFBa0MsUUFBUSxPQUFFO0NBQzdDOztBQUVELFNBQVMsaUJBQWlCLENBQUMsUUFBZ0IsRUFBRSxNQUFjLEVBQVU7QUFDbkUsU0FBVSx1Q0FBcUIsUUFBUSxDQUFDLFNBQUksdUNBQXFCLE1BQU0sQ0FBQyxDQUFHO0NBQzVFIiwiZmlsZSI6ImNyZWF0ZUF0b21Db21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IG5vcm1hbGl6ZUV2ZW50U3RyaW5nIGZyb20gJy4vbm9ybWFsaXplRXZlbnRTdHJpbmcnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVBdG9tQ29tbWFuZHMoXG4gIGdhZGdldHM6IEltbXV0YWJsZS5NYXAsXG4gIGFwcENvbW1hbmRzOiBPYmplY3QsXG4pOiBhdG9tJElEaXNwb3NhYmxlIHtcbiAgY29uc3QgY29tbWFuZHMgPSBnYWRnZXRzXG4gICAgLnZhbHVlU2VxKClcbiAgICAuZmxhdE1hcChnYWRnZXQgPT4gKFtcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgICBmb3JtYXRDb21tYW5kTmFtZShnYWRnZXQuZ2FkZ2V0SWQsICdTaG93JyksXG4gICAgICAgICgpID0+IGFwcENvbW1hbmRzLnNob3dHYWRnZXQoZ2FkZ2V0LmdhZGdldElkKSxcbiAgICAgICksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICAgZm9ybWF0Q29tbWFuZE5hbWUoZ2FkZ2V0LmdhZGdldElkLCAnSGlkZScpLFxuICAgICAgICAoKSA9PiBhcHBDb21tYW5kcy5oaWRlR2FkZ2V0KGdhZGdldC5nYWRnZXRJZCksXG4gICAgICApLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAgIGZvcm1hdENvbW1hbmROYW1lKGdhZGdldC5nYWRnZXRJZCwgJ1RvZ2dsZScpLFxuICAgICAgICAoKSA9PiBhcHBDb21tYW5kcy50b2dnbGVHYWRnZXQoZ2FkZ2V0LmdhZGdldElkKSxcbiAgICAgICksXG4gICAgXSkpXG4gICAgLnRvQXJyYXkoKTtcbiAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKC4uLmNvbW1hbmRzKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0Q29tbWFuZE5hbWUoZ2FkZ2V0SWQ6IHN0cmluZywgYWN0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7bm9ybWFsaXplRXZlbnRTdHJpbmcoZ2FkZ2V0SWQpfToke25vcm1hbGl6ZUV2ZW50U3RyaW5nKGFjdGlvbil9YDtcbn1cbiJdfQ==