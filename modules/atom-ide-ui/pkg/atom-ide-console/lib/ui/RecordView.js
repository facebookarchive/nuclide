"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _MeasuredComponent() {
  const data = require("../../../../../nuclide-commons-ui/MeasuredComponent");

  _MeasuredComponent = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _LazyNestedValueComponent() {
  const data = require("../../../../../nuclide-commons-ui/LazyNestedValueComponent");

  _LazyNestedValueComponent = function () {
    return data;
  };

  return data;
}

function _SimpleValueComponent() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/SimpleValueComponent"));

  _SimpleValueComponent = function () {
    return data;
  };

  return data;
}

function _FullWidthProgressBar() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/FullWidthProgressBar"));

  _FullWidthProgressBar = function () {
    return data;
  };

  return data;
}

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

function _Ansi() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/Ansi"));

  _Ansi = function () {
    return data;
  };

  return data;
}

function _TextRenderer() {
  const data = require("../../../../../nuclide-commons-ui/TextRenderer");

  _TextRenderer = function () {
    return data;
  };

  return data;
}

function _debounce() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/debounce"));

  _debounce = function () {
    return data;
  };

  return data;
}

function _parseText() {
  const data = _interopRequireDefault(require("../parseText"));

  _parseText = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const AnsiRenderSegment = ({
  key,
  style,
  content
}) => React.createElement("span", {
  key: key,
  style: style,
  className: "nuclide-console-default-text-colors"
}, (0, _parseText().default)(content));

const ONE_DAY = 1000 * 60 * 60 * 24;

class RecordView extends React.Component {
  constructor(props) {
    super(props); // The MeasuredComponent can call this many times in quick succession as the
    // child components render, so we debounce it since we only want to know about
    // the height change once everything has settled down

    this.measureAndNotifyHeight = () => {
      if (this._wrapper == null) {
        return;
      }

      const {
        offsetHeight
      } = this._wrapper;
      this.props.onHeightChange(this.props.record, offsetHeight);
    };

    this._handleRecordWrapper = wrapper => {
      this._wrapper = wrapper;
    };

    this._debouncedMeasureAndNotifyHeight = (0, _debounce().default)(this.measureAndNotifyHeight, 10);
  }

  componentDidMount() {
    // We initially assume a height for the record. After it is actually
    // rendered we need it to measure its actual height and report it
    this.measureAndNotifyHeight();
  }

  componentDidUpdate(prevProps) {
    // Record is an immutable object, so any change that would affect a height
    // change should result in us getting a new object.
    if (this.props.record !== prevProps.record) {
      this.measureAndNotifyHeight();
    }
  }

  componentWillUnmount() {
    this._debouncedMeasureAndNotifyHeight.dispose();
  }

  _renderContent() {
    const {
      record
    } = this.props;

    if (record.kind === 'request') {
      // TODO: We really want to use a text editor to render this so that we can get syntax
      // highlighting, but they're just too expensive. Figure out a less-expensive way to get syntax
      // highlighting.
      return React.createElement("pre", null, record.text || ' ');
    } else if (record.kind === 'response') {
      const executor = this.props.getExecutor(record.sourceId);
      return this._renderNestedValueComponent(executor);
    } else if (record.data != null) {
      const provider = this.props.getProvider(record.sourceId);
      return this._renderNestedValueComponent(provider);
    } else {
      // If there's not text, use a space to make sure the row doesn't collapse.
      const text = record.text || ' ';

      if (record.format === 'ansi') {
        return React.createElement(_Ansi().default, {
          renderSegment: AnsiRenderSegment
        }, text);
      }

      return React.createElement("pre", null, (0, _parseText().default)(text));
    }
  }

  shouldComponentUpdate(nextProps) {
    return !(0, _shallowequal().default)(this.props, nextProps);
  }

  _renderNestedValueComponent(provider) {
    const {
      record,
      expansionStateId
    } = this.props;
    const getProperties = provider == null ? null : provider.getProperties;
    const type = record.data == null ? null : record.data.type;

    if (type === 'objects') {
      // Render multiple objects.
      const children = [];

      for (const [index, object] of (0, _nullthrows().default)((_record$data = record.data) === null || _record$data === void 0 ? void 0 : _record$data.objects).entries()) {
        var _record$data;

        const evaluationResult = {
          description: object.description,
          type: object.type || '',
          // $FlowFixMe: that isn't an object ID,
          objectId: object.expression
        };
        const simpleValueComponent = getComponent(object.type); // Each child must have it's own expansion state ID.

        const expansionStateKey = 'child' + index;

        if (!expansionStateId[expansionStateKey]) {
          expansionStateId[expansionStateKey] = {};
        }

        if (object.expression.reference === 0) {
          children.push(React.createElement(_SimpleValueComponent().default, {
            expression: null,
            evaluationResult: {
              type: object.type != null ? object.type : 'text',
              value: object.expression.getValue()
            }
          }));
        } else {
          children.push(React.createElement(_LazyNestedValueComponent().LazyNestedValueComponent, {
            className: "console-lazy-nested-value",
            evaluationResult: evaluationResult,
            fetchChildren: getProperties,
            simpleValueComponent: simpleValueComponent,
            shouldCacheChildren: true,
            expansionStateId: expansionStateId[expansionStateKey]
          }));
        }
      }

      return React.createElement("span", {
        className: "console-multiple-objects"
      }, children);
    } else {
      // Render single object.
      const simpleValueComponent = getComponent(type);
      return React.createElement(_LazyNestedValueComponent().LazyNestedValueComponent, {
        className: "console-lazy-nested-value",
        evaluationResult: record.data,
        fetchChildren: getProperties,
        simpleValueComponent: simpleValueComponent,
        shouldCacheChildren: true,
        expansionStateId: expansionStateId
      });
    }
  }

  render() {
    var _sourceName;

    const {
      record
    } = this.props;
    const {
      level,
      kind,
      timestamp,
      sourceId,
      sourceName
    } = record;
    const classNames = (0, _classnames().default)('console-record', `level-${level || 'log'}`, {
      request: kind === 'request',
      response: kind === 'response'
    });
    const iconName = getIconName(record); // flowlint-next-line sketchy-null-string:off

    const icon = iconName ? React.createElement("span", {
      className: `icon icon-${iconName}`
    }) : null;
    const sourceLabel = this.props.showSourceLabel ? React.createElement("span", {
      className: `console-record-source-label ${getHighlightClassName(level)}`
    }, (_sourceName = sourceName) !== null && _sourceName !== void 0 ? _sourceName : sourceId) : null;
    let renderedTimestamp;

    if (timestamp != null) {
      const timestampLabel = Date.now() - timestamp > ONE_DAY ? timestamp.toLocaleString() : timestamp.toLocaleTimeString();
      renderedTimestamp = React.createElement("div", {
        className: "console-record-timestamp"
      }, timestampLabel);
    }

    return React.createElement(_MeasuredComponent().MeasuredComponent, {
      onMeasurementsChanged: this._debouncedMeasureAndNotifyHeight
    }, React.createElement("div", {
      ref: this._handleRecordWrapper,
      className: classNames
    }, icon, React.createElement("div", {
      className: "console-record-content-wrapper"
    }, record.repeatCount > 1 && React.createElement("div", {
      className: "console-record-duplicate-number"
    }, record.repeatCount), React.createElement("div", {
      className: "console-record-content"
    }, this._renderContent())), sourceLabel, renderedTimestamp, React.createElement(_FullWidthProgressBar().default, {
      progress: null,
      visible: record.incomplete
    })));
  }

}

exports.default = RecordView;

function getComponent(type) {
  switch (type) {
    case 'text':
      return props => (0, _TextRenderer().TextRenderer)(props.evaluationResult);

    case 'boolean':
    case 'string':
    case 'number':
    case 'object':
    default:
      return _SimpleValueComponent().default;
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