'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';

import {ButtonExamples} from '../../nuclide-ui/lib/Button.example';
import {ProgressIndicatorExamples} from '../../nuclide-ui/lib/ProgressIndicators.example';

const playgroundComponents = [
  ButtonExamples,
  ProgressIndicatorExamples,
];

type ComponentSpec = {
  sectionName: string;
  description: string;
  examples: Array<{
    title: string;
    component: ReactComponent | () => ReactElement;
  }>;
}

export class Playground extends React.Component {
  static gadgetId = 'sample-ui-playground-gadget';
  static defaultLocation = 'right';

  getTitle(): string {
    return 'Nuclide UI Playground';
  }

  getIconName(): string {
    return 'puzzle';
  }

  renderExampleForComponent(
    spec: ComponentSpec,
    index: number,
  ): ReactElement {
    const {
      sectionName,
      description,
      examples,
    } = spec;
    const flattenedExample = [].concat(...examples.map((example, i) => {
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
    return (
      <section className="nuclide-ui-playground-bordered">
        <h1>{sectionName}</h1>
        <p>{description}</p>
        {flattenedExample}
      </section>
    );
  }

  render(): ReactElement {
    const renderedExamples = playgroundComponents.map(this.renderExampleForComponent);
    return (
      <div className="nuclide-ui-playground">
        {renderedExamples}
      </div>
    );
  }
}
