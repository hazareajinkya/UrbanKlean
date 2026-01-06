"use client";

import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IPerson } from "@/lib/types/person";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePeopleActions } from "@/lib/hooks/people/use-people-actions";
import { Loader2, X, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

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
}

export default function CustomerEditForm({
  isOpen,
  onClose,
  person,
  wid,
  isLoading = false,
}: CustomerEditFormProps) {
  const { updatePerson } = usePeopleActions();

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
    if (person && isOpen) {
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
  }, [person, isOpen, form]);

  const handleSubmit = (data: PersonFormValues) => {
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
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleAddArrayItem = (
    fieldName: "emails" | "phones" | "tags" | "interests" | "notes"
  ) => {
    const current = form.getValues(fieldName) || [];
    form.setValue(fieldName, [...current, ""]);
  };

  const handleUpdateArrayItem = (
    fieldName: "emails" | "phones" | "tags" | "interests" | "notes",
    index: number,
    value: string
  ) => {
    const current = [...(form.getValues(fieldName) || [])];
    current[index] = value;
    form.setValue(fieldName, current);
  };

  const handleRemoveArrayItem = (
    fieldName: "emails" | "phones" | "tags" | "interests" | "notes",
    index: number
  ) => {
    const current = form.getValues(fieldName) || [];
    form.setValue(
      fieldName,
      current.filter((_, i) => i !== index)
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      const current = form.getValues("tags") || [];
      if (value && !current.includes(value)) {
        form.setValue("tags", [...current, value]);
        e.currentTarget.value = "";
      }
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

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className="max-w-3xl max-h-[75vh] overflow-hidden flex flex-col bg-card rounded-xl border shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
        <h2 className="text-sm font-medium">Edit Customer</h2>
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
      ) : !person ? (
        <div className="flex-1 flex items-center justify-center py-16 text-sm text-muted-foreground">
          No customer selected
        </div>
      ) : (
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Section 1: Avatar + Name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 flex-shrink-0">
                <AvatarImage src="" alt={watchedName || person.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(watchedName || person.name || "?")}
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
                          handleUpdateArrayItem("emails", index, e.target.value)
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
                              e.target.value
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
                          onClick={() => handleRemoveArrayItem("phones", index)}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tags</Label>
                <div className="space-y-2">
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem("tags", index)}
                            className="hover:text-primary/70 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <Input
                    placeholder="Type and press Enter"
                    onKeyDown={handleTagKeyDown}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
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
            <Button type="submit" disabled={updatePerson.isPending}>
              {updatePerson.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
