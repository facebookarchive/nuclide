'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {DiagnosticMessage} from '../../nuclide-diagnostics-common';

import DiagnosticsPane from './DiagnosticsPane';
import {Checkbox} from '../../nuclide-ui/lib/Checkbox';
import {PanelComponent} from '../../nuclide-ui/lib/PanelComponent';
import {Toolbar} from '../../nuclide-ui/lib/Toolbar';
import {ToolbarCenter} from '../../nuclide-ui/lib/ToolbarCenter';
import {ToolbarLeft} from '../../nuclide-ui/lib/ToolbarLeft';
import {ToolbarRight} from '../../nuclide-ui/lib/ToolbarRight';
import {React} from 'react-for-atom';
import {
  Button,
  ButtonSizes,
} from '../../nuclide-ui/lib/Button';
import {track} from '../../nuclide-analytics';

type Props = {
  diagnostics: Array<DiagnosticMessage>,
  height: number,
  width: number,
  onDismiss: () => mixed,
  pathToActiveTextEditor: ?NuclideUri,
  filterByActiveTextEditor: boolean,
  onFilterByActiveTextEditorChange: (isChecked: boolean) => mixed,
  warnAboutLinter: boolean,
  disableLinter: () => mixed,
};

/**
 * Dismissable panel that displays the diagnostics from nuclide-diagnostics-store.
 */
class DiagnosticsPanel extends React.Component {
  props: Props;

  constructor(props: mixed) {
    super(props);
    (this: any)._onFilterByActiveTextEditorChange =
      this._onFilterByActiveTextEditorChange.bind(this);
  }

  render(): React.Element<any> {
    let warningCount = 0;
    let errorCount = 0;
    let {diagnostics} = this.props;
    if (this.props.filterByActiveTextEditor && this.props.pathToActiveTextEditor) {
      const pathToFilterBy = this.props.pathToActiveTextEditor;
      diagnostics = diagnostics.filter(
        diagnostic => diagnostic.scope === 'file' && diagnostic.filePath === pathToFilterBy,
      );
    }
    diagnostics.forEach(diagnostic => {
      if (diagnostic.type === 'Error') {
        ++errorCount;
      } else if (diagnostic.type === 'Warning') {
        ++warningCount;
      }
    });

    let linterWarning = null;
    if (this.props.warnAboutLinter) {
      linterWarning = (
        <Toolbar>
          <ToolbarCenter>
            <span className="inline-block highlight-info">
              nuclide-diagnostics is not compatible with the linter package. We recommend that
              you&nbsp;<a onClick={this.props.disableLinter}>disable the linter package</a>.&nbsp;
              <a href="http://nuclide.io/docs/advanced-topics/linter-package-compatibility/">
              Learn More</a>.
            </span>
          </ToolbarCenter>
        </Toolbar>
      );
    }

    const errorSpanClassName = `inline-block ${errorCount > 0 ? 'text-error' : ''}`;
    const warningSpanClassName = `inline-block ${warningCount > 0 ? 'text-warning' : ''}`;

    // We hide the horizontal overflow in the PanelComponent because the presence of the scrollbar
    // throws off our height calculations.
    return (
      <PanelComponent
        ref="panel"
        dock="bottom"
        initialLength={this.props.height}
        noScroll={true}
        overflowX="hidden">
        <div style={{display: 'flex', flex: 1, flexDirection: 'column'}}>
          {linterWarning}
          <Toolbar location="top">
            <ToolbarLeft>
              <span className={errorSpanClassName}>
                Errors: {errorCount}
              </span>
              <span className={warningSpanClassName}>
                Warnings: {warningCount}
              </span>
            </ToolbarLeft>
            <ToolbarRight>
              <span className="inline-block">
                <Checkbox
                  checked={this.props.filterByActiveTextEditor}
                  label="Show only diagnostics for current file"
                  onChange={this._onFilterByActiveTextEditorChange}
                />
              </span>
              <Button
                onClick={this.props.onDismiss}
                icon="x"
                size={ButtonSizes.SMALL}
                className="inline-block"
                title="Close Panel"
              />
            </ToolbarRight>
          </Toolbar>
          <DiagnosticsPane
            showFileName={!this.props.filterByActiveTextEditor}
            diagnostics={diagnostics}
            width={this.props.width}
          />
        </div>
      </PanelComponent>
    );
  }

  _onFilterByActiveTextEditorChange(isChecked: boolean) {
    track('diagnostics-panel-toggle-current-file', {isChecked: isChecked.toString()});
    this.props.onFilterByActiveTextEditorChange.call(null, isChecked);
  }
}

module.exports = DiagnosticsPanel;
