# Operational-Decision-Tree #

## Disclaimer ##

This package is brand new. I have yet to use it for the project I built it for. Consequently, this project may change soon.

## What it is ##

ODT is a decision tree executor designed to run decision trees that are human-built and managed. You give it a tree object and a subject object. It then runs the tree against the subject and passes back the leaf node along with any data generated along the way.

Usage looks like this:
```js
var ODT = require('operational-decision-tree')

var treeData = require('./binary-tree.json')

var person = { 
  name: "Bob",
  age: 37, 
  nationality: 'US'
}

var DecisionTree = new ODT({
  makeDecision: {},
  runOnHit: {}
})

DecisionTree.run(treeData, person, null, function (err, resultBranchNode) {
  if (err) console.error(err)
  console.log("Result", resultBranchNode)
})
```


Each node can have the following properties:
```js
var node = {
  "decisions": [], // the decisions that will be run for this node in order to produce an output branch
  "branches": [], // each branch is another node
  "runOnHit": [], // a list of function names to run when this node is hit.
  "makeDecision": "" // the name of a function to run instead of the built in comparison function
}
```

For each node:
1. check if 'makeDecision' is set.
  * true: run a function by this name from corresponding opts object
  * false: go to #2
2. ODT runs each comparison in the list and:
  * if all comparisons are true, then the branch with the same index as this decision is chosen.
    * if the chosen branch has the 'decisions' property or the 'makeDecisions' property, then return to step 1 and use this branch as the node to test
    * if not, then the top level callback is triggered with this branch node as the result
  * if any are false, then return to step 2 and test the next decision 

Once we hit a branch node that doesn't have either the 'decisions' property or the 'makeDecision' property, then the callback is triggered with the branch node as the result.

For each comparison, ODT compares the subject data to the tree data based on the "operation" parameter you pass in the tree. Supported operations are:
* > subject value is greater than tree comparison value
* >= subject value is greater than or equal to tree comparison value
* < subject value is less than tree comparison value
* <= subject value is less than or equal to tree comparison value
* == subject value is equal to tree comparison value
* === subject value is definitely equal to tree comparison value
* != subject value is not equal to tree comparison value
* !== subject value is definitely not equal to tree comparison value
* in subject value is present in tree comparison value (tree comparison value must be an array)
* nin subject value is not present in tree comparison value (tree comparison value must be an array)

The number of decisions should always be one less than the number of branches. In the event that all decisions come back false, the last branch is chosen.

## Example ##

binary-tree.json
```json
{
  "decisions": [
    [{  
      "property": "age",
      "operation": ">",
      "value": 40
    }]  
  ],  
  "branches": [
    {   
      "runOnHit": [
        "howOld"
      ],  
      "decisions": [
        [{  
          "property": "random",
          "operation": "<",
          "value": 30
        }], 
        [{  
          "property": "random",
          "operation": "<",
          "value": 50
        }], 
        [{  
          "property": "random",
          "operation": "<",
          "value": 90
        }]  
      ],  
      "branches": [
        {"result": "Leaf A: Aged under 40 and random less than 30"},
        {"result": "Leaf B: Aged under 40 and random between 30 and 49"},
        {"result": "Leaf C: Aged under 40 and random between 50 and 89"},
        {"result": "Leaf D: Aged under 40 and random between 90 and 99"}
      ]   
    },  
    {   
      "decisions": [
        [{  
          "property": "nationality",
          "operation": "in",
          "value": ["US", "CA"]
        }]  
      ],  
      "branches": [
        {   
          "decisions": [
            [   
              {   
              "property": "age",
              "operation": "<",
              "value": 60
              },  
              {   
              "property": "gender",
              "operation": "==",
              "value": "male"
              }   
            ]   
          ],  
          "branches": [
            {"result": "Leaf E: Over 60 or female, and not from US"},
            {"result": "Leaf F: Male under 60 and not from US"}
          ]   
        },  
        {   
          "makeDecision": "decideFinalBranch",
          "decisions": [
            [{  
              "property": "percentage"
            }]  
          ],  
          "branches": [
            {"result": "Leaf G"},
            {"result": "Leaf H"},
            {"result": "Leaf I"} 
          ]   
        }   
      ]   
    }   
  ]
}
```

