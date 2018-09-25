"use strict";

var _reactDom = _interopRequireDefault(require("react-dom"));

function _testUtils() {
  const data = _interopRequireDefault(require("react-dom/test-utils"));

  _testUtils = function () {
    return data;
  };

  return data;
}

function hackService() {
  const data = _interopRequireWildcard(require("../../nuclide-hack/lib/HackLanguage"));

  hackService = function () {
    return data;
  };

  return data;
}

function _QuickOpenHelpers() {
  const data = _interopRequireDefault(require("../lib/QuickOpenHelpers"));

  _QuickOpenHelpers = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

const TEST_DIR = '/test';
describe('QuickOpenHelpers', () => {
  const mockDirectory = {
    getPath: () => TEST_DIR
  };
  beforeEach(() => {
    jest // eslint-disable-next-line nuclide-internal/no-cross-atom-imports
    .spyOn(require("../../nuclide-hack/lib/config"), 'getConfig').mockReturnValue({
      hhClientPath: 'hh_client',
      logLevel: 'OFF'
    });
    jest.spyOn(require("../../nuclide-remote-connection"), 'getServiceByNuclideUri').mockReturnValue({
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
    jest.spyOn(hackService(), 'isFileInHackProject').mockReturnValue(false);
  });
  it('it activates for valid directories', async () => {
    const {
      isEligibleForDirectory
    } = _QuickOpenHelpers().default;

    if (!isEligibleForDirectory) {
      throw new Error("Invariant violation: \"isEligibleForDirectory\"");
    }

    expect((await isEligibleForDirectory(mockDirectory))).toBe(true);
  });
  it('is able to return and render tag results', async () => {
    await (async () => {
      const {
        executeQuery,
        getComponentForItem
      } = _QuickOpenHelpers().default;

      let results = await executeQuery('', mockDirectory);
      expect(results).toEqual([]);
      results = await executeQuery('test', mockDirectory);
      expect(results.map(result => {
        // Functions can't be compared with Jasmine.
        const {
          callback
        } = result,
              rest = _objectWithoutProperties(result, ["callback"]);

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
        throw new Error("Invariant violation: \"getComponentForItem\"");
      }

      const reactElement = getComponentForItem(results[0]);
      expect(reactElement.props.title).toBe('class');

      const renderedComponent = _testUtils().default.renderIntoDocument(reactElement);

      const renderedNode = _reactDom.default.findDOMNode(renderedComponent);

      expect( // $FlowFixMe
      renderedNode.querySelectorAll('.omnisearch-symbol-result-filename').length).toBe(1); // $FlowFixMe

      expect(renderedNode.querySelectorAll('.icon-code').length).toBe(1);
    })();
  });
});