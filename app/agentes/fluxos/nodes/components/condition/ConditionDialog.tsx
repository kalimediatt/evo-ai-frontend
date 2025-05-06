/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { ConditionType, ConditionTypeEnum } from "../../nodeFunctions";

const conditionTypes = [
  {
    id: "previous-output",
    name: "Output do nó anterior",
    description: "Validar o resultado retornado pelo nó anterior",
    icon: "🔄",
  },
];

const operators = [
  { value: "is_defined", label: "está definido" },
  { value: "is_not_defined", label: "não está definido" },
  { value: "equals", label: "igual a" },
  { value: "not_equals", label: "diferente de" },
  { value: "contains", label: "contém" },
  { value: "not_contains", label: "não contém" },
  { value: "starts_with", label: "começa com" },
  { value: "ends_with", label: "termina com" },
  { value: "greater_than", label: "maior que" },
  { value: "greater_than_or_equal", label: "maior ou igual a" },
  { value: "less_than", label: "menor que" },
  { value: "less_than_or_equal", label: "menor ou igual a" },
  { value: "matches", label: "corresponde ao regex" },
  { value: "not_matches", label: "não corresponde ao regex" },
];

const outputFields = [
  { value: "content", label: "Conteúdo" },
  { value: "status", label: "Status" },
];

function ConditionDialog({
  open,
  onOpenChange,
  selectedNode,
  handleUpdateNode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNode: any;
  handleUpdateNode: any;
}) {
  const [selectedType, setSelectedType] = useState("previous-output");
  const [selectedField, setSelectedField] = useState(outputFields[0].value);
  const [selectedOperator, setSelectedOperator] = useState(operators[0].value);
  const [comparisonValue, setComparisonValue] = useState("");

  const handleConditionSave = (condition: ConditionType) => {
    const newConditions = selectedNode.data.conditions
      ? [...selectedNode.data.conditions]
      : [];
    newConditions.push(condition);

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        conditions: newConditions,
      },
    };

    handleUpdateNode(updatedNode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-4xl gap-4 bg-gray-800">
        <div className="w-1/4 border-r pr-4 border-gray-700">
          <h3 className="mb-4 font-bold text-white">Tipos de Condição</h3>
          {conditionTypes.map((type) => (
            <div
              key={type.id}
              className={`mb-2 cursor-pointer rounded-lg p-2 ${
                selectedType === type.id
                  ? "bg-blue-900"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <div className="flex items-center gap-2">
                <span>{type.icon}</span>
                <div>
                  <p className="font-semibold text-white">{type.name}</p>
                  <p className="text-xs text-gray-400">
                    {type.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-3/4">
          <h3 className="mb-4 font-bold text-white">
            Configurar Condição
          </h3>

          {selectedType === "previous-output" && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-200">
                  Campo do output
                </label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full rounded-lg border p-2 border-gray-600 bg-gray-700 text-white"
                >
                  {outputFields.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-200">
                  Operador
                </label>
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  className="w-full rounded-lg border p-2 border-gray-600 bg-gray-700 text-white"
                >
                  {operators.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              {!["is_defined", "is_not_defined"].includes(selectedOperator) && (
                <div>
                  <label className="mb-2 block text-sm text-gray-200">
                    Valor para comparação
                  </label>
                  <input
                    type="text"
                    value={comparisonValue}
                    onChange={(e) => setComparisonValue(e.target.value)}
                    className="w-full rounded-lg border p-2 border-gray-600 bg-gray-700 text-white"
                  />
                </div>
              )}

              <button
                className="mt-4 w-full rounded-lg px-4 py-2 text-white bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  handleConditionSave({
                    id: uuidv4(),
                    type: ConditionTypeEnum.PREVIOUS_OUTPUT,
                    data: {
                      field: selectedField,
                      operator: selectedOperator,
                      value: comparisonValue,
                    },
                  });
                }}
              >
                Adicionar Condição
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ConditionDialog };
