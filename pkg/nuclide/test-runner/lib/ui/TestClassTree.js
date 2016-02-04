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

var _require2 = require('../../../ui/tree');

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

      this.boundRowClassNameForNode = this.rowClassNameForNode.bind(this);
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
        rowClassNameForNode: this.boundRowClassNameForNode
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
//# sourceMappingURL=data:application/json;base64,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LEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ3BDLG9CQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU07S0FDakM7Ozs7U0FKRyxhQUFhO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBcUUzQyxNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJUZXN0Q2xhc3NUcmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTGF6eVRyZWVOb2RlIGZyb20gJy4uLy4uLy4uL3VpL3RyZWUnO1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IFRlc3RDbGFzc1RyZWVOb2RlID0gcmVxdWlyZSgnLi9UZXN0Q2xhc3NUcmVlTm9kZScpO1xuY29uc3Qge1RyZWVSb290Q29tcG9uZW50fSA9IHJlcXVpcmUoJy4uLy4uLy4uL3VpL3RyZWUnKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuZnVuY3Rpb24gbGFiZWxDbGFzc05hbWVGb3JOb2RlKCk6IHN0cmluZyB7XG4gIHJldHVybiAnaWNvbiBpY29uLWNvZGUnO1xufVxuXG5jbGFzcyBUZXN0Q2xhc3NUcmVlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBpc1J1bm5pbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgdGVzdFN1aXRlTW9kZWw6IFByb3BUeXBlcy5vYmplY3QsXG4gIH07XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogT2JqZWN0KSB7XG4gICAgaWYgKHRoaXMucHJvcHMudGVzdFN1aXRlTW9kZWwgIT09IHByZXZQcm9wcy50ZXN0U3VpdGVNb2RlbCkge1xuICAgICAgY29uc3Qgcm9vdHMgPSBbXTtcbiAgICAgIGlmICh0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGVzdENsYXNzIG9mIHRoaXMucHJvcHMudGVzdFN1aXRlTW9kZWwudGVzdENsYXNzZXMudmFsdWVzKCkpIHtcbiAgICAgICAgICByb290cy5wdXNoKG5ldyBUZXN0Q2xhc3NUcmVlTm9kZSh0ZXN0Q2xhc3MpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5yZWZzWyd0cmVlJ10uc2V0Um9vdHMocm9vdHMpO1xuICAgIH1cblxuICAgIHRoaXMuYm91bmRSb3dDbGFzc05hbWVGb3JOb2RlID0gdGhpcy5yb3dDbGFzc05hbWVGb3JOb2RlLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgZW1wdHlSZW5kZXJNZXNzYWdlID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXRyZWUtcm9vdC1wbGFjZWhvbGRlclwiPlxuICAgICAgICA8aDM+UnVubmluZyB0ZXN0czwvaDM+XG4gICAgICAgIDxvbD5cbiAgICAgICAgICA8bGk+T3BlbiB0aGUgZmlsZSB5b3Ugd2FudCB0byB0ZXN0PC9saT5cbiAgICAgICAgICA8bGk+Q2hvb3NlIHRoZSBhcHByb3ByaWF0ZSBydW5uZXIgZnJvbSB0aGUgZHJvcGRvd248L2xpPlxuICAgICAgICAgIDxsaT57J0NsaWNrIFwiVGVzdFwiIHRvIHJ1biB0ZXN0cyBmb3IgdGhhdCBmaWxlXFwncyBkaXJlY3RvcnknfTwvbGk+XG4gICAgICAgIDwvb2w+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxUcmVlUm9vdENvbXBvbmVudFxuICAgICAgICBlbGVtZW50VG9SZW5kZXJXaGVuRW1wdHk9e2VtcHR5UmVuZGVyTWVzc2FnZX1cbiAgICAgICAgZXZlbnRIYW5kbGVyU2VsZWN0b3I9XCIubnVjbGlkZS10ZXN0LXJ1bm5lci10cmVlXCJcbiAgICAgICAgaW5pdGlhbFJvb3RzPXtbXX1cbiAgICAgICAgbGFiZWxDbGFzc05hbWVGb3JOb2RlPXtsYWJlbENsYXNzTmFtZUZvck5vZGV9XG4gICAgICAgIG9uS2VlcFNlbGVjdGlvbj17KCkgPT4ge319XG4gICAgICAgIHJlZj1cInRyZWVcIlxuICAgICAgICByb3dDbGFzc05hbWVGb3JOb2RlPXt0aGlzLmJvdW5kUm93Q2xhc3NOYW1lRm9yTm9kZX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIHJvd0NsYXNzTmFtZUZvck5vZGUobm9kZTogTGF6eVRyZWVOb2RlKTogP3N0cmluZyB7XG4gICAgaWYgKCF0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaXRlbSA9IG5vZGUuZ2V0SXRlbSgpO1xuICAgIGNvbnN0IHRlc3RSdW4gPSB0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsLnRlc3RSdW5zLmdldChpdGVtWydpZCddKTtcbiAgICBpZiAodGVzdFJ1bikge1xuICAgICAgaWYgKHRlc3RSdW5bJ251bUZhaWx1cmVzJ10gPiAwKSB7XG4gICAgICAgIC8vIFJlZC9lcnJvciBpZiB0aGUgdGVzdCBjbGFzcyBoYWQgZXJyb3JzLlxuICAgICAgICByZXR1cm4gJ3N0YXR1cy1yZW1vdmVkJztcbiAgICAgIH0gZWxzZSBpZiAodGVzdFJ1blsnbnVtU2tpcHBlZCddID4gMCkge1xuICAgICAgICAvLyBZZWxsb3cvd2FybmluZyBpZiB0aGUgY2xhc3Mgc2tpcHBlZCB0ZXN0cy5cbiAgICAgICAgcmV0dXJuICdzdGF0dXMtbW9kaWZpZWQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gR3JlZW4vc3VjY2VzcyBpZiBhbGwgdGVzdHMgcGFzc2VkIHdpdGhvdXQgc2tpcHBpbmcgYW55LlxuICAgICAgICByZXR1cm4gJ3N0YXR1cy1hZGRlZCc7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy5wcm9wcy5pc1J1bm5pbmcpIHtcbiAgICAgIHJldHVybiAnc3RhdHVzLWlnbm9yZWQnO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlc3RDbGFzc1RyZWU7XG4iXX0=