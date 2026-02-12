"use client";

import React, { useState } from "react";
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
import axios from "axios";
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
import {
  Plus,
  Trash2,
  X,
  RefreshCw,
  Settings,
  Loader,
  TestTube,
  EyeOff,
  Play,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import TestApiRequest from "./test-api-request";

interface AddApiActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wid: string;
  editingAction?: IAction | null;
}

interface InputRowProps {
  input: IActionInput;
  depth: number;
  onUpdate: (field: keyof IActionInput, value: any) => void;
  onRemove: () => void;
  onAddChild: (path: number[]) => void;
  onUpdateChild: (path: number[], childIndex: number, field: keyof IActionInput, value: any) => void;
  onRemoveChild: (path: number[], childIndex: number) => void;
}

const InputRow: React.FC<InputRowProps> = ({
  input,
  depth,
  onUpdate,
  onRemove,
  onAddChild,
  onUpdateChild,
  onRemoveChild,
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = input.type === "object" || input.type === "array";
  const paddingLeft = depth * 24;

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-1" style={{ paddingLeft }}>
            {hasChildren && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="p-0.5 hover:bg-muted rounded"
              >
                {expanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            )}
            <Input
              value={input.key}
              onChange={(e) => onUpdate("key", e.target.value)}
              placeholder={depth === 0 ? "city" : "child_key"}
              className="w-full"
            />
          </div>
        </TableCell>
        <TableCell>
          <Input
            value={input.description || ""}
            onChange={(e) => onUpdate("description", e.target.value)}
            placeholder="Description"
            className="w-full"
          />
        </TableCell>
        <TableCell>
          <Select
            value={input.type}
            onValueChange={(value) => onUpdate("type", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="object">Object</SelectItem>
              <SelectItem value="array">Array</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-center">
          <Switch
            checked={input.required}
            onCheckedChange={(checked) => onUpdate("required", checked)}
          />
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-1">
            {hasChildren && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddChild([])}
                title="Add child parameter"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {hasChildren && expanded && input.children?.map((child, childIndex) => (
        <InputRow
          key={childIndex}
          input={child}
          depth={depth + 1}
          onUpdate={(field, value) => onUpdateChild([], childIndex, field, value)}
          onRemove={() => onRemoveChild([], childIndex)}
          onAddChild={(path) => onAddChild([childIndex, ...path])}
          onUpdateChild={(path, grandChildIndex, field, value) =>
            onUpdateChild([childIndex, ...path], grandChildIndex, field, value)
          }
          onRemoveChild={(path, grandChildIndex) =>
            onRemoveChild([childIndex, ...path], grandChildIndex)
          }
        />
      ))}
    </>
  );
};

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
    inputs: IActionInput[];
    headers: Array<{ key: string; value: string }>;
    authorization: IActionAuthorization;
  }>({
    name: editingAction?.name || "",
    description: editingAction?.description || "",
    method: editingAction?.requestType || "GET",
    url: editingAction?.apiUrl || "",
    inputs:
      editingAction?.inputs && editingAction.inputs.length > 0
        ? editingAction.inputs.map((input, index) => ({
          key: input.key || `param_${index}`,
          description: input.description || "",
          type: input.type,
          required: input.required,
          children: input.children,
        }))
        : [
          {
            key: "",
            description: "",
            type: "string" as IActionInput["type"],
            required: false,
          },
        ],
    headers: Object.entries(editingAction?.headers || {}).map(
      ([key, value]) => ({
        key,
        value,
      })
    ),
    authorization: editingAction?.authorization || { type: "none" },
  });

  const [activeTab, setActiveTab] = useState("parameters");
  const [showTestPanel, setShowTestPanel] = useState(false);
  const { saveAction, updateAction } = useAiActionsActions();

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

    const actionData: IAction = {
      id: editingAction?.id || uuidv4(),
      wid,
      name: formData.name,
      apiUrl: formData.url,
      slug: formData.name.toLowerCase().replace(/\s+/g, "_"),
      description: formData.description,
      type: "user",
      requestType: formData.method as IRequestType,
      headers: formData.headers.reduce((acc, header) => {
        if (header.key && header.value) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {} as Record<string, string>),
      authorization: authorization,
      inputs: formData.inputs.map((param) => mapInputForSave(param)),
      createdAt: editingAction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
    };

    if (editingAction) {
      updateAction.mutate(
        { wid, updates: actionData },
        {
          onSuccess: () => onClose(),
        }
      );
    } else {
      saveAction.mutate(
        { wid, action: actionData },
        {
          onSuccess: () => onClose(),
        }
      );
    }
  };

  const mapInputForSave = (input: IActionInput): IActionInput => {
    const result: IActionInput = {
      type: input.type,
      key: input.key,
      required: input.required,
      description: input.description,
    };
    if ((input.type === "object" || input.type === "array") && input.children) {
      result.children = input.children.map(mapInputForSave);
    }
    return result;
  };

  const addInput = () => {
    setFormData((prev) => ({
      ...prev,
      inputs: [
        ...prev.inputs,
        {
          key: "",
          description: "",
          type: "string",
          required: false,
        },
      ],
    }));
  };

  const updateInput = (
    index: number,
    field: keyof IActionInput,
    value: any
  ) => {
    setFormData((prev) => {
      const newInputs = [...prev.inputs];
      const updated = { ...newInputs[index], [field]: value };
      // When switching to object/array, initialize children if empty
      if (field === "type" && (value === "object" || value === "array") && !updated.children) {
        updated.children = [];
      }
      // When switching away from object/array, remove children
      if (field === "type" && value !== "object" && value !== "array") {
        delete updated.children;
      }
      newInputs[index] = updated;
      return { ...prev, inputs: newInputs };
    });
  };

  const removeInput = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      inputs: prev.inputs.filter((_, i) => i !== index),
    }));
  };

  // --- Nested children helpers ---
  const updateNestedChildren = (
    inputs: IActionInput[],
    path: number[],
    updater: (children: IActionInput[]) => IActionInput[]
  ): IActionInput[] => {
    if (path.length === 0) return updater(inputs);
    const [head, ...rest] = path;
    return inputs.map((input, i) => {
      if (i !== head) return input;
      return {
        ...input,
        children: updateNestedChildren(input.children || [], rest, updater),
      };
    });
  };

  const addChildInput = (parentPath: number[]) => {
    setFormData((prev) => ({
      ...prev,
      inputs: updateNestedChildren(prev.inputs, parentPath, (children) => [
        ...children,
        { key: "", description: "", type: "string" as IActionInput["type"], required: false },
      ]),
    }));
  };

  const updateChildInput = (
    parentPath: number[],
    childIndex: number,
    field: keyof IActionInput,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      inputs: updateNestedChildren(prev.inputs, parentPath, (children) =>
        children.map((child, i) => {
          if (i !== childIndex) return child;
          const updated = { ...child, [field]: value };
          if (field === "type" && (value === "object" || value === "array") && !updated.children) {
            updated.children = [];
          }
          if (field === "type" && value !== "object" && value !== "array") {
            delete updated.children;
          }
          return updated;
        })
      ),
    }));
  };

  const removeChildInput = (parentPath: number[], childIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      inputs: updateNestedChildren(prev.inputs, parentPath, (children) =>
        children.filter((_, i) => i !== childIndex)
      ),
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
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      headers: prev.headers.map((header, i) =>
        i === index ? { ...header, [field]: value } : header
      ),
    }));
  };

  const removeHeader = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index),
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className={`${showTestPanel ? "max-w-6xl" : "max-w-3xl"
        } bg-white dark:bg-gray-900 rounded-xl p-6 transition-all duration-300`}
    >
      <div
        className={`grid grid-cols-1 ${showTestPanel ? "lg:grid-cols-[2fr_1fr]" : "lg:grid-cols-1"
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

              <TabsContent value="parameters" className="space-y-4 pt-2 pb-4">
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
                      {formData.inputs.map((input, index) => (
                        <InputRow
                          key={index}
                          input={input}
                          depth={0}
                          onUpdate={(field, value) => updateInput(index, field, value)}
                          onRemove={() => removeInput(index)}
                          onAddChild={(path) => addChildInput([index, ...path])}
                          onUpdateChild={(path, childIndex, field, value) =>
                            updateChildInput([index, ...path], childIndex, field, value)
                          }
                          onRemoveChild={(path, childIndex) =>
                            removeChildInput([index, ...path], childIndex)
                          }
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Button variant="outline" onClick={addInput} className="">
                  <Plus className="w-4 h-4" />
                  Add Parameter
                </Button>
              </TabsContent>

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
              inputs={formData.inputs}
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
