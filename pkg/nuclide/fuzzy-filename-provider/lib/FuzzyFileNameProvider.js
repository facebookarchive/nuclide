function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _remoteConnection = require('../../remote-connection');

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
    // Take the `nuclide://<host><port>` prefix into account for matchIndexes of remote files.
    if (_remoteConnection.RemoteDirectory.isRemoteDirectory(directory)) {
      (function () {
        var remoteDir = directory;
        var indexOffset = directoryPath.length - remoteDir.getLocalPath().length;
        result.forEach(function (res) {
          res.matchIndexes = res.matchIndexes.map(function (index) {
            return index + indexOffset;
          });
        });
      })();
    }
    return result;
  })
};

module.exports = FuzzyFileNameProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZ1enp5RmlsZU5hbWVQcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3FCQWlCd0MsU0FBUzs7Z0NBRzFDLHlCQUF5Qjs7QUFFaEMsSUFBTSxxQkFBK0IsR0FBRzs7QUFFdEMsU0FBTyxFQUFBLG1CQUFXO0FBQ2hCLFdBQU8sdUJBQXVCLENBQUM7R0FDaEM7O0FBRUQsaUJBQWUsRUFBQSwyQkFBaUI7QUFDOUIsV0FBTyxXQUFXLENBQUM7R0FDcEI7O0FBRUQsY0FBWSxFQUFBLHdCQUFZO0FBQ3RCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsa0JBQWdCLEVBQUEsNEJBQVc7QUFDekIsV0FBTyxDQUFDLENBQUM7R0FDVjs7QUFFRCxXQUFTLEVBQUEscUJBQVc7QUFDbEIsV0FBTyxpREFBaUQsQ0FBQztHQUMxRDs7QUFFRCxlQUFhLEVBQUEseUJBQVc7QUFDdEIsV0FBTyx3QkFBd0IsQ0FBQztHQUNqQzs7QUFFRCxhQUFXLEVBQUEsdUJBQVc7QUFDcEIsV0FBTyxXQUFXLENBQUM7R0FDcEI7O0FBRUQsd0JBQXNCLEVBQUEsZ0NBQUMsU0FBeUIsRUFBb0I7QUFDbEUsV0FBTyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDM0I7O0FBRUQsQUFBTSxjQUFZLG9CQUFBLFdBQUMsS0FBYSxFQUFFLFNBQTBCLEVBQThCO0FBQ3hGLFFBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdEIsYUFBTyxFQUFFLENBQUM7S0FDWDs7QUFFRCxRQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7QUFDckIsWUFBTSxJQUFJLEtBQUssQ0FDYix3RkFBd0YsR0FDdEYsdUNBQXVDLENBQzFDLENBQUM7S0FDSDs7QUFFRCxRQUFNLE9BQU8sR0FBRyxNQUFNLHNDQUEwQixTQUFTLENBQUMsQ0FBQztBQUMzRCxRQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7QUFDbkIsYUFBTyxFQUFFLENBQUM7S0FDWDs7QUFFRCxRQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDMUMsUUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFbEUsUUFBSSxrQ0FBZ0IsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEVBQUU7O0FBQ2hELFlBQU0sU0FBMEIsR0FBSSxTQUFTLEFBQU0sQ0FBQztBQUNwRCxZQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDM0UsY0FBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUNwQixhQUFHLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSzttQkFBSSxLQUFLLEdBQUcsV0FBVztXQUFBLENBQUMsQ0FBQztTQUN2RSxDQUFDLENBQUM7O0tBQ0o7QUFDRCxXQUFTLE1BQU0sQ0FBMkI7R0FDM0MsQ0FBQTtDQUNGLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyIsImZpbGUiOiJGdXp6eUZpbGVOYW1lUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVSZXN1bHQsXG4gIFByb3ZpZGVyLFxuICBQcm92aWRlclR5cGUsXG59IGZyb20gJy4uLy4uL3F1aWNrLW9wZW4taW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7Z2V0RnV6enlGaWxlU2VhcmNoU2VydmljZX0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge1xuICBSZW1vdGVEaXJlY3RvcnksXG59IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uJztcblxuY29uc3QgRnV6enlGaWxlTmFtZVByb3ZpZGVyOiBQcm92aWRlciA9IHtcblxuICBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdGdXp6eUZpbGVOYW1lUHJvdmlkZXInO1xuICB9LFxuXG4gIGdldFByb3ZpZGVyVHlwZSgpOiBQcm92aWRlclR5cGUge1xuICAgIHJldHVybiAnRElSRUNUT1JZJztcbiAgfSxcblxuICBpc1JlbmRlcmFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgZ2V0RGVib3VuY2VEZWxheSgpOiBudW1iZXIge1xuICAgIHJldHVybiAwO1xuICB9LFxuXG4gIGdldEFjdGlvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiAnbnVjbGlkZS1mdXp6eS1maWxlbmFtZS1wcm92aWRlcjp0b2dnbGUtcHJvdmlkZXInO1xuICB9LFxuXG4gIGdldFByb21wdFRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ0Z1enp5IEZpbGUgTmFtZSBTZWFyY2gnO1xuICB9LFxuXG4gIGdldFRhYlRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdGaWxlbmFtZXMnO1xuICB9LFxuXG4gIGlzRWxpZ2libGVGb3JEaXJlY3RvcnkoZGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBkaXJlY3RvcnkuZXhpc3RzKCk7XG4gIH0sXG5cbiAgYXN5bmMgZXhlY3V0ZVF1ZXJ5KHF1ZXJ5OiBzdHJpbmcsIGRpcmVjdG9yeT86IGF0b20kRGlyZWN0b3J5KTogUHJvbWlzZTxBcnJheTxGaWxlUmVzdWx0Pj4ge1xuICAgIGlmIChxdWVyeS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBpZiAoZGlyZWN0b3J5ID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0Z1enp5RmlsZU5hbWVQcm92aWRlciBpcyBhIGRpcmVjdG9yeS1zcGVjaWZpYyBwcm92aWRlciBidXQgaXRzIGV4ZWN1dGVRdWVyeSBtZXRob2Qgd2FzJ1xuICAgICAgICArICcgY2FsbGVkIHdpdGhvdXQgYSBkaXJlY3RvcnkgYXJndW1lbnQuJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJ2aWNlID0gYXdhaXQgZ2V0RnV6enlGaWxlU2VhcmNoU2VydmljZShkaXJlY3RvcnkpO1xuICAgIGlmIChzZXJ2aWNlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3RvcnlQYXRoID0gZGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZXJ2aWNlLnF1ZXJ5RnV6enlGaWxlKGRpcmVjdG9yeVBhdGgsIHF1ZXJ5KTtcbiAgICAvLyBUYWtlIHRoZSBgbnVjbGlkZTovLzxob3N0Pjxwb3J0PmAgcHJlZml4IGludG8gYWNjb3VudCBmb3IgbWF0Y2hJbmRleGVzIG9mIHJlbW90ZSBmaWxlcy5cbiAgICBpZiAoUmVtb3RlRGlyZWN0b3J5LmlzUmVtb3RlRGlyZWN0b3J5KGRpcmVjdG9yeSkpIHtcbiAgICAgIGNvbnN0IHJlbW90ZURpcjogUmVtb3RlRGlyZWN0b3J5ID0gKGRpcmVjdG9yeTogYW55KTtcbiAgICAgIGNvbnN0IGluZGV4T2Zmc2V0ID0gZGlyZWN0b3J5UGF0aC5sZW5ndGggLSByZW1vdGVEaXIuZ2V0TG9jYWxQYXRoKCkubGVuZ3RoO1xuICAgICAgcmVzdWx0LmZvckVhY2gocmVzID0+IHtcbiAgICAgICAgcmVzLm1hdGNoSW5kZXhlcyA9IHJlcy5tYXRjaEluZGV4ZXMubWFwKGluZGV4ID0+IGluZGV4ICsgaW5kZXhPZmZzZXQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiAoKHJlc3VsdDogYW55KTogQXJyYXk8RmlsZVJlc3VsdD4pO1xuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGdXp6eUZpbGVOYW1lUHJvdmlkZXI7XG4iXX0=