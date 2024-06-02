import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
} from "reactflow";
import "reactflow/dist/style.css";
import Message from "../src/assets/chat.png";
import WhatsApp from "../src/assets/whatsapp.png";
import DeleteButton from "../src/assets/trash.png";

// This is the Default Text Node
const TextNode = ({ data }) => (
  <div
    className={`bg-white shadow-md rounded ${
      data?.selected === true && " border-2 border-blue-400"
    } `}
  >
    <div className="bg-[#b2f0e3] flex justify-between items-center p-2 gap-2 rounded">
      <img src={Message} className="w-4 h-4" />
      <p>Send Message</p>
      <img src={WhatsApp} className="w-4 h-4" />
    </div>
    <Handle
      type="target"
      position="left"
      style={{ background: "#000", width: "12px", height: "12px" }}
    />
    <div className="pl-4 pr-4 pt-2 pb-2 text-center">{data.label}</div>
    <Handle
      type="source"
      position="right"
      style={{ background: "#000", width: "12px", height: "12px" }}
    />
  </div>
);

const nodeTypes = {
  textNode: TextNode,
};

const initialNodes = [];
const initialEdges = [];

function FlowBuilder() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [nodeName, setNodeName] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);

  const reactFlowWrapper = useRef(null);

  //On click of delete button node getting deleted
  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
      setNodeName("");
    }
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: "arrowclosed" } }, eds)
      ),
    []
  );

  // To Drag the message for creating new node
  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // On Drop the node is getting created
  const onDrop = (event) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData("application/reactflow");

    if (!type) {
      return;
    }

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode = {
      id: `node-${nodes.length + 1}`,
      type,
      position,
      data: { label: `text message ${nodes.length + 1}`, selected: false },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  //On Element Click the node getting selected for text message edit or delete
  const onElementClick = (event, element) => {
    if (element && element.type === "textNode") {
      console.log("Text node clicked");
      setSelectedNode(element);
      setNodeName(element.data.label);
    }
    setNodes((nds) =>
      nds.map((nd) => {
        if (nd.id === element.id) {
          nd.data = { ...nd.data, selected: true };
        } else {
          nd.data = { ...nd.data, selected: false };
        }
        return nd;
      })
    );
  };

  const onNodeNameChange = (event) => {
    setNodeName(event.target.value);
    setNodes((nds) =>
      nds.map((nd) => {
        if (nd.id === selectedNode.id) {
          nd.data = { ...nd.data, label: event.target.value };
        }
        return nd;
      })
    );
  };

  // On save the nodes getting save and if target handles not connected the alert will pop up
  const onSave = () => {
    const emptyTargets = nodes.filter(
      (nd) =>
        nd.type === "textNode" && !edges.find((edge) => edge.target === nd.id)
    );
    if (emptyTargets.length > 1) {
      alert("Error: More than one node has empty target handles");
    } else {
      console.log("Flow saved", nodes, edges);
      setSelectedNode(null); // Reset the selected node
      setNodeName(""); // Clear the node name input
      setNodes((nds) =>
        nds.map((nd) => {
          nd.data = { ...nd.data, selected: false };
          return nd;
        })
      );
      alert("Changes saved Succesfully!");
    }
  };

  return (
    <ReactFlowProvider>
      <div className="flex h-screen">
        <div ref={reactFlowWrapper} className="flex-1 h-full">
          <div className="w-full bg-slate-300 text-[#7c44fe] text-2xl text-center bold py-3">
            BiteSpeed
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onElementClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
          />
        </div>
        <div className="w-1/4 bg-gray-100 p-4">
          {!selectedNode ? (
            <div>
              <h3 className="text-lg font-bold mb-4">Nodes Panel</h3>
              <div
                className="border-2 border-blue-400 px-4 py-2 w-32 flex flex-col justify-center items-center rounded cursor-pointer"
                onDragStart={(event) =>
                  event.dataTransfer.setData(
                    "application/reactflow",
                    "textNode"
                  )
                }
                draggable
              >
                <img src={Message} className="w-8 h-8" />
                <p className="text-blue-400"> Message</p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold mb-4">Settings Panel</h3>
              <div className="flex justify-between items-center my-4 mt-8">
                <label className="block mb-2">Edit text of Message node</label>
                <img
                  src={DeleteButton}
                  onClick={handleDeleteNode}
                  className="w-8 h-8 cursor-pointer"
                />
              </div>
              <textarea
                value={nodeName}
                onChange={onNodeNameChange}
                className="border p-2 w-full"
              />
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <button
            onClick={onSave}
            className="border border-blue-400 text-blue-400 px-4 py-1 rounded"
          >
            Save Changes
          </button>
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default FlowBuilder;
