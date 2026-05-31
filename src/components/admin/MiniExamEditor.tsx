"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import {
  createEmptyMiniExamQuestion,
  stringifyMiniExamQuestions,
} from "@/lib/mini-exam";
import { CirclePlus, Trash2 } from "lucide-react";

interface MiniExamEditorProps {
  value: string;
  onChange: (value: string, count: number) => void;
}

function parseDraftQuestions(value: string) {
  if (!value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, index) => {
      const question =
        item && typeof item === "object" && typeof (item as { question?: unknown }).question === "string"
          ? (item as { question: string }).question
          : "";
      const options =
        item && typeof item === "object" && Array.isArray((item as { options?: unknown[] }).options)
          ? ((item as { options: unknown[] }).options
              .slice(0, 4)
              .map((option) => (typeof option === "string" ? option : "")) as string[])
          : [];
      const correctIndex =
        item && typeof item === "object" && typeof (item as { correctIndex?: unknown }).correctIndex === "number"
          ? Number((item as { correctIndex: number }).correctIndex)
          : 0;
      const id =
        item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string"
          ? (item as { id: string }).id
          : `mini-exam-${index + 1}`;

      return {
        id,
        question,
        options: [...options, "", "", "", ""].slice(0, 4),
        correctIndex: Math.max(0, Math.min(correctIndex, 3)),
      };
    });
  } catch {
    return [];
  }
}

export function MiniExamEditor({ value, onChange }: MiniExamEditorProps) {
  const questions = parseDraftQuestions(value);

  const push = (nextQuestions = questions) => {
    onChange(
      stringifyMiniExamQuestions(nextQuestions),
      nextQuestions.filter((item) => item.question.trim()).length
    );
  };

  const updateQuestion = (index: number, patch: Partial<(typeof questions)[number]>) => {
    const next = questions.map((question, questionIndex) =>
      questionIndex === index ? { ...question, ...patch } : question
    );
    push(next);
  };

  const updateOption = (questionIndex: number, optionIndex: number, optionValue: string) => {
    const next = questions.map((question, currentQuestionIndex) => {
      if (currentQuestionIndex !== questionIndex) return question;
      return {
        ...question,
        options: question.options.map((option, currentOptionIndex) =>
          currentOptionIndex === optionIndex ? optionValue : option
        ),
      };
    });
    push(next);
  };

  const addQuestion = () => {
    push([...questions, createEmptyMiniExamQuestion(Date.now() + questions.length)]);
  };

  const removeQuestion = (index: number) => {
    push(questions.filter((_, questionIndex) => questionIndex !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Mini exam savollari</p>
          <p className="text-xs text-text-muted">
            Admin har bir savol, variantlar va to&apos;g&apos;ri javobni qo&apos;lda kiritadi.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <CirclePlus className="w-4 h-4" /> Savol qo&apos;shish
        </Button>
      </div>

      {!questions.length && (
        <div className="rounded-xl border border-dashed border-border p-4 text-sm text-text-muted">
          Hozircha savol kiritilmagan. Mini exam yaratish uchun yuqoridagi tugmadan boshlang.
        </div>
      )}

      {questions.map((question, questionIndex) => (
        <div key={question.id} className="rounded-2xl border border-border p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Savol {questionIndex + 1}</p>
            <Button type="button" variant="danger" size="sm" onClick={() => removeQuestion(questionIndex)}>
              <Trash2 className="w-4 h-4" /> O&apos;chirish
            </Button>
          </div>

          <Textarea
            label="Savol matni"
            className="min-h-[90px]"
            value={question.question}
            onChange={(event) => updateQuestion(questionIndex, { question: event.target.value })}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => (
              <Input
                key={`${question.id}-option-${optionIndex}`}
                label={`Variant ${optionIndex + 1}`}
                value={option}
                onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
              />
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">To&apos;g&apos;ri javob</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => (
                <label
                  key={`${question.id}-correct-${optionIndex}`}
                  className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctIndex === optionIndex}
                    onChange={() => updateQuestion(questionIndex, { correctIndex: optionIndex })}
                  />
                  <span>{option.trim() || `Variant ${optionIndex + 1}`}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
