interface IPerson {
  name: string;
  emails: string[];
  phones: string[];
  company: string;
  title: string;
  location: string;
  interests: string[];
  memories: string[];
  preferences: Record<string, string>;
  notes: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  externalIds: Record<string, string>;
}
