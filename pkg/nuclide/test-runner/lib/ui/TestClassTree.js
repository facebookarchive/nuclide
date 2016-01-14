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

var React = require('react-for-atom');
var TestClassTreeNode = require('./TestClassTreeNode');

var _require = require('../../../ui/tree');

var TreeRootComponent = _require.TreeRootComponent;
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
  }]);

  return TestClassTree;
})(React.Component);

TestClassTree.propTypes = {
  isRunning: PropTypes.bool.isRequired,
  testSuiteModel: PropTypes.object
};

module.exports = TestClassTree;
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxTQUFTOztBQWtFM0MsYUFBYSxDQUFDLFNBQVMsR0FBRztBQUN4QixXQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ3BDLGdCQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU07Q0FDakMsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJUZXN0Q2xhc3NUcmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgTGF6eVRyZWVOb2RlIGZyb20gJy4uLy4uLy4uL3VpL3RyZWUnO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBUZXN0Q2xhc3NUcmVlTm9kZSA9IHJlcXVpcmUoJy4vVGVzdENsYXNzVHJlZU5vZGUnKTtcbmNvbnN0IHtUcmVlUm9vdENvbXBvbmVudH0gPSByZXF1aXJlKCcuLi8uLi8uLi91aS90cmVlJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmZ1bmN0aW9uIGxhYmVsQ2xhc3NOYW1lRm9yTm9kZSgpOiBzdHJpbmcge1xuICByZXR1cm4gJ2ljb24gaWNvbi1jb2RlJztcbn1cblxuY2xhc3MgVGVzdENsYXNzVHJlZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogT2JqZWN0KSB7XG4gICAgaWYgKHRoaXMucHJvcHMudGVzdFN1aXRlTW9kZWwgIT09IHByZXZQcm9wcy50ZXN0U3VpdGVNb2RlbCkge1xuICAgICAgY29uc3Qgcm9vdHMgPSBbXTtcbiAgICAgIGlmICh0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsKSB7XG4gICAgICAgIGZvciAoY29uc3QgdGVzdENsYXNzIG9mIHRoaXMucHJvcHMudGVzdFN1aXRlTW9kZWwudGVzdENsYXNzZXMudmFsdWVzKCkpIHtcbiAgICAgICAgICByb290cy5wdXNoKG5ldyBUZXN0Q2xhc3NUcmVlTm9kZSh0ZXN0Q2xhc3MpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5yZWZzWyd0cmVlJ10uc2V0Um9vdHMocm9vdHMpO1xuICAgIH1cblxuICAgIHRoaXMuYm91bmRSb3dDbGFzc05hbWVGb3JOb2RlID0gdGhpcy5yb3dDbGFzc05hbWVGb3JOb2RlLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgZW1wdHlSZW5kZXJNZXNzYWdlID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXRyZWUtcm9vdC1wbGFjZWhvbGRlclwiPlxuICAgICAgICA8aDM+UnVubmluZyB0ZXN0czwvaDM+XG4gICAgICAgIDxvbD5cbiAgICAgICAgICA8bGk+T3BlbiB0aGUgZmlsZSB5b3Ugd2FudCB0byB0ZXN0PC9saT5cbiAgICAgICAgICA8bGk+Q2hvb3NlIHRoZSBhcHByb3ByaWF0ZSBydW5uZXIgZnJvbSB0aGUgZHJvcGRvd248L2xpPlxuICAgICAgICAgIDxsaT57J0NsaWNrIFwiVGVzdFwiIHRvIHJ1biB0ZXN0cyBmb3IgdGhhdCBmaWxlXFwncyBkaXJlY3RvcnknfTwvbGk+XG4gICAgICAgIDwvb2w+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxUcmVlUm9vdENvbXBvbmVudFxuICAgICAgICBlbGVtZW50VG9SZW5kZXJXaGVuRW1wdHk9e2VtcHR5UmVuZGVyTWVzc2FnZX1cbiAgICAgICAgZXZlbnRIYW5kbGVyU2VsZWN0b3I9XCIubnVjbGlkZS10ZXN0LXJ1bm5lci10cmVlXCJcbiAgICAgICAgaW5pdGlhbFJvb3RzPXtbXX1cbiAgICAgICAgbGFiZWxDbGFzc05hbWVGb3JOb2RlPXtsYWJlbENsYXNzTmFtZUZvck5vZGV9XG4gICAgICAgIG9uS2VlcFNlbGVjdGlvbj17KCkgPT4ge319XG4gICAgICAgIHJlZj1cInRyZWVcIlxuICAgICAgICByb3dDbGFzc05hbWVGb3JOb2RlPXt0aGlzLmJvdW5kUm93Q2xhc3NOYW1lRm9yTm9kZX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIHJvd0NsYXNzTmFtZUZvck5vZGUobm9kZTogTGF6eVRyZWVOb2RlKTogP3N0cmluZyB7XG4gICAgaWYgKCF0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaXRlbSA9IG5vZGUuZ2V0SXRlbSgpO1xuICAgIGNvbnN0IHRlc3RSdW4gPSB0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsLnRlc3RSdW5zLmdldChpdGVtWydpZCddKTtcbiAgICBpZiAodGVzdFJ1bikge1xuICAgICAgaWYgKHRlc3RSdW5bJ251bUZhaWx1cmVzJ10gPiAwKSB7XG4gICAgICAgIC8vIFJlZC9lcnJvciBpZiB0aGUgdGVzdCBjbGFzcyBoYWQgZXJyb3JzLlxuICAgICAgICByZXR1cm4gJ3N0YXR1cy1yZW1vdmVkJztcbiAgICAgIH0gZWxzZSBpZiAodGVzdFJ1blsnbnVtU2tpcHBlZCddID4gMCkge1xuICAgICAgICAvLyBZZWxsb3cvd2FybmluZyBpZiB0aGUgY2xhc3Mgc2tpcHBlZCB0ZXN0cy5cbiAgICAgICAgcmV0dXJuICdzdGF0dXMtbW9kaWZpZWQnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gR3JlZW4vc3VjY2VzcyBpZiBhbGwgdGVzdHMgcGFzc2VkIHdpdGhvdXQgc2tpcHBpbmcgYW55LlxuICAgICAgICByZXR1cm4gJ3N0YXR1cy1hZGRlZCc7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghdGhpcy5wcm9wcy5pc1J1bm5pbmcpIHtcbiAgICAgIHJldHVybiAnc3RhdHVzLWlnbm9yZWQnO1xuICAgIH1cbiAgfVxuXG59XG5cblRlc3RDbGFzc1RyZWUucHJvcFR5cGVzID0ge1xuICBpc1J1bm5pbmc6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gIHRlc3RTdWl0ZU1vZGVsOiBQcm9wVHlwZXMub2JqZWN0LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0Q2xhc3NUcmVlO1xuIl19