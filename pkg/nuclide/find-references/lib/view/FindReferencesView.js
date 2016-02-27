var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('react-for-atom');

var React = _require.React;
var ReactDOM = _require.ReactDOM;
var PropTypes = React.PropTypes;

var FileReferencesView = require('./FileReferencesView');
var FindReferencesModel = require('../FindReferencesModel');

// Number of files to show on every page.
var PAGE_SIZE = 10;
// Start loading more once the user scrolls within this many pixels of the bottom.
var SCROLL_LOAD_THRESHOLD = 250;

function pluralize(noun, count) {
  return count === 1 ? noun : noun + 's';
}

var FindReferencesView = React.createClass({
  displayName: 'FindReferencesView',

  propTypes: {
    model: PropTypes.instanceOf(FindReferencesModel).isRequired
  },

  getInitialState: function getInitialState() {
    var references = [];
    return {
      loading: true,
      fetched: 0,
      references: references
    };
  },

  componentDidMount: function componentDidMount() {
    this._fetchMore(PAGE_SIZE);
  },

  _fetchMore: _asyncToGenerator(function* (count) {
    var next = yield this.props.model.getFileReferences(this.state.fetched, PAGE_SIZE);
    this.setState({
      loading: false,
      fetched: this.state.fetched + PAGE_SIZE,
      references: this.state.references.concat(next)
    });
  }),

  _onScroll: function _onScroll(evt) {
    var root = ReactDOM.findDOMNode(this.refs.root);
    if (this.state.loading || root.clientHeight >= root.scrollHeight) {
      return;
    }
    var scrollBottom = root.scrollTop + root.clientHeight;
    if (root.scrollHeight - scrollBottom <= SCROLL_LOAD_THRESHOLD) {
      this.setState({ loading: true });
      this._fetchMore(PAGE_SIZE);
    }
  },

  render: function render() {
    var _this = this;

    var children = this.state.references.map(function (fileRefs, i) {
      return React.createElement(FileReferencesView, _extends({
        key: i
      }, fileRefs, {
        basePath: _this.props.model.getBasePath()
      }));
    });

    var refCount = this.props.model.getReferenceCount();
    var fileCount = this.props.model.getFileCount();
    if (this.state.fetched < fileCount) {
      children.push(React.createElement('div', {
        key: 'loading',
        className: 'nuclide-find-references-loading loading-spinner-medium'
      }));
    }

    return React.createElement(
      'div',
      { className: 'nuclide-find-references', onScroll: this._onScroll, ref: 'root', tabIndex: '0' },
      React.createElement(
        'div',
        { className: 'nuclide-find-references-count' },
        'Found ',
        refCount,
        ' ',
        pluralize('reference', refCount),
        ' ',
        'in ',
        fileCount,
        ' ',
        pluralize('file', fileCount),
        '.'
      ),
      children
    );
  }

});

module.exports = FindReferencesView;
//# sourceMappingURL=data:application/json;base64,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QUNILENBQUM7O0FBRUYsUUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUN0RCxRQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNsRCxRQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsRUFBRTtBQUNsQyxjQUFRLENBQUMsSUFBSSxDQUNYO0FBQ0UsV0FBRyxFQUFDLFNBQVM7QUFDYixpQkFBUyxFQUFDLHdEQUF3RDtRQUNsRSxDQUNILENBQUM7S0FDSDs7QUFFRCxXQUNFOztRQUFLLFNBQVMsRUFBQyx5QkFBeUIsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQUFBQyxFQUFDLEdBQUcsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLEdBQUc7TUFDeEY7O1VBQUssU0FBUyxFQUFDLCtCQUErQjs7UUFDckMsUUFBUTs7UUFBRyxTQUFTLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQztRQUFFLEdBQUc7O1FBQ25ELFNBQVM7O1FBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUM7O09BQ3hDO01BQ0wsUUFBUTtLQUNMLENBQ047R0FDSDs7Q0FFRixDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJGaW5kUmVmZXJlbmNlc1ZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RmlsZVJlZmVyZW5jZXN9IGZyb20gJy4uL3R5cGVzJztcblxuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5jb25zdCBGaWxlUmVmZXJlbmNlc1ZpZXcgPSByZXF1aXJlKCcuL0ZpbGVSZWZlcmVuY2VzVmlldycpO1xuY29uc3QgRmluZFJlZmVyZW5jZXNNb2RlbCA9IHJlcXVpcmUoJy4uL0ZpbmRSZWZlcmVuY2VzTW9kZWwnKTtcblxuLy8gTnVtYmVyIG9mIGZpbGVzIHRvIHNob3cgb24gZXZlcnkgcGFnZS5cbmNvbnN0IFBBR0VfU0laRSA9IDEwO1xuLy8gU3RhcnQgbG9hZGluZyBtb3JlIG9uY2UgdGhlIHVzZXIgc2Nyb2xscyB3aXRoaW4gdGhpcyBtYW55IHBpeGVscyBvZiB0aGUgYm90dG9tLlxuY29uc3QgU0NST0xMX0xPQURfVEhSRVNIT0xEID0gMjUwO1xuXG5mdW5jdGlvbiBwbHVyYWxpemUobm91bjogc3RyaW5nLCBjb3VudDogbnVtYmVyKSB7XG4gIHJldHVybiBjb3VudCA9PT0gMSA/IG5vdW4gOiBub3VuICsgJ3MnO1xufVxuXG5jb25zdCBGaW5kUmVmZXJlbmNlc1ZpZXcgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgbW9kZWw6IFByb3BUeXBlcy5pbnN0YW5jZU9mKEZpbmRSZWZlcmVuY2VzTW9kZWwpLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIGNvbnN0IHJlZmVyZW5jZXM6IEFycmF5PEZpbGVSZWZlcmVuY2VzPiA9IFtdO1xuICAgIHJldHVybiB7XG4gICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgZmV0Y2hlZDogMCxcbiAgICAgIHJlZmVyZW5jZXMsXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLl9mZXRjaE1vcmUoUEFHRV9TSVpFKTtcbiAgfSxcblxuICBhc3luYyBfZmV0Y2hNb3JlKGNvdW50OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBuZXh0ID0gYXdhaXQgdGhpcy5wcm9wcy5tb2RlbC5nZXRGaWxlUmVmZXJlbmNlcyhcbiAgICAgIHRoaXMuc3RhdGUuZmV0Y2hlZCxcbiAgICAgIFBBR0VfU0laRVxuICAgICk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgIGZldGNoZWQ6IHRoaXMuc3RhdGUuZmV0Y2hlZCArIFBBR0VfU0laRSxcbiAgICAgIHJlZmVyZW5jZXM6IHRoaXMuc3RhdGUucmVmZXJlbmNlcy5jb25jYXQobmV4dCksXG4gICAgfSk7XG4gIH0sXG5cbiAgX29uU2Nyb2xsKGV2dDogRXZlbnQpIHtcbiAgICBjb25zdCByb290ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzLnJvb3QpO1xuICAgIGlmICh0aGlzLnN0YXRlLmxvYWRpbmcgfHwgcm9vdC5jbGllbnRIZWlnaHQgPj0gcm9vdC5zY3JvbGxIZWlnaHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc2Nyb2xsQm90dG9tID0gcm9vdC5zY3JvbGxUb3AgKyByb290LmNsaWVudEhlaWdodDtcbiAgICBpZiAocm9vdC5zY3JvbGxIZWlnaHQgLSBzY3JvbGxCb3R0b20gPD0gU0NST0xMX0xPQURfVEhSRVNIT0xEKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtsb2FkaW5nOiB0cnVlfSk7XG4gICAgICB0aGlzLl9mZXRjaE1vcmUoUEFHRV9TSVpFKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnN0YXRlLnJlZmVyZW5jZXMubWFwKChmaWxlUmVmcywgaSkgPT5cbiAgICAgIDxGaWxlUmVmZXJlbmNlc1ZpZXdcbiAgICAgICAga2V5PXtpfVxuICAgICAgICB7Li4uZmlsZVJlZnN9XG4gICAgICAgIGJhc2VQYXRoPXt0aGlzLnByb3BzLm1vZGVsLmdldEJhc2VQYXRoKCl9XG4gICAgICAvPlxuICAgICk7XG5cbiAgICBjb25zdCByZWZDb3VudCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0UmVmZXJlbmNlQ291bnQoKTtcbiAgICBjb25zdCBmaWxlQ291bnQgPSB0aGlzLnByb3BzLm1vZGVsLmdldEZpbGVDb3VudCgpO1xuICAgIGlmICh0aGlzLnN0YXRlLmZldGNoZWQgPCBmaWxlQ291bnQpIHtcbiAgICAgIGNoaWxkcmVuLnB1c2goXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBrZXk9XCJsb2FkaW5nXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1sb2FkaW5nIGxvYWRpbmctc3Bpbm5lci1tZWRpdW1cIlxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlc1wiIG9uU2Nyb2xsPXt0aGlzLl9vblNjcm9sbH0gcmVmPVwicm9vdFwiIHRhYkluZGV4PVwiMFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWNvdW50XCI+XG4gICAgICAgICAgRm91bmQge3JlZkNvdW50fSB7cGx1cmFsaXplKCdyZWZlcmVuY2UnLCByZWZDb3VudCl9eycgJ31cbiAgICAgICAgICBpbiB7ZmlsZUNvdW50fSB7cGx1cmFsaXplKCdmaWxlJywgZmlsZUNvdW50KX0uXG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaW5kUmVmZXJlbmNlc1ZpZXc7XG4iXX0=