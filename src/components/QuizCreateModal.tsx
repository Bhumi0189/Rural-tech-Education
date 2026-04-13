import React, { useState } from 'react';
import { PlusCircle, Trash2, X } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const defaultQuestion = (): QuizQuestion => ({
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
});

export default function QuizCreateModal({ isOpen, onClose, onCreated }: QuizCreateModalProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('SCIENCE');
  const [quizClass, setQuizClass] = useState('Class 10');
  const [rewardAmount, setRewardAmount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([defaultQuestion()]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) {
    return null;
  }

  const updateQuestion = (index: number, partial: Partial<QuizQuestion>) => {
    setQuestions((current) => current.map((question, questionIndex) => (
      questionIndex === index ? { ...question, ...partial } : question
    )));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please login as teacher.');
      return;
    }

    const normalizedQuestions = questions.map((question) => ({
      question: question.question.trim(),
      options: question.options.map((option) => option.trim()).filter(Boolean),
      correctIndex: Number(question.correctIndex),
    }));

    if (!title.trim() || !subject.trim() || normalizedQuestions.length === 0) {
      setError('Please fill title, subject and at least one question.');
      return;
    }

    const invalid = normalizedQuestions.find((question) => !question.question || question.options.length < 2 || question.correctIndex < 0 || question.correctIndex >= question.options.length);
    if (invalid) {
      setError('Each question must have text, at least 2 options, and a valid correct answer.');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          subject,
          class: quizClass,
          rewardAmount,
          questions: normalizedQuestions,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to create quiz.');
        }
        throw new Error(await response.text());
      }

      setTitle('');
      setSubject('SCIENCE');
      setQuizClass('Class 10');
      setRewardAmount(10);
      setQuestions([defaultQuestion()]);
      onCreated?.();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create quiz.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-headline text-2xl font-bold text-on-surface">Create Quiz</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-surface-container-low">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Quiz title" className="rounded-xl border border-outline px-3 py-2" />
            <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" className="rounded-xl border border-outline px-3 py-2" />
            <select value={quizClass} onChange={(event) => setQuizClass(event.target.value)} className="rounded-xl border border-outline px-3 py-2">
              <option>Class 10</option>
              <option>Class 9</option>
              <option>Class 8</option>
            </select>
            <input type="number" min={1} value={rewardAmount} onChange={(event) => setRewardAmount(Number(event.target.value || 0))} placeholder="Reward amount" className="rounded-xl border border-outline px-3 py-2" />
          </div>

          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={index} className="rounded-xl border border-outline-variant/50 bg-surface-container-low p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-headline text-sm font-bold">Question {index + 1}</p>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index))} className="rounded-lg p-1 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <input
                  value={question.question}
                  onChange={(event) => updateQuestion(index, { question: event.target.value })}
                  placeholder="Question text"
                  className="mb-3 w-full rounded-lg border border-outline px-3 py-2"
                />

                <div className="grid gap-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={question.correctIndex === optionIndex}
                        onChange={() => updateQuestion(index, { correctIndex: optionIndex })}
                      />
                      <input
                        value={option}
                        onChange={(event) => {
                          const next = [...question.options];
                          next[optionIndex] = event.target.value;
                          updateQuestion(index, { options: next });
                        }}
                        placeholder={`Option ${optionIndex + 1}`}
                        className="w-full rounded-lg border border-outline px-3 py-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => setQuestions((current) => [...current, defaultQuestion()])} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100">
            <PlusCircle className="h-4 w-4" />
            Add Question
          </button>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button type="submit" disabled={isSaving} className="w-full rounded-xl bg-emerald-800 px-4 py-3 font-headline text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
            {isSaving ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
}
