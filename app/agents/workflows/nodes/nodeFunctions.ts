/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
export enum ConditionTypeEnum {
  PREVIOUS_OUTPUT = "previous-output",
}

export type ConditionType = {
  id: string;
  type: ConditionTypeEnum;
  data?: any;
};

export type StatisticType = {
  executions: number;
  success: number;
  error: number;
};