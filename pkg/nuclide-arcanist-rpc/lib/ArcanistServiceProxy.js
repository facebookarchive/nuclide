"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.findArcConfigDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 58
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcConfigDirectory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 58
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 58
          },
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.readArcConfig = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 66
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/readArcConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 66
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 66
          },
          kind: "any"
        }
      });
    });
  };

  remoteModule.findArcProjectIdOfPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 81
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcProjectIdOfPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 81
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 81
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.findArcProjectIdAndDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 86
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcProjectIdAndDirectory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 86
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 86
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 87
            },
            name: "projectId",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 87
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 88
            },
            name: "directory",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 88
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }]
        }
      });
    });
  };

  remoteModule.getProjectRelativePath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 101
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/getProjectRelativePath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 101
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 101
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.findDiagnostics = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 107
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "skip",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 108
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 108
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findDiagnostics", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 109
        },
        kind: "named",
        name: "ArcDiagnostic"
      });
    }).publish();
  };

  remoteModule.createPhabricatorRevision = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 201
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "isPrepareMode",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 202
        },
        kind: "boolean"
      }
    }, {
      name: "lintExcuse",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 203
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 203
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/createPhabricatorRevision", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 204
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 204
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 204
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 204
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 204
            },
            kind: "string"
          },
          optional: true
        }]
      });
    }).publish();
  };

  remoteModule.updatePhabricatorRevision = function (arg0, arg1, arg2, arg3, arg4) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 210
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "message",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 211
        },
        kind: "string"
      }
    }, {
      name: "allowUntracked",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 212
        },
        kind: "boolean"
      }
    }, {
      name: "lintExcuse",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 213
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 213
          },
          kind: "string"
        }
      }
    }, {
      name: "verbatimModeEnabled",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 214
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/updatePhabricatorRevision", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 215
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 215
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 215
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 215
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 215
            },
            kind: "string"
          },
          optional: true
        }]
      });
    }).publish();
  };

  remoteModule.execArcPull = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "cwd",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 229
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "fetchLatest",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 230
        },
        kind: "boolean"
      }
    }, {
      name: "allowDirtyChanges",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 231
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/execArcPull", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 232
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.execArcLand = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "cwd",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 250
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/execArcLand", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 251
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.execArcPatch = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "cwd",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 259
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "differentialRevision",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 260
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/execArcPatch", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 261
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
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
  }], ["ArcDiagnostic", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 42
    },
    name: "ArcDiagnostic",
    definition: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 42
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 43
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 43
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 43
            },
            kind: "string-literal",
            value: "Error"
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 43
            },
            kind: "string-literal",
            value: "Warning"
          }]
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 44
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 44
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 45
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 45
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 46
        },
        name: "row",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 46
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 47
        },
        name: "col",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 47
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 48
        },
        name: "code",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 48
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 48
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 51
        },
        name: "original",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 51
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 52
        },
        name: "replacement",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 52
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
      fileName: "ArcanistService.js",
      line: 58
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 58
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 58
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 58
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 58
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 58
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
      fileName: "ArcanistService.js",
      line: 66
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 66
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 66
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 66
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 66
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 66
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
      fileName: "ArcanistService.js",
      line: 81
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 81
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 81
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 81
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 81
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 81
            },
            kind: "string"
          }
        }
      }
    }
  }], ["findArcProjectIdAndDirectory", {
    kind: "function",
    name: "findArcProjectIdAndDirectory",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 86
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 86
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 86
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 86
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 86
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 86
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 87
              },
              name: "projectId",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 87
                },
                kind: "string"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 88
              },
              name: "directory",
              type: {
                location: {
                  type: "source",
                  fileName: "ArcanistService.js",
                  line: 88
                },
                kind: "named",
                name: "NuclideUri"
              },
              optional: false
            }]
          }
        }
      }
    }
  }], ["getProjectRelativePath", {
    kind: "function",
    name: "getProjectRelativePath",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 101
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 101
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 101
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 101
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 101
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 101
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
      fileName: "ArcanistService.js",
      line: 106
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 106
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 107
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "skip",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 108
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 108
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 109
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 109
          },
          kind: "named",
          name: "ArcDiagnostic"
        }
      }
    }
  }], ["createPhabricatorRevision", {
    kind: "function",
    name: "createPhabricatorRevision",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 200
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 200
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 201
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "isPrepareMode",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 202
          },
          kind: "boolean"
        }
      }, {
        name: "lintExcuse",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 203
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 203
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 204
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 204
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 204
            },
            name: "stderr",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 204
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 204
            },
            name: "stdout",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 204
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
      fileName: "ArcanistService.js",
      line: 209
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 209
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 210
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 211
          },
          kind: "string"
        }
      }, {
        name: "allowUntracked",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 212
          },
          kind: "boolean"
        }
      }, {
        name: "lintExcuse",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 213
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 213
            },
            kind: "string"
          }
        }
      }, {
        name: "verbatimModeEnabled",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 214
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 215
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 215
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 215
            },
            name: "stderr",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 215
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 215
            },
            name: "stdout",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 215
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }
  }], ["execArcPull", {
    kind: "function",
    name: "execArcPull",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 228
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 228
      },
      kind: "function",
      argumentTypes: [{
        name: "cwd",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 229
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "fetchLatest",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 230
          },
          kind: "boolean"
        }
      }, {
        name: "allowDirtyChanges",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 231
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 232
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 232
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["execArcLand", {
    kind: "function",
    name: "execArcLand",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 249
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 249
      },
      kind: "function",
      argumentTypes: [{
        name: "cwd",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 250
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 251
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 251
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["execArcPatch", {
    kind: "function",
    name: "execArcPatch",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 258
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 258
      },
      kind: "function",
      argumentTypes: [{
        name: "cwd",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 259
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "differentialRevision",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 260
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 261
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 261
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["ProcessExitMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-rpc-types.js",
      line: 13
    },
    name: "ProcessExitMessage",
    definition: {
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 13
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 14
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          kind: "string-literal",
          value: "exit"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 15
        },
        name: "exitCode",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "number"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 16
        },
        name: "signal",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "string"
          }
        },
        optional: false
      }]
    }
  }], ["ProcessMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-rpc-types.js",
      line: 20
    },
    name: "ProcessMessage",
    definition: {
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 20
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 20
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 21
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 21
            },
            kind: "string-literal",
            value: "stdout"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 22
          },
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 23
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 24
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            kind: "string-literal",
            value: "stderr"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 25
          },
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 25
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 26
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 27
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            kind: "string-literal",
            value: "error"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 28
          },
          name: "error",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            kind: "named",
            name: "Object"
          },
          optional: false
        }]
      }],
      discriminantField: "kind"
    }
  }], ["ProcessInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-rpc-types.js",
      line: 31
    },
    name: "ProcessInfo",
    definition: {
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 31
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 32
        },
        name: "parentPid",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 32
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 33
        },
        name: "pid",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 33
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 34
        },
        name: "command",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 34
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }]])
});