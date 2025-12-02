import React, { useEffect, useState } from "react";
import { useQA } from "@/lib/hooks/qa/use-qa";
import { useParams } from "next/navigation";
import { IQA } from "@/lib/types/qa";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  MessageCircle,
  Pencil,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

export default function QATab() {
  const { wid } = useParams() as { wid: string };
  const { data: qa, isLoading } = useQA(wid);
  const [selectedQuestion, setSelectedQuestion] = useState<IQA | null>(null);

  useEffect(() => {
    if (qa?.questions && qa.questions.length > 0 && !selectedQuestion) {
      setSelectedQuestion(qa.questions[0]);
    }
  }, [qa, selectedQuestion]);

  if (isLoading) {
    return (
      <div className="h-full p-4">
        <div className="bg-card border rounded-xl h-full overflow-hidden flex">
          <div className="p-0 border-r w-full">
            <div className="bg-card h-full flex flex-col">
              <div className="h-14 border-b px-4 grid place-items-center">
                <div className="w-full space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-24"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-48"></div>
                </div>
              </div>

              <div className="overflow-y-auto no-scrollbar">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="px-4 flex flex-col gap-2 py-3.5 border-b"
                  >
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-3/4"></div>
                    <div className="flex items-center gap-2 w-full">
                      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-16"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-12 ml-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-0 transition-all flex flex-col overflow-hidden w-[680px]">
            <div className="h-full flex flex-col">
              <div className="border-b h-14 px-4 flex justify-between items-center">
                <div className="w-full space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-32"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-48"></div>
                </div>
              </div>

              <div className="p-4 pb-8 space-y-6 flex-1 overflow-y-auto no-scrollbar">
                <section className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-24"></div>
                  <div className="p-4 rounded-lg border space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-4/5"></div>
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-20"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-3/4"></div>
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card space-y-2">
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-16"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-20"></div>
                  </div>
                  <div className="p-4 rounded-lg border bg-card space-y-2">
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-24"></div>
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-16"></div>
                  </div>
                </div>

                <section className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-28"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer bg-[length:200%_100%] w-5/6"></div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const satisfiedCount = qa?.questions?.filter((q) => q.satisfied).length || 0;
  const unsatisfiedCount =
    qa?.questions?.filter((q) => !q.satisfied).length || 0;

  return (
    <div className="h-full p-4">
      <div className="bg-card border rounded-xl h-full overflow-hidden flex  ">
        <div className="p-0 border-r w-full">
          <div className="bg-card h-full flex flex-col">
            <div className="h-14 border-b px-4 grid place-items-center ">
              <div className="w-full">
                <p className="text-sm font-medium text-foreground">Questions</p>
                <p className="text-xs text-muted-foreground">
                  {qa?.questions?.length || 0} total •{" "}
                  <span className="text-green-600">
                    {satisfiedCount} satisfied
                  </span>{" "}
                  •{" "}
                  <span className="text-red-600">
                    {unsatisfiedCount} unsatisfied
                  </span>
                </p>
              </div>
            </div>
            <div className=" overflow-y-auto no-scrollbar">
              {qa?.questions.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedQuestion(item)}
                  className={cn(
                    "px-4 flex flex-col gap-2 transition-all duration-100 cursor-pointer py-3.5 border-b",
                    selectedQuestion === item &&
                      "bg-background border-l-2 border-b-0 border-primary"
                  )}
                >
                  <p className="text-sm  text-foreground line-clamp-2">
                    {item.question}
                  </p>
                  <div className="flex items-center gap-2 w-full">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-5 font-normal",
                        item.difficulty === "easy" &&
                          "bg-green-100 text-green-700",
                        item.difficulty === "medium" &&
                          "bg-yellow-100 text-yellow-700",
                        item.difficulty === "hard" && "bg-red-100 text-red-700"
                      )}
                    >
                      {item.difficulty}
                    </Badge>
                    <span
                      className={`text-[10px] ${
                        item.satisfied ? "text-green-600" : "text-red-600"
                      } ml-auto flex items-center gap-1`}
                    >
                      {item.satisfied ? (
                        <ThumbsUp className="w-3 h-3" />
                      ) : (
                        <ThumbsDown className="w-3 h-3" />
                      )}
                      {item.satisfactionScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-0 transition-all  flex flex-col overflow-hidden w-[680px]">
          {selectedQuestion ? (
            <div className="h-full flex flex-col">
              <div className="border-b  h-14 px-4 flex justify-between items-center ">
                <div className="w-full">
                  <h4 className="text-sm font-medium text-foreground mb-0.5">
                    Question Details
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="capitalize">
                      {selectedQuestion.difficulty} difficulty
                    </span>
                    <span>•</span>
                    <span
                      className={cn(
                        "font-medium",
                        selectedQuestion.satisfied
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {selectedQuestion.satisfied ? "Satisfied" : "Unsatisfied"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-4 pb-8 space-y-6 flex-1 overflow-y-auto no-scrollbar">
                <section className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Question
                  </h3>
                  <div className="p-4 rounded-lg border text-foreground text-sm leading-relaxed">
                    {selectedQuestion.question}
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Answer
                    </h3>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>
                  <div className="prose prose-sm leading-relaxed">
                    {selectedQuestion.answer}
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <span className="text-xs text-muted-foreground block mb-1">
                      Difficulty
                    </span>
                    <span className="font-medium capitalize text-foreground">
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <span className="text-xs text-muted-foreground block mb-1">
                      Satisfaction Score
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${
                              selectedQuestion.satisfactionScore * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="font-medium">
                        {selectedQuestion.satisfactionScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {selectedQuestion.reasoning && (
                  <section className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Reasoning
                    </h3>
                    <p className="prose prose-sm leading-relaxed">
                      {selectedQuestion.reasoning}
                    </p>
                  </section>
                )}

                {selectedQuestion.improvementSuggestions && (
                  <section className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Improvement Suggestions
                    </h3>
                    <p className="prose prose-sm leading-relaxed">
                      {selectedQuestion.improvementSuggestions}
                    </p>
                  </section>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">
                No question selected
              </h3>
              <p className="text-sm">
                Select a question from the sidebar to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
