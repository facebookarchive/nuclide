/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  InstallServerPrompt,
  UpdateServerPrompt,
  Prompt,
} from 'big-dig/src/client/SshHandshake';
import * as vscode from 'vscode';

// Helper to concatenate regular expressions
function concatRegex(...args: RegExp[]): RegExp {
  return new RegExp(String.prototype.concat(...args.map(x => x.source)));
}

// Regular expression to detect whether a prompt is for Duo 2-factor
const duoPrompt = concatRegex(
  /^\s*/,
  /(Login request denied.)?\s*/,
  /(Incorrect passcode. Please try again.)?\s*/,
  /Visit http:\/\/fburl.com\/2fac if you have problems logging in.\s*/,
  /Duo two-factor login for .*\s*/,
  /Enter a passcode or select one of the following options:\s*/,
  /(?:\d+[.] Duo Push to XXX-XXX-\d{4}\s*)*/,
  /Passcode or option (?:.*?):\s*$/,
);

// Regular expression to detect whether prompt is an ordinary password prompt.
// Can be seen when connecting to localhost.
const passwordPrompt = /^\s*Password:\s*/;

/** Controls how verbose prompts are displayed to the user. */
class VerbosePromptOutput {
  _out: ?vscode.OutputChannel;

  message(message: string) {
    if (this._out == null) {
      this._out = vscode.window.createOutputChannel(
        'Remote Connection Authentication',
      );
    }
    const out = this._out;
    out.appendLine(message);
    out.show(true);
  }

  clear() {
    if (this._out != null) {
      this._out.clear();
    }
  }

  dispose(): void {
    if (this._out != null) {
      this._out.dispose();
    }
  }
}

export type ConnectionPromptParams = {
  hostname: string,
  autoUpdate: boolean,
  canceller?: vscode.CancellationTokenSource,
};

/**
 * Returns a function that manages the user experience for entering
 * authentication information by presenting a series of prompts to the user and
 * gathering user input.
 *
 * If the type of prompt is unrecognized, it will display the full instructions
 * to the user in an output pane. But if it is a known prompt (e.g. Duo),
 * then an abbreviated message will be shown to the user.
 *
 * If the user cancels the prompt, then this will
 *  1) return an array of all the responses collected so far
 *  2) and call `canceller.cancel()` (if provided).
 *
 * @param canceller Will be cancelled if the user cancels the prompt.
 */
export default function connectionPrompt(
  progress: vscode.Progress<{message?: string}>,
  params: ConnectionPromptParams,
) {
  return async function(
    name: string,
    instructions: string,
    instructionsLang: string,
    prompts: Array<Prompt>,
  ): Promise<Array<string>> {
    const verbose = new VerbosePromptOutput();
    const response: Array<string> = [];

    let step = 1;
    for (const p of prompts) {
      progress.report({
        message: progressMessage(p, step, prompts.length, params.hostname),
      });

      // eslint-disable-next-line no-await-in-loop
      const answer = await doPrompt(p, verbose, params);
      if (answer == null) {
        // Stop asking for prompts and return with the just responses we've already acquired
        if (params.canceller) {
          params.canceller.cancel();
        }
        break;
      }
      response.push(answer);

      ++step;
    }

    verbose.dispose();

    progress.report({} /* reset the progress message */);
    // Send the user's responses back
    return response;
  };
}

/**
 * Formats the progress message. If there is more than one authentication
 * step involved, then also show e.g. "(1/2)" for the first step of two.
 */
function progressMessage(
  prompt: Prompt,
  step: number,
  stepCount: number,
  hostname: string,
): string {
  let stepMsg = '';
  if (stepCount > 1) {
    stepMsg = ` (${step}/${stepCount})`;
  }
  switch (prompt.kind) {
    case 'ssh':
    case 'private-key':
      return `Authentication required for ${hostname} ${stepMsg}`;
    case 'install':
    case 'update':
    default:
      return `Feedback required for ${hostname} ${stepMsg}`;
  }
}

/**
 * This displays an abbreviated Duo two-factor prompt. If the user enters
 * 'help', then this will show the full prompt message. If the user presses
 * `enter` without a password, then treat it as 'push'.
 * @param {*} isPassword true if the typed text should be obscured
 * @param {*} fullPrompt the full prompt message
 */
async function doDuoPrompt(
  isPassword: boolean,
  fullPrompt: string,
  verbose: VerbosePromptOutput,
): Promise<?string> {
  // $FlowFixMe (>= v0.75.0)
  const match: RegExp$matchResult = duoPrompt.exec(fullPrompt);
  // Attempt to pull out any response message from auth (mutually exclusive):
  // match[1] = "Login request denied."
  // match[2] = "Incorrect passcode. Please try again."
  const prompt = match[1] || match[2] || 'Enter Duo 2-factor';
  const placeHolder = "passcode | 'push' | 'help'";

  const password = await vscode.window.showInputBox({
    password: isPassword,
    ignoreFocusOut: true,
    placeHolder,
    prompt,
  });

  if (password === 'help') {
    return doGenericPrompt(isPassword, fullPrompt, verbose);
  } else if (password === '') {
    return 'push';
  } else {
    return password;
  }
}

/**
 * This displays a simple password prompt.
 * @param retry `true` if this is a password-retry attempt
 */
function doPasswordPrompt(retry: boolean): Promise<?string> {
  const prompt = retry
    ? 'Authentication failed. Enter password.'
    : 'Enter password.';
  return vscode.window.showInputBox({
    password: true,
    ignoreFocusOut: true,
    placeHolder: 'password',
    prompt,
  });
}

/** A catch-all prompt */
async function doGenericPrompt(
  isPassword: boolean,
  prompt: string,
  verbose: VerbosePromptOutput,
): Promise<?string> {
  verbose.message(prompt);
  const password = await vscode.window.showInputBox({
    password: isPassword,
    ignoreFocusOut: true,
    prompt: isPassword
      ? 'Enter password. Refer to the output panel below for instructions.'
      : 'Refer to the output panel below for instructions.',
  });
  verbose.clear();
  return password;
}

async function doInstallServerPrompt(prompt: InstallServerPrompt) {
  const answer = await vscode.window.showWarningMessage(
    `A remote server is not installed in \`${
      prompt.installationPath
    }\`. Install?`,
    {title: 'Abort', isCloseAffordance: true},
    {title: 'Install', isCloseAffordance: false},
  );
  if (answer != null && answer.title === 'Install') {
    return 'install';
  } else {
    return 'abort';
  }
}

async function doUpdateServerPrompt(prompt: UpdateServerPrompt) {
  const answer = await vscode.window.showWarningMessage(
    `The remote server is version ${prompt.current}, but ${
      prompt.expected
    } is needed. Update?`,
    {title: 'Abort', isCloseAffordance: true},
    {title: 'Update', isCloseAffordance: false},
  );
  if (answer != null && answer.title === 'Update') {
    return 'update';
  } else {
    return 'abort';
  }
}

/**
 * Prompts the user for authentication. Depending on the type of the prompt,
 * this forwards the handling to a more specific UI experience.
 * @return the user's answer or null/undefined if cancelled.
 */
function doPrompt(
  prompt: Prompt,
  verbose: VerbosePromptOutput,
  params: ConnectionPromptParams,
): Promise<?string> {
  if (prompt.kind === 'install') {
    return doInstallServerPrompt(prompt);
  } else if (prompt.kind === 'update' && params.autoUpdate) {
    return Promise.resolve('update');
  } else if (prompt.kind === 'update') {
    return doUpdateServerPrompt(prompt);
  } else if (prompt.kind === 'private-key') {
    return doPasswordPrompt(prompt.retry);
  } else if (prompt.kind === 'ssh' && duoPrompt.test(prompt.prompt)) {
    return doDuoPrompt(!prompt.echo, prompt.prompt, verbose);
  } else if (prompt.kind === 'ssh' && passwordPrompt.test(prompt.prompt)) {
    return doPasswordPrompt(false);
  } else {
    return doGenericPrompt(!prompt.echo, prompt.prompt, verbose);
  }
}
