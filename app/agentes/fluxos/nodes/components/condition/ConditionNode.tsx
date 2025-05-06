/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Node, NodeProps, Position, useEdges } from "@xyflow/react";
import { FilterIcon } from "lucide-react";

import { BaseNode } from "../../BaseNode";
import { ConditionType, ConditionTypeEnum, StatisticType } from "../../nodeFunctions";

export type ConditionNodeType = Node<
  {
    label?: string;
    type?: "and" | "or";
    conditions?: ConditionType[];
    statistics?: StatisticType;
  },
  "condition-node"
>;

export type OperatorType =
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
  equals: "é igual a",
  not_equals: "é diferente de",
  contains: "contém",
  not_contains: "não contém",
  starts_with: "começa com",
  ends_with: "termina com",
  greater_than: "é maior que",
  greater_than_or_equal: "é maior ou igual a",
  less_than: "é menor que",
  less_than_or_equal: "é menor ou igual a",
  matches: "corresponde ao padrão",
  not_matches: "não corresponde ao padrão",
  is_defined: "está definido",
  is_not_defined: "não está definido",
};

export function ConditionNode(props: NodeProps) {
  const { selected, data } = props;
  const edges = useEdges();

  const typeText = {
    and: "todas as seguintes condições",
    or: "qualquer uma das seguintes condições",
  };

  const isHandleConnected = (handleId: string) => {
    return edges.some(
      (edge) => edge.source === props.id && edge.sourceHandle === handleId,
    );
  };

  const isBottomHandleConnected = isHandleConnected("bottom-handle");

  const conditions: ConditionType[] = data.conditions as ConditionType[];
  // const statistics: StatisticType = data.statistics as StatisticType;

  const renderCondition = (condition: ConditionType) => {
    const isConnected = isHandleConnected(condition.id);

    if (condition.type === ConditionTypeEnum.PREVIOUS_OUTPUT) {
      return (
        <div
          className="mb-4 cursor-pointer rounded-lg border-2 border-solid p-3 text-left border-gray-700 bg-gray-700 text-gray-200"
          style={{
            backgroundColor: "#374151a2",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">
                O campo{" "}
                <span className="font-semibold text-blue-600">
                  {condition.data.field}
                </span>{" "}
                <span className="text-gray-300">
                  {operatorText[condition.data.operator as OperatorType]}
                </span>{" "}
                {!["is_defined", "is_not_defined"].includes(
                  condition.data.operator,
                ) && (
                  <span className="font-semibold text-green-600">
                    &quot;{condition.data.value}&quot;
                  </span>
                )}
              </p>
            </div>
            <Handle
              style={{
                top: "50%",
                right: "-5px",
                transform: "translateY(-50%)",
                borderRadius: "50%",
                height: "16px",
                position: "relative",
                width: "16px",
                backgroundColor: isConnected ? "#8492A6" : "#f5f5f5",
                border: "3px solid #8492A6",
              }}
              type="source"
              position={Position.Right}
              id={condition.id}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <BaseNode hasTarget={true} selected={selected || false}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon size={20} className="text-blue-500" />
          <div>
            <p className="text-md font-medium text-white">
              {data.label as string}
            </p>
            <p className="text-sm text-gray-400">
              Corresponde a {typeText[(data.type as "and" | "or") || "and"]}
            </p>
          </div>
        </div>
      </div>

      {conditions && conditions.length > 0 && Array.isArray(conditions) ? (
        conditions.map((condition) => (
          <div key={condition.id}>{renderCondition(condition)}</div>
        ))
      ) : (
        <div className="mb-4 cursor-pointer rounded-lg border-2 border-dashed p-4 text-center text-gray-400 border-gray-700 hover:bg-gray-700">
          Adicionar Condição
        </div>
      )}

      <div className="mt-4 cursor-pointer text-right text-sm text-gray-400">
        Próximo passo
      </div>
      <Handle
        style={{
          borderRadius: "50%",
          height: "16px",
          position: "absolute",
          width: "16px",
          right: "0px",
          top: "calc(100% - 25px)",
          backgroundColor: isBottomHandleConnected ? "#8492A6" : "#f5f5f5",
          border: "3px solid #8492A6",
        }}
        type="source"
        position={Position.Right}
        id="bottom-handle"
      />
    </BaseNode>
  );
}
