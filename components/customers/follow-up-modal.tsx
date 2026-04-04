"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
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
import { IFollowUpJob, IFollowUpScheduleInput, IPerson } from "@/lib/types/person";
import { IWaTemplate } from "@/lib/types/wa-api";
import { useWaTemplates } from "@/lib/hooks/whatsapp/use-wa-templates";
import useFollowUpActions from "@/lib/hooks/followup/use-followup-actions";

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  wid: string;
  person: IPerson;
  followUp?: IFollowUpJob | null;
  onSaved: (person: IPerson) => void;
}

const getLocalTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const getTimezoneOptions = () => {
  const local = getLocalTimezone();

  if (typeof Intl.supportedValuesOf === "function") {
    const allTimezones = Intl.supportedValuesOf("timeZone");
    const prioritized = [local, "UTC", "Asia/Kolkata", "America/New_York"];
    const top = prioritized.filter((timezone, index) => prioritized.indexOf(timezone) === index);
    const rest = allTimezones.filter((timezone) => !top.includes(timezone));
    return [...top, ...rest.slice(0, 80)];
  }

  return [local, "UTC", "Asia/Kolkata", "America/New_York", "Europe/London"];
};

const extractVariablesCount = (text?: string) => {
  if (!text) return 0;
  const matches = text.match(/\{\{(\d+)\}\}/g);
  if (!matches?.length) return 0;
  const numbers = matches.map((match) => Number.parseInt(match.replace(/\D/g, ""), 10));
  return Math.max(...numbers);
};

const getAutoMappedValue = ({
  person,
  index,
}: {
  person: IPerson;
  index: number;
}) => {
  const map: Record<number, string> = {
    1: person.name || "",
    2: person.company || "",
    3: person.title || "",
    4: person.location || "",
    5: person.emails?.[0]?.value || "",
    6: person.phones?.[0]?.value || "",
  };

  return map[index] || "";
};

const parseParamsFromComponents = (components?: any[]) => {
  const header = components?.find((item) => item.type === "header");
  const body = components?.find((item) => item.type === "body");

  const headerParams = header?.parameters?.map((param: any) => {
    if (param.type === "text") {
      return param.text || "";
    }

    if (param.type === "image") {
      return param.image?.link || "";
    }

    if (param.type === "video") {
      return param.video?.link || "";
    }

    if (param.type === "document") {
      return param.document?.link || "";
    }

    return "";
  }) || [];

  const bodyParams =
    body?.parameters?.map((param: any) => {
      if (param.type === "text") {
        return param.text || "";
      }
      return "";
    }) || [];

  return { headerParams, bodyParams };
};

export default function FollowUpModal({
  isOpen,
  onClose,
  wid,
  person,
  followUp,
  onSaved,
}: FollowUpModalProps) {
  const { data: templates = [], isLoading: isLoadingTemplates } = useWaTemplates(wid);
  const { createFollowUp, updateFollowUp } = useFollowUpActions({ wid });

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [phone, setPhone] = useState(person.phones?.[0]?.value || "");
  const [timezone, setTimezone] = useState(getLocalTimezone());
  const [scheduleType, setScheduleType] = useState<"once" | "interval">("once");
  const [onceDate, setOnceDate] = useState("");
  const [onceTime, setOnceTime] = useState("");
  const [every, setEvery] = useState("5");
  const [unit, setUnit] = useState<"min" | "hour">("min");
  const [headerParams, setHeaderParams] = useState<string[]>([]);
  const [bodyParams, setBodyParams] = useState<string[]>([]);

  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) return null;
    return templates.find((template) => template.id === selectedTemplateId) || null;
  }, [selectedTemplateId, templates]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

    const toDatePart = nextHour.toISOString().slice(0, 10);
    const toTimePart = `${`${nextHour.getHours()}`.padStart(2, "0")}:${`${nextHour.getMinutes()}`.padStart(2, "0")}`;

    setPhone(person.phones?.[0]?.value || "");
    setTimezone(getLocalTimezone());
    setOnceDate(toDatePart);
    setOnceTime(toTimePart);
    setEvery("5");
    setUnit("min");
    setHeaderParams([]);
    setBodyParams([]);

    if (followUp) {
      setScheduleType(followUp.schedule.type === "once" ? "once" : "interval");
      setTimezone(followUp.timezone || getLocalTimezone());
      setPhone(followUp.phone || person.phones?.[0]?.value || "");

      if (followUp.schedule.type === "once") {
        setOnceDate(followUp.schedule.date || toDatePart);
        setOnceTime(followUp.schedule.time || toTimePart);
      }

      if (followUp.schedule.type === "interval") {
        setEvery(`${followUp.schedule.every || 5}`);
        setUnit(followUp.schedule.unit || "min");
      }

      const foundTemplate = templates.find(
        (item) =>
          item.name === followUp.template.name &&
          item.language === followUp.template.languageCode,
      );

      if (foundTemplate) {
        setSelectedTemplateId(foundTemplate.id);
      } else {
        setSelectedTemplateId("");
      }

      const params = parseParamsFromComponents(followUp.template.components);
      setHeaderParams(params.headerParams);
      setBodyParams(params.bodyParams);
      return;
    }

    setScheduleType("once");
    setSelectedTemplateId("");
  }, [followUp, isOpen, person.emails, person.name, person.phones, person.company, person.title, person.location, templates]);

  useEffect(() => {
    if (!selectedTemplate) {
      return;
    }

    const headerComponent = selectedTemplate.components?.find((item: any) => item.type === "HEADER");
    const bodyComponent = selectedTemplate.components?.find((item: any) => item.type === "BODY");

    if (followUp) {
      return;
    }

    const headerCount =
      headerComponent?.format === "TEXT"
        ? extractVariablesCount(headerComponent?.text)
        : headerComponent?.format === "IMAGE" ||
            headerComponent?.format === "VIDEO" ||
            headerComponent?.format === "DOCUMENT"
          ? 1
          : 0;

    const bodyCount = extractVariablesCount(bodyComponent?.text);

    setHeaderParams(
      Array.from({ length: headerCount }, (_, index) =>
        getAutoMappedValue({ person, index: index + 1 }),
      ),
    );

    setBodyParams(
      Array.from({ length: bodyCount }, (_, index) =>
        getAutoMappedValue({ person, index: index + 1 }),
      ),
    );
  }, [followUp, person, selectedTemplate]);

  const isBusy = createFollowUp.isPending || updateFollowUp.isPending;

  const handleHeaderParamChange = (index: number, value: string) => {
    setHeaderParams((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const handleBodyParamChange = (index: number, value: string) => {
    setBodyParams((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const buildTemplateComponents = () => {
    if (!selectedTemplate) {
      return [];
    }

    const submitComponents: any[] = [];
    const header = selectedTemplate.components?.find((item: any) => item.type === "HEADER");

    if (headerParams.length > 0 && header) {
      if (header.format === "TEXT") {
        submitComponents.push({
          type: "header",
          parameters: headerParams.map((param) => ({
            type: "text",
            text: param,
          })),
        });
      }

      if (header.format === "IMAGE") {
        submitComponents.push({
          type: "header",
          parameters: [{ type: "image", image: { link: headerParams[0] } }],
        });
      }

      if (header.format === "VIDEO") {
        submitComponents.push({
          type: "header",
          parameters: [{ type: "video", video: { link: headerParams[0] } }],
        });
      }

      if (header.format === "DOCUMENT") {
        submitComponents.push({
          type: "header",
          parameters: [{ type: "document", document: { link: headerParams[0] } }],
        });
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

    if (!selectedTemplate) {
      return;
    }

    const schedule: IFollowUpScheduleInput =
      scheduleType === "once"
        ? {
            type: "once",
            date: onceDate,
            time: onceTime,
          }
        : {
            type: "interval",
            every: Math.max(1, Number.parseInt(every || "1", 10)),
            unit,
          };

    const payload = {
      personId: person.id,
      phone,
      timezone,
      schedule,
      template: {
        name: selectedTemplate.name,
        languageCode: selectedTemplate.language,
        components: buildTemplateComponents(),
      },
    };

    const response = followUp
      ? await updateFollowUp.mutateAsync({
          ...payload,
          followUpId: followUp.id,
        })
      : await createFollowUp.mutateAsync(payload);

    onSaved(response.person as IPerson);
    onClose();
  };

  const saveDisabled =
    !selectedTemplate ||
    !phone ||
    !timezone ||
    (scheduleType === "once" && (!onceDate || !onceTime)) ||
    (scheduleType === "interval" && (!every || Number.parseInt(every, 10) <= 0));

  const MessagePreview = ({ template }: { template: IWaTemplate }) => {
    const headerComponent = template.components?.find(
      (c) => c.type === "HEADER",
    );
    const bodyComponent = template.components?.find((c) => c.type === "BODY");
    const footerComponent = template.components?.find(
      (c) => c.type === "FOOTER",
    );
    const buttonsComponent = template.components?.find(
      (c) => c.type === "BUTTONS",
    );

    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-lg overflow-hidden shadow-sm bg-white dark:bg-slate-900">
          {/* WhatsApp Header */}
          <div className="bg-gradient-to-r from-[#25d366] to-[#128c7e] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                WA
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">WhatsApp Chat</div>
                <div className="text-xs opacity-80">Business Account</div>
              </div>
            </div>
          </div>

          {/* Message Bubble */}
          <div className="p-4">
            <div className="bg-[#f0f0f0] dark:bg-slate-800 rounded-lg p-3 rounded-bl-none">
              {headerComponent && (
                <div className="mb-2">
                  {headerComponent.format === "TEXT" && headerComponent.text ? (
                    <div className="font-medium text-foreground/90 text-sm mb-2">
                      {headerComponent.text}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-black/10 dark:bg-black/20 rounded h-24 mb-2">
                      <span className="text-xs text-muted-foreground">
                        {headerComponent?.format === "IMAGE" && "📷 Image"}
                        {headerComponent?.format === "VIDEO" && "🎥 Video"}
                        {headerComponent?.format === "DOCUMENT" && "📄 Document"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {bodyComponent && (
                <div className="text-foreground/90 text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {bodyComponent.text}
                </div>
              )}

              {footerComponent && (
                <div className="text-xs text-foreground/50 mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                  {footerComponent.text}
                </div>
              )}

              <div className="flex justify-end mt-2">
                <span className="text-[10px] text-foreground/40">
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>

            {buttonsComponent && buttonsComponent.buttons?.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {buttonsComponent.buttons.map((btn: any, idx: number) => (
                  <button
                    key={idx}
                    disabled
                    className="w-full px-3 py-2 text-[#25d366] dark:text-[#25d366] border border-[#25d366] dark:border-[#25d366] rounded text-sm font-medium hover:bg-[#25d366]/5 transition-colors"
                  >
                    {btn.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className="w-full max-w-6xl rounded-xl border border-border bg-background p-0"
    >
      <form className="w-full flex" onSubmit={handleSubmit}>
        <div className="flex-1 flex flex-col">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-medium">
              {followUp ? "Edit Follow-up" : "Schedule Follow-up"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Pick a WhatsApp template, review dynamic fields, and choose one-time or recurring schedule.
            </p>
          </div>

          <div className="max-h-[72vh] space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid gap-2">
            <Label htmlFor="followup-phone">Phone</Label>
            <Input
              id="followup-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\s/g, ""))}
              placeholder="15551234567"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select a template"} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template: IWaTemplate) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.language})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {headerParams.length > 0 && (
            <div className="space-y-2">
              <Label>Header Variables</Label>
              {headerParams.map((param, index) => (
                <Input
                  key={`header-${index}`}
                  value={param}
                  onChange={(event) => handleHeaderParamChange(index, event.target.value)}
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
                  onChange={(event) => handleBodyParamChange(index, event.target.value)}
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
                variant={scheduleType === "interval" ? "default" : "outline"}
                onClick={() => setScheduleType("interval")}
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
            <div className="grid grid-cols-[1fr_160px] gap-3">
              <div className="grid gap-2">
                <Label htmlFor="interval-every">Every</Label>
                <Input
                  id="interval-every"
                  type="number"
                  min={1}
                  value={every}
                  onChange={(event) => setEvery(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select value={unit} onValueChange={(value: "min" | "hour") => setUnit(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="min">Minute(s)</SelectItem>
                    <SelectItem value="hour">Hour(s)</SelectItem>
                  </SelectContent>
                </Select>
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
            <Select value={timezone} onValueChange={setTimezone}>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveDisabled || isBusy}>
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : followUp ? (
                "Save Changes"
              ) : (
                "Schedule Follow-up"
              )}
            </Button>
          </div>
        </div>

        {selectedTemplate && (
          <div className="border-l pl-6 py-5 pr-6 bg-slate-50 dark:bg-slate-950 w-96 flex flex-col gap-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div>
              <p className="text-sm font-medium text-foreground mb-4">Live Preview</p>
              <p className="text-xs text-muted-foreground mb-4">This is how your message will look to the customer.</p>
              <MessagePreview template={selectedTemplate} />
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
                  <span className="font-medium text-foreground/80">Language</span>
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
      </form>
    </Modal>
  );
}
