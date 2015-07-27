


var DTS = require('../index.js')

var treeData = require('./binary-tree.json')

var opts = {
  // custom decider
  decider: function (result) {
    if (result) {
      return 1
    } else {
      return 0
    }
  }
}

var person = {
  name: "Bob",
  age: 37,
  nationality: 'US'
}


var DecisionTree = new DTS(opts)
DecisionTree.run(treeData, person, function (err, result) {
  if (err) console.error("ERROR", err)
  console.log("RESULT", result)
})
