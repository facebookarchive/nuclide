"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */
class CommandDispatcher {
  constructor(aliases) {
    this._commands = [];
    this._aliases = aliases;
  }

  registerCommand(command) {
    this._commands.push(command);
  }

  getCommands() {
    return this._commands;
  }

  getCommandsMatching(prefix) {
    const re = new RegExp(`^${prefix}`);
    return this._commands.filter(x => x.name.match(re));
  }

  commandListToString(commands) {
    const names = commands.map(_ => _.name);
    return `"${names.join('", "')}"`;
  }

  async execute(line) {
    let tail = line;
    const tokens = []; // Here we're looking for quoted arguments.
    // \1 is the contents of a single-quoted arg that may contain spaces
    // \2 is a space-delimited arg if there are no quotes
    // \3 is the rest of the command line

    const tokenizer = /^\s*(?:('([^']*)')|(\S+))\s*(.*)$/;

    while (tail.length > 0) {
      const match = tail.match(tokenizer);

      if (match == null) {
        break;
      }

      const [,, quoted, unquoted, rest] = match;
      tokens.push(quoted != null ? quoted : unquoted);
      tail = rest;
    }

    return this.executeTokenizedLine(tokens);
  }

  async executeTokenizedLine(tokens) {
    if (tokens.length === 0 || !tokens[0]) {
      return;
    } // Get all commands of which the given command is a prefix


    const cmd = tokens[0]; // resolve aliases

    const alias = this.resolveAlias(tokens);

    if (alias != null) {
      return this.execute(alias);
    }

    const matches = this.getCommandsMatching(cmd);

    if (matches.length === 0) {
      return new Error(`No command matches "${cmd}".`);
    }

    if (matches.length > 1) {
      const list = this.commandListToString(matches);
      return new Error(`Multiple commands match "${cmd}": ${list}`);
    }

    return new Promise((resolve, reject) => {
      matches[0].execute(tokens.slice(1)).then(_ => resolve(null), _ => resolve(_));
    });
  }

  resolveAlias(tokens) {
    const alias = this._aliases.get(tokens[0]);

    if (alias != null) {
      return `${alias} ${tokens.splice(1).join(' ')}`;
    } // punctuation aliases are things like '=' for print ala hphpd
    // we have to be careful here since we want '=$x' to work to
    // print the value of x
    //
    // Find the longest punctuation alias match


    let puncMatch = null;

    for (const key of this._aliases.keys()) {
      if (key.match(/^[^a-zA-Z0-9]+$/)) {
        if (puncMatch != null && key.length < puncMatch.length) {
          continue;
        }

        if (tokens[0].startsWith(key)) {
          puncMatch = key;
        }
      }
    }

    if (puncMatch != null) {
      const puncAlias = this._aliases.get(puncMatch);

      if (!(puncAlias != null)) {
        throw new Error("Invariant violation: \"puncAlias != null\"");
      }

      const tok0 = tokens[0].substr(puncMatch.length);
      return `${puncAlias} ${tok0} ${tokens.splice(1).join(' ')}`;
    }

    return null;
  }

}

exports.default = CommandDispatcher;