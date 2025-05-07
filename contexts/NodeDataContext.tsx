"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface NodeData {
  [key: string]: any;
}

interface NodeUploads {
  [key: string]: any;
}

interface NodeDataContextProps {
  nodeData: NodeData;
  setNodeData: React.Dispatch<React.SetStateAction<NodeData>>;
  showEdgeDeleteLabel: boolean;
  setShowEdgeDeleteLabel: React.Dispatch<React.SetStateAction<boolean>>;
  nodeUploads: NodeUploads;
  setNodeUploads: React.Dispatch<React.SetStateAction<NodeUploads>>;
  showUploadModal: boolean;
  setShowUploadModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentUploadModalId: string | null;
  setCurrentUploadModalId: React.Dispatch<React.SetStateAction<string | null>>;
  currentUploadType: string;
  setCurrentUploadType: React.Dispatch<React.SetStateAction<string>>;
}

const NodeDataContext = createContext<NodeDataContextProps | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components
export const useNodeData = () => {
  const context = useContext(NodeDataContext);
  if (!context) {
    throw new Error("useNodeData must be used within a NodeDataProvider");
  }
  return context;
};

interface NodeDataProviderProps {
  children: ReactNode;
}

export const NodeDataProvider: React.FC<NodeDataProviderProps> = ({
  children,
}) => {
  const [nodeData, setNodeData] = useState<NodeData>({});
  const [nodeUploads, setNodeUploads] = useState<NodeUploads>({});

  const [showEdgeDeleteLabel, setShowEdgeDeleteLabel] =
    useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [currentUploadModalId, setCurrentUploadModalId] = useState<
    string | null
  >(null);
  const [currentUploadType, setCurrentUploadType] = useState<string>("image");

  useEffect(() => {
    // You can add logic here if needed
  }, [nodeData]);

  return (
    <NodeDataContext.Provider
      value={{
        nodeData,
        setNodeData,
        showEdgeDeleteLabel,
        setShowEdgeDeleteLabel,
        nodeUploads,
        setNodeUploads,
        showUploadModal,
        setShowUploadModal,
        currentUploadModalId,
        setCurrentUploadModalId,
        currentUploadType,
        setCurrentUploadType,
      }}
    >
      {children}
    </NodeDataContext.Provider>
  );
};
