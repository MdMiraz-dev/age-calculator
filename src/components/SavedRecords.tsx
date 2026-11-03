import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Trash2, User, ChevronDown } from 'lucide-react';
import { Language, SavedRecord } from '../types';
import { formatFullDate } from '../utils/dateFormatter';

interface SavedRecordsProps {
  lang: Language;
  currentBirthDate: string;
  onSelectBirthDate: (date: string) => void;
}

const STORAGE_KEY = 'age_calc_saved_records';

export const SavedRecords: React.FC<SavedRecordsProps> = ({
  lang,
  currentBirthDate,
  onSelectBirthDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecordsToStorage = (updated: SavedRecord[]) => {
    setRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const newRecord: SavedRecord = {
      id: Date.now().toString(),
      name: nameInput.trim(),
      birthDate: currentBirthDate,
      createdAt: Date.now(),
    };

    const updated = [newRecord, ...records];
    saveRecordsToStorage(updated);
    setNameInput('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = records.filter((r) => r.id !== id);
    saveRecordsToStorage(updated);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/70 dark:hover:bg-neutral-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-none">
              {lang === 'bn' ? 'সংরক্ষিত জন্মতারিখ সমূহ' : 'Saved Birthdays'}
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1">
              {lang === 'bn'
                ? `পরিবার বা বন্ধুদের তারিখ সংরক্ষণ করুন (${records.length})`
                : `Save family or friends' dates (${records.length})`}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-neutral-900 dark:text-white' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-3 bg-neutral-50/50 dark:bg-neutral-800/40">
          {/* Quick Add Button */}
          {!showAddForm ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <span>
                {lang === 'bn' ? 'বর্তমান তারিখটি সেভ করুন' : 'Save Current Date'}
              </span>
            </button>
          ) : (
            <form onSubmit={handleAdd} className="bg-white dark:bg-neutral-800 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={lang === 'bn' ? 'নাম লিখুন (যেমন: মা, বাবা, ভাই)' : 'Enter name (e.g. Mom, Dad)'}
                className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!nameInput.trim()}
                  className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}
                </button>
              </div>
            </form>
          )}

          {/* List of saved records */}
          {records.length === 0 ? (
            <p className="text-center py-3 text-xs text-neutral-400 dark:text-neutral-500">
              {lang === 'bn'
                ? 'এখনও কোনো জন্মতারিখ সেভ করা হয়নি।'
                : 'No saved birthdays yet.'}
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onSelectBirthDate(rec.birthDate)}
                  className="flex items-center justify-between p-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">{rec.name}</span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      ({formatFullDate(rec.birthDate, lang, false)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(rec.id, e)}
                    className="p-1 rounded-md text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
