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
//# sourceMappingURL=data:application/json;base64,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LGVBQVMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDcEMsb0JBQWMsRUFBRSxTQUFTLENBQUMsTUFBTTtLQUNqQzs7OztTQUpHLGFBQWE7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUFxRTNDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IlRlc3RDbGFzc1RyZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBMYXp5VHJlZU5vZGUgZnJvbSAnLi4vLi4vLi4vdWkvdHJlZSc7XG5cbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuY29uc3QgVGVzdENsYXNzVHJlZU5vZGUgPSByZXF1aXJlKCcuL1Rlc3RDbGFzc1RyZWVOb2RlJyk7XG5jb25zdCB7VHJlZVJvb3RDb21wb25lbnR9ID0gcmVxdWlyZSgnLi4vLi4vLi4vdWkvdHJlZScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5mdW5jdGlvbiBsYWJlbENsYXNzTmFtZUZvck5vZGUoKTogc3RyaW5nIHtcbiAgcmV0dXJuICdpY29uIGljb24tY29kZSc7XG59XG5cbmNsYXNzIFRlc3RDbGFzc1RyZWUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGlzUnVubmluZzogUHJvcFR5cGVzLmJvb2wuaXNSZXF1aXJlZCxcbiAgICB0ZXN0U3VpdGVNb2RlbDogUHJvcFR5cGVzLm9iamVjdCxcbiAgfTtcblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBPYmplY3QpIHtcbiAgICBpZiAodGhpcy5wcm9wcy50ZXN0U3VpdGVNb2RlbCAhPT0gcHJldlByb3BzLnRlc3RTdWl0ZU1vZGVsKSB7XG4gICAgICBjb25zdCByb290cyA9IFtdO1xuICAgICAgaWYgKHRoaXMucHJvcHMudGVzdFN1aXRlTW9kZWwpIHtcbiAgICAgICAgZm9yIChjb25zdCB0ZXN0Q2xhc3Mgb2YgdGhpcy5wcm9wcy50ZXN0U3VpdGVNb2RlbC50ZXN0Q2xhc3Nlcy52YWx1ZXMoKSkge1xuICAgICAgICAgIHJvb3RzLnB1c2gobmV3IFRlc3RDbGFzc1RyZWVOb2RlKHRlc3RDbGFzcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnJlZnNbJ3RyZWUnXS5zZXRSb290cyhyb290cyk7XG4gICAgfVxuXG4gICAgKHRoaXM6IGFueSkucm93Q2xhc3NOYW1lRm9yTm9kZSA9IHRoaXMucm93Q2xhc3NOYW1lRm9yTm9kZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGVtcHR5UmVuZGVyTWVzc2FnZSA9IChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS10cmVlLXJvb3QtcGxhY2Vob2xkZXJcIj5cbiAgICAgICAgPGgzPlJ1bm5pbmcgdGVzdHM8L2gzPlxuICAgICAgICA8b2w+XG4gICAgICAgICAgPGxpPk9wZW4gdGhlIGZpbGUgeW91IHdhbnQgdG8gdGVzdDwvbGk+XG4gICAgICAgICAgPGxpPkNob29zZSB0aGUgYXBwcm9wcmlhdGUgcnVubmVyIGZyb20gdGhlIGRyb3Bkb3duPC9saT5cbiAgICAgICAgICA8bGk+eydDbGljayBcIlRlc3RcIiB0byBydW4gdGVzdHMgZm9yIHRoYXQgZmlsZVxcJ3MgZGlyZWN0b3J5J308L2xpPlxuICAgICAgICA8L29sPlxuICAgICAgPC9kaXY+XG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8VHJlZVJvb3RDb21wb25lbnRcbiAgICAgICAgZWxlbWVudFRvUmVuZGVyV2hlbkVtcHR5PXtlbXB0eVJlbmRlck1lc3NhZ2V9XG4gICAgICAgIGV2ZW50SGFuZGxlclNlbGVjdG9yPVwiLm51Y2xpZGUtdGVzdC1ydW5uZXItdHJlZVwiXG4gICAgICAgIGluaXRpYWxSb290cz17W119XG4gICAgICAgIGxhYmVsQ2xhc3NOYW1lRm9yTm9kZT17bGFiZWxDbGFzc05hbWVGb3JOb2RlfVxuICAgICAgICBvbktlZXBTZWxlY3Rpb249eygpID0+IHt9fVxuICAgICAgICByZWY9XCJ0cmVlXCJcbiAgICAgICAgcm93Q2xhc3NOYW1lRm9yTm9kZT17dGhpcy5yb3dDbGFzc05hbWVGb3JOb2RlfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgcm93Q2xhc3NOYW1lRm9yTm9kZShub2RlOiBMYXp5VHJlZU5vZGUpOiA/c3RyaW5nIHtcbiAgICBpZiAoIXRoaXMucHJvcHMudGVzdFN1aXRlTW9kZWwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpdGVtID0gbm9kZS5nZXRJdGVtKCk7XG4gICAgY29uc3QgdGVzdFJ1biA9IHRoaXMucHJvcHMudGVzdFN1aXRlTW9kZWwudGVzdFJ1bnMuZ2V0KGl0ZW1bJ2lkJ10pO1xuICAgIGlmICh0ZXN0UnVuKSB7XG4gICAgICBpZiAodGVzdFJ1blsnbnVtRmFpbHVyZXMnXSA+IDApIHtcbiAgICAgICAgLy8gUmVkL2Vycm9yIGlmIHRoZSB0ZXN0IGNsYXNzIGhhZCBlcnJvcnMuXG4gICAgICAgIHJldHVybiAnc3RhdHVzLXJlbW92ZWQnO1xuICAgICAgfSBlbHNlIGlmICh0ZXN0UnVuWydudW1Ta2lwcGVkJ10gPiAwKSB7XG4gICAgICAgIC8vIFllbGxvdy93YXJuaW5nIGlmIHRoZSBjbGFzcyBza2lwcGVkIHRlc3RzLlxuICAgICAgICByZXR1cm4gJ3N0YXR1cy1tb2RpZmllZCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBHcmVlbi9zdWNjZXNzIGlmIGFsbCB0ZXN0cyBwYXNzZWQgd2l0aG91dCBza2lwcGluZyBhbnkuXG4gICAgICAgIHJldHVybiAnc3RhdHVzLWFkZGVkJztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF0aGlzLnByb3BzLmlzUnVubmluZykge1xuICAgICAgcmV0dXJuICdzdGF0dXMtaWdub3JlZCc7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGVzdENsYXNzVHJlZTtcbiJdfQ==