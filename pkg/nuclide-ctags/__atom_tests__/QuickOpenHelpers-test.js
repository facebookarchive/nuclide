'use strict';

var _reactDom = _interopRequireDefault(require('react-dom'));

var _testUtils;

function _load_testUtils() {
  return _testUtils = _interopRequireDefault(require('react-dom/test-utils'));
}

var _HackLanguage;

function _load_HackLanguage() {
  return _HackLanguage = _interopRequireWildcard(require('../../nuclide-hack/lib/HackLanguage'));
}

var _QuickOpenHelpers;

function _load_QuickOpenHelpers() {
  return _QuickOpenHelpers = _interopRequireDefault(require('../lib/QuickOpenHelpers'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
                                                                                                                                                                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                              * All rights reserved.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                              * the root directory of this source tree.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * 
                                                                                                                                                                                                                              * @format
                                                                                                                                                                                                                              */

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports


const TEST_DIR = '/test';

describe('QuickOpenHelpers', () => {
  const mockDirectory = {
    getPath: () => TEST_DIR
  };

  beforeEach(() => {
    // eslint-disable-next-line nuclide-internal/no-cross-atom-imports
    jest.spyOn(require('../../nuclide-hack/lib/config'), 'getConfig').mockReturnValue({
      hhClientPath: 'hh_client',
      logLevel: 'OFF'
    });
    jest.spyOn(require('../../nuclide-remote-connection'), 'getServiceByNuclideUri').mockReturnValue({
      async getCtagsService() {
        return {
          async findTags(path, query) {
            return [{
              resultType: 'FILE',
              name: 'A',
              file: '/path1/a',
              lineNumber: 1,
              kind: 'c',
              pattern: '/^class A$/'
            }, {
              resultType: 'FILE',
              name: 'test::A',
              file: '/test/a',
              lineNumber: 2,
              kind: '',
              pattern: '/^struct A$/'
            }];
          },
          dispose() {}
        };
      }
    });
    jest.spyOn(_HackLanguage || _load_HackLanguage(), 'isFileInHackProject').mockReturnValue(false);
  });

  it('it activates for valid directories', async () => {
    await (async () => {
      const { isEligibleForDirectory } = (_QuickOpenHelpers || _load_QuickOpenHelpers()).default;

      if (!isEligibleForDirectory) {
        throw new Error('Invariant violation: "isEligibleForDirectory"');
      }

      expect((await isEligibleForDirectory(mockDirectory))).toBe(true);
    })();
  });

  it('is able to return and render tag results', async () => {
    await (async () => {
      const { executeQuery, getComponentForItem } = (_QuickOpenHelpers || _load_QuickOpenHelpers()).default;
      let results = await executeQuery('', mockDirectory);
      expect(results).toEqual([]);

      results = await executeQuery('test', mockDirectory);
      expect(results.map(result => {
        // Functions can't be compared with Jasmine.
        const { callback } = result,
              rest = _objectWithoutProperties(result, ['callback']);
        expect(callback).not.toBe(null);
        return rest;
      })).toEqual([{
        resultType: 'FILE',
        name: 'A',
        file: '/path1/a',
        lineNumber: 1,
        kind: 'c',
        pattern: '/^class A$/',
        path: '/path1/a',
        dir: TEST_DIR
      }, {
        resultType: 'FILE',
        name: 'test::A',
        file: '/test/a',
        lineNumber: 2,
        kind: '',
        pattern: '/^struct A$/',
        path: '/test/a',
        dir: TEST_DIR
      }]);

      if (!getComponentForItem) {
        throw new Error('Invariant violation: "getComponentForItem"');
      }

      const reactElement = getComponentForItem(results[0]);
      expect(reactElement.props.title).toBe('class');
      const renderedComponent = (_testUtils || _load_testUtils()).default.renderIntoDocument(reactElement);
      const renderedNode = _reactDom.default.findDOMNode(renderedComponent);

      expect(
      // $FlowFixMe
      renderedNode.querySelectorAll('.omnisearch-symbol-result-filename').length).toBe(1);
      // $FlowFixMe
      expect(renderedNode.querySelectorAll('.icon-code').length).toBe(1);
    })();
  });
});