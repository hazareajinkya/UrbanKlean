"use client";

import { useEffect, useRef, useState } from "react";
import { Loader, RotateCcw, X } from "lucide-react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IFollowUpJob,
  IFollowUpScheduleInput,
  IPerson,
} from "@/lib/types/person";
import { IWaTemplate } from "@/lib/types/wa-api";
import {
  EMPTY_WA_TEMPLATES,
  useWaTemplates,
} from "@/lib/hooks/whatsapp/use-wa-templates";
import useFollowUpActions from "@/lib/hooks/followup/use-followup-actions";
import { CronInput } from "@/components/customers/cron-input";
import { FollowUpMessagePreview } from "@/components/customers/follow-up-message-preview";
import {
  CRON_DEFAULT,
  getAutoMappedValue,
  getCronValidationError,
  getDefaultOnceScheduleParts,
  getFollowUpSaveErrorMessage,
  getLocalTimezone,
  getTimezoneOptions,
  parseParamsFromComponents,
  toUtcTimestampFromLocal,
} from "@/lib/utils/follow-up-schedule";
import {
  buildWaHeaderSubmitComponent,
  extractVariablesCount,
  findWaTemplateComponent,
  getWaHeaderParameterSlotCount,
} from "@/lib/utils/wa-template";

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  wid: string;
  person: IPerson;
  followUp?: IFollowUpJob | null;
  onSaved: (person: IPerson) => void;
  onMutationPendingChange?: (pending: boolean) => void;
}

export default function FollowUpModal({
  isOpen,
  onClose,
  wid,
  person,
  followUp,
  onSaved,
  onMutationPendingChange,
}: FollowUpModalProps) {
  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    isFetching,
  } = useWaTemplates(wid, { enabled: isOpen });
  const templates = templatesData ?? EMPTY_WA_TEMPLATES;
  const { createFollowUp, updateFollowUp } = useFollowUpActions({ wid });

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [phone, setPhone] = useState(person.phones?.[0]?.value || "");
  const [timezone, setTimezone] = useState(getLocalTimezone());
  const [scheduleType, setScheduleType] = useState<"once" | "cron">("once");
  const [onceDate, setOnceDate] = useState("");
  const [onceTime, setOnceTime] = useState("");
  const [customCron, setCustomCron] = useState(CRON_DEFAULT);
  const [headerParams, setHeaderParams] = useState<string[]>([]);
  const [bodyParams, setBodyParams] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");

  const baseTimezoneOptions = getTimezoneOptions();
  const timezoneOptions =
    !timezone || baseTimezoneOptions.includes(timezone)
      ? baseTimezoneOptions
      : [timezone, ...baseTimezoneOptions];

  const selectedTemplate = !selectedTemplateId
    ? null
    : templates.find((template) => template.id === selectedTemplateId) || null;
  const allowScheduleWithoutTemplate = templates.length === 0;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const { date: toDatePart, time: toTimePart } =
      getDefaultOnceScheduleParts();

    setPhone(person.phones?.[0]?.value || "");
    setTimezone(getLocalTimezone());
    setOnceDate(toDatePart);
    setOnceTime(toTimePart);
    setCustomCron(CRON_DEFAULT);
    setHeaderParams([]);
    setBodyParams([]);
    setSubmitError("");

    if (followUp) {
      setScheduleType(followUp.schedule.type === "once" ? "once" : "cron");
      setTimezone(followUp.timezone || getLocalTimezone());
      setPhone(followUp.phone || person.phones?.[0]?.value || "");

      if (followUp.schedule.type === "once") {
        setOnceDate(followUp.schedule.date || toDatePart);
        setOnceTime(followUp.schedule.time || toTimePart);
      }

      if (followUp.schedule.type === "cron") {
        const existingCron = followUp.schedule.cron || CRON_DEFAULT;
        setCustomCron(existingCron);
      }

      const foundTemplate = followUp.template
        ? templates.find(
            (item) =>
              item.name === followUp.template?.name &&
              item.language === followUp.template?.languageCode,
          )
        : undefined;

      if (foundTemplate) {
        setSelectedTemplateId(foundTemplate.id);
      } else {
        setSelectedTemplateId("");
      }

      const params = parseParamsFromComponents(followUp.template?.components);
      setHeaderParams(params.headerParams);
      setBodyParams(params.bodyParams);
      return;
    }

    setScheduleType("once");
    setSelectedTemplateId("");
  }, [
    followUp,
    isOpen,
    person.emails,
    person.name,
    person.phones,
    person.company,
    person.title,
    person.location,
    templates,
  ]);

  useEffect(() => {
    if (!selectedTemplate) {
      return;
    }

    const headerComponent = findWaTemplateComponent(
      selectedTemplate.components,
      "HEADER",
    );
    const bodyComponent = findWaTemplateComponent(
      selectedTemplate.components,
      "BODY",
    );

    if (followUp) {
      return;
    }

    const headerCount = getWaHeaderParameterSlotCount(headerComponent);
    const bodyCount = extractVariablesCount(bodyComponent?.text);

    const nextHeaderParams = Array.from({ length: headerCount }, (_, index) =>
      getAutoMappedValue({ person, index: index + 1 }),
    );
    const nextBodyParams = Array.from({ length: bodyCount }, (_, index) =>
      getAutoMappedValue({ person, index: index + 1 }),
    );

    setHeaderParams((prev) =>
      prev.length === nextHeaderParams.length &&
      prev.every((item, index) => item === nextHeaderParams[index])
        ? prev
        : nextHeaderParams,
    );

    setBodyParams((prev) =>
      prev.length === nextBodyParams.length &&
      prev.every((item, index) => item === nextBodyParams[index])
        ? prev
        : nextBodyParams,
    );
  }, [followUp, person, selectedTemplate]);

  const isBusy = createFollowUp.isPending || updateFollowUp.isPending;

  const onMutationPendingChangeRef = useRef(onMutationPendingChange);
  onMutationPendingChangeRef.current = onMutationPendingChange;

  useEffect(() => {
    if (!isOpen) {
      onMutationPendingChangeRef.current?.(false);
      return;
    }
    onMutationPendingChangeRef.current?.(isBusy);
  }, [isOpen, isBusy]);

  const cronValidationError = getCronValidationError(customCron);

  const isCustomCronValid = cronValidationError.length === 0;

  const handleHeaderParamChange = (index: number, value: string) => {
    setHeaderParams((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  };

  const handleBodyParamChange = (index: number, value: string) => {
    setBodyParams((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  };

  const buildTemplateComponents = () => {
    if (!selectedTemplate) {
      return [];
    }

    const submitComponents: Array<{
      type: string;
      parameters: Array<
        | { type: "text"; text: string }
        | { type: "image"; image: { link: string } }
        | { type: "video"; video: { link: string } }
        | { type: "document"; document: { link: string } }
      >;
    }> = [];
    const header = findWaTemplateComponent(
      selectedTemplate.components,
      "HEADER",
    );

    if (header) {
      const headerBlock = buildWaHeaderSubmitComponent({
        header,
        headerParams,
      });
      if (headerBlock) {
        submitComponents.push(headerBlock);
      }
    }

    if (bodyParams.length > 0) {
      submitComponents.push({
        type: "body",
        parameters: bodyParams.map((param) => ({
          type: "text",
          text: param,
        })),
      });
    }

    return submitComponents;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");

    if (!allowScheduleWithoutTemplate && !selectedTemplate) {
      setSubmitError("Please select a template to continue.");
      return;
    }

    if (!phone || !timezone) {
      setSubmitError("Phone and timezone are required.");
      return;
    }

    if (scheduleType === "once") {
      if (!onceDate || !onceTime) {
        setSubmitError("Please select a valid one-time date and time.");
        return;
      }

      try {
        const runAt = toUtcTimestampFromLocal({
          date: onceDate,
          time: onceTime,
          timezone,
        });

        if (runAt <= Date.now()) {
          setSubmitError("One-time schedule must be in the future.");
          return;
        }
      } catch (error: unknown) {
        setSubmitError(
          error instanceof Error ? error.message : "Invalid one-time schedule.",
        );
        return;
      }
    }

    if (scheduleType === "cron" && !isCustomCronValid) {
      setSubmitError(cronValidationError || "Invalid cron expression.");
      return;
    }

    const schedule: IFollowUpScheduleInput =
      scheduleType === "once"
        ? { type: "once", date: onceDate, time: onceTime }
        : { type: "cron", cron: customCron.trim() };

    const payload = {
      personId: person.id,
      phone,
      timezone,
      schedule,
      template: selectedTemplate
        ? {
            name: selectedTemplate.name,
            languageCode: selectedTemplate.language,
            components: buildTemplateComponents(),
          }
        : null,
      isOnTest: allowScheduleWithoutTemplate,
    };

    try {
      const response = followUp
        ? await updateFollowUp.mutateAsync({
            ...payload,
            followUpId: followUp.id,
          })
        : await createFollowUp.mutateAsync(payload);

      onSaved(response.person as IPerson);
      onClose();
    } catch (error: unknown) {
      setSubmitError(getFollowUpSaveErrorMessage(error));
    }
  };

  const saveDisabled =
    (!allowScheduleWithoutTemplate && !selectedTemplate) ||
    !phone ||
    !timezone ||
    (scheduleType === "once" && (!onceDate || !onceTime)) ||
    (scheduleType === "cron" && !isCustomCronValid);

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className={`w-full rounded-xl border border-border bg-background p-0 overflow-hidden ${selectedTemplate ? "max-w-6xl" : "max-w-3xl"}`}
    >
      <div
        className={`relative grid w-full ${selectedTemplate ? "grid-cols-1 lg:grid-cols-[1fr_420px]" : "grid-cols-1"}`}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background"
          onClick={onClose}
          disabled={isBusy}
          aria-label="Close follow-up modal"
        >
          <X className="h-4 w-4" />
        </Button>
        <form className="w-full flex" onSubmit={handleSubmit}>
          <div className="flex-1 flex flex-col">
            <div className="border-b px-6 py-4 pr-16">
              <h2 className="text-lg font-medium">
                {followUp ? "Edit Follow-up" : "Schedule Follow-up"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick a WhatsApp template, review dynamic fields, and choose
                one-time or recurring schedule.
              </p>
            </div>

            <div className="max-h-[72vh] space-y-5 overflow-y-auto px-6 py-5">
              <div className="grid gap-2">
                <Label htmlFor="followup-phone">Phone</Label>
                <Input
                  id="followup-phone"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value.replace(/\s/g, ""))
                  }
                  placeholder="15551234567"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Template</Label>
                <Select
                  value={selectedTemplateId || undefined}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingTemplates || isFetching
                          ? "Loading templates..."
                          : "Select a template"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template: IWaTemplate) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.language})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {allowScheduleWithoutTemplate && (
                  <p className="text-xs text-muted-foreground">
                    No WhatsApp template/channel found. Scheduling will run in
                    test mode without template.
                  </p>
                )}
              </div>

              {headerParams.length > 0 && (
                <div className="space-y-2">
                  <Label>Header Variables</Label>
                  {headerParams.map((param, index) => (
                    <Input
                      key={`header-${index}`}
                      value={param}
                      onChange={(event) =>
                        handleHeaderParamChange(index, event.target.value)
                      }
                      placeholder={`Header {{${index + 1}}}`}
                      required
                    />
                  ))}
                </div>
              )}

              {bodyParams.length > 0 && (
                <div className="space-y-2">
                  <Label>Body Variables</Label>
                  {bodyParams.map((param, index) => (
                    <Input
                      key={`body-${index}`}
                      value={param}
                      onChange={(event) =>
                        handleBodyParamChange(index, event.target.value)
                      }
                      placeholder={`Body {{${index + 1}}}`}
                      required
                    />
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label>Schedule Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={scheduleType === "once" ? "default" : "outline"}
                    onClick={() => setScheduleType("once")}
                    className="h-9"
                  >
                    One Time
                  </Button>
                  <Button
                    type="button"
                    variant={scheduleType === "cron" ? "default" : "outline"}
                    onClick={() => setScheduleType("cron")}
                    className="h-9"
                  >
                    Recurring
                  </Button>
                </div>
              </div>

              {scheduleType === "once" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="once-date">Date</Label>
                    <Input
                      id="once-date"
                      type="date"
                      value={onceDate}
                      onChange={(event) => setOnceDate(event.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="once-time">Time</Label>
                    <Input
                      id="once-time"
                      type="time"
                      value={onceTime}
                      onChange={(event) => setOnceTime(event.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-2">
                    <Label htmlFor="followup-cron">Cron Schedule</Label>
                    <CronInput
                      id="followup-cron"
                      value={customCron}
                      onChange={setCustomCron}
                      timezone={timezone}
                      onTimezoneChange={setTimezone}
                      timezones={timezoneOptions}
                      showDelete={false}
                      showTimezone={false}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Format: minute hour day month weekday. Example: 0 0 * * *.
                    </p>
                    {!isCustomCronValid && (
                      <p className="text-[11px] text-red-500">
                        {cronValidationError}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Timezone</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setTimezone(getLocalTimezone())}
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Reset to local
                  </Button>
                </div>
                <Select
                  value={
                    timezone && timezoneOptions.includes(timezone)
                      ? timezone
                      : undefined
                  }
                  onValueChange={setTimezone}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezoneOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveDisabled || isBusy}>
                {isBusy ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : followUp ? (
                  "Save Changes"
                ) : (
                  "Schedule Follow-up"
                )}
              </Button>
            </div>
          </div>
        </form>

        {selectedTemplate && (
          <div className="border-l bg-muted/30 p-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
            <div className="pt-8 lg:pt-0">
              <p className="text-base font-medium text-foreground mb-1">
                Preview
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Template layout (not personalized).
              </p>
              <FollowUpMessagePreview template={selectedTemplate} />
            </div>
            <div className="border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                Template Info
              </p>
              <div className="space-y-2.5 text-xs text-foreground/70">
                <div>
                  <span className="font-medium text-foreground/80">Name</span>
                  <p className="truncate text-foreground/90 mt-0.5">
                    {selectedTemplate.name}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-foreground/80">
                    Language
                  </span>
                  <p className="mt-0.5">{selectedTemplate.language}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground/80">Status</span>
                  <p className="capitalize mt-0.5">{selectedTemplate.status}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
