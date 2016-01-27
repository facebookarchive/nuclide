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
    var root = React.findDOMNode(this.refs.root);
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
      { className: 'nuclide-find-references', onScroll: this._onScroll, ref: 'root' },
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
//# sourceMappingURL=data:application/json;base64,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UUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDdEQsUUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDbEQsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLEVBQUU7QUFDbEMsY0FBUSxDQUFDLElBQUksQ0FDWDtBQUNFLFdBQUcsRUFBQyxTQUFTO0FBQ2IsaUJBQVMsRUFBQyx3REFBd0Q7UUFDbEUsQ0FDSCxDQUFDO0tBQ0g7O0FBRUQsV0FDRTs7UUFBSyxTQUFTLEVBQUMseUJBQXlCLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEFBQUMsRUFBQyxHQUFHLEVBQUMsTUFBTTtNQUMzRTs7VUFBSyxTQUFTLEVBQUMsK0JBQStCOztRQUNyQyxRQUFROztRQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDO1FBQUUsR0FBRzs7UUFDbkQsU0FBUzs7UUFBRyxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQzs7T0FDeEM7TUFDTCxRQUFRO0tBQ0wsQ0FDTjtHQUNIOztDQUVGLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLGtCQUFrQixDQUFDIiwiZmlsZSI6IkZpbmRSZWZlcmVuY2VzVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlUmVmZXJlbmNlc30gZnJvbSAnLi4vdHlwZXMnO1xuXG5jb25zdCB7UmVhY3R9ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5jb25zdCBGaWxlUmVmZXJlbmNlc1ZpZXcgPSByZXF1aXJlKCcuL0ZpbGVSZWZlcmVuY2VzVmlldycpO1xuY29uc3QgRmluZFJlZmVyZW5jZXNNb2RlbCA9IHJlcXVpcmUoJy4uL0ZpbmRSZWZlcmVuY2VzTW9kZWwnKTtcblxuLy8gTnVtYmVyIG9mIGZpbGVzIHRvIHNob3cgb24gZXZlcnkgcGFnZS5cbmNvbnN0IFBBR0VfU0laRSA9IDEwO1xuLy8gU3RhcnQgbG9hZGluZyBtb3JlIG9uY2UgdGhlIHVzZXIgc2Nyb2xscyB3aXRoaW4gdGhpcyBtYW55IHBpeGVscyBvZiB0aGUgYm90dG9tLlxuY29uc3QgU0NST0xMX0xPQURfVEhSRVNIT0xEID0gMjUwO1xuXG5mdW5jdGlvbiBwbHVyYWxpemUobm91bjogc3RyaW5nLCBjb3VudDogbnVtYmVyKSB7XG4gIHJldHVybiBjb3VudCA9PT0gMSA/IG5vdW4gOiBub3VuICsgJ3MnO1xufVxuXG5jb25zdCBGaW5kUmVmZXJlbmNlc1ZpZXcgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcHJvcFR5cGVzOiB7XG4gICAgbW9kZWw6IFByb3BUeXBlcy5pbnN0YW5jZU9mKEZpbmRSZWZlcmVuY2VzTW9kZWwpLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIGNvbnN0IHJlZmVyZW5jZXM6IEFycmF5PEZpbGVSZWZlcmVuY2VzPiA9IFtdO1xuICAgIHJldHVybiB7XG4gICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgZmV0Y2hlZDogMCxcbiAgICAgIHJlZmVyZW5jZXMsXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLl9mZXRjaE1vcmUoUEFHRV9TSVpFKTtcbiAgfSxcblxuICBhc3luYyBfZmV0Y2hNb3JlKGNvdW50OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBuZXh0ID0gYXdhaXQgdGhpcy5wcm9wcy5tb2RlbC5nZXRGaWxlUmVmZXJlbmNlcyhcbiAgICAgIHRoaXMuc3RhdGUuZmV0Y2hlZCxcbiAgICAgIFBBR0VfU0laRVxuICAgICk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgIGZldGNoZWQ6IHRoaXMuc3RhdGUuZmV0Y2hlZCArIFBBR0VfU0laRSxcbiAgICAgIHJlZmVyZW5jZXM6IHRoaXMuc3RhdGUucmVmZXJlbmNlcy5jb25jYXQobmV4dCksXG4gICAgfSk7XG4gIH0sXG5cbiAgX29uU2Nyb2xsKGV2dDogRXZlbnQpIHtcbiAgICBjb25zdCByb290ID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnJvb3QpO1xuICAgIGlmICh0aGlzLnN0YXRlLmxvYWRpbmcgfHwgcm9vdC5jbGllbnRIZWlnaHQgPj0gcm9vdC5zY3JvbGxIZWlnaHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc2Nyb2xsQm90dG9tID0gcm9vdC5zY3JvbGxUb3AgKyByb290LmNsaWVudEhlaWdodDtcbiAgICBpZiAocm9vdC5zY3JvbGxIZWlnaHQgLSBzY3JvbGxCb3R0b20gPD0gU0NST0xMX0xPQURfVEhSRVNIT0xEKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtsb2FkaW5nOiB0cnVlfSk7XG4gICAgICB0aGlzLl9mZXRjaE1vcmUoUEFHRV9TSVpFKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnN0YXRlLnJlZmVyZW5jZXMubWFwKChmaWxlUmVmcywgaSkgPT5cbiAgICAgIDxGaWxlUmVmZXJlbmNlc1ZpZXdcbiAgICAgICAga2V5PXtpfVxuICAgICAgICB7Li4uZmlsZVJlZnN9XG4gICAgICAgIGJhc2VQYXRoPXt0aGlzLnByb3BzLm1vZGVsLmdldEJhc2VQYXRoKCl9XG4gICAgICAvPlxuICAgICk7XG5cbiAgICBjb25zdCByZWZDb3VudCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0UmVmZXJlbmNlQ291bnQoKTtcbiAgICBjb25zdCBmaWxlQ291bnQgPSB0aGlzLnByb3BzLm1vZGVsLmdldEZpbGVDb3VudCgpO1xuICAgIGlmICh0aGlzLnN0YXRlLmZldGNoZWQgPCBmaWxlQ291bnQpIHtcbiAgICAgIGNoaWxkcmVuLnB1c2goXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBrZXk9XCJsb2FkaW5nXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1sb2FkaW5nIGxvYWRpbmctc3Bpbm5lci1tZWRpdW1cIlxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlc1wiIG9uU2Nyb2xsPXt0aGlzLl9vblNjcm9sbH0gcmVmPVwicm9vdFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWNvdW50XCI+XG4gICAgICAgICAgRm91bmQge3JlZkNvdW50fSB7cGx1cmFsaXplKCdyZWZlcmVuY2UnLCByZWZDb3VudCl9eycgJ31cbiAgICAgICAgICBpbiB7ZmlsZUNvdW50fSB7cGx1cmFsaXplKCdmaWxlJywgZmlsZUNvdW50KX0uXG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaW5kUmVmZXJlbmNlc1ZpZXc7XG4iXX0=