'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Copy, Check, RotateCcw, Star, Download, Image as ImageIcon, FileText, List, MessageSquare } from 'lucide-react';
import { toPng } from 'html-to-image';
import dataEn from '../../../../public/review_templates/english.json';
import dataPt from '../../../../public/review_templates/portuguese.json';

type OutputMode = 'plain' | 'markdown' | 'curator';

interface CategoryData {
  title: string;
  type: string;
  options: string[];
}

interface TemplateData {
  name: string;
  categories: CategoryData[];
  finalCommentPlaceholder?: string;
  gameNamePlaceholder?: string;
  prosLabel?: string;
  consLabel?: string;
  verdictLabel?: string;
  pros?: string[];
  cons?: string[];
  verdicts?: string[];
}

interface GameReviewProps {
  language: 'en' | 'pt';
}

function toggleSetItem(set: Set<string>, item: string): Set<string> {
  const next = new Set(set);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}

const GameReview: React.FC<GameReviewProps> = ({ language }) => {
  const data: TemplateData = language === 'en' ? dataEn : dataPt;

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedPros, setSelectedPros] = useState<Set<string>>(new Set());
  const [selectedCons, setSelectedCons] = useState<Set<string>>(new Set());
  const [selectedVerdict, setSelectedVerdict] = useState('');
  const [gameName, setGameName] = useState('');
  const [finalComment, setFinalComment] = useState('');
  const [copied, setCopied] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>('curator');
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleOptionChange = useCallback((categoryTitle: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [categoryTitle]: option }));
  }, []);

  const handleReset = useCallback(() => {
    setSelectedOptions({});
    setSelectedPros(new Set());
    setSelectedCons(new Set());
    setSelectedVerdict('');
    setGameName('');
    setFinalComment('');
    setCopied(false);
  }, []);

  const totalCategories = data.categories.length;
  const filledCount = Object.keys(selectedOptions).length;
  const progress = totalCategories > 0 ? (filledCount / totalCategories) * 100 : 0;

  const ratingValue = useMemo(() => {
    const ratingCategory = data.categories.find((c) => c.title.includes('⭐'));
    if (!ratingCategory) return 0;
    const val = parseInt(selectedOptions[ratingCategory.title] || '0', 10);
    return isNaN(val) ? 0 : val;
  }, [selectedOptions, data.categories]);

  const generatePlain = useCallback(() => {
    const lines: string[] = [];
    if (gameName.trim()) {
      lines.push(`🎮 ${gameName.trim()}`);
      lines.push('');
    }
    data.categories.forEach((cat) => {
      const v = selectedOptions[cat.title];
      if (v) lines.push(`${cat.title}: ${v}`);
    });
    if (selectedPros.size > 0) {
      lines.push('');
      lines.push(`${data.prosLabel || '✅ Pros'}:`);
      selectedPros.forEach((p) => lines.push(`- ${p}`));
    }
    if (selectedCons.size > 0) {
      lines.push('');
      lines.push(`${data.consLabel || '❌ Cons'}:`);
      selectedCons.forEach((c) => lines.push(`- ${c}`));
    }
    if (selectedVerdict) {
      lines.push('');
      lines.push(`${data.verdictLabel || '📢 Verdict'}: ${selectedVerdict}`);
    }
    if (finalComment.trim()) {
      lines.push('');
      lines.push(finalComment.trim());
    }
    return lines.join('\n');
  }, [selectedOptions, data, selectedPros, selectedCons, selectedVerdict, gameName, finalComment]);

  const generateMarkdown = useCallback(() => {
    const lines: string[] = [];
    if (gameName.trim()) {
      lines.push(`# 🎮 ${gameName.trim()}`);
      lines.push('');
    }
    const rated = data.categories.filter((c) => selectedOptions[c.title]);
    if (rated.length > 0) {
      lines.push('## Ratings');
      lines.push('');
      lines.push('| Category | Rating |');
      lines.push('| --- | --- |');
      rated.forEach((c) => lines.push(`| ${c.title} | ${selectedOptions[c.title]} |`));
      lines.push('');
    }
    if (selectedPros.size > 0) {
      lines.push(`## ${data.prosLabel || '✅ Pros'}`);
      lines.push('');
      selectedPros.forEach((p) => lines.push(`- ${p}`));
      lines.push('');
    }
    if (selectedCons.size > 0) {
      lines.push(`## ${data.consLabel || '❌ Cons'}`);
      lines.push('');
      selectedCons.forEach((c) => lines.push(`- ${c}`));
      lines.push('');
    }
    if (selectedVerdict) {
      lines.push(`**${data.verdictLabel || '📢 Verdict'}:** ${selectedVerdict}`);
      lines.push('');
    }
    if (finalComment.trim()) {
      lines.push(finalComment.trim());
    }
    return lines.join('\n');
  }, [selectedOptions, data, selectedPros, selectedCons, selectedVerdict, gameName, finalComment]);

  const generateCurator = useCallback(() => {
    const lines: string[] = [];
    if (gameName.trim()) lines.push(`🎮 ${gameName.trim()}`);
    if (selectedPros.size > 0) {
      lines.push('');
      lines.push(`${data.prosLabel || '✅ Pros'}:`);
      selectedPros.forEach((p) => lines.push(`• ${p}`));
    }
    if (selectedCons.size > 0) {
      lines.push('');
      lines.push(`${data.consLabel || '❌ Cons'}:`);
      selectedCons.forEach((c) => lines.push(`• ${c}`));
    }
    if (selectedVerdict) {
      lines.push('');
      lines.push(`${data.verdictLabel || '📢 Verdict'}: ${selectedVerdict}`);
    }
    if (finalComment.trim()) {
      lines.push('');
      lines.push(finalComment.trim());
    }
    return lines.join('\n');
  }, [data, selectedPros, selectedCons, selectedVerdict, gameName, finalComment]);

  const outputText = useMemo(() => {
    if (outputMode === 'plain') return generatePlain();
    if (outputMode === 'markdown') return generateMarkdown();
    return generateCurator();
  }, [outputMode, generatePlain, generateMarkdown, generateCurator]);

  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [outputText]);

  const handleExportImage = useCallback(async () => {
    if (!previewRef.current || !outputText) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        backgroundColor: '#171a21',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${gameName.trim() || 'review'}.png`;
      link.href = dataUrl;
      link.click();
    } catch { /* ignore */ }
    setExporting(false);
  }, [outputText, gameName]);

  const isComplete = filledCount === totalCategories;

  const copyLabel = language === 'en'
    ? (copied ? 'Copied!' : 'Copy')
    : (copied ? 'Copiado!' : 'Copiar');
  const resetLabel = language === 'en' ? 'Reset' : 'Limpar';
  const progressLabel = language === 'en' ? 'Progress' : 'Progresso';
  const previewLabel = language === 'en' ? 'Preview' : 'Pré-visualização';
  const exportLabel = language === 'en' ? 'Export Image' : 'Exportar Imagem';
  const plainLabel = language === 'en' ? 'Plain' : 'Simples';
  const mdLabel = language === 'en' ? 'Markdown' : 'Markdown';
  const curatorLabel = language === 'en' ? 'Curator' : 'Curador';

  const renderMarkdownPreview = (text: string) => {
    const parts: React.ReactNode[] = [];
    let idx = 0;
    text.split('\n').forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) {
        parts.push(<br key={`br-${i}`} />);
        return;
      }
      if (trimmed.startsWith('# ')) {
        parts.push(<h1 key={idx++} className="text-2xl font-extrabold text-white mb-3 mt-4">{trimmed.replace('# ', '')}</h1>);
      } else if (trimmed.startsWith('## ')) {
        parts.push(<h2 key={idx++} className="text-lg font-bold text-steam-blue mb-2 mt-4">{trimmed.replace('## ', '')}</h2>);
      } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        const inner = trimmed.slice(2, -2);
        parts.push(<p key={idx++} className="text-sm text-gray-300 mb-1"><strong className="text-white">{inner}</strong></p>);
      } else if (trimmed.startsWith('| ')) {
        // table row - skip separator rows
        if (trimmed.includes('---')) return;
        const cells = trimmed.split('|').filter((c) => c.trim()).map((c) => c.trim());
        parts.push(
          <div key={idx++} className="flex gap-4 text-sm mb-1">
            {cells.map((cell, ci) => (
              <span key={ci} className={ci === 0 ? 'font-semibold text-gray-400 w-32 shrink-0' : 'text-gray-200'}>{cell}</span>
            ))}
          </div>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const bullet = trimmed.slice(2);
        parts.push(<p key={idx++} className="text-sm text-gray-300 mb-1 ml-4">• {bullet}</p>);
      } else {
        parts.push(<p key={idx++} className="text-sm text-gray-300 mb-1">{trimmed}</p>);
      }
    });
    return parts;
  };

  return (
    <main className="min-h-screen bg-steam-darker text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-steam-blue tracking-tight">
            {data.name}
          </h1>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium border border-gray-700 self-start"
          >
            <RotateCcw size={16} />
            {resetLabel}
          </button>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            {data.gameNamePlaceholder || (language === 'en' ? 'Game name' : 'Nome do jogo')}
          </label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder={data.gameNamePlaceholder || (language === 'en' ? 'e.g. Half-Life 2' : 'ex. Half-Life 2')}
            className="w-full max-w-xl px-4 py-2.5 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steam-blue focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">{progressLabel}</span>
            <span className="text-sm font-medium text-steam-blue">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-steam-blue transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {data.categories.map((category) => {
            const isRating = category.title.includes('⭐');
            return (
              <section
                key={category.title}
                className={`rounded-lg border p-4 md:p-5 transition-colors ${
                  selectedOptions[category.title]
                    ? 'border-steam-blue/40 bg-gray-900/60'
                    : 'border-gray-800 bg-gray-900/40'
                }`}
              >
                <h2 className="text-lg font-bold text-white mb-4">{category.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.options.map((option) => {
                    const checked = selectedOptions[category.title] === option;
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all border ${
                          checked
                            ? 'bg-steam-blue/10 border-steam-blue/50 text-steam-blue'
                            : 'bg-gray-800/50 border-transparent hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={category.title}
                          value={option}
                          checked={checked}
                          onChange={() => handleOptionChange(category.title, option)}
                          className="shrink-0 cursor-pointer accent-steam-blue"
                        />
                        <span className="text-sm leading-snug">{option}</span>
                      </label>
                    );
                  })}
                </div>
                {isRating && ratingValue > 0 && (
                  <div className="mt-3 flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Star key={i} size={18} className={i < ratingValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                    ))}
                    <span className="ml-2 text-sm font-bold text-yellow-400">{ratingValue}/10</span>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {(data.pros?.length || data.cons?.length) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {data.pros && data.pros.length > 0 && (
              <section className="rounded-lg border border-gray-800 bg-gray-900/40 p-4 md:p-5">
                <h2 className="text-lg font-bold text-steam-green mb-4">{data.prosLabel || '✅ Pros'}</h2>
                <div className="grid grid-cols-1 gap-2">
                  {data.pros.map((item) => {
                    const checked = selectedPros.has(item);
                    return (
                      <label
                        key={item}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all border ${
                          checked
                            ? 'bg-steam-green/10 border-steam-green/50 text-steam-green'
                            : 'bg-gray-800/50 border-transparent hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setSelectedPros((prev) => toggleSetItem(prev, item))}
                          className="shrink-0 cursor-pointer accent-steam-green"
                        />
                        <span className="text-sm leading-snug">{item}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            )}
            {data.cons && data.cons.length > 0 && (
              <section className="rounded-lg border border-gray-800 bg-gray-900/40 p-4 md:p-5">
                <h2 className="text-lg font-bold text-steam-red mb-4">{data.consLabel || '❌ Cons'}</h2>
                <div className="grid grid-cols-1 gap-2">
                  {data.cons.map((item) => {
                    const checked = selectedCons.has(item);
                    return (
                      <label
                        key={item}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all border ${
                          checked
                            ? 'bg-steam-red/10 border-steam-red/50 text-steam-red'
                            : 'bg-gray-800/50 border-transparent hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setSelectedCons((prev) => toggleSetItem(prev, item))}
                          className="shrink-0 cursor-pointer accent-steam-red"
                        />
                        <span className="text-sm leading-snug">{item}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {data.verdicts && data.verdicts.length > 0 && (
          <section className="rounded-lg border border-gray-800 bg-gray-900/40 p-4 md:p-5 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">{data.verdictLabel || '📢 Verdict'}</h2>
            <div className="grid grid-cols-1 gap-2">
              {data.verdicts.map((item) => {
                const checked = selectedVerdict === item;
                return (
                  <label
                    key={item}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all border ${
                      checked
                        ? 'bg-steam-blue/10 border-steam-blue/50 text-steam-blue'
                        : 'bg-gray-800/50 border-transparent hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="verdict"
                      value={item}
                      checked={checked}
                      onChange={() => setSelectedVerdict(item)}
                      className="shrink-0 cursor-pointer accent-steam-blue"
                    />
                    <span className="text-sm leading-snug">{item}</span>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            {language === 'en' ? 'Final Comments' : 'Comentários Finais'}
          </label>
          <textarea
            value={finalComment}
            onChange={(e) => setFinalComment(e.target.value)}
            placeholder={data.finalCommentPlaceholder || ''}
            rows={4}
            className="w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-steam-blue focus:border-transparent resize-y"
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-steam-darker/95 backdrop-blur border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">{previewLabel}</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400">
                {filledCount}/{totalCategories}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="flex rounded-md bg-gray-800 border border-gray-700 overflow-hidden">
                <button
                  onClick={() => setOutputMode('plain')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                    outputMode === 'plain' ? 'bg-steam-blue text-steam-darker' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FileText size={14} /> {plainLabel}
                </button>
                <button
                  onClick={() => setOutputMode('markdown')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-l border-gray-700 ${
                    outputMode === 'markdown' ? 'bg-steam-blue text-steam-darker' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <MessageSquare size={14} /> {mdLabel}
                </button>
                <button
                  onClick={() => setOutputMode('curator')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-l border-gray-700 ${
                    outputMode === 'curator' ? 'bg-steam-blue text-steam-darker' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <List size={14} /> {curatorLabel}
                </button>
              </div>
              <button
                onClick={handleCopy}
                disabled={!outputText}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  copied
                    ? 'bg-steam-green text-steam-darker'
                    : outputText
                    ? 'bg-steam-blue text-steam-darker hover:bg-sky-300'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copyLabel}
              </button>
              <button
                onClick={handleExportImage}
                disabled={!outputText || exporting}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  outputText && !exporting
                    ? 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
                    : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                }`}
              >
                {exporting ? <Check size={16} /> : <ImageIcon size={16} />}
                {exportLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {outputText && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20 pt-4">
          <div
            ref={previewRef}
            className="rounded-lg border border-gray-700 bg-gray-900 p-6 md:p-8"
          >
            <div className="mb-4 pb-3 border-b border-gray-800">
              <span className="text-xs font-bold tracking-widest uppercase text-gray-500">
                {outputMode === 'curator' ? (language === 'en' ? 'Steam Curator' : 'Curador Steam')
                  : outputMode === 'markdown' ? 'Markdown'
                  : (language === 'en' ? 'Plain Text' : 'Texto Simples')}
              </span>
            </div>
            {outputMode === 'markdown' ? (
              <div className="space-y-0">{renderMarkdownPreview(outputText)}</div>
            ) : (
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                {outputText}
              </pre>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default GameReview;
