"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.findArcConfigDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 55
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => _client.callRemoteFunction("ArcanistBaseService/findArcConfigDirectory", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 55
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 55
        },
        kind: "named",
        name: "NuclideUri"
      }
    }));
  }

  remoteModule.readArcConfig = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 63
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => _client.callRemoteFunction("ArcanistBaseService/readArcConfig", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 63
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 63
        },
        kind: "any"
      }
    }));
  }

  remoteModule.findArcProjectIdOfPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 78
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => _client.callRemoteFunction("ArcanistBaseService/findArcProjectIdOfPath", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 78
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 78
        },
        kind: "string"
      }
    }));
  }

  remoteModule.getProjectRelativePath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 83
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => _client.callRemoteFunction("ArcanistBaseService/getProjectRelativePath", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 83
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 83
        },
        kind: "string"
      }
    }));
  }

  remoteModule.findDiagnostics = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "pathToFiles",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 88
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 88
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "skip",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 88
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 88
          },
          kind: "string"
        }
      }
    }]).then(args => _client.callRemoteFunction("ArcanistBaseService/findDiagnostics", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 89
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 89
        },
        kind: "named",
        name: "ArcDiagnostic"
      }
    }));
  }

  remoteModule.createPhabricatorRevision = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 166
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => _client.callRemoteFunction("ArcanistBaseService/createPhabricatorRevision", "observable", args))).concatMap(id => id).concatMap(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 167
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 167
        },
        name: "stderr",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 167
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 167
        },
        name: "stdout",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 167
          },
          kind: "string"
        },
        optional: true
      }]
    }));
  }

  remoteModule.updatePhabricatorRevision = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 172
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "message",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 173
        },
        kind: "string"
      }
    }, {
      name: "allowUntracked",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 174
        },
        kind: "boolean"
      }
    }]).then(args => _client.callRemoteFunction("ArcanistBaseService/updatePhabricatorRevision", "observable", args))).concatMap(id => id).concatMap(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 175
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 175
        },
        name: "stderr",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 175
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 175
        },
        name: "stdout",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 175
          },
          kind: "string"
        },
        optional: true
      }]
    }));
  }

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
  }], ["ArcDiagnostic", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "ArcanistBaseService.js",
      line: 38
    },
    name: "ArcDiagnostic",
    definition: {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 38
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 39
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 39
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 40
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 40
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 41
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 41
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 42
        },
        name: "row",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 42
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 43
        },
        name: "col",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 43
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 44
        },
        name: "code",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 44
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 44
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 47
        },
        name: "original",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 47
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 48
        },
        name: "replacement",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 48
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }], ["findArcConfigDirectory", {
    kind: "function",
    name: "findArcConfigDirectory",
    location: {
      type: "source",
      fileName: "ArcanistBaseService.js",
      line: 55
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 55
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 55
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 55
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 55
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 55
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }
    }
  }], ["readArcConfig", {
    kind: "function",
    name: "readArcConfig",
    location: {
      type: "source",
      fileName: "ArcanistBaseService.js",
      line: 63
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 63
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 63
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 63
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 63
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 63
            },
            kind: "any"
          }
        }
      }
    }
  }], ["findArcProjectIdOfPath", {
    kind: "function",
    name: "findArcProjectIdOfPath",
    location: {
      type: "source",
      fileName: "ArcanistBaseService.js",
      line: 78
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 78
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 78
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 78
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 78
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 78
            },
            kind: "string"
          }
        }
      }
    }
  }], ["getProjectRelativePath", {
    kind: "function",
    name: "getProjectRelativePath",
    location: {
      type: "source",
      fileName: "ArcanistBaseService.js",
      line: 83
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 83
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 83
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 83
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 83
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 83
            },
            kind: "string"
          }
        }
      }
    }
  }], ["findDiagnostics", {
    kind: "function",
    name: "findDiagnostics",
    location: {
      type: "source",
      fileName: "ArcanistBaseService.js",
      line: 88
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 88
      },
      kind: "function",
      argumentTypes: [{
        name: "pathToFiles",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 88
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 88
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "skip",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 88
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 88
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 89
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 89
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 89
            },
            kind: "named",
            name: "ArcDiagnostic"
          }
        }
      }
    }
  }], ["createPhabricatorRevision", {
    kind: "function",
    name: "createPhabricatorRevision",
    location: {
      type: "source",
      fileName: "ArcanistBaseService.js",
      line: 165
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 165
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 166
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 167
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 167
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 167
            },
            name: "stderr",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistBaseService.js",
                line: 167
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 167
            },
            name: "stdout",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistBaseService.js",
                line: 167
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }
  }], ["updatePhabricatorRevision", {
    kind: "function",
    name: "updatePhabricatorRevision",
    location: {
      type: "source",
      fileName: "ArcanistBaseService.js",
      line: 171
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistBaseService.js",
        line: 171
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 172
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 173
          },
          kind: "string"
        }
      }, {
        name: "allowUntracked",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 174
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistBaseService.js",
          line: 175
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistBaseService.js",
            line: 175
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 175
            },
            name: "stderr",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistBaseService.js",
                line: 175
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "ArcanistBaseService.js",
              line: 175
            },
            name: "stdout",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistBaseService.js",
                line: 175
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }
  }]])
});