export interface IQA {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  satisfactionScore: number;
  reasoning: string;
  improvementSuggestions: string;
  retries: number;
  satisfied: boolean;
}
