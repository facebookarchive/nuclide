var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('react-for-atom');

var React = _require.React;

var TestClassTreeNode = require('./TestClassTreeNode');

var _require2 = require('../../../nuclide-ui-tree');

var TreeRootComponent = _require2.TreeRootComponent;
var PropTypes = React.PropTypes;

function labelClassNameForNode() {
  return 'icon icon-code';
}

var TestClassTree = (function (_React$Component) {
  _inherits(TestClassTree, _React$Component);

  function TestClassTree() {
    _classCallCheck(this, TestClassTree);

    _get(Object.getPrototypeOf(TestClassTree.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(TestClassTree, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (this.props.testSuiteModel !== prevProps.testSuiteModel) {
        var roots = [];
        if (this.props.testSuiteModel) {
          for (var testClass of this.props.testSuiteModel.testClasses.values()) {
            roots.push(new TestClassTreeNode(testClass));
          }
        }
        this.refs['tree'].setRoots(roots);
      }

      this.rowClassNameForNode = this.rowClassNameForNode.bind(this);
    }
  }, {
    key: 'render',
    value: function render() {
      var emptyRenderMessage = React.createElement(
        'div',
        { className: 'nuclide-tree-root-placeholder' },
        React.createElement(
          'h3',
          null,
          'Running tests'
        ),
        React.createElement(
          'ol',
          null,
          React.createElement(
            'li',
            null,
            'Open the file you want to test'
          ),
          React.createElement(
            'li',
            null,
            'Choose the appropriate runner from the dropdown'
          ),
          React.createElement(
            'li',
            null,
            'Click "Test" to run tests for that file\'s directory'
          )
        )
      );

      return React.createElement(TreeRootComponent, {
        elementToRenderWhenEmpty: emptyRenderMessage,
        eventHandlerSelector: '.nuclide-test-runner-tree',
        initialRoots: [],
        labelClassNameForNode: labelClassNameForNode,
        onKeepSelection: function () {},
        ref: 'tree',
        rowClassNameForNode: this.rowClassNameForNode
      });
    }
  }, {
    key: 'rowClassNameForNode',
    value: function rowClassNameForNode(node) {
      if (!this.props.testSuiteModel) {
        return;
      }

      var item = node.getItem();
      var testRun = this.props.testSuiteModel.testRuns.get(item['id']);
      if (testRun) {
        if (testRun['numFailures'] > 0) {
          // Red/error if the test class had errors.
          return 'status-removed';
        } else if (testRun['numSkipped'] > 0) {
          // Yellow/warning if the class skipped tests.
          return 'status-modified';
        } else {
          // Green/success if all tests passed without skipping any.
          return 'status-added';
        }
      } else if (!this.props.isRunning) {
        return 'status-ignored';
      }
    }
  }], [{
    key: 'propTypes',
    value: {
      isRunning: PropTypes.bool.isRequired,
      testSuiteModel: PropTypes.object
    },
    enumerable: true
  }]);

  return TestClassTree;
})(React.Component);

module.exports = TestClassTree;
//# sourceMappingURL=data:application/json;base64,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LGVBQVMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDcEMsb0JBQWMsRUFBRSxTQUFTLENBQUMsTUFBTTtLQUNqQzs7OztTQUpHLGFBQWE7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUFxRTNDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IlRlc3RDbGFzc1RyZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBMYXp5VHJlZU5vZGUgZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS11aS10cmVlJztcblxuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBUZXN0Q2xhc3NUcmVlTm9kZSA9IHJlcXVpcmUoJy4vVGVzdENsYXNzVHJlZU5vZGUnKTtcbmNvbnN0IHtUcmVlUm9vdENvbXBvbmVudH0gPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLXVpLXRyZWUnKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuZnVuY3Rpb24gbGFiZWxDbGFzc05hbWVGb3JOb2RlKCk6IHN0cmluZyB7XG4gIHJldHVybiAnaWNvbiBpY29uLWNvZGUnO1xufVxuXG5jbGFzcyBUZXN0Q2xhc3NUcmVlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBpc1J1bm5pbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdGVzdFN1aXRlTW9kZWw6IFByb3BUeXBlcy5vYmplY3QsXG4gIH07XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogT2JqZWN0KSB7XG4gICAgaWYgKHRoaXMucHJvcHMudGVzdFN1aXRlTW9kZWwgIT09IHByZXZQcm9wcy50ZXN0U3VpdGVNb2RlbCkge1xuICAgICAgY29uc3Qgcm9vdHMgPSBbXTtcbiAgICAgIGlmICh0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGVzdENsYXNzIG9mIHRoaXMucHJvcHMudGVzdFN1aXRlTW9kZWwudGVzdENsYXNzZXMudmFsdWVzKCkpIHtcbiAgICAgICAgICByb290cy5wdXNoKG5ldyBUZXN0Q2xhc3NUcmVlTm9kZSh0ZXN0Q2xhc3MpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5yZWZzWyd0cmVlJ10uc2V0Um9vdHMocm9vdHMpO1xuICAgIH1cblxuICAgICh0aGlzOiBhbnkpLnJvd0NsYXNzTmFtZUZvck5vZGUgPSB0aGlzLnJvd0NsYXNzTmFtZUZvck5vZGUuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBlbXB0eVJlbmRlck1lc3NhZ2UgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtdHJlZS1yb290LXBsYWNlaG9sZGVyXCI+XG4gICAgICAgIDxoMz5SdW5uaW5nIHRlc3RzPC9oMz5cbiAgICAgICAgPG9sPlxuICAgICAgICAgIDxsaT5PcGVuIHRoZSBmaWxlIHlvdSB3YW50IHRvIHRlc3Q8L2xpPlxuICAgICAgICAgIDxsaT5DaG9vc2UgdGhlIGFwcHJvcHJpYXRlIHJ1bm5lciBmcm9tIHRoZSBkcm9wZG93bjwvbGk+XG4gICAgICAgICAgPGxpPnsnQ2xpY2sgXCJUZXN0XCIgdG8gcnVuIHRlc3RzIGZvciB0aGF0IGZpbGVcXCdzIGRpcmVjdG9yeSd9PC9saT5cbiAgICAgICAgPC9vbD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPFRyZWVSb290Q29tcG9uZW50XG4gICAgICAgIGVsZW1lbnRUb1JlbmRlcldoZW5FbXB0eT17ZW1wdHlSZW5kZXJNZXNzYWdlfVxuICAgICAgICBldmVudEhhbmRsZXJTZWxlY3Rvcj1cIi5udWNsaWRlLXRlc3QtcnVubmVyLXRyZWVcIlxuICAgICAgICBpbml0aWFsUm9vdHM9e1tdfVxuICAgICAgICBsYWJlbENsYXNzTmFtZUZvck5vZGU9e2xhYmVsQ2xhc3NOYW1lRm9yTm9kZX1cbiAgICAgICAgb25LZWVwU2VsZWN0aW9uPXsoKSA9PiB7fX1cbiAgICAgICAgcmVmPVwidHJlZVwiXG4gICAgICAgIHJvd0NsYXNzTmFtZUZvck5vZGU9e3RoaXMucm93Q2xhc3NOYW1lRm9yTm9kZX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIHJvd0NsYXNzTmFtZUZvck5vZGUobm9kZTogTGF6eVRyZWVOb2RlKTogP3N0cmluZyB7XG4gICAgaWYgKCF0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaXRlbSA9IG5vZGUuZ2V0SXRlbSgpO1xuICAgIGNvbnN0IHRlc3RSdW4gPSB0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsLnRlc3RSdW5zLmdldChpdGVtWydpZCddKTtcbiAgICBpZiAodGVzdFJ1bikge1xuICAgICAgaWYgKHRlc3RSdW5bJ251bUZhaWx1cmVzJ10gPiAwKSB7XG4gICAgICAgIC8vIFJlZC9lcnJvciBpZiB0aGUgdGVzdCBjbGFzcyBoYWQgZXJyb3JzLlxuICAgICAgICByZXR1cm4gJ3N0YXR1cy1yZW1vdmVkJztcbiAgICAgIH0gZWxzZSBpZiAodGVzdFJ1blsnbnVtU2tpcHBlZCddID4gMCkge1xuICAgICAgICAvLyBZZWxsb3cvd2FybmluZyBpZiB0aGUgY2xhc3Mgc2tpcHBlZCB0ZXN0cy5cbiAgICAgICAgcmV0dXJuICdzdGF0dXMtbW9kaWZpZWQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gR3JlZW4vc3VjY2VzcyBpZiBhbGwgdGVzdHMgcGFzc2VkIHdpdGhvdXQgc2tpcHBpbmcgYW55LlxuICAgICAgICByZXR1cm4gJ3N0YXR1cy1hZGRlZCc7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy5wcm9wcy5pc1J1bm5pbmcpIHtcbiAgICAgIHJldHVybiAnc3RhdHVzLWlnbm9yZWQnO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RDbGFzc1RyZWU7XG4iXX0=