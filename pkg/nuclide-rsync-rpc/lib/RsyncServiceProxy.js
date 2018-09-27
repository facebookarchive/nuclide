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
        name: "RsyncDaemonReadyMessage"
      });
    }).publish();
  };

  remoteModule.getVersion = function () {
    return _client.callRemoteFunction("RsyncService/getVersion", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "RsyncVersionInfo"
      });
    });
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
    RsyncDaemonReadyMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "RsyncService.js",
        line: 26
      },
      name: "RsyncDaemonReadyMessage",
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
        line: 38
      },
      type: {
        location: {
          type: "source",
          fileName: "RsyncService.js",
          line: 38
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
            name: "RsyncDaemonReadyMessage"
          }
        }
      }
    },
    RsyncVersionInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "RsyncService.js",
        line: 115
      },
      name: "RsyncVersionInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "rsyncVersion",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "protocolVersion",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    getVersion: {
      kind: "function",
      name: "getVersion",
      location: {
        type: "source",
        fileName: "RsyncService.js",
        line: 120
      },
      type: {
        location: {
          type: "source",
          fileName: "RsyncService.js",
          line: 120
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "RsyncVersionInfo"
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
        line: 137
      },
      type: {
        location: {
          type: "source",
          fileName: "RsyncService.js",
          line: 137
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