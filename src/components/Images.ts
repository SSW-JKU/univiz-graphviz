export const graph1: string = `graph { 
    splines=true;
    node0 [label="A"];
    node1 [label="B"];
    node2 [label="C"];
    node3 [label="D"];
    node4 [label="E"];
    node5 [label="F"];
    node6 [label="G"];
    node0 -- node6 [label=1];
    node6 -- node5 [label=2];
    node5 -- node3 [label=2];
    node3 -- node4 [label=3];
    node4 -- node2 [label=3];
    node2 -- node1 [label=9];
    node1 -- node0 [label=2];
    node0 -- node4 [label=9];
    node6 -- node1 [label=9];
    node6 -- node2 [label=6];
    node5 -- node4 [label=7];
}`;

export const graph2: string = `graph { 
    splines=true;
    node0 [label="Amsterdam"];
    node1 [label="Berlin"];
    node2 [label="Cannes"];
    node3 [label="Dortmund"];
    node4 [label="Erlangen"];
    node5 [label="Frankfurt"];
    node6 [label="Hanoi"];
    node0 -- node1 [label=12];
    node1 -- node2 [label=11];
    node2 -- node3 [label=9];
    node3 -- node4 [label=4];
    node4 -- node5 [label=14];
    node5 -- node6 [label=13];
    node6 -- node0 [label=2];
}`;

export const graph3: string = `graph { 
splines=true;
node0 [label="0"]
node1 [label="1"]
node2 [label="2"]
node3 [label="3"]
node4 [label="4"]
node5 [label="5"]
node6 [label="6"]
node7 [label="7"]
node0 -- node1
node0 -- node2
node0 -- node3
node1 -- node4
node1 -- node5
node2 -- node6
node3 -- node7}`;

export const graph4: string = `digraph { 
    splines=true;
    node0 [label="Mercury"]
    node1 [label="Venus"]
    node2 [label="Earth"]
    node3 [label="Mars"]
    node4 [label="Jupiter"]
    node5 [label="Saturn"]
    node6 [label="Uranus"]
    node7 [label="Neptune"]
    node0 -> node1 [label=10]
    node1 -> node2 [label=20]
    node2 -> node3 [label=15]
    node3 -> node4 [label=30]
    node4 -> node5 [label=25]
    node5 -> node6 [label=35]
    node6 -> node7 [label=40]
    node7 -> node0 [label=50]
}`;
