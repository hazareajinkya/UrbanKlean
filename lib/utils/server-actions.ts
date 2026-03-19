import { IAction, IActionInput } from "../types/actions";
import { tool, ToolSet } from "ai";
import z from "zod";
import { backendClient } from "../clients/axios-client";

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
        // return executeAPIAction(action, params);
        try {
          const response = await backendClient.post("/actions/execute", {
            aid: action.id,
            wid: action.wid,
            params,
          });
          return response.data;
        } catch (error) {
          console.log("error :", JSON.stringify(error));
          return error;
        }
      },
    });
    return acc;
  }, {} as ToolSet);
};
