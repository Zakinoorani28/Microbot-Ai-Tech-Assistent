"use client";

import type React from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    // Split by lines to handle different elements
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let currentTable: string[] = [];
    let inTable = false;

    lines.forEach((line, index) => {
      // Check if line contains table separators
      if (
        line.includes("|") &&
        (line.includes("---") ||
          line.includes("===") ||
          line.trim().split("|").length > 2)
      ) {
        if (!inTable) {
          inTable = true;
          currentTable = [];
        }
        currentTable.push(line);
        return;
      }

      // If we were in a table and this line doesn't continue it, render the table
      if (inTable && !line.includes("|")) {
        elements.push(renderTable(currentTable, `table-${index}`));
        currentTable = [];
        inTable = false;
      }

      // Process regular text with markdown
      if (line.trim()) {
        elements.push(
          <div key={index} className="mb-2">
            {processInlineMarkdown(line)}
          </div>
        );
      } else {
        elements.push(<br key={index} />);
      }
    });

    // Handle table at the end
    if (inTable && currentTable.length > 0) {
      elements.push(renderTable(currentTable, "table-end"));
    }

    return elements;
  };

  const renderTable = (tableLines: string[], key: string) => {
    const rows = tableLines.filter(
      (line) => line.trim() && !line.includes("---") && !line.includes("===")
    );
    if (rows.length === 0) return null;

    const headerRow = rows[0];
    const dataRows = rows.slice(1);

    const parseRow = (row: string) => {
      return row
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell);
    };

    const headers = parseRow(headerRow);
    const data = dataRows.map(parseRow);

    return (
      <div key={key} className="my-4 w-full overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full border-collapse border border-border rounded-lg text-sm">
            <thead>
              <tr className="bg-muted">
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="border border-border px-2 py-2 text-left font-semibold text-xs sm:text-sm min-w-[80px]"
                  >
                    {processInlineMarkdown(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-muted/50">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="border border-border px-2 py-2 text-xs sm:text-sm break-words"
                    >
                      {processInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const processInlineMarkdown = (text: string) => {
    const parts = [];
    let currentText = text;
    let key = 0;

    // Process bold text (**text**)
    while (currentText.includes("**")) {
      const start = currentText.indexOf("**");
      const end = currentText.indexOf("**", start + 2);

      if (end === -1) break;

      // Add text before bold
      if (start > 0) {
        parts.push(currentText.substring(0, start));
      }

      // Add bold text
      const boldText = currentText.substring(start + 2, end);
      parts.push(
        <strong key={`bold-${key++}`} className="font-semibold">
          {boldText}
        </strong>
      );

      currentText = currentText.substring(end + 2);
    }

    // Add remaining text
    if (currentText) {
      parts.push(currentText);
    }

    return parts.length > 0 ? parts : text;
  };

  return <div className="space-y-1">{renderMarkdown(content)}</div>;
}
