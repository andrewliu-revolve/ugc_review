"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, RotateCcw } from "lucide-react"
import { toast } from "sonner"

export default function CSVToJSONConverter() {
    const [csvInput, setCsvInput] = useState("")
    const [jsonOutput, setJsonOutput] = useState("")
    const [error, setError] = useState("")

    const parseCSV = (raw: string) => {
        if (!raw || !raw.trim()) return [];

        // Strip BOM
        const csv = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;

        // --- Delimiter sniffing over multiple lines (robust) ---
        const candidates: Array<"," | ";" | "\t" | "|"> = [",", ";", "\t", "|"];

        const countColsFor = (s: string, delim: string, maxLines = 200) => {
            let colsPerLine: number[] = [];
            let inQuotes = false, col = 1, lines = 0;

            for (let i = 0; i < s.length; i++) {
                const c = s[i];

                if (c === '"') {
                    if (inQuotes && s[i + 1] === '"') { i++; continue; }
                    inQuotes = !inQuotes;
                } else if (c === delim && !inQuotes) {
                    col++;
                } else if (c === "\n" && !inQuotes) {
                    // finish a line
                    colsPerLine.push(col);
                    col = 1;
                    lines++;
                    if (lines >= maxLines) break;
                }
                // ignore \r
            }

            // finalize last partial line if not empty
            if (col > 1 && (colsPerLine.length === 0 || colsPerLine[colsPerLine.length - 1] !== col)) {
                colsPerLine.push(col);
            }

            // strip very short/blank rows from stats
            colsPerLine = colsPerLine.filter(n => n >= 2);
            if (colsPerLine.length === 0) return { median: 0, variance: Infinity, sample: 0 };

            const sorted = [...colsPerLine].sort((a, b) => a - b);
            const median = sorted[Math.floor(sorted.length / 2)];
            const mean = colsPerLine.reduce((a, b) => a + b, 0) / colsPerLine.length;
            const variance = colsPerLine.reduce((a, b) => a + (b - mean) ** 2, 0) / colsPerLine.length;
            return { median, variance, sample: colsPerLine.length };
        };

        let best = { delim: "," as typeof candidates[number], score: -Infinity };
        for (const d of candidates) {
            const { median, variance, sample } = countColsFor(csv, d);
            // higher median cols & sample, lower variance → better.
            const score = (median > 1 ? median : 0) * 1000 + sample - variance;
            if (score > best.score) best = { delim: d, score };
        }
        const delimiter = best.delim;

        // --- Tokenize to rows (RFC-4180-ish) ---
        const rows: string[][] = [];
        let row: string[] = [];
        let field = "";
        let inQuotes = false;

        for (let i = 0; i < csv.length; i++) {
            const c = csv[i];

            if (c === '"') {
                if (inQuotes) {
                    if (csv[i + 1] === '"') {
                        field += '"'; i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    // Begin quoted field only if at field start
                    if (field === "") inQuotes = true;
                    else field += '"';
                }
            } else if (c === delimiter && !inQuotes) {
                row.push(field);
                field = "";
            } else if (c === "\n" && !inQuotes) {
                row.push(field);
                // accept even empty trailing fields
                rows.push(row);
                row = [];
                field = "";
            } else if (c === "\r") {
                // skip
            } else {
                field += c;
            }
        }
        // finalize last row if file doesn't end with \n
        if (field.length > 0 || row.length > 0) {
            row.push(field);
            rows.push(row);
        }

        // Remove leading/trailing completely empty rows
        while (rows.length && rows[0].every(v => v.trim() === "")) rows.shift();
        while (rows.length && rows[rows.length - 1].every(v => v.trim() === "")) rows.pop();

        if (rows.length < 1) throw new Error("CSV must have at least a header row");

        // --- Headers ---
        const seen = new Map<string, number>();
        const cleanHeader = (h: string) => {
            let name = h.trim();
            if ((name.startsWith('"') && name.endsWith('"')) || (name.startsWith("'") && name.endsWith("'"))) {
                name = name.slice(1, -1);
            }
            if (!name) name = "column";
            const base = name;
            const count = seen.get(base) ?? 0;
            seen.set(base, count + 1);
            return count === 0 ? base : `${base}_${count + 1}`;
        };

        const headers = (rows[0] || []).map(cleanHeader);
        if (headers.length < 1) throw new Error("Header row is empty");

        // --- Type inference (safe) ---
        const infer = (rawVal: string): string => {
            const v = rawVal; // already preserved; don't trim blindly

            if (v === "") return "";

            // booleans
            if (/^(true|false)$/i.test(v)) return /^true$/i.test(v) ? "true" : "false";

            // numbers (guard long & leading-zero integers)
            if (/^-?\d+(\.\d+)?$/.test(v)) {
                if (v.length < 15) {
                    const leadingZeroInt = v[0] === "0" && v.length > 1 && !v.includes(".");
                    if (!leadingZeroInt) {
                        const num = Number(v);
                        if (!Number.isNaN(num)) return String(num);
                    }
                }
            }
            return v;
        };

        // --- Build objects with strict alignment ---
        const out: Record<string, string>[] = [];
        for (let r = 1; r < rows.length; r++) {
            const cols = rows[r];

            // Pad missing to header length (prevents shifting)
            const padded = cols.length < headers.length
                ? [...cols, ...Array(headers.length - cols.length).fill("")]
                : cols;

            const record: Record<string, string> = {};
            for (let c = 0; c < headers.length; c++) {
                record[headers[c]] = infer(padded[c] ?? "");
            }

            // Skip rows that are entirely empty after padding
            const allEmpty = Object.values(record).every(v => v === "");
            if (!allEmpty) out.push(record);
        }

        return out;
    };

    const convertToJSON = () => {
        if (!csvInput.trim()) {
            setError("Please enter some CSV data")
            return
        }

        try {
            const parsed = parseCSV(csvInput)
            const jsonString = JSON.stringify(parsed, null, 2)
            setJsonOutput(jsonString)
            setError("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error parsing CSV")
            setJsonOutput("")
        }
    }

    const copyToClipboard = async () => {
        if (!jsonOutput) return

        try {
            await navigator.clipboard.writeText(jsonOutput)
            toast.success("JSON copied to clipboard!")
        } catch (err) {
            toast.error("Failed to copy to clipboard")
        }
    }

    const downloadJSON = () => {
        if (!jsonOutput) return

        const blob = new Blob([jsonOutput], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "converted.json"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const clearAll = () => {
        setCsvInput("")
        setJsonOutput("")
        setError("")
    }

    const sampleCSV = `name,age,city,salary,"join_date"
"John Doe",30,"New York",50000,"2023-01-15"
"Jane Smith",25,"Los Angeles",60000,"2023-02-20"
"Bob Johnson",35,"Chicago, IL",55000,"2023-03-10"`

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">CSV to JSON</h1>
                    <p className="text-muted-foreground text-lg">Convert CSV data to JSON format quickly and easily</p>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* CSV Input */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                CSV Input
                                <Badge variant="secondary">Paste CSV</Badge>
                            </CardTitle>
                            <CardDescription>Paste your CSV data here. First row should contain headers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder={sampleCSV}
                                value={csvInput}
                                onChange={(e) => setCsvInput(e.target.value)}
                                className="min-h-[300px] font-mono text-sm"
                            />
                            <div className="flex gap-2">
                                <Button onClick={convertToJSON} className="flex-1">
                                    Convert
                                </Button>
                                <Button variant="outline" onClick={clearAll}>
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Clear
                                </Button>
                            </div>
                            {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>}
                        </CardContent>
                    </Card>

                    {/* JSON Output */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                JSON Output
                                <Badge variant="secondary">Result</Badge>
                            </CardTitle>
                            <CardDescription>Your converted JSON data will appear here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                value={jsonOutput}
                                readOnly
                                placeholder="JSON output will appear here after conversion..."
                                className="min-h-[300px] font-mono text-sm bg-muted/50"
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={copyToClipboard}
                                    disabled={!jsonOutput}
                                    variant="outline"
                                    className="flex-1 bg-transparent"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy to Clipboard
                                </Button>
                                <Button onClick={downloadJSON} disabled={!jsonOutput} variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Features */}
                <Card>
                    <CardHeader>
                        <CardTitle>Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold mb-2">✨ Smart Parsing</h4>
                                <p className="text-muted-foreground">
                                    Automatically detects numbers and converts them to proper JSON types
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">📋 Easy Copy</h4>
                                <p className="text-muted-foreground">One-click copy to clipboard for quick usage in your projects</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">💾 Download</h4>
                                <p className="text-muted-foreground">Download the converted JSON as a file for offline use</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
