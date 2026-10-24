import React from 'react';
import { conceptsData, ruleOfThumb } from '../data/conceptsData';

export default function KeyConcepts() {
  return (
    <div className="bg-paper-surface border border-paper-border rounded-xl p-4 sm:p-6 my-6 shadow-sm">
      <div className="mb-4">
        <h3 className="font-serif font-semibold text-lg sm:text-xl text-paper-text flex items-center gap-2 mb-1">
          <svg className="w-5 h-5 text-core" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Key Concepts &mdash; Know the Difference
        </h3>
        <p className="text-xs sm:text-sm text-paper-dim">
          The four core collection patterns tested in almost every coding interview.
        </p>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto border border-paper-border rounded-lg bg-paper-surface my-4">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead className="bg-paper-surface-2 border-b border-paper-border">
            <tr>
              <th className="font-mono text-[10.5px] uppercase tracking-wider text-paper-dim px-3.5 sm:px-4 py-2.5 sm:py-3 font-semibold sm:w-36">
                Term
              </th>
              <th className="font-mono text-[10.5px] uppercase tracking-wider text-paper-dim px-3.5 sm:px-4 py-2.5 sm:py-3 font-semibold">
                Meaning
              </th>
              <th className="font-mono text-[10.5px] uppercase tracking-wider text-paper-dim px-3.5 sm:px-4 py-2.5 sm:py-3 font-semibold sm:w-64">
                Typical Technique
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-border">
            {conceptsData.map((item) => (
              <tr key={item.term} className="hover:bg-core/5 transition-colors">
                <td className="px-3.5 sm:px-4 py-3 align-middle whitespace-nowrap">
                  <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md inline-block ${item.badgeClass}`}>
                    {item.term}
                  </span>
                </td>
                <td className="px-3.5 sm:px-4 py-3 align-middle text-paper-text leading-relaxed">
                  {item.meaning}
                </td>
                <td className="px-3.5 sm:px-4 py-3 align-middle">
                  <div className="flex gap-1.5 flex-wrap">
                    {item.techniques.map((tech) => (
                      <span key={tech} className="font-mono text-[10.5px] font-medium px-2 py-0.5 rounded bg-paper-surface-2 border border-paper-border text-paper-dim whitespace-nowrap">
                        {tech}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rule of Thumb Callout */}
      <div className="bg-paper-surface-2 border-l-[3.5px] border-core rounded-lg p-3 sm:p-4 mt-3.5 flex gap-3 text-xs sm:text-sm leading-relaxed">
        <span className="text-base sm:text-lg flex-shrink-0">💡</span>
        <div>
          <strong className="text-paper-text text-[11.5px] font-mono tracking-wider uppercase block mb-1">
            Rule of Thumb:
          </strong>
          <div className="text-paper-dim flex flex-col gap-1">
            {ruleOfThumb.map((r, i) => (
              <span key={i}>
                • <b>{r.label}</b> &rarr; <span className="font-mono font-semibold text-core text-xs">{r.technique}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
