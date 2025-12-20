"use client";

import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IPerson } from "@/lib/types/person";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePeopleActions } from "@/lib/hooks/people/use-people-actions";
import { Loader2, X } from "lucide-react";
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
        emails: person.emails || [],
        phones: person.phones || [],
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

  const onSubmit = async (data: PersonFormValues) => {
    if (!person) return;

    updatePerson.mutate(
      {
        wid,
        personId: person.id,
        updates: {
          name: data.name,
          emails: data.emails,
          phones: data.phones,
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

  const addArrayItem = (
    fieldName: "emails" | "phones" | "tags" | "interests" | "notes",
    value?: string
  ) => {
    const current = form.getValues(fieldName) || [];
    if (value !== undefined) {
      // For emails, phones, and notes, allow empty strings to be added
      if (fieldName === "emails" || fieldName === "phones" || fieldName === "notes") {
        form.setValue(fieldName, [...current, ""]);
      } else {
        // For tags and interests, only add non-empty values
        if (value.trim() && !current.includes(value.trim())) {
          form.setValue(fieldName, [...current, value.trim()]);
        }
      }
    } else {
      // Add empty string for emails/phones/notes
      form.setValue(fieldName, [...current, ""]);
    }
  };

  const removeArrayItem = (
    fieldName: "emails" | "phones" | "tags" | "interests" | "notes",
    index: number
  ) => {
    const current = form.getValues(fieldName) || [];
    form.setValue(
      fieldName,
      current.filter((_, i) => i !== index)
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      size="2xl"
      className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Edit Customer</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading customer details..."
              : "Update customer information and details."}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !person ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">No customer selected</p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {getInitials(form.watch("name") || person.name || "Unknown")}
                </AvatarFallback>
              </Avatar>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Contact Information</h3>

              <FormField
                control={form.control}
                name="emails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emails</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value?.map((email, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={email}
                              onChange={(e) => {
                                const newEmails = [...(field.value || [])];
                                newEmails[index] = e.target.value;
                                field.onChange(newEmails);
                              }}
                              placeholder="email@example.com"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeArrayItem("emails", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem("emails", "")}
                        >
                          Add Email
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Numbers</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value?.map((phone, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={phone}
                              onChange={(e) => {
                                const newPhones = [...(field.value || [])];
                                newPhones[index] = e.target.value;
                                field.onChange(newPhones);
                              }}
                              placeholder="+1 234 567 8900"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeArrayItem("phones", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem("phones", "")}
                        >
                          Add Phone
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="New York, USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Work Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Additional Information</h3>

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief summary about the customer..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {field.value?.map((tag, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeArrayItem("tags", index)}
                                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <Input
                          placeholder="Add tag and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const value = e.currentTarget.value;
                              if (value.trim()) {
                                addArrayItem("tags", value);
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {field.value?.map((interest, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 px-2 py-1 bg-secondary text-foreground rounded-full text-xs"
                            >
                              <span>{interest}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  removeArrayItem("interests", index)
                                }
                                className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <Input
                          placeholder="Add interest and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const value = e.currentTarget.value;
                              if (value.trim()) {
                                addArrayItem("interests", value);
                                e.currentTarget.value = "";
                              }
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value?.map((note, index) => (
                          <div key={index} className="flex gap-2">
                            <Textarea
                              value={note}
                              onChange={(e) => {
                                const newNotes = [...(field.value || [])];
                                newNotes[index] = e.target.value;
                                field.onChange(newNotes);
                              }}
                              placeholder="Add a note..."
                              rows={2}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeArrayItem("notes", index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem("notes", "")}
                        >
                          Add Note
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={updatePerson.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatePerson.isPending}>
                {updatePerson.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      )}
    </Modal>
  );
}

