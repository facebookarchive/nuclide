function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var FuzzyFileNameProvider = {

  getName: function getName() {
    return 'FuzzyFileNameProvider';
  },

  getProviderType: function getProviderType() {
    return 'DIRECTORY';
  },

  isRenderable: function isRenderable() {
    return true;
  },

  getDebounceDelay: function getDebounceDelay() {
    return 0;
  },

  getAction: function getAction() {
    return 'nuclide-fuzzy-filename-provider:toggle-provider';
  },

  getPromptText: function getPromptText() {
    return 'Fuzzy File Name Search';
  },

  getTabTitle: function getTabTitle() {
    return 'Filenames';
  },

  isEligibleForDirectory: function isEligibleForDirectory(directory) {
    return directory.exists();
  },

  executeQuery: _asyncToGenerator(function* (query, directory) {
    if (query.length === 0) {
      return [];
    }

    if (directory == null) {
      throw new Error('FuzzyFileNameProvider is a directory-specific provider but its executeQuery method was' + ' called without a directory argument.');
    }

    var service = yield (0, _utils.getFuzzyFileSearchService)(directory);
    if (service == null) {
      return [];
    }

    var directoryPath = directory.getPath();
    var result = yield service.queryFuzzyFile(directoryPath, query);
    return result;
  })
};

module.exports = FuzzyFileNameProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZ1enp5RmlsZU5hbWVQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3FCQWlCd0MsU0FBUzs7QUFFakQsSUFBTSxxQkFBMkMsR0FBRzs7QUFFbEQsU0FBTyxFQUFBLG1CQUFXO0FBQ2hCLFdBQU8sdUJBQXVCLENBQUM7R0FDaEM7O0FBRUQsaUJBQWUsRUFBQSwyQkFBaUI7QUFDOUIsV0FBTyxXQUFXLENBQUM7R0FDcEI7O0FBRUQsY0FBWSxFQUFBLHdCQUFZO0FBQ3RCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsa0JBQWdCLEVBQUEsNEJBQVc7QUFDekIsV0FBTyxDQUFDLENBQUM7R0FDVjs7QUFFRCxXQUFTLEVBQUEscUJBQVc7QUFDbEIsV0FBTyxpREFBaUQsQ0FBQztHQUMxRDs7QUFFRCxlQUFhLEVBQUEseUJBQVc7QUFDdEIsV0FBTyx3QkFBd0IsQ0FBQztHQUNqQzs7QUFFRCxhQUFXLEVBQUEsdUJBQVc7QUFDcEIsV0FBTyxXQUFXLENBQUM7R0FDcEI7O0FBRUQsd0JBQXNCLEVBQUEsZ0NBQUMsU0FBeUIsRUFBb0I7QUFDbEUsV0FBTyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDM0I7O0FBRUQsQUFBTSxjQUFZLG9CQUFBLFdBQUMsS0FBYSxFQUFFLFNBQTBCLEVBQThCO0FBQ3hGLFFBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdEIsYUFBTyxFQUFFLENBQUM7S0FDWDs7QUFFRCxRQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7QUFDckIsWUFBTSxJQUFJLEtBQUssQ0FDYix3RkFBd0YsR0FDdEYsdUNBQXVDLENBQzFDLENBQUM7S0FDSDs7QUFFRCxRQUFNLE9BQU8sR0FBRyxNQUFNLHNDQUEwQixTQUFTLENBQUMsQ0FBQztBQUMzRCxRQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDbkIsYUFBTyxFQUFFLENBQUM7S0FDWDs7QUFFRCxRQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDMUMsUUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNsRSxXQUFTLE1BQU0sQ0FBMkI7R0FDM0MsQ0FBQTtDQUNGLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyIsImZpbGUiOiJGdXp6eUZpbGVOYW1lUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVSZXN1bHQsXG4gIFByb3ZpZGVyLFxuICBQcm92aWRlclR5cGUsXG59IGZyb20gJy4uLy4uL3F1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7Z2V0RnV6enlGaWxlU2VhcmNoU2VydmljZX0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IEZ1enp5RmlsZU5hbWVQcm92aWRlcjogUHJvdmlkZXI8RmlsZVJlc3VsdD4gPSB7XG5cbiAgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnRnV6enlGaWxlTmFtZVByb3ZpZGVyJztcbiAgfSxcblxuICBnZXRQcm92aWRlclR5cGUoKTogUHJvdmlkZXJUeXBlIHtcbiAgICByZXR1cm4gJ0RJUkVDVE9SWSc7XG4gIH0sXG5cbiAgaXNSZW5kZXJhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIGdldERlYm91bmNlRGVsYXkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gMDtcbiAgfSxcblxuICBnZXRBY3Rpb24oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ251Y2xpZGUtZnV6enktZmlsZW5hbWUtcHJvdmlkZXI6dG9nZ2xlLXByb3ZpZGVyJztcbiAgfSxcblxuICBnZXRQcm9tcHRUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdGdXp6eSBGaWxlIE5hbWUgU2VhcmNoJztcbiAgfSxcblxuICBnZXRUYWJUaXRsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnRmlsZW5hbWVzJztcbiAgfSxcblxuICBpc0VsaWdpYmxlRm9yRGlyZWN0b3J5KGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gZGlyZWN0b3J5LmV4aXN0cygpO1xuICB9LFxuXG4gIGFzeW5jIGV4ZWN1dGVRdWVyeShxdWVyeTogc3RyaW5nLCBkaXJlY3Rvcnk/OiBhdG9tJERpcmVjdG9yeSk6IFByb21pc2U8QXJyYXk8RmlsZVJlc3VsdD4+IHtcbiAgICBpZiAocXVlcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgaWYgKGRpcmVjdG9yeSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdGdXp6eUZpbGVOYW1lUHJvdmlkZXIgaXMgYSBkaXJlY3Rvcnktc3BlY2lmaWMgcHJvdmlkZXIgYnV0IGl0cyBleGVjdXRlUXVlcnkgbWV0aG9kIHdhcydcbiAgICAgICAgKyAnIGNhbGxlZCB3aXRob3V0IGEgZGlyZWN0b3J5IGFyZ3VtZW50LidcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VydmljZSA9IGF3YWl0IGdldEZ1enp5RmlsZVNlYXJjaFNlcnZpY2UoZGlyZWN0b3J5KTtcbiAgICBpZiAoc2VydmljZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgZGlyZWN0b3J5UGF0aCA9IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2VydmljZS5xdWVyeUZ1enp5RmlsZShkaXJlY3RvcnlQYXRoLCBxdWVyeSk7XG4gICAgcmV0dXJuICgocmVzdWx0OiBhbnkpOiBBcnJheTxGaWxlUmVzdWx0Pik7XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZ1enp5RmlsZU5hbWVQcm92aWRlcjtcbiJdfQ==