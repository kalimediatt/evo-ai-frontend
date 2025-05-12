/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
export enum ConditionTypeEnum {
  PREVIOUS_OUTPUT = "previous-output",
}

export enum MessageTypeEnum {
  TEXT = "text",
}

export type MessageType = {
  type: MessageTypeEnum;
  content: string;
};

export type ConditionType = {
  id: string;
  type: ConditionTypeEnum;
  data?: any;
};

