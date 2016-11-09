"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.dispose = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("FlowService/dispose", "void", args);
    });
  };

  remoteModule.getServerStatusUpdates = function () {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("FlowService/getServerStatusUpdates", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 105
        },
        kind: "named",
        name: "ServerStatusUpdate"
      });
    }).publish();
  };

  remoteModule.flowFindDefinition = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 110
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "currentContents",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 111
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 112
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 113
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FlowService/flowFindDefinition", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 114
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 114
          },
          kind: "named",
          name: "Loc"
        }
      });
    });
  };

  remoteModule.flowFindDiagnostics = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 127
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "currentContents",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 128
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 128
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FlowService/flowFindDiagnostics", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 129
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 129
          },
          kind: "named",
          name: "Diagnostics"
        }
      });
    });
  };

  remoteModule.flowGetAutocompleteSuggestions = function (arg0, arg1, arg2, arg3, arg4, arg5) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 140
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "currentContents",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 141
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 142
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 143
        },
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 144
        },
        kind: "string"
      }
    }, {
      name: "activatedManually",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 145
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FlowService/flowGetAutocompleteSuggestions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 146
        },
        kind: "any"
      });
    });
  };

  remoteModule.flowGetType = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 161
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "currentContents",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 162
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 163
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 164
        },
        kind: "number"
      }
    }, {
      name: "includeRawType",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 165
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FlowService/flowGetType", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 166
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 166
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 166
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "FlowService.js",
                line: 166
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 166
            },
            name: "rawType",
            type: {
              location: {
                type: "source",
                fileName: "FlowService.js",
                line: 166
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "FlowService.js",
                  line: 166
                },
                kind: "string"
              }
            },
            optional: false
          }]
        }
      });
    });
  };

  remoteModule.flowGetCoverage = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 180
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FlowService/flowGetCoverage", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 181
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 181
          },
          kind: "named",
          name: "FlowCoverageResult"
        }
      });
    });
  };

  remoteModule.flowGetOutline = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 189
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 189
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "currentContents",
      type: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 190
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FlowService/flowGetOutline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 191
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 191
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 191
            },
            kind: "named",
            name: "FlowOutlineTree"
          }
        }
      });
    });
  };

  remoteModule.allowServerRestart = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("FlowService/allowServerRestart", "void", args);
    });
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
  }], ["Diagnostics", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 17
    },
    name: "Diagnostics",
    definition: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 17
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 19
        },
        name: "flowRoot",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 19
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 20
        },
        name: "messages",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 20
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 20
            },
            kind: "named",
            name: "Diagnostic"
          }
        },
        optional: false
      }]
    }
  }], ["Diagnostic", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 28
    },
    name: "Diagnostic",
    definition: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 28
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 29
        },
        name: "level",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 29
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 30
        },
        name: "messageComponents",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 30
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 30
            },
            kind: "named",
            name: "MessageComponent"
          }
        },
        optional: false
      }]
    }
  }], ["MessageComponent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 33
    },
    name: "MessageComponent",
    definition: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 33
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 34
        },
        name: "descr",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 34
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 35
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 35
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 35
            },
            kind: "named",
            name: "Range"
          }
        },
        optional: false
      }]
    }
  }], ["Range", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 38
    },
    name: "Range",
    definition: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 38
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 39
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 39
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 40
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 40
          },
          kind: "named",
          name: "Point"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 41
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 41
          },
          kind: "named",
          name: "Point"
        },
        optional: false
      }]
    }
  }], ["Point", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 44
    },
    name: "Point",
    definition: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 44
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 45
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 45
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 46
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 46
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["Loc", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 49
    },
    name: "Loc",
    definition: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 49
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 50
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 50
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 51
        },
        name: "point",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 51
          },
          kind: "named",
          name: "Point"
        },
        optional: false
      }]
    }
  }], ["ServerStatusType", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 56
    },
    name: "ServerStatusType",
    definition: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 57
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 57
        },
        kind: "string-literal",
        value: "failed"
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 58
        },
        kind: "string-literal",
        value: "unknown"
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 59
        },
        kind: "string-literal",
        value: "not running"
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 60
        },
        kind: "string-literal",
        value: "not installed"
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 61
        },
        kind: "string-literal",
        value: "busy"
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 62
        },
        kind: "string-literal",
        value: "init"
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 63
        },
        kind: "string-literal",
        value: "ready"
      }]
    }
  }], ["ServerStatusUpdate", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 65
    },
    name: "ServerStatusUpdate",
    definition: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 65
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 66
        },
        name: "pathToRoot",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 66
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 67
        },
        name: "status",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 67
          },
          kind: "named",
          name: "ServerStatusType"
        },
        optional: false
      }]
    }
  }], ["FlowOutlineTree", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 70
    },
    name: "FlowOutlineTree",
    definition: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 70
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 71
        },
        name: "tokenizedText",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 71
          },
          kind: "named",
          name: "TokenizedText"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 72
        },
        name: "representativeName",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 72
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 73
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 73
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 73
            },
            kind: "named",
            name: "FlowOutlineTree"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 74
        },
        name: "startPosition",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 74
          },
          kind: "named",
          name: "Point"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 75
        },
        name: "endPosition",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 75
          },
          kind: "named",
          name: "Point"
        },
        optional: false
      }]
    }
  }], ["FlowCoverageResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 78
    },
    name: "FlowCoverageResult",
    definition: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 78
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 79
        },
        name: "percentage",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 79
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 80
        },
        name: "uncoveredRanges",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 80
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 80
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "FlowService.js",
                line: 81
              },
              name: "start",
              type: {
                location: {
                  type: "source",
                  fileName: "FlowService.js",
                  line: 81
                },
                kind: "named",
                name: "Point"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "FlowService.js",
                line: 82
              },
              name: "end",
              type: {
                location: {
                  type: "source",
                  fileName: "FlowService.js",
                  line: 82
                },
                kind: "named",
                name: "Point"
              },
              optional: false
            }]
          }
        },
        optional: false
      }]
    }
  }], ["dispose", {
    kind: "function",
    name: "dispose",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 98
    },
    type: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 98
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 98
        },
        kind: "void"
      }
    }
  }], ["getServerStatusUpdates", {
    kind: "function",
    name: "getServerStatusUpdates",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 105
    },
    type: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 105
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 105
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 105
          },
          kind: "named",
          name: "ServerStatusUpdate"
        }
      }
    }
  }], ["flowFindDefinition", {
    kind: "function",
    name: "flowFindDefinition",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 109
    },
    type: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 109
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 110
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "currentContents",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 111
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 112
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 113
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 114
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 114
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 114
            },
            kind: "named",
            name: "Loc"
          }
        }
      }
    }
  }], ["flowFindDiagnostics", {
    kind: "function",
    name: "flowFindDiagnostics",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 126
    },
    type: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 126
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 127
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "currentContents",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 128
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 128
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 129
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 129
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 129
            },
            kind: "named",
            name: "Diagnostics"
          }
        }
      }
    }
  }], ["flowGetAutocompleteSuggestions", {
    kind: "function",
    name: "flowGetAutocompleteSuggestions",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 139
    },
    type: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 139
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 140
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "currentContents",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 141
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 142
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 143
          },
          kind: "number"
        }
      }, {
        name: "prefix",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 144
          },
          kind: "string"
        }
      }, {
        name: "activatedManually",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 145
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 146
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 146
          },
          kind: "any"
        }
      }
    }
  }], ["flowGetType", {
    kind: "function",
    name: "flowGetType",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 160
    },
    type: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 160
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 161
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "currentContents",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 162
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 163
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 164
          },
          kind: "number"
        }
      }, {
        name: "includeRawType",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 165
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 166
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 166
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 166
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "FlowService.js",
                line: 166
              },
              name: "type",
              type: {
                location: {
                  type: "source",
                  fileName: "FlowService.js",
                  line: 166
                },
                kind: "string"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "FlowService.js",
                line: 166
              },
              name: "rawType",
              type: {
                location: {
                  type: "source",
                  fileName: "FlowService.js",
                  line: 166
                },
                kind: "nullable",
                type: {
                  location: {
                    type: "source",
                    fileName: "FlowService.js",
                    line: 166
                  },
                  kind: "string"
                }
              },
              optional: false
            }]
          }
        }
      }
    }
  }], ["flowGetCoverage", {
    kind: "function",
    name: "flowGetCoverage",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 179
    },
    type: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 179
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 180
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 181
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 181
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 181
            },
            kind: "named",
            name: "FlowCoverageResult"
          }
        }
      }
    }
  }], ["flowGetOutline", {
    kind: "function",
    name: "flowGetOutline",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 188
    },
    type: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 188
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 189
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 189
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "currentContents",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 190
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 191
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FlowService.js",
            line: 191
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FlowService.js",
              line: 191
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FlowService.js",
                line: 191
              },
              kind: "named",
              name: "FlowOutlineTree"
            }
          }
        }
      }
    }
  }], ["allowServerRestart", {
    kind: "function",
    name: "allowServerRestart",
    location: {
      type: "source",
      fileName: "FlowService.js",
      line: 198
    },
    type: {
      location: {
        type: "source",
        fileName: "FlowService.js",
        line: 198
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "FlowService.js",
          line: 198
        },
        kind: "void"
      }
    }
  }], ["TokenKind", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "tokenizedText-rpc-types.js",
      line: 13
    },
    name: "TokenKind",
    definition: {
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 13
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 13
        },
        kind: "string-literal",
        value: "keyword"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 14
        },
        kind: "string-literal",
        value: "class-name"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 15
        },
        kind: "string-literal",
        value: "constructor"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 16
        },
        kind: "string-literal",
        value: "method"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 17
        },
        kind: "string-literal",
        value: "param"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 18
        },
        kind: "string-literal",
        value: "string"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 19
        },
        kind: "string-literal",
        value: "whitespace"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 20
        },
        kind: "string-literal",
        value: "plain"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 21
        },
        kind: "string-literal",
        value: "type"
      }]
    }
  }], ["TextToken", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "tokenizedText-rpc-types.js",
      line: 24
    },
    name: "TextToken",
    definition: {
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 24
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 25
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 25
          },
          kind: "named",
          name: "TokenKind"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 26
        },
        name: "value",
        type: {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 26
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["TokenizedText", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "tokenizedText-rpc-types.js",
      line: 29
    },
    name: "TokenizedText",
    definition: {
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 29
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 29
        },
        kind: "named",
        name: "TextToken"
      }
    }
  }]])
});