'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.ResizeSensitiveContainer = undefined;











var _react = _interopRequireWildcard(require('react'));var _classnames;
function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _observable;
function _load_observable() {return _observable = require('../nuclide-commons/observable');}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}







const EXPANSION_BUFFER = 50;

/**
                              * Hidden set of DOM nodes that are used to detect resizes through onScroll events.
                              *
                              * This component works by injecting two sets of divs, one for detecting expansions
                              * and one for detecting shrinking. They are sized and have their scroll positions
                              * set in a specific way so that a resize of the container will trigger an onScroll
                              * event. This is used as the basis for the "onResize" event.
                              *
                              * The scroll position of the inner divs can be reset when DOM nodes are shuffled
                              * around, which will break the resize detection. To handle this case, the sensor
                              * uses a CSS animation and listens for onAnimationStart to know when to reset the
                              * scroll positions.
                              *
                              * This strategy is derived from https://github.com/wnr/element-resize-detector
                              */ /**
                                  * Copyright (c) 2017-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the BSD-style license found in the
                                  * LICENSE file in the root directory of this source tree. An additional grant
                                  * of patent rights can be found in the PATENTS file in the same directory.
                                  *
                                  * 
                                  * @format
                                  */class ResizeSensor extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.




















    _handleScroll = () => {
      this._resetScrollbars();
      this.props.onDetectedResize();
    }, this.

    _handleExpandRef = el => {
      this._expand = el;
    }, this.

    _handleShrinkRef = el => {
      this._shrink = el;
    }, _temp;}componentDidMount() {this._resetScrollbars();}componentDidUpdate(prevProps) {const { targetWidth, targetHeight } = this.props;if (prevProps.targetWidth !== targetWidth || prevProps.targetHeight !== targetHeight) {this._resetScrollbars();}}_resetScrollbars() {if (this._expand == null || this._shrink == null) {return;}this._expand.scrollLeft = this._expand.scrollWidth;this._expand.scrollTop = this._expand.scrollHeight;this._shrink.scrollLeft = this._shrink.scrollWidth;this._shrink.scrollTop = this._shrink.scrollHeight;}

  render() {
    const { targetWidth, targetHeight } = this.props;
    const expandInnerStyle = {
      width: targetWidth + EXPANSION_BUFFER,
      height: targetHeight + EXPANSION_BUFFER };


    return (
      _react.createElement('div', {
          className: 'nuclide-resize-sensitive-container-sensor',
          onAnimationStart: this._handleScroll },
        _react.createElement('div', {
            // $FlowFixMe(>=0.53.0) Flow suppress
            ref: this._handleExpandRef,
            className: 'nuclide-resize-sensitive-container-expand',
            onScroll: this._handleScroll },
          _react.createElement('div', {
            className: 'nuclide-resize-sensitive-container-expand-inner',
            style: expandInnerStyle })),


        _react.createElement('div', {
            // $FlowFixMe(>=0.53.0) Flow suppress
            ref: this._handleShrinkRef,
            className: 'nuclide-resize-sensitive-container-shrink',
            onScroll: this._handleScroll },
          _react.createElement('div', { className: 'nuclide-resize-sensitive-container-shrink-inner' }))));



  }}














/**
      * Size-sensitive container that provides an onResize callback that
      * is invoked with the container's width and height whenever it changes.
      *
      * NOTE: This component is meant to be used to detect size changes that
      *       are not a result of a DOM mutation. If you only care about size
      *       changes as a result of a DOM mutation, use MeasuredComponent
      *       instead.
      */
class ResizeSensitiveContainer extends _react.Component {




  constructor(props) {
    super(props);this._resizeEvents = new _rxjsBundlesRxMinJs.Subject();this.






















    _handleContainer = el => {
      this._container = el;
      this._updateContainerSize();
    };this.

    _updateContainerSize = () => {
      if (this._container == null) {
        return;
      }

      const { offsetHeight, offsetWidth } = this._container;
      const { height, width } = this.state;
      if (offsetHeight === height && offsetWidth === width) {
        return;
      }

      this.setState({
        height: offsetHeight,
        width: offsetWidth });

      this.props.onResize(offsetHeight, offsetWidth);
    };this.

    _handleResize = () => {
      this._resizeEvents.next();
    };this.state = { height: -1, width: -1 };}componentDidMount() {this._resizeSubscription = this._resizeEvents.switchMap(() => (_observable || _load_observable()).nextAnimationFrame).subscribe(() => {this._updateContainerSize();});}componentWillUnmount() {(0, (_nullthrows || _load_nullthrows()).default)(this._resizeSubscription).unsubscribe();}_containerRendered() {return this.state.height !== -1 && this.state.width !== -1;}

  render() {
    const { children, className, tabIndex } = this.props;
    const { height, width } = this.state;
    const containerClasses = (0, (_classnames || _load_classnames()).default)(
    'nuclide-resize-sensitive-container',
    className);

    return (
      _react.createElement('div', { className: 'nuclide-resize-sensitive-container-wrapper' },
        _react.createElement('div', {
            ref: this._handleContainer,
            className: containerClasses,
            tabIndex: tabIndex },
          children),

        this._containerRendered() ?
        _react.createElement(ResizeSensor, {
          targetHeight: height,
          targetWidth: width,
          onDetectedResize: this._handleResize }) :

        null));


  }}exports.ResizeSensitiveContainer = ResizeSensitiveContainer;