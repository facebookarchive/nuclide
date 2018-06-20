'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _marked;

function _load_marked() {
  return _marked = _interopRequireDefault(require('marked'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('../../../modules/nuclide-commons-ui/Icon');
}

var _react = _interopRequireWildcard(require('react'));

var _SettingsTooltip;

function _load_SettingsTooltip() {
  return _SettingsTooltip = _interopRequireDefault(require('./SettingsTooltip'));
}

var _StatusTooltip;

function _load_StatusTooltip() {
  return _StatusTooltip = _interopRequireDefault(require('./StatusTooltip'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const SETTINGS_NAME = 'settings';
const kindPriorities = ['red', 'yellow', 'green'];

class StatusComponent extends _react.Component {
  // A projection from serverStatuses that retains identity unless providers change

  // Used to debounce hover state changes.
  constructor() {
    super();
    // $FlowFixMe: debounce() is not in flow types for rxjs
    this._tooltipRefs = new Map();
    this._hoveredProviderName = new _rxjsBundlesRxMinJs.BehaviorSubject(null);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._providersCache = [];
    this.state = {
      hoveredProviderName: null
    };

    this._renderBar = statuses => {
      const kind = statuses.map(([s, visible]) => s.data.kind).sort((k1, k2) => kindPriorities.indexOf(k1) - kindPriorities.indexOf(k2))[0];
      return _react.createElement('div', {
        className: (0, (_classnames || _load_classnames()).default)('nuclide-language-status-bar', {
          'nuclide-language-status-bar-green': kind === 'green',
          'nuclide-language-status-bar-yellow': kind === 'yellow',
          'nuclide-language-status-bar-red': kind === 'red'
        })
      });
    };

    this._renderProvider = (status, visible) => {
      const { provider, data } = status;

      const icon = this._renderIcon(provider);
      const progress = this._renderProgress(data);

      return _react.createElement(
        'div',
        {
          className: (0, (_classnames || _load_classnames()).default)('nuclide-language-status-provider', 'nuclide-language-status-provider-' + data.kind),
          onMouseOver: this._onMouseOver,
          onMouseOut: this._onMouseOut,
          'data-name': status.provider.name,
          key: status.provider.name,
          style: { opacity: visible ? 1 : 0 },
          ref: this._setTooltipRef },
        icon,
        progress,
        this.state.hoveredProviderName !== provider.name ? null : _react.createElement((_StatusTooltip || _load_StatusTooltip()).default, {
          parentRef: this._tooltipRefs.get(status.provider.name),
          status: status,
          editor: this.props.editor
        })
      );
    };

    this._setTooltipRef = ref => {
      if (ref == null) {
        return;
      }
      this._tooltipRefs.set(ref.dataset.name, ref);
    };

    this._onMouseOver = e => {
      this._hoveredProviderName.next(e.currentTarget.dataset.name);
    };

    this._onMouseOut = () => {
      this._hoveredProviderName.next(null);
    };

    const hoveredProviderNameDebounced = this._hoveredProviderName.debounce(hoveredProviderName => {
      // No debounce when hovering on to, 250ms debounce when hovering off of
      return _rxjsBundlesRxMinJs.Observable.empty().delay(hoveredProviderName != null ? 0 : 250);
    });
    this._disposables.add(hoveredProviderNameDebounced.subscribe(hoveredProviderName => {
      this.setState({ hoveredProviderName });
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const { settings } = this.props;
    const statuses = this.props.serverStatuses.filter(status => {
      // For a status to be potentially visible, (1) the user has to have set its
      // preference to be shown (always/on-progress/on-errors), and (2) the status
      // provider must have reported a non-null status.data.kind.
      const settingKind = settings.get(status.provider);
      return settingKind != null && settingKind !== 'null' && status.data.kind !== 'null';
    }).map(status => {
      // A status tab will be either "visible" (because of a combination
      // of the user's preference plus the current status.data.kind) or just
      // "contingently-visible" (i.e. visible only when you hover)
      const kind = settings.get(status.provider);
      const visible = kindPriorities.indexOf(kind) >= kindPriorities.indexOf(status.data.kind);
      return [status, visible];
    }).sort(([a, aVisible], [b, bVisible]) => {
      // We'll sort the contingently-visible ones all to the left and the visible
      // ones to the right. That way there won't be any gaps amongst visible ones.
      // And within that, we'll sort by priority.
      if (aVisible !== bVisible) {
        return aVisible ? 1 : -1;
      } else if (a.provider.priority !== b.provider.priority) {
        return a.provider.priority - b.provider.priority;
      } else {
        return a.provider.name.localeCompare(b.provider.name);
      }
    });
    return _react.createElement(
      'div',
      { className: 'nuclide-language-status-container' },
      this._renderBar(statuses),
      _react.createElement(
        'div',
        { className: 'nuclide-language-status-providers-container' },
        this._renderSettings(),
        statuses.map(([status, visible]) => this._renderProvider(status, this.state.hoveredProviderName != null || visible))
      )
    );
  }

  _renderSettings() {
    // Update _providersCache only if the set of providers has changed.
    // This is so the content of the settings tooltip only re-renders if
    // absolutely needed.
    const newCache = this.props.serverStatuses.map(({ provider, _ }) => provider);
    const newCacheValue = newCache.map(p => p.name).join(',');
    const oldCacheValue = this._providersCache.map(p => p.name).join(',');
    if (newCacheValue !== oldCacheValue) {
      this._providersCache = newCache;
    }

    return _react.createElement(
      'div',
      {
        className: 'nuclide-language-status-provider nuclide-language-status-provider-settings',
        'data-name': SETTINGS_NAME,
        key: SETTINGS_NAME,
        onMouseOver: this._onMouseOver,
        onMouseOut: this._onMouseOut,
        style: { opacity: this.state.hoveredProviderName != null ? 1 : 0 },
        ref: this._setTooltipRef },
      _react.createElement((_Icon || _load_Icon()).Icon, { className: 'nuclide-language-status-icon', icon: 'gear' }),
      this.state.hoveredProviderName !== SETTINGS_NAME ? null : _react.createElement((_SettingsTooltip || _load_SettingsTooltip()).default, {
        onUpdateSettings: this.props.onUpdateSettings,
        parentRef: this._tooltipRefs.get('settings'),
        providers: this._providersCache,
        settings: this.props.settings
      })
    );
  }

  _renderIcon(provider) {
    const { icon, iconMarkdown, name } = provider;
    if (icon != null) {
      return _react.createElement((_Icon || _load_Icon()).Icon, { className: 'nuclide-language-status-icon', icon: icon });
    }
    if (iconMarkdown != null) {
      return _react.createElement('div', {
        dangerouslySetInnerHTML: {
          __html: (0, (_marked || _load_marked()).default)(iconMarkdown)
        }
      });
    }
    // Default to showing the capitalized first letter of the server's name
    return _react.createElement(
      'div',
      null,
      name.substr(0, 1).toUpperCase()
    );
  }

  _renderProgress(data) {
    if (data.kind !== 'yellow') {
      return null;
    }
    if (data.shortMessage != null) {
      return data.shortMessage;
    }
    if (data.progress != null) {
      const { numerator, denominator } = data.progress;
      return Math.round(numerator / (denominator == null ? 100 : denominator) * 100) + '%';
    }
    return null;
  }

}
exports.default = StatusComponent;