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
          line: 16
        },
        kind: "named",
        name: "FileNotifier"
      });
    });
  };

  remoteModule.FileNotifier = class {
    onEvent(arg0) {
      return trackOperationTiming("FileNotifier.onEvent", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "event",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 44
            },
            kind: "named",
            name: "FileEvent"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 43
            },
            name: "FileNotifier"
          }).then(id => {
            return _client.callRemoteMethod(id, "onEvent", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 44
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
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["initialize", {
    kind: "function",
    name: "initialize",
    location: {
      type: "source",
      fileName: "OpenFilesService.js",
      line: 16
    },
    type: {
      location: {
        type: "source",
        fileName: "OpenFilesService.js",
        line: 16
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "OpenFilesService.js",
          line: 16
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "OpenFilesService.js",
            line: 16
          },
          kind: "named",
          name: "FileNotifier"
        }
      }
    }
  }], ["FileOpenEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 13
    },
    name: "FileOpenEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 13
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          kind: "string-literal",
          value: "open"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 15
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          kind: "named",
          name: "FileVersion"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
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
      line: 20
    },
    name: "FileSyncEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 20
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "string-literal",
          value: "sync"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 22
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          kind: "named",
          name: "FileVersion"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 23
        },
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
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
      line: 26
    },
    name: "FileCloseEvent",
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
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "string-literal",
          value: "close"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 28
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
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
      line: 31
    },
    name: "FileEditEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 31
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 32
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
          },
          kind: "string-literal",
          value: "edit"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 33
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          kind: "named",
          name: "FileVersion"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 34
        },
        name: "oldRange",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 35
        },
        name: "newRange",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 35
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 36
        },
        name: "oldText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 36
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 37
        },
        name: "newText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 37
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
      line: 41
    },
    name: "FileEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 41
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 14
            },
            kind: "string-literal",
            value: "open"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
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
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 27
            },
            kind: "string-literal",
            value: "close"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
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
          line: 31
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 32
            },
            kind: "string-literal",
            value: "edit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 33
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          name: "oldRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 34
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 35
          },
          name: "newRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 35
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 36
          },
          name: "oldText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 36
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 37
          },
          name: "newText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 37
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 21
            },
            kind: "string-literal",
            value: "sync"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            kind: "string"
          },
          optional: false
        }]
      }],
      discriminantField: "kind"
    }
  }], ["FileNotifier", {
    kind: "interface",
    name: "FileNotifier",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 43
    },
    constructorArgs: null,
    staticMethods: new Map(),
    instanceMethods: new Map([["onEvent", {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 44
      },
      kind: "function",
      argumentTypes: [{
        name: "event",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 44
          },
          kind: "named",
          name: "FileEvent"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 44
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 44
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 45
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 45
        },
        kind: "void"
      }
    }]])
  }], ["FileVersion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 48
    },
    name: "FileVersion",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 48
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 49
        },
        name: "notifier",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 49
          },
          kind: "named",
          name: "FileNotifier"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 50
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 50
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 51
        },
        name: "version",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 51
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }]])
});