

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {
  activate: function activate() {},

  getHyperclickProvider: function getHyperclickProvider() {
    return require('./HyperclickProvider');
  },

  createAutocompleteProvider: function createAutocompleteProvider() {
    var _require = require('../../analytics');

    var trackOperationTiming = _require.trackOperationTiming;

    var getSuggestions = function getSuggestions(request) {
      return trackOperationTiming('nuclide-ocaml:getAutocompleteSuggestions', function () {
        return require('./AutoComplete').getAutocompleteSuggestions(request);
      });
    };
    return {
      selector: '.source.ocaml',
      inclusionPriority: 1,
      disableForSelector: '.source.ocaml .comment',
      getSuggestions: getSuggestions
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQVdBLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixVQUFRLEVBQUEsb0JBQVMsRUFDaEI7O0FBRUQsdUJBQXFCLEVBQUEsaUNBQUc7QUFDdEIsV0FBTyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztHQUN4Qzs7QUFFRCw0QkFBMEIsRUFBQSxzQ0FBVTttQkFDSCxPQUFPLENBQUMsaUJBQWlCLENBQUM7O1FBQWxELG9CQUFvQixZQUFwQixvQkFBb0I7O0FBQzNCLFFBQU0sY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBRyxPQUFPLEVBQUk7QUFDaEMsYUFBTyxvQkFBb0IsQ0FDekIsMENBQTBDLEVBQzFDO2VBQU0sT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ3hFLENBQUM7QUFDRixXQUFPO0FBQ0wsY0FBUSxFQUFFLGVBQWU7QUFDekIsdUJBQWlCLEVBQUUsQ0FBQztBQUNwQix3QkFBa0IsRUFBRSx3QkFBd0I7QUFDNUMsb0JBQWMsRUFBZCxjQUFjO0tBQ2YsQ0FBQztHQUNIO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICB9LFxuXG4gIGdldEh5cGVyY2xpY2tQcm92aWRlcigpIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi9IeXBlcmNsaWNrUHJvdmlkZXInKTtcbiAgfSxcblxuICBjcmVhdGVBdXRvY29tcGxldGVQcm92aWRlcigpOiBtaXhlZCB7XG4gICAgY29uc3Qge3RyYWNrT3BlcmF0aW9uVGltaW5nfSA9IHJlcXVpcmUoJy4uLy4uL2FuYWx5dGljcycpO1xuICAgIGNvbnN0IGdldFN1Z2dlc3Rpb25zID0gcmVxdWVzdCA9PiB7XG4gICAgICByZXR1cm4gdHJhY2tPcGVyYXRpb25UaW1pbmcoXG4gICAgICAgICdudWNsaWRlLW9jYW1sOmdldEF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zJyxcbiAgICAgICAgKCkgPT4gcmVxdWlyZSgnLi9BdXRvQ29tcGxldGUnKS5nZXRBdXRvY29tcGxldGVTdWdnZXN0aW9ucyhyZXF1ZXN0KSk7XG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgc2VsZWN0b3I6ICcuc291cmNlLm9jYW1sJyxcbiAgICAgIGluY2x1c2lvblByaW9yaXR5OiAxLFxuICAgICAgZGlzYWJsZUZvclNlbGVjdG9yOiAnLnNvdXJjZS5vY2FtbCAuY29tbWVudCcsXG4gICAgICBnZXRTdWdnZXN0aW9ucyxcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==