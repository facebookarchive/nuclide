"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.initialize = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("OpenFilesService/initialize", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "OpenFilesService.js",
          line: 18
        },
        kind: "named",
        name: "FileNotifier"
      });
    });
  };

  remoteModule.FileNotifier = class {
    constructor() {
      _client.createRemoteObject("FileNotifier", this, [], [])
    }
    onEvent(arg0) {
      return trackOperationTiming("FileNotifier.onEvent", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "event",
          type: {
            location: {
              type: "source",
              fileName: "OpenFilesService.js",
              line: 24
            },
            kind: "named",
            name: "FileEvent"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "OpenFilesService.js",
              line: 23
            },
            name: "FileNotifier"
          }).then(id => {
            return _client.callRemoteMethod(id, "onEvent", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "OpenFilesService.js",
              line: 24
            },
            kind: "void"
          });
        });
      });
    }
    dispose() {
      return _client.disposeRemoteObject(this);
    }
  };
  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
    trackOperationTiming = arguments[1];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["initialize", {
    kind: "function",
    name: "initialize",
    location: {
      type: "source",
      fileName: "OpenFilesService.js",
      line: 18
    },
    type: {
      location: {
        type: "source",
        fileName: "OpenFilesService.js",
        line: 18
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "OpenFilesService.js",
          line: 18
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "OpenFilesService.js",
            line: 18
          },
          kind: "named",
          name: "FileNotifier"
        }
      }
    }
  }], ["FileNotifier", {
    kind: "interface",
    name: "FileNotifier",
    location: {
      type: "source",
      fileName: "OpenFilesService.js",
      line: 23
    },
    constructorArgs: [],
    staticMethods: new Map(),
    instanceMethods: new Map([["onEvent", {
      location: {
        type: "source",
        fileName: "OpenFilesService.js",
        line: 24
      },
      kind: "function",
      argumentTypes: [{
        name: "event",
        type: {
          location: {
            type: "source",
            fileName: "OpenFilesService.js",
            line: 24
          },
          kind: "named",
          name: "FileEvent"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "OpenFilesService.js",
          line: 24
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "OpenFilesService.js",
            line: 24
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "OpenFilesService.js",
        line: 27
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "OpenFilesService.js",
          line: 27
        },
        kind: "void"
      }
    }]])
  }], ["FileOpenEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 14
    },
    name: "FileOpenEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 15
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          kind: "string-literal",
          value: "open"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          kind: "named",
          name: "FileVersion"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["FileSyncEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 21
    },
    name: "FileSyncEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 21
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 22
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          kind: "string-literal",
          value: "sync"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 23
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          kind: "named",
          name: "FileVersion"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 24
        },
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["FileCloseEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 27
    },
    name: "FileCloseEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 27
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 28
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "string-literal",
          value: "close"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 29
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          kind: "named",
          name: "FileVersion"
        },
        optional: false
      }]
    }
  }], ["FileEditEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 32
    },
    name: "FileEditEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 32
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 33
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          kind: "string-literal",
          value: "edit"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 34
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          kind: "named",
          name: "FileVersion"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 35
        },
        name: "oldRange",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 35
          },
          kind: "named",
          name: "AtomRange"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 36
        },
        name: "newRange",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 36
          },
          kind: "named",
          name: "AtomRange"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 37
        },
        name: "oldText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 37
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 38
        },
        name: "newText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 38
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["FileEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 42
    },
    name: "FileEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 42
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
            kind: "string-literal",
            value: "open"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 17
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 27
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            kind: "string-literal",
            value: "close"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 32
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 33
            },
            kind: "string-literal",
            value: "edit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 34
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 35
          },
          name: "oldRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 35
            },
            kind: "named",
            name: "AtomRange"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 36
          },
          name: "newRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 36
            },
            kind: "named",
            name: "AtomRange"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 37
          },
          name: "oldText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 37
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 38
          },
          name: "newText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 38
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "string-literal",
            value: "sync"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 24
            },
            kind: "string"
          },
          optional: false
        }]
      }],
      discriminantField: "kind"
    }
  }], ["AtomPoint", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 15
    },
    name: "AtomPoint",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 15
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        name: "row",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["AtomRange", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 21
    },
    name: "AtomRange",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 21
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 22
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          kind: "named",
          name: "AtomPoint"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 23
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          kind: "named",
          name: "AtomPoint"
        },
        optional: false
      }]
    }
  }], ["FileVersion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 26
    },
    name: "FileVersion",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 26
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 27
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 28
        },
        name: "version",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }]])
});