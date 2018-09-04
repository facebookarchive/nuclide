"use strict";

module.exports = _client => {
  const remoteModule = {};

  remoteModule.startDaemon = function (arg0) {
    return _client.callRemoteFunction("RsyncService/startDaemon", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "root",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "DaemonReadyMessage"
      });
    }).publish();
  };

  remoteModule.syncFolder = function (arg0, arg1) {
    return _client.callRemoteFunction("RsyncService/syncFolder", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "from",
      type: {
        kind: "string"
      }
    }, {
      name: "to",
      type: {
        kind: "string"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "number"
      });
    }).publish();
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    DaemonReadyMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "RsyncService.js",
        line: 21
      },
      name: "DaemonReadyMessage",
      definition: {
        kind: "object",
        fields: [{
          name: "version",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "port",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    startDaemon: {
      kind: "function",
      name: "startDaemon",
      location: {
        type: "source",
        fileName: "RsyncService.js",
        line: 33
      },
      type: {
        location: {
          type: "source",
          fileName: "RsyncService.js",
          line: 33
        },
        kind: "function",
        argumentTypes: [{
          name: "root",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "DaemonReadyMessage"
          }
        }
      }
    },
    syncFolder: {
      kind: "function",
      name: "syncFolder",
      location: {
        type: "source",
        fileName: "RsyncService.js",
        line: 110
      },
      type: {
        location: {
          type: "source",
          fileName: "RsyncService.js",
          line: 110
        },
        kind: "function",
        argumentTypes: [{
          name: "from",
          type: {
            kind: "string"
          }
        }, {
          name: "to",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "number"
          }
        }
      }
    }
  }
});