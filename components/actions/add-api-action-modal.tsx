"use client";

import { Fragment, useState } from "react";
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
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import TestApiRequest from "./test-api-request";

interface AddApiActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wid: string;
  editingAction?: IAction | null;
}

type IUiActionInput = Omit<IActionInput, "children"> & {
  uiId: string;
  children?: IUiActionInput[];
};
type InputField = "key" | "description" | "type" | "required";

const AddApiActionModal = ({
  isOpen,
  onClose,
  wid,
  editingAction,
}: AddApiActionModalProps) => {
  const toUiInputs = (inputs: IActionInput[]): IUiActionInput[] =>
    inputs.map((input) => ({
      ...input,
      uiId: uuidv4(),
      children: input.children ? toUiInputs(input.children) : [],
    }));

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    method: string;
    url: string;
    inputs: IUiActionInput[];
    headers: Array<{ key: string; value: string }>;
    authorization: IActionAuthorization;
  }>({
    name: editingAction?.name || "",
    description: editingAction?.description || "",
    method: editingAction?.requestType || "GET",
    url: editingAction?.apiUrl || "",
    inputs:
      editingAction?.inputs && editingAction.inputs.length > 0
        ? toUiInputs(
            editingAction.inputs.map((input, index) => ({
              ...input,
              key: input.key || `param_${index}`,
            })),
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

  const handleSave = () => {
    const sanitizeInputs = (inputs: IUiActionInput[]): IActionInput[] =>
      inputs
        .filter((param) => param.key?.trim())
        .map((param) => {
          const children =
            param.children && param.children.length
              ? sanitizeInputs(param.children)
              : [];
          return {
            type: param.type,
            key: param.key,
            required: param.required,
            description: param.description,
            ...(children.length ? { children } : {}),
          };
        });

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
      authorization: formData.authorization,
      inputs: sanitizeInputs(formData.inputs),
      createdAt: editingAction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

  const addInput = () => {
    setFormData((prev) => ({
      ...prev,
      inputs: [
        ...prev.inputs,
        {
          uiId: uuidv4(),
          key: "",
          description: "",
          type: "string",
          required: false,
        },
      ],
    }));
  };

  const updateInput = (index: number, field: InputField, value: any) => {
    setFormData((prev) => ({
      ...prev,
      inputs: prev.inputs.map((input, i) =>
        i === index
          ? {
              ...input,
              [field]: value,
              children:
                field === "type" && value !== "object"
                  ? ([] as IUiActionInput[])
                  : input.children,
            }
          : input,
      ),
    }));
  };

  const addNestedInput = (parentIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      inputs: prev.inputs.map((input, i) =>
        i === parentIndex
          ? {
              ...input,
              children: [
                ...(input.children || []),
                {
                  uiId: uuidv4(),
                  key: "",
                  description: "",
                  type: "string",
                  required: false,
                },
              ],
            }
          : input,
      ),
    }));
  };

  const updateNestedInput = (
    parentIndex: number,
    index: number,
    field: InputField,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      inputs: prev.inputs.map((input, i) =>
        i === parentIndex
          ? {
              ...input,
              children: (input.children || []).map((child, ci) =>
                ci === index
                  ? {
                      ...child,
                      [field]: value,
                      children:
                        field === "type" && value !== "object"
                          ? ([] as IUiActionInput[])
                          : child.children,
                    }
                  : child,
              ),
            }
          : input,
      ),
    }));
  };

  const removeNestedInput = (parentIndex: number, index: number) => {
    setFormData((prev) => ({
      ...prev,
      inputs: prev.inputs.map((input, i) =>
        i === parentIndex
          ? {
              ...input,
              children: (input.children || []).filter((_, ci) => ci !== index),
            }
          : input,
      ),
    }));
  };

  const removeInput = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      inputs: prev.inputs.filter((_, i) => i !== index),
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
        } gap-6 h-[75vh] w-full`}
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
                  {formData.inputs.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground bg-muted/30 rounded-md">
                      Add Parameter to add inputs if your API needs them.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-center">
                            Required
                          </TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.inputs.map((input, index) => (
                          <Fragment key={input.uiId}>
                            <TableRow>
                              <TableCell>
                                <Input
                                  value={input.key}
                                  onChange={(e) =>
                                    updateInput(index, "key", e.target.value)
                                  }
                                  placeholder="city"
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={input.description || ""}
                                  onChange={(e) =>
                                    updateInput(
                                      index,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="City of the user"
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={input.type}
                                  onValueChange={(value) =>
                                    updateInput(index, "type", value)
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="string">
                                      String
                                    </SelectItem>
                                    <SelectItem value="number">
                                      Number
                                    </SelectItem>
                                    <SelectItem value="boolean">
                                      Boolean
                                    </SelectItem>
                                    <SelectItem value="url">URL</SelectItem>
                                    <SelectItem value="object">
                                      Object (JSON)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={input.required}
                                  onCheckedChange={(checked) =>
                                    updateInput(index, "required", checked)
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeInput(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                            {input.type === "object" && (
                              <>
                                <TableRow>
                                  <TableCell colSpan={5}>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span className="font-medium">-&gt;</span>
                                      <span className="font-medium">
                                        Nested variables for{" "}
                                        {input.key || "object"}
                                      </span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                {(input.children || []).map(
                                  (child, childIndex) => (
                                    <TableRow key={child.uiId}>
                                      <TableCell className="pl-8">
                                        <Input
                                          value={child.key}
                                          onChange={(e) =>
                                            updateNestedInput(
                                              index,
                                              childIndex,
                                              "key",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="field"
                                          className="w-full"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          value={child.description || ""}
                                          onChange={(e) =>
                                            updateNestedInput(
                                              index,
                                              childIndex,
                                              "description",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="Field description"
                                          className="w-full"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Select
                                          value={child.type}
                                          onValueChange={(value) =>
                                            updateNestedInput(
                                              index,
                                              childIndex,
                                              "type",
                                              value,
                                            )
                                          }
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="string">
                                              String
                                            </SelectItem>
                                            <SelectItem value="number">
                                              Number
                                            </SelectItem>
                                            <SelectItem value="boolean">
                                              Boolean
                                            </SelectItem>
                                            <SelectItem value="url">
                                              URL
                                            </SelectItem>
                                            <SelectItem value="object">
                                              Object (JSON)
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Switch
                                          checked={child.required}
                                          onCheckedChange={(checked) =>
                                            updateNestedInput(
                                              index,
                                              childIndex,
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
                                          onClick={() =>
                                            removeNestedInput(index, childIndex)
                                          }
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ),
                                )}
                                <TableRow>
                                  <TableCell colSpan={5} className="pl-8">
                                    <Button
                                      variant="outline"
                                      onClick={() => addNestedInput(index)}
                                      className="gap-2"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add Variable
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              </>
                            )}
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  )}
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
