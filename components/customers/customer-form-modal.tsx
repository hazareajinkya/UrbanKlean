"use client";

import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IPerson } from "@/lib/types/person";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePeopleActions } from "@/lib/hooks/people/use-people-actions";
import { Loader2, X, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fromSlug, getInitials, toSlug } from "@/lib/utils";

const personSchema = z.object({
  name: z.string().min(1, "Name is required"),
  emails: z.array(z.string().email("Invalid email")).optional(),
  phones: z.array(z.string()).optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  notes: z.array(z.string()).optional(),
  summary: z.string().optional(),
});

type PersonFormValues = z.infer<typeof personSchema>;

interface CustomerEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  person: IPerson | null;
  wid: string;
  isLoading?: boolean;
  mode?: "create" | "edit";
  availableTags?: string[];
  /** Fired with the persisted person after create or update (server-shaped). */
  onCustomerSaved?: (person: IPerson) => void;
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  person,
  wid,
  isLoading = false,
  mode = "edit",
  availableTags: availableTagsProp,
  onCustomerSaved,
}: CustomerEditFormProps) {
  const availableTags = availableTagsProp ?? [];
  const { createPerson, updatePerson } = usePeopleActions(wid);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: "",
      emails: [],
      phones: [],
      company: "",
      title: "",
      location: "",
      tags: [],
      interests: [],
      notes: [],
      summary: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "create") {
        // For create mode, reset to empty defaults
        form.reset({
          name: "",
          emails: [],
          phones: [],
          company: "",
          title: "",
          location: "",
          tags: [],
          interests: [],
          notes: [],
          summary: "",
        });
      } else if (person) {
        // For edit mode, populate from person data
        form.reset({
          name: person.name || "",
          emails: person.emails?.map((email) => email.value) || [],
          phones: person.phones?.map((phone) => phone.value) || [],
          company: person.company || "",
          title: person.title || "",
          location: person.location || "",
          tags: person.tags || [],
          interests: person.interests || [],
          notes: person.notes || [],
          summary: person.summary || "",
        });
      }
    }
  }, [person, isOpen, form, mode]);

  useEffect(() => {
    if (isOpen) {
      setTagInput("");
    }
  }, [isOpen]);

  const handleSubmit = (data: PersonFormValues) => {
    if (mode === "create") {
      createPerson.mutate(
        {
          wid,
          name: data.name,
          emails: data.emails?.map((email) => ({
            value: email,
            verified: false,
          })),
          phones: data.phones?.map((phone) => ({
            value: phone,
            verified: false,
          })),
          company: data.company,
          title: data.title,
          location: data.location,
          tags: data.tags,
          interests: data.interests,
          notes: data.notes,
          summary: data.summary,
        },
        {
          onSuccess: (created) => {
            if (created) {
              onCustomerSaved?.(created);
            }
            onClose();
          },
        },
      );
    } else {
      // Edit mode
      if (!person) return;

      updatePerson.mutate(
        {
          wid,
          personId: person.id,
          updates: {
            name: data.name,
            emails: data.emails?.map((email) => ({
              value: email,
              verified: false,
            })),
            phones: data.phones?.map((phone) => ({
              value: phone,
              verified: false,
            })),
            company: data.company,
            title: data.title,
            location: data.location,
            tags: data.tags,
            interests: data.interests,
            notes: data.notes,
            summary: data.summary,
          },
        },
        {
          onSuccess: (updated) => {
            if (updated) {
              onCustomerSaved?.(updated);
            }
            onClose();
          },
        },
      );
    }
  };

  const handleAddArrayItem = (
    fieldName: "emails" | "phones" | "tags" | "interests" | "notes",
  ) => {
    const current = form.getValues(fieldName) || [];
    form.setValue(fieldName, [...current, ""]);
  };

  const handleUpdateArrayItem = (
    fieldName: "emails" | "phones" | "tags" | "interests" | "notes",
    index: number,
    value: string,
  ) => {
    const current = [...(form.getValues(fieldName) || [])];
    current[index] = value;
    form.setValue(fieldName, current);
  };

  const handleRemoveArrayItem = (
    fieldName: "emails" | "phones" | "tags" | "interests" | "notes",
    index: number,
  ) => {
    const current = form.getValues(fieldName) || [];
    form.setValue(
      fieldName,
      current.filter((_, i) => i !== index),
    );
  };

  const handleAddTag = (value: string) => {
    const current = form.getValues("tags") || [];
    if (current.includes(value)) return;
    form.setValue("tags", [...current, value]);
  };

  const handleAddCustomTag = (raw: string) => {
    const slug = toSlug(raw);
    if (!slug) return;
    const current = form.getValues("tags") || [];
    if (current.includes(slug)) return;
    form.setValue("tags", [...current, slug]);
  };

  const handleCommitTagInput = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const slug = toSlug(trimmed);
    if (!slug) return;

    const currentTags = form.getValues("tags") || [];
    const unselected = availableTags.filter((t) => !currentTags.includes(t));
    const matchPreset = unselected.find(
      (t) =>
        t === slug ||
        t.toLowerCase() === trimmed.toLowerCase() ||
        fromSlug(t).toLowerCase() === trimmed.toLowerCase(),
    );

    if (matchPreset) {
      handleAddTag(matchPreset);
    } else {
      handleAddCustomTag(trimmed);
    }
    setTagInput("");
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommitTagInput();
    }
  };

  const handleInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      const current = form.getValues("interests") || [];
      if (value && !current.includes(value)) {
        form.setValue("interests", [...current, value]);
        e.currentTarget.value = "";
      }
    }
  };

  const emails = form.watch("emails") || [];
  const phones = form.watch("phones") || [];
  const tags = form.watch("tags") || [];
  const interests = form.watch("interests") || [];
  const notes = form.watch("notes") || [];
  const watchedName = form.watch("name");

  const unselectedSuggestions = useMemo(
    () => availableTags.filter((t) => !tags.includes(t)),
    [availableTags, tags],
  );
  const filteredUnselectedSuggestions = useMemo(() => {
    const q = tagInput.trim().toLowerCase();
    if (!q) return unselectedSuggestions;
    return unselectedSuggestions.filter(
      (t) =>
        t.toLowerCase().includes(q) || fromSlug(t).toLowerCase().includes(q),
    );
  }, [unselectedSuggestions, tagInput]);

  const showTagSuggestionsUi =
    availableTags.length > 0 && unselectedSuggestions.length > 0;

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className="max-w-3xl  bg-card rounded-xl border shadow-lg w-full"
    >
      <div className="max-h-[75vh] overflow-hidden flex flex-col w-full ">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-sm font-medium">
            {mode === "create" ? "Add Customer" : "Edit Customer"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : mode === "edit" && !person ? (
          <div className="flex-1 flex items-center justify-center py-16 text-sm text-muted-foreground">
            No customer selected
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Scrollable Content */}
            <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-6">
              {/* Section 1: Avatar + Name */}
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 flex-shrink-0">
                  <AvatarImage src="" alt={watchedName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(watchedName || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Full name"
                    {...form.register("name")}
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Section 2: Company, Title, Location, Emails, Phones - 2 Column Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Company name"
                    {...form.register("company")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    placeholder="Job title"
                    {...form.register("title")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    {...form.register("location")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Emails</Label>
                  <div className="space-y-2">
                    {emails.map((email, index) => (
                      <div key={index} className="flex gap-2 group">
                        <Input
                          value={email}
                          onChange={(e) =>
                            handleUpdateArrayItem(
                              "emails",
                              index,
                              e.target.value,
                            )
                          }
                          placeholder="email@example.com"
                          type="email"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          onClick={() => handleRemoveArrayItem("emails", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleAddArrayItem("emails")}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5 col-span-2 grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Phones</Label>
                    <div className="space-y-2">
                      {phones.map((phone, index) => (
                        <div key={index} className="flex gap-2 group">
                          <Input
                            value={phone}
                            onChange={(e) =>
                              handleUpdateArrayItem(
                                "phones",
                                index,
                                e.target.value,
                              )
                            }
                            placeholder="+1 234 567 8900"
                            type="tel"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                            onClick={() =>
                              handleRemoveArrayItem("phones", index)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleAddArrayItem("phones")}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Summary - Full Width */}
              <div className="space-y-1.5">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Brief description about this customer..."
                  rows={3}
                  className="resize-none"
                  {...form.register("summary")}
                />
              </div>

              {/* Section 4: Tags & Interests - 2 Column Grid */}
              <div className="grid min-w-0 grid-cols-2 gap-4">
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="customer-tag-input">Tags</Label>
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap content-start gap-1.5 pr-0.5">
                      {tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="inline-flex max-w-full min-w-0 items-center gap-1 px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium cursor-pointer"
                        >
                          <span className="min-w-0 truncate">
                            {fromSlug(tag)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem("tags", index)}
                            className="shrink-0 hover:text-secondary-foreground/70 transition-colors"
                            aria-label={`Remove tag ${fromSlug(tag)}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="relative min-w-0">
                    {showTagSuggestionsUi ? (
                      <Search
                        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                    ) : null}
                    <Input
                      id="customer-tag-input"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder={
                        showTagSuggestionsUi
                          ? "Search or add a tag…"
                          : "Add a tag and press Enter"
                      }
                      className={`h-9 min-w-0   pr-9 text-sm ${showTagSuggestionsUi ? "pl-9" : "pl-3"}`}
                      autoComplete="off"
                      aria-describedby="customer-tag-input-hint"
                    />
                    {tagInput.trim() ? (
                      <button
                        type="button"
                        aria-label="Clear tag field"
                        onClick={() => setTagInput("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <p
                    id="customer-tag-input-hint"
                    className="text-[11px] leading-snug text-muted-foreground"
                  >
                    {showTagSuggestionsUi
                      ? "Type to filter available tags. Press Enter to add—workspace tags match when possible, otherwise a custom slug is saved."
                      : availableTags.length > 0
                        ? "All workspace tags are on this customer. Press Enter to add a custom tag."
                        : 'Press Enter to add. Tags are saved as slugs (e.g. "VIP Client" becomes vip-client).'}
                  </p>

                  {showTagSuggestionsUi ? (
                    <div className="min-w-0  rounded-lg border border-border/50 bg-muted/25">
                      <div className="border-b border-border/40 px-2.5 py-1.5">
                        <p className="text-[11px] font-medium text-muted-foreground">
                          Available tags
                        </p>
                      </div>
                      <div className=" min-h-0  p-2">
                        {filteredUnselectedSuggestions.length === 0 ? (
                          <p className="px-0.5 py-1 text-xs text-muted-foreground">
                            No matching available tags. Press Enter to add a
                            custom tag.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {filteredUnselectedSuggestions.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  handleAddTag(tag);
                                  setTagInput("");
                                }}
                                className="inline-flex max-w-full min-w-0 items-center px-2.5 py-1 text-left text-xs font-medium bg-secondary text-secondary-foreground rounded-md cursor-pointer transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                aria-label={`Add tag ${fromSlug(tag)}`}
                              >
                                <span className="min-w-0 truncate">
                                  {fromSlug(tag)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="min-w-0 space-y-1.5">
                  <Label>Interests</Label>
                  <div className="space-y-2">
                    {interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {interests.map((interest, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium"
                          >
                            {interest}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveArrayItem("interests", index)
                              }
                              className="hover:text-secondary-foreground/70 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <Input
                      placeholder="Type and press Enter"
                      onKeyDown={handleInterestKeyDown}
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Notes - Full Width */}
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <div className="space-y-2">
                  {notes.map((note, index) => (
                    <div key={index} className="flex gap-2 group">
                      <Textarea
                        value={note}
                        onChange={(e) =>
                          handleUpdateArrayItem("notes", index, e.target.value)
                        }
                        placeholder="Add a note..."
                        rows={2}
                        className="flex-1 resize-none"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity self-start"
                        onClick={() => handleRemoveArrayItem("notes", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleAddArrayItem("notes")}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Note
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  mode === "create"
                    ? createPerson.isPending
                    : updatePerson.isPending
                }
              >
                {mode === "create" ? (
                  createPerson.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create"
                  )
                ) : updatePerson.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
