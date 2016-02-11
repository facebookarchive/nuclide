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
//# sourceMappingURL=data:application/json;base64,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QUNILENBQUM7O0FBRUYsUUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztBQUN0RCxRQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNsRCxRQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsRUFBRTtBQUNsQyxjQUFRLENBQUMsSUFBSSxDQUNYO0FBQ0UsV0FBRyxFQUFDLFNBQVM7QUFDYixpQkFBUyxFQUFDLHdEQUF3RDtRQUNsRSxDQUNILENBQUM7S0FDSDs7QUFFRCxXQUNFOztRQUFLLFNBQVMsRUFBQyx5QkFBeUIsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQUFBQyxFQUFDLEdBQUcsRUFBQyxNQUFNO01BQzNFOztVQUFLLFNBQVMsRUFBQywrQkFBK0I7O1FBQ3JDLFFBQVE7O1FBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUM7UUFBRSxHQUFHOztRQUNuRCxTQUFTOztRQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDOztPQUN4QztNQUNMLFFBQVE7S0FDTCxDQUNOO0dBQ0g7O0NBRUYsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiRmluZFJlZmVyZW5jZXNWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0ZpbGVSZWZlcmVuY2VzfSBmcm9tICcuLi90eXBlcyc7XG5cbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuY29uc3QgRmlsZVJlZmVyZW5jZXNWaWV3ID0gcmVxdWlyZSgnLi9GaWxlUmVmZXJlbmNlc1ZpZXcnKTtcbmNvbnN0IEZpbmRSZWZlcmVuY2VzTW9kZWwgPSByZXF1aXJlKCcuLi9GaW5kUmVmZXJlbmNlc01vZGVsJyk7XG5cbi8vIE51bWJlciBvZiBmaWxlcyB0byBzaG93IG9uIGV2ZXJ5IHBhZ2UuXG5jb25zdCBQQUdFX1NJWkUgPSAxMDtcbi8vIFN0YXJ0IGxvYWRpbmcgbW9yZSBvbmNlIHRoZSB1c2VyIHNjcm9sbHMgd2l0aGluIHRoaXMgbWFueSBwaXhlbHMgb2YgdGhlIGJvdHRvbS5cbmNvbnN0IFNDUk9MTF9MT0FEX1RIUkVTSE9MRCA9IDI1MDtcblxuZnVuY3Rpb24gcGx1cmFsaXplKG5vdW46IHN0cmluZywgY291bnQ6IG51bWJlcikge1xuICByZXR1cm4gY291bnQgPT09IDEgPyBub3VuIDogbm91biArICdzJztcbn1cblxuY29uc3QgRmluZFJlZmVyZW5jZXNWaWV3ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHByb3BUeXBlczoge1xuICAgIG1vZGVsOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihGaW5kUmVmZXJlbmNlc01vZGVsKS5pc1JlcXVpcmVkLFxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICBjb25zdCByZWZlcmVuY2VzOiBBcnJheTxGaWxlUmVmZXJlbmNlcz4gPSBbXTtcbiAgICByZXR1cm4ge1xuICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgIGZldGNoZWQ6IDAsXG4gICAgICByZWZlcmVuY2VzLFxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5fZmV0Y2hNb3JlKFBBR0VfU0laRSk7XG4gIH0sXG5cbiAgYXN5bmMgX2ZldGNoTW9yZShjb3VudDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbmV4dCA9IGF3YWl0IHRoaXMucHJvcHMubW9kZWwuZ2V0RmlsZVJlZmVyZW5jZXMoXG4gICAgICB0aGlzLnN0YXRlLmZldGNoZWQsXG4gICAgICBQQUdFX1NJWkVcbiAgICApO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICBmZXRjaGVkOiB0aGlzLnN0YXRlLmZldGNoZWQgKyBQQUdFX1NJWkUsXG4gICAgICByZWZlcmVuY2VzOiB0aGlzLnN0YXRlLnJlZmVyZW5jZXMuY29uY2F0KG5leHQpLFxuICAgIH0pO1xuICB9LFxuXG4gIF9vblNjcm9sbChldnQ6IEV2ZW50KSB7XG4gICAgY29uc3Qgcm9vdCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmcy5yb290KTtcbiAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nIHx8IHJvb3QuY2xpZW50SGVpZ2h0ID49IHJvb3Quc2Nyb2xsSGVpZ2h0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHNjcm9sbEJvdHRvbSA9IHJvb3Quc2Nyb2xsVG9wICsgcm9vdC5jbGllbnRIZWlnaHQ7XG4gICAgaWYgKHJvb3Quc2Nyb2xsSGVpZ2h0IC0gc2Nyb2xsQm90dG9tIDw9IFNDUk9MTF9MT0FEX1RIUkVTSE9MRCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7bG9hZGluZzogdHJ1ZX0pO1xuICAgICAgdGhpcy5fZmV0Y2hNb3JlKFBBR0VfU0laRSk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5zdGF0ZS5yZWZlcmVuY2VzLm1hcCgoZmlsZVJlZnMsIGkpID0+XG4gICAgICA8RmlsZVJlZmVyZW5jZXNWaWV3XG4gICAgICAgIGtleT17aX1cbiAgICAgICAgey4uLmZpbGVSZWZzfVxuICAgICAgICBiYXNlUGF0aD17dGhpcy5wcm9wcy5tb2RlbC5nZXRCYXNlUGF0aCgpfVxuICAgICAgLz5cbiAgICApO1xuXG4gICAgY29uc3QgcmVmQ291bnQgPSB0aGlzLnByb3BzLm1vZGVsLmdldFJlZmVyZW5jZUNvdW50KCk7XG4gICAgY29uc3QgZmlsZUNvdW50ID0gdGhpcy5wcm9wcy5tb2RlbC5nZXRGaWxlQ291bnQoKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5mZXRjaGVkIDwgZmlsZUNvdW50KSB7XG4gICAgICBjaGlsZHJlbi5wdXNoKFxuICAgICAgICA8ZGl2XG4gICAgICAgICAga2V5PVwibG9hZGluZ1wiXG4gICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1maW5kLXJlZmVyZW5jZXMtbG9hZGluZyBsb2FkaW5nLXNwaW5uZXItbWVkaXVtXCJcbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1maW5kLXJlZmVyZW5jZXNcIiBvblNjcm9sbD17dGhpcy5fb25TY3JvbGx9IHJlZj1cInJvb3RcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWZpbmQtcmVmZXJlbmNlcy1jb3VudFwiPlxuICAgICAgICAgIEZvdW5kIHtyZWZDb3VudH0ge3BsdXJhbGl6ZSgncmVmZXJlbmNlJywgcmVmQ291bnQpfXsnICd9XG4gICAgICAgICAgaW4ge2ZpbGVDb3VudH0ge3BsdXJhbGl6ZSgnZmlsZScsIGZpbGVDb3VudCl9LlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRmluZFJlZmVyZW5jZXNWaWV3O1xuIl19