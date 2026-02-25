import { decrypt } from "@/lib/utils/encryption";
import axios from "axios";
import { IAction, IActionInput } from "../types/actions";
import { executeAPIAction as originalExecuteAPIAction } from "./api-actions-utils";
import { tool, ToolSet } from "ai";
import z from "zod";

export const executeAPIAction = async (
  action: IAction,
  params: Record<string, any>,
) => {
  const decryptedAction = { ...action };

  console.log("decryptedAction :", decryptedAction);

  if (decryptedAction.authorization) {
    if (
      decryptedAction.authorization.type === "api-key" &&
      decryptedAction.authorization.apiKey
    ) {
      decryptedAction.authorization.apiKey = {
        ...decryptedAction.authorization.apiKey,
        value: decrypt(decryptedAction.authorization.apiKey.value),
      };
    } else if (
      decryptedAction.authorization.type === "bearer-token" &&
      decryptedAction.authorization.bearerToken
    ) {
      decryptedAction.authorization.bearerToken = {
        ...decryptedAction.authorization.bearerToken,
        token: decrypt(decryptedAction.authorization.bearerToken.token),
      };
    } else if (
      decryptedAction.authorization.type === "basic" &&
      decryptedAction.authorization.basic
    ) {
      decryptedAction.authorization.basic = {
        ...decryptedAction.authorization.basic,
        username: decrypt(decryptedAction.authorization.basic.username),
        password: decrypt(decryptedAction.authorization.basic.password),
      };
    }
  }
  return originalExecuteAPIAction(decryptedAction, params);
};

const inputToZodSchema = (input: IActionInput): z.ZodTypeAny => {
  let schema: z.ZodTypeAny;

  switch (input.type) {
    case "number":
      schema = z.number();
      break;
    case "boolean":
      schema = z.boolean();
      break;
    case "object": {
      const childSchemas: Record<string, z.ZodTypeAny> = {};
      if (input.children && input.children.length > 0) {
        for (const child of input.children) {
          const childSchema = inputToZodSchema(child);
          childSchemas[child.key] = child.required
            ? childSchema
            : childSchema.optional();
        }
      }
      schema = z.object(childSchemas);
      break;
    }
    case "array": {
      if (input.children && input.children.length > 0) {
        const childSchemas: Record<string, z.ZodTypeAny> = {};
        for (const child of input.children) {
          const childSchema = inputToZodSchema(child);
          childSchemas[child.key] = child.required
            ? childSchema
            : childSchema.optional();
        }
        schema = z.array(z.object(childSchemas));
      } else {
        schema = z.array(z.any());
      }
      break;
    }
    case "string":
    case "url":
    default:
      schema = z.string();
      break;
  }

  if (input.description) {
    schema = schema.describe(input.description);
  }

  return schema;
};

export const getCustomTools = (actions: IAction[]): ToolSet => {
  return actions.reduce((acc, action) => {
    acc[action.slug] = tool({
      name: action.name,
      description: action.description,
      inputSchema: z.object({
        ...[...(action.query || []), ...(action.body || [])].reduce(
          (acc: Record<string, any>, input) => {
            const schema = inputToZodSchema(input);
            acc[input.key] = input.required ? schema : schema.optional();
            return acc;
          },
          {} as Record<string, any>,
        ),
      }),
      execute: async (params) => {
        return executeAPIAction(action, params);
      },
    });
    return acc;
  }, {} as ToolSet);
};
