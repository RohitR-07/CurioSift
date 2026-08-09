/**
 * GeneratedContent — Module 5 Phase 3
 *
 * Renders the output of study material generation:
 *   - Summary (title, paragraphs, key points)
 *   - Notes (sections with headings)
 *   - Quiz (delegates to QuizPlayer for interaction)
 */

import { FileText, BookOpen, HelpCircle, Star } from 'lucide-react';
import type { GeneratedContent } from '../../types/studyMaterial';
import { QuizPlayer } from './QuizPlayer';

interface GeneratedContentProps {
  content: GeneratedContent;
}

export function GeneratedContentView({ content }: GeneratedContentProps) {
  if (content.type === 'summary') {
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-text text-base leading-tight">{content.title}</h3>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
              {content.length} summary
            </p>
          </div>
        </div>

        {/* Summary text */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-sm text-text leading-relaxed">{content.content}</p>
        </div>

        {/* Key points */}
        {content.keyPoints.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3 flex items-center gap-1.5">
              <Star className="w-3 h-3" /> Key Points
            </p>
            <ul className="space-y-2">
              {content.keyPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-text"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (content.type === 'notes') {
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-text text-base leading-tight">{content.title}</h3>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
              {content.length} notes · {content.sections.length} sections
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {content.sections.map((section, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <h4 className="text-sm font-bold text-text leading-tight">
                  {i + 1}. {section.heading}
                </h4>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-text-secondary leading-relaxed">{section.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (content.type === 'quiz') {
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-text text-base leading-tight">{content.title}</h3>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
              {content.difficulty} · {content.questions.length} questions
            </p>
          </div>
        </div>

        {/* Interactive quiz */}
        <QuizPlayer quiz={content} />
      </div>
    );
  }

  return null;
}
