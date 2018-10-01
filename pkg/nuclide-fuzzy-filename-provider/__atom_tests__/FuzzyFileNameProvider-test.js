"use strict";

function _FuzzyFileNameProvider() {
  const data = _interopRequireDefault(require("../lib/FuzzyFileNameProvider"));

  _FuzzyFileNameProvider = function () {
    return data;
  };

  return data;
}

function remoteConnection() {
  const data = _interopRequireWildcard(require("../../nuclide-remote-connection"));

  remoteConnection = function () {
    return data;
  };

  return data;
}

function goToLocationModule() {
  const data = _interopRequireWildcard(require("../../../modules/nuclide-commons-atom/go-to-location"));

  goToLocationModule = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('FuzzyFileNameProvider', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  describe('executeQuery()', () => {
    // $FlowIgnore
    const mockLocalDirectory = {
      getPath() {
        return '/some/local/path';
      }

    };
    it('returns an empty array for an empty query', async () => {
      const results = await _FuzzyFileNameProvider().default.executeQuery('', mockLocalDirectory);
      expect(results).toEqual([]);
    });
    describe('callbacks', () => {
      const cannedResults = Promise.resolve([{
        path: '/a/b/c/',
        score: 0.5,
        matchIndexes: [1, 2, 3]
      }, {
        path: '/d/e/f/',
        score: 0.3,
        matchIndexes: [4, 5]
      }]);
      const fakeService = {
        // $FlowIgnore
        queryFuzzyFile(x) {
          return cannedResults;
        }

      };
      beforeEach(() => {
        jest.spyOn(remoteConnection(), 'getFuzzyFileSearchServiceByNuclideUri').mockReturnValue(fakeService);
      });
      it('goes to the right location on clickthrough', async () => {
        const goToLocationSpy = jest.spyOn(goToLocationModule(), 'goToLocation');
        const query = 'lifesizeshark:10:22';
        const results = await _FuzzyFileNameProvider().default.executeQuery(query, mockLocalDirectory);
        expect(results.length).toBe(2);
        expect(goToLocationSpy).not.toHaveBeenCalled();

        if (!results[1].callback) {
          throw new Error('should have a callback');
        }

        results[1].callback(); // Line and column are 1 less because they're 0 indexed in goToLocation

        expect(goToLocationSpy).toHaveBeenCalledWith('/d/e/f/', {
          line: 9,
          column: 21
        });
      });
    });
  });
});