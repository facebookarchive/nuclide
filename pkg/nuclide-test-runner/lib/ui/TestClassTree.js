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

var _require2 = require('../../../nuclide-ui/lib/TreeRootComponent');

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
//# sourceMappingURL=data:application/json;base64,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LGVBQVMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDcEMsb0JBQWMsRUFBRSxTQUFTLENBQUMsTUFBTTtLQUNqQzs7OztTQUpHLGFBQWE7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUFxRTNDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IlRlc3RDbGFzc1RyZWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TGF6eVRyZWVOb2RlfSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLXVpL2xpYi9MYXp5VHJlZU5vZGUnO1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IFRlc3RDbGFzc1RyZWVOb2RlID0gcmVxdWlyZSgnLi9UZXN0Q2xhc3NUcmVlTm9kZScpO1xuY29uc3Qge1RyZWVSb290Q29tcG9uZW50fSA9IHJlcXVpcmUoJy4uLy4uLy4uL251Y2xpZGUtdWkvbGliL1RyZWVSb290Q29tcG9uZW50Jyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbmZ1bmN0aW9uIGxhYmVsQ2xhc3NOYW1lRm9yTm9kZSgpOiBzdHJpbmcge1xuICByZXR1cm4gJ2ljb24gaWNvbi1jb2RlJztcbn1cblxuY2xhc3MgVGVzdENsYXNzVHJlZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaXNSdW5uaW5nOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIHRlc3RTdWl0ZU1vZGVsOiBQcm9wVHlwZXMub2JqZWN0LFxuICB9O1xuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IE9iamVjdCkge1xuICAgIGlmICh0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsICE9PSBwcmV2UHJvcHMudGVzdFN1aXRlTW9kZWwpIHtcbiAgICAgIGNvbnN0IHJvb3RzID0gW107XG4gICAgICBpZiAodGhpcy5wcm9wcy50ZXN0U3VpdGVNb2RlbCkge1xuICAgICAgICBmb3IgKGNvbnN0IHRlc3RDbGFzcyBvZiB0aGlzLnByb3BzLnRlc3RTdWl0ZU1vZGVsLnRlc3RDbGFzc2VzLnZhbHVlcygpKSB7XG4gICAgICAgICAgcm9vdHMucHVzaChuZXcgVGVzdENsYXNzVHJlZU5vZGUodGVzdENsYXNzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMucmVmc1sndHJlZSddLnNldFJvb3RzKHJvb3RzKTtcbiAgICB9XG5cbiAgICAodGhpczogYW55KS5yb3dDbGFzc05hbWVGb3JOb2RlID0gdGhpcy5yb3dDbGFzc05hbWVGb3JOb2RlLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgZW1wdHlSZW5kZXJNZXNzYWdlID0gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLXRyZWUtcm9vdC1wbGFjZWhvbGRlclwiPlxuICAgICAgICA8aDM+UnVubmluZyB0ZXN0czwvaDM+XG4gICAgICAgIDxvbD5cbiAgICAgICAgICA8bGk+T3BlbiB0aGUgZmlsZSB5b3Ugd2FudCB0byB0ZXN0PC9saT5cbiAgICAgICAgICA8bGk+Q2hvb3NlIHRoZSBhcHByb3ByaWF0ZSBydW5uZXIgZnJvbSB0aGUgZHJvcGRvd248L2xpPlxuICAgICAgICAgIDxsaT57J0NsaWNrIFwiVGVzdFwiIHRvIHJ1biB0ZXN0cyBmb3IgdGhhdCBmaWxlXFwncyBkaXJlY3RvcnknfTwvbGk+XG4gICAgICAgIDwvb2w+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxUcmVlUm9vdENvbXBvbmVudFxuICAgICAgICBlbGVtZW50VG9SZW5kZXJXaGVuRW1wdHk9e2VtcHR5UmVuZGVyTWVzc2FnZX1cbiAgICAgICAgZXZlbnRIYW5kbGVyU2VsZWN0b3I9XCIubnVjbGlkZS10ZXN0LXJ1bm5lci10cmVlXCJcbiAgICAgICAgaW5pdGlhbFJvb3RzPXtbXX1cbiAgICAgICAgbGFiZWxDbGFzc05hbWVGb3JOb2RlPXtsYWJlbENsYXNzTmFtZUZvck5vZGV9XG4gICAgICAgIG9uS2VlcFNlbGVjdGlvbj17KCkgPT4ge319XG4gICAgICAgIHJlZj1cInRyZWVcIlxuICAgICAgICByb3dDbGFzc05hbWVGb3JOb2RlPXt0aGlzLnJvd0NsYXNzTmFtZUZvck5vZGV9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICByb3dDbGFzc05hbWVGb3JOb2RlKG5vZGU6IExhenlUcmVlTm9kZSk6ID9zdHJpbmcge1xuICAgIGlmICghdGhpcy5wcm9wcy50ZXN0U3VpdGVNb2RlbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGl0ZW0gPSBub2RlLmdldEl0ZW0oKTtcbiAgICBjb25zdCB0ZXN0UnVuID0gdGhpcy5wcm9wcy50ZXN0U3VpdGVNb2RlbC50ZXN0UnVucy5nZXQoaXRlbVsnaWQnXSk7XG4gICAgaWYgKHRlc3RSdW4pIHtcbiAgICAgIGlmICh0ZXN0UnVuWydudW1GYWlsdXJlcyddID4gMCkge1xuICAgICAgICAvLyBSZWQvZXJyb3IgaWYgdGhlIHRlc3QgY2xhc3MgaGFkIGVycm9ycy5cbiAgICAgICAgcmV0dXJuICdzdGF0dXMtcmVtb3ZlZCc7XG4gICAgICB9IGVsc2UgaWYgKHRlc3RSdW5bJ251bVNraXBwZWQnXSA+IDApIHtcbiAgICAgICAgLy8gWWVsbG93L3dhcm5pbmcgaWYgdGhlIGNsYXNzIHNraXBwZWQgdGVzdHMuXG4gICAgICAgIHJldHVybiAnc3RhdHVzLW1vZGlmaWVkJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEdyZWVuL3N1Y2Nlc3MgaWYgYWxsIHRlc3RzIHBhc3NlZCB3aXRob3V0IHNraXBwaW5nIGFueS5cbiAgICAgICAgcmV0dXJuICdzdGF0dXMtYWRkZWQnO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXRoaXMucHJvcHMuaXNSdW5uaW5nKSB7XG4gICAgICByZXR1cm4gJ3N0YXR1cy1pZ25vcmVkJztcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUZXN0Q2xhc3NUcmVlO1xuIl19