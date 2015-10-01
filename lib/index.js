

var _ = require('lodash')
var async = require('async')

DecisionTree = module.exports = function (opts) {
  if (opts) {
    this.opts = opts
  } else {
    this.opts = {}
  }
}


DecisionTree.prototype.run = function (treeData, subjectData, populated, cb) {
  if (!populated) {
    populated = {}
  }
console.log("TREE", treeData)
  var nodeCount = -1
  this.runNode(nodeCount, treeData, subjectData, populated, function (err, result, populated) {
    if (err) return cb(err)
    cb(err, result, populated)
  })
}

DecisionTree.prototype.runNode = function (nodeCount, node, subjectData, populated, cb) {
  nodeCount++
  var self = this
  var resolved = false
  var resolvedIndex = 0

  // run prepare for each decision as it is encountered
  async.forEachOf(node.branches, function (nodeBranch, index, callback) {
    if (resolved) {
      callback(null)
    } else {
      self.runHits(nodeBranch, subjectData)
      self.prepareSubject(nodeCount, node, nodeBranch, subjectData, populated, function (err) {
        if (err) return cb(err)
        var result = self.runDecisions(nodeCount, nodeBranch.decisions, subjectData, populated)
        if (result) {
          resolved = true
        } else {
          resolvedIndex++
        }
        callback(null)
      })
    }
  }, function (err) {
    if (err) return cb(err)
    if (!node.branches || !node.branches[resolvedIndex]) {
      return cb(null, node)
    }
    var nextNode = node.branches[resolvedIndex]
    if (nextNode.node) {
      if (nextNode.node.branches) {
        self.runNode(nodeCount, nextNode.node, subjectData, populated, cb)
      } else {
        // we have a final node
        return cb(null, nextNode.node)
      }
    } else {
      // we have a final node
      return cb(null, nextNode)
    }
  })
}

DecisionTree.prototype.runDecisions = function (nodeCount, decisions, subjectData, populated) {
  var self = this
  for (var i in decisions) {
    var decision = decisions[i]
    var result = this.compare(nodeCount, decision.property, decision, subjectData, populated)
    if (!result) {
      return false
    }
  }
  return true
}

DecisionTree.prototype.runHits = function (nodeBranch, subjectData) {
  var self = this
  if (nodeBranch.runOnHit && this.opts.runOnHit) {
    for (var i in nodeBranch.runOnHit) {
      var fn = nodeBranch.runOnHit[i]
      if (this.opts.runOnHit[fn]) {
        this.opts.runOnHit[fn](nodeBranch, subjectData)
      }
    }
  } else {
    return false
  }
}

DecisionTree.prototype.prepareSubject = function (nodeCount, node, nodeBranch, subjectData, populated, cb) {
  var self = this
  if (nodeBranch.decisions) {
    async.each(nodeBranch.decisions, function (decision, callback) {
      if (populated && populated[nodeCount] && populated[nodeCount].hasOwnProperty(decision.property)) {
        callback(null)
      } else if (self.opts.populateFunctions && self.opts.populateFunctions[decision.property]) {
        self.opts.populateFunctions[decision.property](node, nodeBranch, decision, subjectData, function (err, result) {
          if (err) return cb(err)
          if (!populated[nodeCount]) {
            populated[nodeCount] = {}
          }
          populated[nodeCount][decision.property] = result
          return callback(null)
        })
      } else {
        return callback(null)
      }
    }, function (err) {
      if (err) return err
      return cb(null)
    })
  } else {
    return cb(null)
  }
}


DecisionTree.prototype.compare = function (nodeCount, property, comparison, subjectData, populated) {
  var result = 0;
  if (populated && populated[nodeCount] && populated[nodeCount].hasOwnProperty(property)) {
    var val = populated[nodeCount][property]
  } else {
    var val = _.get(subjectData, property)
  }
  switch (comparison.operation) {
    case ">":
      if (typeof(val) === 'undefined' || val === null) {
        val = 0
      }
      if (Number(val) > Number(comparison.value)) {
        result = 1;
      }
      break;
    case ">=":
      if (typeof(val) === 'undefined' || val === null) {
        val = 0
      }
      if (Number(val) >= Number(comparison.value)) {
        result = 1;
      }
      break;
    case "<":
      if (typeof(val) === 'undefined' || val === null) {
        val = 0
      }
      if (Number(val) < Number(comparison.value)) {
        result = 1;
      }
      break;
    case "<=":
      if (typeof(val) === 'undefined' || val === null) {
        val = 0
      }
      if (Number(val) <= Number(comparison.value)) {
        result = 1;
      }
      break;
    case "==":
      if (val == comparison.value) {
        result = 1;
      }
      break;
    case "===":
      if (val === comparison.value) {
        result = 1;
      }
      break;
    case "!=":
      if (val != comparison.value) {
        result = 1;
      }
      break;
    case "!==":
      if (val !== comparison.value) {
        result = 1;
      }
      break;
    case "exists":
      if (val) {
        result = 1;
      }
      break;
    case "in":
      for (var i in comparison.value) {
        if (val === comparison.value[i]) {
          result = 1;
        }
      }
      break;
    case "nin":
      result = 1;
      for (var i in comparison.value) {
        if (val === comparison.value[i]) {
          result = 0;
        }
      }
      break;
    default:
      return new Error('Invalid comparison operation')
  }
  console.log("COMPARING: "+val+" "+comparison.operation+" "+comparison.value)
  return result
}



// utility functions
/*
DecisionTree.prototype.countDecisions = function (treeData, finished) {
  var decisionCount = {}
  var self = this
  this.walkTree(treeData, function (node, cb) {
    if (node.decision) {
      self.incrementDecisionCount(decisionCount, node.decision.name)
    } else if (node.decisions) {
      for (var index in node.decisions) {
        self.incrementDecisionCount(decisionCount, node.decisions[index].name)
      }
    }
    cb(null)
  }, function (err) {
    finished(err, decisionCount)
  })
}

DecisionTree.prototype.walkTree = function (node, perNode, finishedNode) {
  var self = this
  var count = 1
  var done = 0

  if (node.branches) {
    for (var index in node.branches) {
      count++
      self.walkTree(node.branches[index], perNode, function (err) {
        done++
        if (count === done) {
          finishedNode(null)
        }
      })
    }
  }

  perNode(node, function (err) {
    done++
    if (count === done) {
      finishedNode(null)
    }
  })
}
*/

DecisionTree.prototype.incrementDecisionCount = function (decisionCount, decisionName) {
  if (!decisionCount[decisionName]) {
    decisionCount[decisionName] = 0
  }
  decisionCount[decisionName]++
}

function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
