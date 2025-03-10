let flowchartData = [
  {
    "id": 1,
    "type": "start",
    "content": "Start",
    "next": [2]
  },
  {
    "id": 2,
    "type": "io",
    "content": "Enter dividend",
    "next": [3]
  },
  {
    "id": 3,
    "type": "io",
    "content": "Enter divisor",
    "next": [4]
  },
  {
    "id": 4,
    "type": "process",
    "content": "quotient = dividend / divisor",
    "next": [5]
  },
  {
    "id": 5,
    "type": "process",
    "content": "remainder = dividend % divisor",
    "next": [6]
  },
  {
    "id": 6,
    "type": "io",
    "content": "Output Quotient",
    "next": [7]
  },
  {
    "id": 7,
    "type": "io",
    "content": "Output Remainder",
    "next": [8]
  },
  {
    "id": 8,
    "type": "process",
    "content": "return 0",
    "next": [9]
  },
  {
    "id": 9,
    "type": "start",
    "content": "End",
    "next": []
  }
];

let nodePositions = {};
let nodeWidth = 150;
let nodeHeight = 50;
let spacingX = 200;
let spacingY = 100;

function setup() {
  createCanvas(800, 9000);
  calculateNodePositions();
}

function draw() {
  background(220);
  drawConnections();
  drawNodes();
}

function calculateNodePositions() {
  let startNode = flowchartData.find((node) => node.type === "start");
  if (!startNode) return;

  let queue = [{ id: startNode.id, x: width / 2, y: 50, level: 0 }];
  let levels = {};

  while (queue.length > 0) {
    let current = queue.shift();
    nodePositions[current.id] = { x: current.x, y: current.y };

    if (!levels[current.level]) {
      levels[current.level] = [];
    }
    levels[current.level].push(current.id);

    let nextNodes = flowchartData.find((node) => node.id === current.id).next;
    if (nextNodes) {
      for (let i = 0; i < nextNodes.length; i++) {
        let nextId = nextNodes[i];
        if (!nodePositions[nextId]) {
          let nextLevel = current.level + 1;
          queue.push({ id: nextId, x: 0, y: nextLevel * (nodeHeight + spacingY), level: nextLevel });
        }
      }
    }
  }

  for (let level in levels) {
    let nodesInLevel = levels[level];
    let startX = width / 2 - ((nodesInLevel.length - 1) * (nodeWidth + spacingX)) / 2;
    for (let i = 0; i < nodesInLevel.length; i++) {
      nodePositions[nodesInLevel[i]].x = startX + i * (nodeWidth + spacingX);
    }
  }

  // Handle function nodes and their internal flow.
  flowchartData.forEach(node => {
    if (node.type === 'function' && node.function_start_id) {
      let functionStart = flowchartData.find(n=> n.id === node.function_start_id);
      if(functionStart){
        let functionQueue = [{ id: functionStart.id, x: nodePositions[node.id].x + nodeWidth + spacingX * 1.5, y: nodePositions[node.id].y - nodeHeight, level: 0 }];
        let functionLevels = {};

        while (functionQueue.length > 0) {
          let current = functionQueue.shift();
          nodePositions[current.id] = { x: current.x, y: current.y };

          if (!functionLevels[current.level]) {
            functionLevels[current.level] = [];
          }
          functionLevels[current.level].push(current.id);

          let nextNodes = flowchartData.find((n) => n.id === current.id).next;
          if (nextNodes) {
            for (let i = 0; i < nextNodes.length; i++) {
              let nextId = nextNodes[i];
              if (!nodePositions[nextId]) {
                let nextLevel = current.level + 1;
                functionQueue.push({ id: nextId, x: 0, y: current.y + nodeHeight + spacingY, level: nextLevel });
              }
            }
          }
        }

        for (let level in functionLevels) {
          let nodesInLevel = functionLevels[level];
          let startX = nodePositions[node.id].x + nodeWidth + spacingX * 1.5;
          for (let i = 0; i < nodesInLevel.length; i++) {
            nodePositions[nodesInLevel[i]].x = startX;
            startX += nodeWidth + spacingX;
          }
        }
      }
    }
  });

}

function drawNodes() {
  flowchartData.forEach((node) => {
    let pos = nodePositions[node.id];
    if (pos) {
      let x = pos.x;
      let y = pos.y;
      switch (node.type) {
        case "start":
          ellipse(x + nodeWidth / 2, y + nodeHeight / 2, nodeWidth, nodeHeight);
          break;
        case "io":
          beginShape();
          vertex(x + nodeWidth / 4, y);
          vertex(x + nodeWidth, y);
          vertex(x + (nodeWidth * 3) / 4, y + nodeHeight);
          vertex(x, y + nodeHeight);
          endShape(CLOSE);
          break;
        case "process":
          rect(x, y, nodeWidth, nodeHeight);
          break;
        case "decision":
          beginShape();
          vertex(x + nodeWidth / 2, y);
          vertex(x + nodeWidth, y + nodeHeight / 2);
          vertex(x + nodeWidth / 2, y + nodeHeight);
          vertex(x, y + nodeHeight / 2);
          endShape(CLOSE);
          break;
        case "function":
          rect(x, y, nodeWidth, nodeHeight);
          break;
      }
      textAlign(CENTER, CENTER);
      text(node.content, x + nodeWidth / 2, y + nodeHeight / 2);
    }
  });
}

function drawConnections() {
  flowchartData.forEach((node) => {
    let fromPos = nodePositions[node.id];
    if (fromPos && node.next) {
      node.next.forEach((nextId) => {
        let toPos = nodePositions[nextId];
        if (toPos) {
          line(fromPos.x + nodeWidth / 2, fromPos.y + nodeHeight / 2, toPos.x + nodeWidth / 2, toPos.y + nodeHeight / 2);
        }
      });
    }
  });
}
