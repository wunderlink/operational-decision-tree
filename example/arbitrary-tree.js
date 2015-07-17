


var DTS = require('../index.js')

var treeData = require('./arbitrary-tree.json')


var conditions = require('./conditions.js')

var opts = {
  conditions: conditions
}

var person = {
  name: "Bob",
  age: 37,
  nationality: 'US',
  random: Math.floor(Math.random()*100)
}

var DecisionTree = new DTS(opts)
DecisionTree.run(treeData, person, function (err, result) {
  if (err) console.error("ERROR", err)
  console.log("RESULT", result)
})

