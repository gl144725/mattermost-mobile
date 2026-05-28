// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * File preview utilities: type detection, CSV parsing.
 */

const MARKDOWN_EXTENSIONS = /\.(md|markdown|mdown)$/i;
const CSV_EXTENSION = /\.csv$/i;

const MARKDOWN_MIMES = new Set([
    'text/markdown',
    'text/x-markdown',
    'text/plain', // fallback: .md often served as text/plain
]);

const CSV_MIMES = new Set([
    'text/csv',
    'text/comma-separated-values',
    'application/csv',
]);

export type PreviewType = 'markdown' | 'csv' | null;

interface FileInfoLike {
    name?: string;
    extension?: string;
    mime_type?: string;
}

/**
 * Detect if a file can be previewed in-app.
 * Returns the preview type, or null if unsupported.
 */
export function isPreviewableInApp(file?: FileInfoLike): PreviewType {
    if (!file) return null;

    const name = file.name || file.extension || '';
    const mime = file.mime_type || '';

    if (MARKDOWN_EXTENSIONS.test(name) || MARKDOWN_MIMES.has(mime)) {
        return 'markdown';
    }
    if (CSV_EXTENSION.test(name) || CSV_MIMES.has(mime)) {
        return 'csv';
    }
    return null;
}

// ============================================================
// CSV Parser
// ============================================================

export interface CSVData {
    headers: string[];
    rows: string[][];
}

/**
 * Parse CSV text into structured data.
 * Handles quoted fields, escaped quotes, CRLF/CR/LF line endings.
 */
export function parseCSV(content: string): CSVData {
    const trimmed = content.trim();
    if (!trimmed) return {headers: [], rows: []};

    const lines = trimmed.split(/\r?\n|\r/);
    if (lines.length === 0) return {headers: [], rows: []};

    const headers = splitCSVLine(lines[0]);
    const rows: string[][] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            rows.push(splitCSVLine(line));
        }
    }

    return {headers, rows};
}

function splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"') {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                current += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                result.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
    }
    result.push(current.trim());
    return result;
}
