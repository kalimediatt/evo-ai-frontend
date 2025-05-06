"use client";

import { Node } from "@xyflow/react";
import React, { createContext, useState, useContext } from "react";

interface SourceClickContextProps {
  sourceClicked: Node | null;
  setSourceClicked: React.Dispatch<React.SetStateAction<Node | null>>;
}

const SourceClickContext = createContext<SourceClickContextProps | undefined>(
  undefined,
);

export const useSourceClick = () => {
  const context = useContext(SourceClickContext);
  if (!context) {
    throw new Error("useSourceClick must be used within a SourceClickProvider");
  }
  return context;
};

interface SourceClickProviderProps {
  children: React.ReactNode;
}

export const SourceClickProvider: React.FC<SourceClickProviderProps> = ({
  children,
}) => {
  const [sourceClicked, setSourceClicked] = useState<Node | null>(null);

  return (
    <SourceClickContext.Provider value={{ sourceClicked, setSourceClicked }}>
      {children}
    </SourceClickContext.Provider>
  );
};
