


var DTS = require('../index.js')

var treeData = require('./multi-condition-nodes.json')


var person = {
  name: "Bob",
  age: 37,
  nationality: 'US'
}


var DecisionTree = new DTS()
DecisionTree.run(treeData, person, function (err, result) {
  if (err) console.error("ERROR", err)
  console.log("RESULT", result)
})
