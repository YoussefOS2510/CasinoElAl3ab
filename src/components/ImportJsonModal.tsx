import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileJson,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { ALL_CATEGORY_NAMES, CATEGORY_LIST } from '../data/starterQuestions';
import { CategoryName, QuestionItem } from '../types/game';
import { parseQuestionDataset, sanitizeAndParseJson } from '../utils/jsonLoader';
import { CategoryIcon } from './CategoryIcon';

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  allQuestions: QuestionItem[];
  customQuestionsCount: number;
  onImportQuestions: (newItems: QuestionItem[], replaceCategories: boolean) => void;
  onClearCustomQuestions: () => void;
}

export const ImportJsonModal: React.FC<ImportJsonModalProps> = ({
  isOpen,
  onClose,
  allQuestions,
  customQuestionsCount,
  onImportQuestions,
  onClearCustomQuestions,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [fallbackCategory, setFallbackCategory] = useState<CategoryName | ''>('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const categoryBreakdown = useMemo(() => {
    return CATEGORY_LIST.map((meta) => {
      const catItems = allQuestions.filter((q) => q.category === meta.name);
      return {
        meta,
        total: catItems.length,
        easy: catItems.filter((q) => q.difficulty === 'easy').length,
        medium: catItems.filter((q) => q.difficulty === 'medium').length,
        hard: catItems.filter((q) => q.difficulty === 'hard').length,
      };
    });
  }, [allQuestions]);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setStatusMessage(null);

    let importedItems: QuestionItem[] = [];
    const loadedFiles: string[] = [];
    const failedFiles: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const parsed = sanitizeAndParseJson(text);
        const { items } = parseQuestionDataset(
          parsed,
          fallbackCategory ? (fallbackCategory as CategoryName) : null
        );
        if (items.length > 0) {
          importedItems = importedItems.concat(items);
          loadedFiles.push(`${file.name} (${items.length})`);
        } else {
          failedFiles.push(`${file.name} (تنسيق غير مطابق)`);
        }
      } catch {
        failedFiles.push(`${file.name} (خطأ في صيغة JSON)`);
      }
    }

    if (importedItems.length > 0) {
      onImportQuestions(importedItems, replaceExisting);
      setStatusMessage({
        type: 'success',
        text: `تم استيراد ${importedItems.length} سؤال بنجاح من: ${loadedFiles.join('، ')}${
          failedFiles.length > 0 ? ` — تعذر قراءة: ${failedFiles.join('، ')}` : ''
        }`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: `لم يتم العثور على أسئلة صالحة. ${failedFiles.join('، ')}`,
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasteSubmit = () => {
    setStatusMessage(null);
    if (!pastedJson.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'من فضلك الصق كود JSON أولاً.',
      });
      return;
    }

    try {
      const parsed = sanitizeAndParseJson(pastedJson);
      const { items, categoriesFound } = parseQuestionDataset(
        parsed,
        fallbackCategory ? (fallbackCategory as CategoryName) : null
      );

      if (items.length === 0) {
        setStatusMessage({
          type: 'error',
          text: 'البيانات لا تحتوي على أسئلة صالحة. تأكد من وجود حقل "category" و "items" أو اختر الفئة يدوياً.',
        });
        return;
      }

      onImportQuestions(items, replaceExisting);
      setPastedJson('');
      setStatusMessage({
        type: 'success',
        text: `تم حفظ ${items.length} سؤال في (${categoriesFound.join('، ')}) داخل المتصفح بنجاح!`,
      });
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'كود JSON غير سليم. تأكد من الأقواس والفواصل وعلامات التنصيص.',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-slate-700 bg-[#1E293B] shadow-2xl animate-pop-in pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/80 bg-[#1E293B]/95 backdrop-blur px-4 sm:px-5 py-3.5 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-white">
                تحميل ملفات الأسئلة (Import JSON)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                ارفع ملف أو أكثر بصيغة JSON أو الصق المحتوى مباشرة للحفظ في المتصفح
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-700/60 hover:text-white transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-5 sm:space-y-6">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm font-semibold ${
                statusMessage.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                  : 'border-red-500/40 bg-red-500/15 text-red-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Drag & Drop File Upload */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              void handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10'
                : 'border-slate-600 bg-slate-900/50 hover:border-amber-500/70 hover:bg-slate-900/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              multiple
              className="hidden"
              onChange={(e) => void handleFiles(e.target.files)}
            />
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-white">
              اضغط لاختيار ملفات JSON أو اسحبها هنا
            </p>
            <p className="mt-1 text-xs text-slate-400">
              يدعم اختيار ملفات متعددة في نفس الوقت (مثل: fast.json, songs.json, reversed_words.json...)
            </p>
          </div>

          {/* Options row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/40 border border-slate-700/70 rounded-xl p-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                فئة احتياطية (لو الملف مفهوش حقل category):
              </label>
              <select
                value={fallbackCategory}
                onChange={(e) => setFallbackCategory(e.target.value as CategoryName | '')}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">قراءة الفئة تلقائياً من الملف</option>
                {ALL_CATEGORY_NAMES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-200 font-semibold">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
                />
                <span>استبدال الأسئلة المضافة سابقاً لنفس الفئة</span>
              </label>
            </div>
          </div>

          {/* Paste JSON textarea */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-200">
              أو الصق كود JSON هنا مباشرة:
            </label>
            <textarea
              rows={4}
              dir="ltr"
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              placeholder='{"category": "أسئلة السرعة والذكاء", "items": [{"id": 1, "difficulty": "easy", "question": "...", "answer": "..."}]}'
              className="w-full rounded-xl border border-slate-600 bg-slate-900/80 p-3 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePasteSubmit}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ وتطبيق الكود</span>
              </button>

              {customQuestionsCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClearCustomQuestions();
                    setStatusMessage({
                      type: 'success',
                      text: 'تم مسح الملفات المرفوعة والرجوع لبنك الأسئلة الأساسي.',
                    });
                  }}
                  className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>مسح الأسئلة المرفوعة ({customQuestionsCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Loaded Questions Summary Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-200">
                <Database className="w-4 h-4 text-amber-400" />
                <span>ملخص بنك الأسئلة الحالي</span>
              </h3>
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 text-xs font-extrabold text-amber-300">
                الإجمالي: {allQuestions.length} سؤال
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/50">
              <table className="w-full text-right text-xs sm:text-sm">
                <thead className="border-b border-slate-700 bg-slate-800/70 text-slate-300">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">الفئة</th>
                    <th className="px-2 py-2.5 text-center font-bold text-emerald-400">سهل</th>
                    <th className="px-2 py-2.5 text-center font-bold text-amber-400">متوسط</th>
                    <th className="px-2 py-2.5 text-center font-bold text-red-400">صعب</th>
                    <th className="px-3 py-2.5 text-center font-bold text-white">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {categoryBreakdown.map(({ meta, total, easy, medium, hard }) => (
                    <tr key={meta.name} className="hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <span style={{ color: meta.accentColor }}>
                            <CategoryIcon iconName={meta.iconName} className="w-4 h-4" />
                          </span>
                          <span>{meta.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center text-emerald-300 font-semibold">
                        {easy}
                      </td>
                      <td className="px-2 py-2 text-center text-amber-300 font-semibold">
                        {medium}
                      </td>
                      <td className="px-2 py-2 text-center text-red-300 font-semibold">
                        {hard}
                      </td>
                      <td className="px-3 py-2 text-center font-extrabold text-white">
                        {total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

