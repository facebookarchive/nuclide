'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import classnames from 'classnames';
import {React} from 'react-for-atom';


import {Button} from '../../nuclide-ui/lib/Button';
import {ButtonExamples} from '../../nuclide-ui/lib/Button.example';
import {ProgressIndicatorExamples} from '../../nuclide-ui/lib/ProgressIndicators.example';
import {CheckboxExamples} from '../../nuclide-ui/lib/Checkbox.example';
import {TabExamples} from '../../nuclide-ui/lib/Tabs.example';
import {RadioGroupExamples} from '../../nuclide-ui/lib/RadioGroup.example';
import {TextInputExamples} from '../../nuclide-ui/lib/TextInputs.example';
import {ToolbarExamples} from '../../nuclide-ui/lib/Toolbar.example';
import {DiagnosticsExamples} from '../../nuclide-ui/lib/Diagnostics.example';
import {BadgeExamples} from '../../nuclide-ui/lib/Badge.example';
import {IconExamples} from '../../nuclide-ui/lib/Icon.example';
import {TreeExamples} from '../../nuclide-ui/lib/Tree.example';

const playgroundComponents = [
  ButtonExamples,
  ProgressIndicatorExamples,
  CheckboxExamples,
  TabExamples,
  RadioGroupExamples,
  TextInputExamples,
  ToolbarExamples,
  DiagnosticsExamples,
  BadgeExamples,
  IconExamples,
  TreeExamples,
];

type ComponentSpec = {
  sectionName: string;
  description: string;
  examples: Array<{
    title: string;
    component: React.Component | () => React.Element;
  }>;
};

type State = {
  collapsedSections: Set<string>;
};

export class Playground extends React.Component {
  state: State;
  static gadgetId = 'sample-ui-playground-gadget';
  static defaultLocation = 'right';

  constructor(props: any) {
    super(props);
    (this: any)._collapseAllSections = this._collapseAllSections.bind(this);
    (this: any).renderExampleForComponent = this.renderExampleForComponent.bind(this);
    this.state = {
      collapsedSections: new Set(),
    };
  }

  getTitle(): string {
    return 'Nuclide UI Playground';
  }

  getIconName(): string {
    return 'puzzle';
  }

  _collapseAllSections(): void {
    this.setState({
      collapsedSections: new Set(playgroundComponents.map(spec => spec.sectionName)),
    });
  }

  _toggleSection(sectionName: string): void {
    const {collapsedSections} = this.state;
    if (collapsedSections.has(sectionName)) {
      collapsedSections.delete(sectionName);
    } else {
      collapsedSections.add(sectionName);
    }
    this.forceUpdate();
  }

  renderExampleForComponent(
    spec: ComponentSpec,
    index: number,
  ): React.Element {
    const {
      sectionName,
      description,
      examples,
    } = spec;
    let renderedDescription;
    let flattenedExample;
    const isCollapsed = this.state.collapsedSections.has(sectionName);
    if (!isCollapsed) {
      flattenedExample = [].concat(...examples.map((example, i) => {
        const {
          title,
          // $FlowIssue
          component: Component,
        } = example;
        return [
          <h2 key={`${index}:${i}t`}>{title}</h2>,
          <div key={`${index}:${i}c`} className="nuclide-ui-playground-example">
            <Component />
          </div>,
        ];
      }));
      renderedDescription = <p>{description}</p>;
    }
    const h1ClassName = classnames({
      'nuclide-ui-playground-section-headline-collapsed': isCollapsed,
    });
    return (
      <section className="nuclide-ui-playground-section bordered">
        <h1 className={h1ClassName} onClick={this._toggleSection.bind(this, sectionName)}>
          {sectionName}
        </h1>
        {renderedDescription}
        {flattenedExample}
      </section>
    );
  }

  render(): React.Element {
    const renderedExamples = playgroundComponents.map(this.renderExampleForComponent);
    return (
      <div className="nuclide-ui-playground">
        <div className="nuclide-ui-playground-header">
          <Button onClick={this._collapseAllSections}>Collapse all sections</Button>
        </div>
        {renderedExamples}
      </div>
    );
  }
}
