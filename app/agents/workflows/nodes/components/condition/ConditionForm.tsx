import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ConditionType, ConditionTypeEnum } from "../../nodeFunctions";
import { ConditionDialog } from "./ConditionDialog";
import { Button } from "@/components/ui/button";

/* eslint-disable @typescript-eslint/no-explicit-any */
function ConditionForm({
  selectedNode,
  handleUpdateNode,
}: {
  selectedNode: any;
  handleUpdateNode: any;
  setEdges: any;
  setIsOpen: any;
  setSelectedNode: any;
}) {
  const [node, setNode] = useState(selectedNode);

  const [conditions, setConditions] = useState<ConditionType[]>(
    selectedNode.data.conditions || []
  );

  const [open, setOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [conditionToDelete, setConditionToDelete] =
    useState<ConditionType | null>(null);

  useEffect(() => {
    if (selectedNode) {
      setNode(selectedNode);
      setConditions(selectedNode.data.conditions || []);
    }
  }, [selectedNode]);

  const handleDelete = (condition: ConditionType) => {
    setConditionToDelete(condition);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!conditionToDelete) return;

    const newConditions = conditions.filter(
      (c) => c.id !== conditionToDelete.id
    );
    setConditions(newConditions);
    handleUpdateNode({
      ...node,
      data: { ...node.data, conditions: newConditions },
    });
    setDeleteDialog(false);
    setConditionToDelete(null);
  };

  const renderCondition = (condition: ConditionType) => {
    if (condition.type === ConditionTypeEnum.PREVIOUS_OUTPUT) {
      type OperatorType =
        | "is_defined"
        | "is_not_defined"
        | "equals"
        | "not_equals"
        | "contains"
        | "not_contains"
        | "starts_with"
        | "ends_with"
        | "greater_than"
        | "greater_than_or_equal"
        | "less_than"
        | "less_than_or_equal"
        | "matches"
        | "not_matches";

      const operatorText: Record<OperatorType, string> = {
        is_defined: "is defined",
        is_not_defined: "is not defined",
        equals: "is equal to",
        not_equals: "is not equal to",
        contains: "contains",
        not_contains: "does not contain",
        starts_with: "starts with",
        ends_with: "ends with",
        greater_than: "is greater than",
        greater_than_or_equal: "is greater than or equal to",
        less_than: "is less than",
        less_than_or_equal: "is less than or equal to",
        matches: "matches the regex",
        not_matches: "does not match the regex",
      };

      return (
        <div
          key={condition.id}
          className="mb-2 rounded-lg border border-gray-600 p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2">
              <p className="font-medium text-gray-300">
                O campo{" "}
                <span className="font-semibold text-blue-600">
                  {condition.data.field}
                </span>{" "}
                <span className="text-gray-300">
                  {operatorText[condition.data.operator as OperatorType]}
                </span>{" "}
                {!["is_defined", "is_not_defined"].includes(
                  condition.data.operator
                ) && (
                  <span className="font-semibold text-green-600">
                    &quot;{condition.data.value}&quot;
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => handleDelete(condition)}
              className="shrink-0 p-2 text-gray-400 transition-colors hover:text-red-500"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderForm = () => {
    return (
      <div className="pb-4 pl-8 pr-8 pt-2">
        <div className="my-4 text-gray-300">
          <p>
            This validation corresponds to:{" "}
            <select
              className="cursor-pointer border-none bg-transparent p-0 font-bold text-green-600 underline focus:outline-none focus:ring-0"
              value={node.data.type || "and"}
              onChange={(e) => {
                const updatedNode = {
                  ...node,
                  data: {
                    ...node.data,
                    type: e.target.value,
                  },
                };
                setNode(updatedNode);
                handleUpdateNode(updatedNode);
              }}
            >
              <option value="and">all of the following conditions</option>
              <option value="or">any of the following conditions</option>
            </select>
          </p>
        </div>

        {conditions.length > 0 && (
          <div className="mb-4">
            {conditions.map((condition) => renderCondition(condition))}
          </div>
        )}

        <div
          onClick={() => setOpen(true)}
          className="mb-4 cursor-pointer rounded-lg border-2 border-dashed p-4 text-center text-blue-400 border-gray-700 hover:bg-gray-700"
        >
          + Add Condition
        </div>

        <ConditionDialog
          open={open}
          onOpenChange={setOpen}
          selectedNode={selectedNode}
          handleUpdateNode={handleUpdateNode}
        />
      </div>
    );
  };

  return (
    <>
      {renderForm()}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this condition?</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialog(false);
                setConditionToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { ConditionForm };
