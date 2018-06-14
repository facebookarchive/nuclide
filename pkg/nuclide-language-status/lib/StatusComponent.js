/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {StatusData} from '../../nuclide-language-service/lib/LanguageService';
import type {LanguageStatusProvider, StatusKind} from './types';

import marked from 'marked';
import classnames from 'classnames';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Icon} from 'nuclide-commons-ui/Icon';
import * as React from 'react';
import SettingsTooltip from './SettingsTooltip';
import StatusTooltip from './StatusTooltip';

export type ServerStatus = {
  provider: LanguageStatusProvider,
  data: StatusData,
};

type Props = {
  serverStatuses: Array<ServerStatus>,
  settings: Map<LanguageStatusProvider, StatusKind>,
  onUpdateSettings: (
    newSettings: Map<LanguageStatusProvider, StatusKind>,
  ) => void,
  editor: atom$TextEditor,
};

type State = {
  hovered: boolean,
};

const kindPriorities: Array<StatusKind> = ['red', 'yellow', 'green'];

export default class StatusComponent extends React.Component<Props, State> {
  _tooltipRefs: Map<string, HTMLElement> = new Map();
  _disposables: UniversalDisposable = new UniversalDisposable();

  state: State = {
    hovered: false,
  };

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render(): React.Node {
    const {settings} = this.props;
    const statuses = this.props.serverStatuses.filter(
      status => status.data.kind !== 'null',
    );
    // Shown statuses correspond to which statuses we show icons for.
    const shownStatuses = statuses.filter(status => {
      const kind = settings.get(status.provider);
      return (
        kind != null &&
        kindPriorities.indexOf(kind) >= kindPriorities.indexOf(status.data.kind)
      );
    });
    // Non hidden statuses correspond to which statuses affect the bar color.
    const nonHiddenStatuses = statuses.filter(status => {
      const kind = settings.get(status.provider);
      return kind != null && kind !== 'null';
    });
    return (
      <div
        onMouseEnter={() => this.setState({hovered: true})}
        onMouseLeave={() => this.setState({hovered: false})}
        className="nuclide-language-status-container">
        {this._renderBar(nonHiddenStatuses)}
        <div className="nuclide-language-status-providers-container">
          {this._renderSettings()}
          {shownStatuses.map(status => this._renderProvider(status, false))}
        </div>
      </div>
    );
  }

  _renderSettings(): React.Node {
    return (
      <div
        className="nuclide-language-status-provider nuclide-language-status-provider-settings"
        data-name="settings"
        key="settings"
        style={{opacity: this.state.hovered ? 1 : 0}}
        ref={this._setTooltipRef}>
        <Icon className="nuclide-language-status-icon" icon="gear" />
        <SettingsTooltip
          onUpdateSettings={this.props.onUpdateSettings}
          parentRef={this._tooltipRefs.get('settings')}
          settings={this.props.settings}
        />
      </div>
    );
  }

  _renderBar = (statuses: Array<ServerStatus>): React.Node => {
    const kind: ?StatusKind = statuses
      .map(s => s.data.kind)
      .sort(
        (k1, k2) => kindPriorities.indexOf(k1) - kindPriorities.indexOf(k2),
      )[0];
    return (
      <div
        className={classnames('nuclide-language-status-bar', {
          'nuclide-language-status-bar-green': kind === 'green',
          'nuclide-language-status-bar-yellow': kind === 'yellow',
          'nuclide-language-status-bar-red': kind === 'red',
        })}
      />
    );
  };

  _renderProvider = (status: ServerStatus, hidden: boolean): React.Node => {
    const {provider, data} = status;

    // Use icon if present otherwise the first letter of the name, capitalized.
    const icon = this._renderIcon(provider);
    const progress = this._renderProgress(data);

    return (
      <div
        className={classnames(
          'nuclide-language-status-provider',
          'nuclide-language-status-provider-' + data.kind,
        )}
        data-name={status.provider.name}
        key={status.provider.name}
        style={{opacity: hidden ? 0 : 1}}
        ref={this._setTooltipRef}>
        {icon}
        {progress}
        <StatusTooltip
          parentRef={this._tooltipRefs.get(status.provider.name)}
          status={status}
          editor={this.props.editor}
        />
      </div>
    );
  };

  _renderIcon(provider: LanguageStatusProvider): React.Node {
    const {icon, iconMarkdown, name} = provider;
    if (icon != null) {
      return <Icon className="nuclide-language-status-icon" icon={icon} />;
    }
    if (iconMarkdown != null) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: marked(iconMarkdown),
          }}
        />
      );
    }
    // Default to showing the capitalized first letter of the server's name
    return <div>{name.substr(0, 1).toUpperCase()}</div>;
  }

  _renderProgress(data: StatusData): ?string {
    if (data.kind !== 'yellow') {
      return null;
    }
    if (data.shortMessage != null) {
      return data.shortMessage;
    }
    if (data.progress != null) {
      const {numerator, denominator} = data.progress;
      return (
        Math.round(
          (numerator / (denominator == null ? 100 : denominator)) * 100,
        ) + '%'
      );
    }
    return null;
  }

  _setTooltipRef = (ref: React.ElementRef<any>): void => {
    if (ref == null) {
      return;
    }
    this._tooltipRefs.set(ref.dataset.name, ref);
  };
}
