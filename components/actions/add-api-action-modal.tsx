"use client";

import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import actionService from "@/lib/services/action-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import Modal from "@/components/ui/modal";
import {
  IAction,
  IActionInput,
  IRequestType,
  IActionAuthorization,
} from "@/lib/types/actions";
import { useAiActionsActions } from "@/lib/hooks/actions/use-ai-actions-actions";
import { ArrowRight, Plus, Trash2, X, Loader, Play } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import TestApiRequest from "./test-api-request";

type InputTarget = "query" | "body";

interface AddApiActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wid: string;
  editingAction?: IAction | null;
}

const normalizeInput = (
  input: IActionInput,
  fallbackKey: string,
): IActionInput => ({
  key: input.key || fallbackKey,
  description: input.description || "",
  type: input.type,
  required: input.required,
  children: input.children?.map((child, i) =>
    normalizeInput(child, `field_${i}`),
  ),
});

const mapInputForSave = (input: IActionInput): IActionInput => {
  const result: IActionInput = {
    type: input.type,
    key: input.key,
    required: input.required,
    description: input.description,
  };
  if ((input.type === "object" || input.type === "array") && input.children) {
    result.children = input.children
      .filter((child) => child.key.trim() !== "")
      .map(mapInputForSave);
  }
  return result;
};

const METHODS_WITH_BODY: IRequestType[] = ["POST", "PUT", "PATCH", "DELETE"];

const AddApiActionModal = ({
  isOpen,
  onClose,
  wid,
  editingAction,
}: AddApiActionModalProps) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    method: string;
    url: string;
    query: IActionInput[];
    body: IActionInput[];
    headers: Array<{ key: string; value: string }>;
    authorization: IActionAuthorization;
  }>({
    name: editingAction?.name || "",
    description: editingAction?.description || "",
    method: editingAction?.requestType || "GET",
    url: editingAction?.apiUrl || "",
    query:
      editingAction?.query && editingAction.query.length > 0
        ? editingAction.query.map((input, index) =>
            normalizeInput(input, `param_${index}`),
          )
        : [],
    body:
      editingAction?.body && editingAction.body.length > 0
        ? editingAction.body.map((input, index) =>
            normalizeInput(input, `field_${index}`),
          )
        : [],
    headers: Object.entries(editingAction?.headers || {}).map(
      ([key, value]) => ({
        key,
        value,
      }),
    ),
    authorization: editingAction?.authorization || { type: "none" },
  });

  const [activeTab, setActiveTab] = useState("parameters");
  const [showTestPanel, setShowTestPanel] = useState(false);
  const { saveAction, updateAction } = useAiActionsActions();

  const showBodyTab = METHODS_WITH_BODY.includes(
    formData.method as IRequestType,
  );

  // Auto-extract {param} variables from URL and sync into query params
  useEffect(() => {
    const urlValue = formData.url;
    if (!urlValue) return;

    const templateVarRegex = /\{([\w-]+)\}/g;
    const extractedKeys: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = templateVarRegex.exec(urlValue)) !== null) {
      extractedKeys.push(match[1]);
    }

    if (extractedKeys.length === 0) return;

    setFormData((prev) => {
      const existingKeys = new Set(prev.query.map((q) => q.key));
      const newParams: IActionInput[] = extractedKeys
        .filter((key) => !existingKeys.has(key))
        .map((key) => ({
          key,
          description: "",
          type: "string" as const,
          required: true,
        }));

      if (newParams.length === 0) return prev;

      return {
        ...prev,
        query: [...prev.query, ...newParams],
      };
    });
  }, [formData.url]);

  // If method changes to one without body, switch away from body tab
  useEffect(() => {
    if (!showBodyTab && activeTab === "body") {
      setActiveTab("parameters");
    }
  }, [showBodyTab, activeTab]);

  const handleSave = async () => {
    let authorization = { ...formData.authorization };
    try {
      authorization = await actionService.encryptActionAuthorization({
        authorization,
        existingAuthorization: editingAction?.authorization,
      });
    } catch (error) {
      console.error("Failed to encrypt settings:", error);
      return;
    }

    const sanitizedQuery = formData.query
      .filter((param) => param.key.trim() !== "")
      .map(mapInputForSave);
    const sanitizedBody = formData.body
      .filter((param) => param.key.trim() !== "")
      .map(mapInputForSave);

    const actionData: IAction = {
      id: editingAction?.id || uuidv4(),
      wid,
      name: formData.name,
      apiUrl: formData.url,
      slug: formData.name.toLowerCase().replace(/\s+/g, "_"),
      description: formData.description,
      type: "user",
      requestType: formData.method as IRequestType,
      headers: formData.headers.reduce(
        (acc, header) => {
          if (header.key && header.value) {
            acc[header.key] = header.value;
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
      authorization: authorization,
      query: sanitizedQuery.length > 0 ? sanitizedQuery : undefined,
      body: sanitizedBody.length > 0 ? sanitizedBody : undefined,
      createdAt: editingAction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
    };

    if (editingAction) {
      updateAction.mutate(
        { wid, updates: actionData },
        {
          onSuccess: () => onClose(),
        },
      );
    } else {
      saveAction.mutate(
        { wid, action: actionData },
        {
          onSuccess: () => onClose(),
        },
      );
    }
  };

  const handleAddInput = (target: InputTarget) => {
    setFormData((prev) => ({
      ...prev,
      [target]: [
        ...prev[target],
        {
          key: "",
          description: "",
          type: "string",
          required: false,
        },
      ],
    }));
  };

  const handleUpdateInput = (
    target: InputTarget,
    index: number,
    field: keyof IActionInput,
    value: IActionInput[keyof IActionInput],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [target]: prev[target].map((input, inputIndex) => {
        if (inputIndex !== index) return input;

        if (field === "type") {
          const nextType = value as IActionInput["type"];
          if (nextType === "object" || nextType === "array") {
            return {
              ...input,
              type: nextType,
              children: input.children || [],
            };
          }

          return {
            ...input,
            type: nextType,
            children: undefined,
          };
        }

        return { ...input, [field]: value };
      }),
    }));
  };

  const handleRemoveInput = (target: InputTarget, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [target]: prev[target].filter((_, inputIndex) => inputIndex !== index),
    }));
  };

  const handleAddObjectVariable = (target: InputTarget, inputIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      [target]: prev[target].map((input, currentIndex) => {
        if (currentIndex !== inputIndex) return input;
        return {
          ...input,
          children: [
            ...(input.children || []),
            {
              key: "",
              description: "",
              type: "string",
              required: false,
            },
          ],
        };
      }),
    }));
  };

  const handleUpdateObjectVariable = (args: {
    target: InputTarget;
    inputIndex: number;
    variableIndex: number;
    field: keyof IActionInput;
    value: IActionInput[keyof IActionInput];
  }) => {
    setFormData((prev) => ({
      ...prev,
      [args.target]: prev[args.target].map((input, currentInputIndex) => {
        if (currentInputIndex !== args.inputIndex) return input;

        return {
          ...input,
          children: (input.children || []).map(
            (variable, currentVariableIndex) => {
              if (currentVariableIndex !== args.variableIndex) return variable;
              if (args.field === "type") {
                const nextType = args.value as IActionInput["type"];
                if (nextType === "object" || nextType === "array") {
                  return {
                    ...variable,
                    type: nextType,
                    children: variable.children || [],
                  };
                }

                return {
                  ...variable,
                  type: nextType,
                  children: undefined,
                };
              }

              return { ...variable, [args.field]: args.value };
            },
          ),
        };
      }),
    }));
  };

  const handleRemoveObjectVariable = (args: {
    target: InputTarget;
    inputIndex: number;
    variableIndex: number;
  }) => {
    setFormData((prev) => ({
      ...prev,
      [args.target]: prev[args.target].map((input, currentInputIndex) => {
        if (currentInputIndex !== args.inputIndex) return input;

        return {
          ...input,
          children: (input.children || []).filter(
            (_, currentVariableIndex) =>
              currentVariableIndex !== args.variableIndex,
          ),
        };
      }),
    }));
  };

  const addHeader = () => {
    setFormData((prev) => ({
      ...prev,
      headers: [
        ...prev.headers,
        {
          key: "",
          value: "",
        },
      ],
    }));
  };

  const updateHeader = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      headers: prev.headers.map((header, i) =>
        i === index ? { ...header, [field]: value } : header,
      ),
    }));
  };

  const removeHeader = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index),
    }));
  };

  const renderInputTable = (config: {
    target: InputTarget;
    tabValue: string;
    items: IActionInput[];
    emptyMessage: string;
    addButtonLabel: string;
    keyPlaceholder: string;
  }) => (
    <TabsContent value={config.tabValue} className="space-y-4 pt-2 pb-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Required</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {config.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  {config.emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              config.items.map((input, index) => (
                <Fragment key={index}>
                  <TableRow>
                    <TableCell>
                      <Input
                        value={input.key}
                        onChange={(event) =>
                          handleUpdateInput(
                            config.target,
                            index,
                            "key",
                            event.target.value,
                          )
                        }
                        placeholder={config.keyPlaceholder}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={input.description || ""}
                        onChange={(event) =>
                          handleUpdateInput(
                            config.target,
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        placeholder="Description"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={input.type}
                        onValueChange={(value) =>
                          handleUpdateInput(config.target, index, "type", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="object">Object (JSON)</SelectItem>
                          <SelectItem value="array">Array (JSON)</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={input.required}
                        onCheckedChange={(checked) =>
                          handleUpdateInput(
                            config.target,
                            index,
                            "required",
                            checked,
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveInput(config.target, index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {input.type === "object" || input.type === "array" ? (
                    <>
                      <TableRow className="bg-muted/20">
                        <TableCell className="pl-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <ArrowRight className="size-3" />
                            Nested variables for{" "}
                            <span className="font-medium text-foreground">
                              {input.key ||
                                (input.type === "array" ? "array" : "object")}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>

                      {(input.children || []).map(
                        (
                          objectVariable: IActionInput,
                          variableIndex: number,
                        ) => (
                          <TableRow
                            key={`${index}-${variableIndex}`}
                            className="bg-muted/10"
                          >
                            <TableCell className="pl-8">
                              <Input
                                value={objectVariable.key}
                                onChange={(event) =>
                                  handleUpdateObjectVariable({
                                    target: config.target,
                                    inputIndex: index,
                                    variableIndex,
                                    field: "key",
                                    value: event.target.value,
                                  })
                                }
                                placeholder="field"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={objectVariable.description || ""}
                                onChange={(event) =>
                                  handleUpdateObjectVariable({
                                    target: config.target,
                                    inputIndex: index,
                                    variableIndex,
                                    field: "description",
                                    value: event.target.value,
                                  })
                                }
                                placeholder="Field description"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={objectVariable.type}
                                onValueChange={(value) =>
                                  handleUpdateObjectVariable({
                                    target: config.target,
                                    inputIndex: index,
                                    variableIndex,
                                    field: "type",
                                    value,
                                  })
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="boolean">
                                    Boolean
                                  </SelectItem>
                                  <SelectItem value="url">URL</SelectItem>
                                  <SelectItem value="object">
                                    Object (JSON)
                                  </SelectItem>
                                  <SelectItem value="array">
                                    Array (JSON)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={objectVariable.required}
                                onCheckedChange={(checked) =>
                                  handleUpdateObjectVariable({
                                    target: config.target,
                                    inputIndex: index,
                                    variableIndex,
                                    field: "required",
                                    value: checked,
                                  })
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleRemoveObjectVariable({
                                    target: config.target,
                                    inputIndex: index,
                                    variableIndex,
                                  })
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ),
                      )}

                      <TableRow className="bg-muted/10">
                        <TableCell className="pl-8">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleAddObjectVariable(config.target, index)
                            }
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Variable
                          </Button>
                        </TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    </>
                  ) : null}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Button variant="outline" onClick={() => handleAddInput(config.target)}>
        <Plus className="w-4 h-4" />
        {config.addButtonLabel}
      </Button>
    </TabsContent>
  );

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className={`${
        showTestPanel ? "max-w-6xl" : "max-w-3xl"
      } bg-white dark:bg-gray-900 rounded-xl p-6 transition-all duration-300`}
    >
      <div
        className={`grid grid-cols-1 ${
          showTestPanel ? "lg:grid-cols-[2fr_1fr]" : "lg:grid-cols-1"
        } gap-6 h-[75vh]`}
      >
        {/* Left Panel - Form */}
        <div className="flex flex-col min-h-0">
          {/* Header - Always Visible */}
          <div className="flex items-center justify-between border-b pb-2 mb-6">
            <div>
              <h2 className="text-lg font-medium">
                {editingAction ? "Edit API Action" : "Create API Action"}
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pr-4 space-y-6 min-h-0">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Get current weather"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Get current weather of a given location."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <div className="flex mt-2">
                  <Select
                    value={formData.method}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, method: value }))
                    }
                  >
                    <SelectTrigger className="w-24 rounded-r-none border-r-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={formData.url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder="https://weatherapi.com/v1"
                    className="rounded-l-none flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="">
                <TabsList className="w-full gap-6">
                  <TabsTrigger
                    value="parameters"
                    className="border-b-2 border-transparent data-[state=active]:border-primary "
                  >
                    Parameters
                  </TabsTrigger>
                  {showBodyTab && (
                    <TabsTrigger
                      value="body"
                      className="border-b-2 border-transparent data-[state=active]:border-primary "
                    >
                      Body
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="authorization"
                    className="border-b-2 border-transparent data-[state=active]:border-primary "
                  >
                    Authorization
                  </TabsTrigger>
                  <TabsTrigger
                    value="headers"
                    className="border-b-2 border-transparent data-[state=active]:border-primary "
                  >
                    Headers
                  </TabsTrigger>
                </TabsList>
              </div>

              {renderInputTable({
                target: "query",
                tabValue: "parameters",
                items: formData.query,
                emptyMessage: "No query parameters defined yet.",
                addButtonLabel: "Add Parameter",
                keyPlaceholder: "city",
              })}

              {showBodyTab &&
                renderInputTable({
                  target: "body",
                  tabValue: "body",
                  items: formData.body,
                  emptyMessage: "No body fields defined yet.",
                  addButtonLabel: "Add Body Field",
                  keyPlaceholder: "field_name",
                })}

              <TabsContent
                value="authorization"
                className="space-y-4 pt-2 pb-4"
              >
                <div className="space-y-4">
                  <div>
                    <Label>Authorization Type</Label>
                    <Select
                      value={formData.authorization.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          authorization: {
                            type: value as IActionAuthorization["type"],
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="api-key">API Key</SelectItem>
                        <SelectItem value="bearer-token">
                          Bearer Token
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.authorization.type === "api-key" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Key</Label>
                        <Input
                          value={formData.authorization.apiKey?.key || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              authorization: {
                                ...prev.authorization,
                                apiKey: {
                                  ...prev.authorization.apiKey,
                                  key: e.target.value,
                                  value: prev.authorization.apiKey?.value || "",
                                  location:
                                    prev.authorization.apiKey?.location ||
                                    "header",
                                },
                              },
                            }))
                          }
                          placeholder="x-api-key"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input
                          value={formData.authorization.apiKey?.value || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              authorization: {
                                ...prev.authorization,
                                apiKey: {
                                  ...prev.authorization.apiKey,
                                  key: prev.authorization.apiKey?.key || "",
                                  value: e.target.value,
                                  location:
                                    prev.authorization.apiKey?.location ||
                                    "header",
                                },
                              },
                            }))
                          }
                          placeholder="your-api-key"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Select
                          value={
                            formData.authorization.apiKey?.location || "header"
                          }
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              authorization: {
                                ...prev.authorization,
                                apiKey: {
                                  ...prev.authorization.apiKey,
                                  key: prev.authorization.apiKey?.key || "",
                                  value: prev.authorization.apiKey?.value || "",
                                  location: value as "header" | "query",
                                },
                              },
                            }))
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="header">Header</SelectItem>
                            <SelectItem value="query">
                              Query Parameter
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {formData.authorization.type === "bearer-token" && (
                    <div>
                      <Label>Token</Label>
                      <Input
                        value={formData.authorization.bearerToken?.token || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            authorization: {
                              ...prev.authorization,
                              bearerToken: { token: e.target.value },
                            },
                          }))
                        }
                        placeholder="Bearer xxxxx"
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="headers" className="space-y-4 pt-2 pb-4">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.headers.map((header, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              value={header.key}
                              onChange={(e) =>
                                updateHeader(index, "key", e.target.value)
                              }
                              placeholder="Content-Type"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={header.value}
                              onChange={(e) =>
                                updateHeader(index, "value", e.target.value)
                              }
                              placeholder="application/json"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeHeader(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Button variant="outline" onClick={addHeader} className="">
                  <Plus className="w-4 h-4" />
                  Add Header
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer - Always Visible */}
          <div className="flex justify-between pt-4 border-t flex-shrink-0 ">
            <Button
              variant="outline"
              onClick={() => setShowTestPanel(true)}
              className="gap-2"
              disabled={showTestPanel}
            >
              <Play className="w-4 h-4" />
              Test
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  !formData.name ||
                  !formData.description ||
                  saveAction.isPending ||
                  updateAction.isPending
                }
              >
                {saveAction.isPending || updateAction.isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : undefined}
                {editingAction ? "Update Custom Action" : "Save Custom Action"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Test Request Sidebar */}
        {showTestPanel && (
          <div className="border rounded-md bg-gray-50 dark:bg-gray-800 px-4 py-3 overflow-y-auto rounded-r-lg">
            <TestApiRequest
              url={formData.url}
              method={formData.method as IRequestType}
              query={formData.query}
              body={formData.body}
              headers={formData.headers}
              authorization={formData.authorization}
              onClose={() => setShowTestPanel(false)}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddApiActionModal;
