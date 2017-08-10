'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireDefault(require('react'));

var _LazyNestedValueComponent;

function _load_LazyNestedValueComponent() {
  return _LazyNestedValueComponent = require('../../../nuclide-ui/LazyNestedValueComponent');
}

var _SimpleValueComponent;

function _load_SimpleValueComponent() {
  return _SimpleValueComponent = _interopRequireDefault(require('../../../nuclide-ui/SimpleValueComponent'));
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var _TextRenderer;

function _load_TextRenderer() {
  return _TextRenderer = require('../../../nuclide-ui/TextRenderer');
}

var _MeasuredComponent;

function _load_MeasuredComponent() {
  return _MeasuredComponent = require('../../../nuclide-ui/MeasuredComponent');
}

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('nuclide-commons/debounce'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ONE_DAY = 1000 * 60 * 60 * 24; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */

class RecordView extends _react.default.Component {

  constructor(props) {
    super(props);

    // The MeasuredComponent can call this many times in quick succession as the
    // child components render, so we debounce it since we only want to know about
    // the height change once everything has settled down

    this.measureAndNotifyHeight = () => {
      // This method is called after the necessary DOM mutations have
      // already occurred, however it is possible that the updates have
      // not been flushed to the screen. So the height change update
      // is deferred until the rendering is complete so that
      // this._wrapper.offsetHeight gives us the correct final height
      if (this._rafDisposable != null) {
        this._rafDisposable.unsubscribe();
      }
      this._rafDisposable = (_observable || _load_observable()).nextAnimationFrame.subscribe(() => {
        if (this._wrapper == null) {
          return;
        }
        const { offsetHeight } = this._wrapper;
        const { displayableRecord, onHeightChange } = this.props;
        if (offsetHeight !== displayableRecord.height) {
          onHeightChange(displayableRecord.id, offsetHeight);
        }
      });
    };

    this._handleRecordWrapper = wrapper => {
      this._wrapper = wrapper;
    };

    this._debouncedMeasureAndNotifyHeight = (0, (_debounce || _load_debounce()).default)(this.measureAndNotifyHeight, 10);
  }

  componentDidMount() {
    // We initially assume a height for the record. After it is actually
    // rendered we need it to measure its actual height and report it
    this.measureAndNotifyHeight();
  }

  componentWillUnmount() {
    if (this._rafDisposable != null) {
      this._rafDisposable.unsubscribe();
    }
  }

  _renderContent(displayableRecord) {
    const { record } = displayableRecord;
    if (record.kind === 'request') {
      // TODO: We really want to use a text editor to render this so that we can get syntax
      // highlighting, but they're just too expensive. Figure out a less-expensive way to get syntax
      // highlighting.
      return _react.default.createElement(
        'pre',
        null,
        record.text || ' '
      );
    } else if (record.kind === 'response') {
      const executor = this.props.getExecutor(record.sourceId);
      return this._renderNestedValueComponent(displayableRecord, executor);
    } else if (record.data != null) {
      const provider = this.props.getProvider(record.sourceId);
      return this._renderNestedValueComponent(displayableRecord, provider);
    } else {
      // If there's not text, use a space to make sure the row doesn't collapse.
      const text = record.text || ' ';
      return _react.default.createElement(
        'pre',
        null,
        parseText(text)
      );
    }
  }

  shouldComponentUpdate(nextProps) {
    return !(0, (_shallowequal || _load_shallowequal()).default)(this.props, nextProps);
  }

  _renderNestedValueComponent(displayableRecord, provider) {
    const { record, expansionStateId } = displayableRecord;
    const getProperties = provider == null ? null : provider.getProperties;
    const type = record.data == null ? null : record.data.type;
    const simpleValueComponent = getComponent(type);
    return _react.default.createElement((_LazyNestedValueComponent || _load_LazyNestedValueComponent()).LazyNestedValueComponent, {
      className: 'nuclide-console-lazy-nested-value',
      evaluationResult: record.data,
      fetchChildren: getProperties,
      simpleValueComponent: simpleValueComponent,
      shouldCacheChildren: true,
      expansionStateId: expansionStateId
    });
  }

  render() {
    const { displayableRecord } = this.props;
    const { record } = displayableRecord;
    const { level, kind, timestamp, sourceId } = record;

    const classNames = (0, (_classnames || _load_classnames()).default)('nuclide-console-record', `level-${level || 'log'}`, {
      request: kind === 'request',
      response: kind === 'response'
    });

    const iconName = getIconName(record);
    const icon = iconName ? _react.default.createElement('span', { className: `icon icon-${iconName}` }) : null;
    const sourceLabel = this.props.showSourceLabel ? _react.default.createElement(
      'span',
      {
        className: `nuclide-console-record-source-label ${getHighlightClassName(level)}` },
      sourceId
    ) : null;
    let renderedTimestamp;
    if (timestamp != null) {
      const timestampLabel = Date.now() - timestamp > ONE_DAY ? timestamp.toLocaleString() : timestamp.toLocaleTimeString();
      renderedTimestamp = _react.default.createElement(
        'div',
        { className: 'nuclide-console-record-timestamp' },
        timestampLabel
      );
    }
    return _react.default.createElement(
      (_MeasuredComponent || _load_MeasuredComponent()).MeasuredComponent,
      {
        onMeasurementsChanged: this._debouncedMeasureAndNotifyHeight },
      _react.default.createElement(
        'div',
        { ref: this._handleRecordWrapper, className: classNames },
        icon,
        _react.default.createElement(
          'div',
          { className: 'nuclide-console-record-content-wrapper' },
          this._renderContent(displayableRecord)
        ),
        sourceLabel,
        renderedTimestamp
      )
    );
  }

}

exports.default = RecordView;
function getComponent(type) {
  switch (type) {
    case 'text':
      return props => (0, (_TextRenderer || _load_TextRenderer()).TextRenderer)(props.evaluationResult);
    case 'boolean':
    case 'string':
    case 'number':
    case 'object':
    default:
      return (_SimpleValueComponent || _load_SimpleValueComponent()).default;
  }
}

function getHighlightClassName(level) {
  switch (level) {
    case 'info':
      return 'highlight-info';
    case 'success':
      return 'highlight-success';
    case 'warning':
      return 'highlight-warning';
    case 'error':
      return 'highlight-error';
    default:
      return 'highlight';
  }
}

function getIconName(record) {
  switch (record.kind) {
    case 'request':
      return 'chevron-right';
    case 'response':
      return 'arrow-small-left';
  }
  switch (record.level) {
    case 'info':
      return 'info';
    case 'success':
      return 'check';
    case 'warning':
      return 'alert';
    case 'error':
      return 'stop';
  }
}

function parseText(text) {
  return text.split((_string || _load_string()).URL_REGEX).map((chunk, i) => {
    // Since we're splitting on the URL regex, every other piece will be a URL.
    const isURL = i % 2 !== 0;
    return isURL ? _react.default.createElement(
      'a',
      { key: `d${i}`, href: chunk, target: '_blank' },
      chunk
    ) : chunk;
  });
}