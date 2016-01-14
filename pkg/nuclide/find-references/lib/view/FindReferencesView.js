var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');
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
    model: React.PropTypes.objectOf(FindReferencesModel).isRequired
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUN0RCxRQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNsRCxRQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsRUFBRTtBQUNsQyxjQUFRLENBQUMsSUFBSSxDQUNYO0FBQ0UsV0FBRyxFQUFDLFNBQVM7QUFDYixpQkFBUyxFQUFDLHdEQUF3RDtRQUNsRSxDQUNILENBQUM7S0FDSDs7QUFFRCxXQUNFOztRQUFLLFNBQVMsRUFBQyx5QkFBeUIsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQUFBQyxFQUFDLEdBQUcsRUFBQyxNQUFNO01BQzNFOztVQUFLLFNBQVMsRUFBQywrQkFBK0I7O1FBQ3JDLFFBQVE7O1FBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUM7UUFBRSxHQUFHOztRQUNuRCxTQUFTOztRQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDOztPQUN4QztNQUNMLFFBQVE7S0FDTCxDQUNOO0dBQ0g7O0NBRUYsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiRmluZFJlZmVyZW5jZXNWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0ZpbGVSZWZlcmVuY2VzfSBmcm9tICcuLi90eXBlcyc7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcbmNvbnN0IEZpbGVSZWZlcmVuY2VzVmlldyA9IHJlcXVpcmUoJy4vRmlsZVJlZmVyZW5jZXNWaWV3Jyk7XG5jb25zdCBGaW5kUmVmZXJlbmNlc01vZGVsID0gcmVxdWlyZSgnLi4vRmluZFJlZmVyZW5jZXNNb2RlbCcpO1xuXG4vLyBOdW1iZXIgb2YgZmlsZXMgdG8gc2hvdyBvbiBldmVyeSBwYWdlLlxuY29uc3QgUEFHRV9TSVpFID0gMTA7XG4vLyBTdGFydCBsb2FkaW5nIG1vcmUgb25jZSB0aGUgdXNlciBzY3JvbGxzIHdpdGhpbiB0aGlzIG1hbnkgcGl4ZWxzIG9mIHRoZSBib3R0b20uXG5jb25zdCBTQ1JPTExfTE9BRF9USFJFU0hPTEQgPSAyNTA7XG5cbmZ1bmN0aW9uIHBsdXJhbGl6ZShub3VuOiBzdHJpbmcsIGNvdW50OiBudW1iZXIpIHtcbiAgcmV0dXJuIGNvdW50ID09PSAxID8gbm91biA6IG5vdW4gKyAncyc7XG59XG5cbmNvbnN0IEZpbmRSZWZlcmVuY2VzVmlldyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBwcm9wVHlwZXM6IHtcbiAgICBtb2RlbDogUmVhY3QuUHJvcFR5cGVzLm9iamVjdE9mKEZpbmRSZWZlcmVuY2VzTW9kZWwpLmlzUmVxdWlyZWQsXG4gIH0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIGNvbnN0IHJlZmVyZW5jZXM6IEFycmF5PEZpbGVSZWZlcmVuY2VzPiA9IFtdO1xuICAgIHJldHVybiB7XG4gICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgZmV0Y2hlZDogMCxcbiAgICAgIHJlZmVyZW5jZXMsXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLl9mZXRjaE1vcmUoUEFHRV9TSVpFKTtcbiAgfSxcblxuICBhc3luYyBfZmV0Y2hNb3JlKGNvdW50OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBuZXh0ID0gYXdhaXQgdGhpcy5wcm9wcy5tb2RlbC5nZXRGaWxlUmVmZXJlbmNlcyhcbiAgICAgIHRoaXMuc3RhdGUuZmV0Y2hlZCxcbiAgICAgIFBBR0VfU0laRVxuICAgICk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgIGZldGNoZWQ6IHRoaXMuc3RhdGUuZmV0Y2hlZCArIFBBR0VfU0laRSxcbiAgICAgIHJlZmVyZW5jZXM6IHRoaXMuc3RhdGUucmVmZXJlbmNlcy5jb25jYXQobmV4dCksXG4gICAgfSk7XG4gIH0sXG5cbiAgX29uU2Nyb2xsKGV2dDogRXZlbnQpIHtcbiAgICBjb25zdCByb290ID0gUmVhY3QuZmluZERPTU5vZGUodGhpcy5yZWZzLnJvb3QpO1xuICAgIGlmICh0aGlzLnN0YXRlLmxvYWRpbmcgfHwgcm9vdC5jbGllbnRIZWlnaHQgPj0gcm9vdC5zY3JvbGxIZWlnaHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc2Nyb2xsQm90dG9tID0gcm9vdC5zY3JvbGxUb3AgKyByb290LmNsaWVudEhlaWdodDtcbiAgICBpZiAocm9vdC5zY3JvbGxIZWlnaHQgLSBzY3JvbGxCb3R0b20gPD0gU0NST0xMX0xPQURfVEhSRVNIT0xEKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtsb2FkaW5nOiB0cnVlfSk7XG4gICAgICB0aGlzLl9mZXRjaE1vcmUoUEFHRV9TSVpFKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnN0YXRlLnJlZmVyZW5jZXMubWFwKChmaWxlUmVmcywgaSkgPT5cbiAgICAgIDxGaWxlUmVmZXJlbmNlc1ZpZXdcbiAgICAgICAga2V5PXtpfVxuICAgICAgICB7Li4uZmlsZVJlZnN9XG4gICAgICAgIGJhc2VQYXRoPXt0aGlzLnByb3BzLm1vZGVsLmdldEJhc2VQYXRoKCl9XG4gICAgICAvPlxuICAgICk7XG5cbiAgICBjb25zdCByZWZDb3VudCA9IHRoaXMucHJvcHMubW9kZWwuZ2V0UmVmZXJlbmNlQ291bnQoKTtcbiAgICBjb25zdCBmaWxlQ291bnQgPSB0aGlzLnByb3BzLm1vZGVsLmdldEZpbGVDb3VudCgpO1xuICAgIGlmICh0aGlzLnN0YXRlLmZldGNoZWQgPCBmaWxlQ291bnQpIHtcbiAgICAgIGNoaWxkcmVuLnB1c2goXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBrZXk9XCJsb2FkaW5nXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1sb2FkaW5nIGxvYWRpbmctc3Bpbm5lci1tZWRpdW1cIlxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlc1wiIG9uU2Nyb2xsPXt0aGlzLl9vblNjcm9sbH0gcmVmPVwicm9vdFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmluZC1yZWZlcmVuY2VzLWNvdW50XCI+XG4gICAgICAgICAgRm91bmQge3JlZkNvdW50fSB7cGx1cmFsaXplKCdyZWZlcmVuY2UnLCByZWZDb3VudCl9eycgJ31cbiAgICAgICAgICBpbiB7ZmlsZUNvdW50fSB7cGx1cmFsaXplKCdmaWxlJywgZmlsZUNvdW50KX0uXG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9LFxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaW5kUmVmZXJlbmNlc1ZpZXc7XG4iXX0=