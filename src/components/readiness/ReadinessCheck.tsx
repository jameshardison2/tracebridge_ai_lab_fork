"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
    ArrowRight,
    Check,
    CloudUpload,
    Download,
    FileSpreadsheet,
    FileText,
    Info,
    Lock,
    ShieldCheck,
    X,
} from "lucide-react";
import {
    SAMPLE_DEVICE_NAME,
    SAMPLE_FILES,
    SAMPLE_FINDINGS,
    SAMPLE_SECTIONS,
    type Finding,
    type Severity,
} from "@/lib/sample-aeropulse";

type Step = 0 | 1 | 2 | 3 | 4;
type Decision = "confirmed" | "dismissed";

const STEPS = ["Upload", "Check", "Findings", "Review", "Report"] as const;
const CHECK_TICK_MS = 550;
const MAX_FILES = 14;

const SEVERITY_STYLE: Record<Severity, string> = {
    Critical: "bg-[#fef2f2] text-[#b91c1c]",
    Major: "bg-[#fffbeb] text-[#b45309]",
    Minor: "bg-slate-100 text-slate-700",
};

export default function ReadinessCheck() {
    const [step, setStep] = useState<Step>(0);
    const [files, setFiles] = useState<string[]>([]);
    const [usingSample, setUsingSample] = useState(false);
    const [checked, setChecked] = useState(0);
    const [decisions, setDecisions] = useState<Record<string, Decision>>({});

    const checkDone = checked >= SAMPLE_SECTIONS.length;
    const reviewedCount = Object.keys(decisions).length;
    const allReviewed = reviewedCount === SAMPLE_FINDINGS.length;

    // Highest step the user may open from the step bar.
    const reachable: Step = allReviewed
        ? 4
        : checkDone
          ? 3
          : files.length > 0 && step >= 1
            ? 1
            : 0;

    // Simulated parsing progress. Replace with real parse status from the API.
    useEffect(() => {
        if (step !== 1 || checkDone) return;
        const t = setTimeout(() => setChecked((c) => c + 1), CHECK_TICK_MS);
        return () => clearTimeout(t);
    }, [step, checked, checkDone]);

    const startCheck = () => {
        setChecked(0);
        setDecisions({});
        setStep(1);
    };

    const reset = () => {
        setFiles([]);
        setUsingSample(false);
        setChecked(0);
        setDecisions({});
        setStep(0);
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Header step={step} reachable={reachable} onGo={setStep} />
            <div className="mx-auto max-w-4xl px-4 pb-16 md:px-8">
                <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                        Preview with sample data for {SAMPLE_DEVICE_NAME}, the fictional nebulizer
                        from the eval set. Findings shown are examples, not real results. Files you
                        choose are listed but not uploaded or read yet.
                    </p>
                </div>

                <main className="mt-8">
                    {step === 0 && (
                        <UploadScreen
                            files={files}
                            usingSample={usingSample}
                            onAdd={(names) => {
                                setUsingSample(false);
                                setFiles((prev) =>
                                    Array.from(new Set([...prev, ...names])).slice(0, MAX_FILES)
                                );
                            }}
                            onSample={() => {
                                setUsingSample(true);
                                setFiles(SAMPLE_FILES);
                            }}
                            onRemove={(name) => setFiles((prev) => prev.filter((f) => f !== name))}
                            onClear={() => {
                                setFiles([]);
                                setUsingSample(false);
                            }}
                            onRun={startCheck}
                        />
                    )}
                    {step === 1 && <CheckScreen checked={checked} onNext={() => setStep(2)} />}
                    {step === 2 && <FindingsScreen onNext={() => setStep(3)} />}
                    {step === 3 && (
                        <ReviewScreen
                            decisions={decisions}
                            onDecide={(id, d) => setDecisions((prev) => ({ ...prev, [id]: d }))}
                            allReviewed={allReviewed}
                            reviewedCount={reviewedCount}
                            onNext={() => setStep(4)}
                        />
                    )}
                    {step === 4 && allReviewed && (
                        <ReportScreen decisions={decisions} onRestart={reset} />
                    )}
                </main>
            </div>
        </div>
    );
}

/* ---------- Header and step bar ---------- */

function Header({
    step,
    reachable,
    onGo,
}: {
    step: Step;
    reachable: Step;
    onGo: (s: Step) => void;
}) {
    return (
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8">
                <div className="flex items-center gap-2">
                    <div className="relative h-7 w-[2.75rem] shrink-0">
                        <Image
                            src="/brand/icon_transparent.png"
                            alt="TraceBridge"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                        TraceBridge <span className="text-[var(--accent)]">AI</span>
                    </span>
                </div>
                <nav aria-label="Readiness check steps" className="flex gap-1.5 overflow-x-auto">
                    {STEPS.map((label, i) => {
                        const current = i === step;
                        const done = i < step;
                        const locked = i > reachable;
                        return (
                            <button
                                key={label}
                                type="button"
                                disabled={locked}
                                aria-current={current ? "step" : undefined}
                                onClick={() => onGo(i as Step)}
                                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                                    current
                                        ? "border-[var(--accent)] bg-[#f0fdfa] text-[var(--accent)]"
                                        : "border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                                        current || done
                                            ? "bg-[var(--accent)] text-white"
                                            : "bg-slate-200 text-slate-600"
                                    }`}
                                >
                                    {done ? <Check className="h-3 w-3" /> : i + 1}
                                </span>
                                {label}
                                {i === 4 && locked && <Lock className="h-3.5 w-3.5" />}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}

/* ---------- Shared bits ---------- */

function Title({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
            {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
        </div>
    );
}

function PrimaryButton({
    children,
    onClick,
    disabled,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#115e59] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
            {children}
        </button>
    );
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
    const pct = Math.round((value / max) * 100);
    return (
        <div>
            <div className="mb-1.5 flex justify-between text-sm text-slate-600">
                <span>{label}</span>
                <span>{pct}%</span>
            </div>
            <div
                className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
            >
                <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function QuoteBox({ section, text }: { section: string; text: string }) {
    return (
        <div className="rounded-lg border border-[var(--border)] bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{section}</p>
            <p className="mt-1 text-sm text-slate-800">&ldquo;{text}&rdquo;</p>
        </div>
    );
}

function FindingCard({ f, children }: { f: Finding; children?: React.ReactNode }) {
    return (
        <article className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_STYLE[f.severity]}`}>
                    {f.severity}
                </span>
                <span className="text-xs font-medium text-slate-500">{f.type}</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{f.title}</h2>
            <div className={`mt-3 grid gap-3 ${f.quotes.length > 1 ? "md:grid-cols-2" : ""}`}>
                {f.quotes.map((q) => (
                    <QuoteBox key={q.section + q.text} section={q.section} text={q.text} />
                ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">Based on: {f.rule}</p>
            {children}
        </article>
    );
}

/* ---------- 1. Upload ---------- */

function UploadScreen({
    files,
    usingSample,
    onAdd,
    onSample,
    onRemove,
    onClear,
    onRun,
}: {
    files: string[];
    usingSample: boolean;
    onAdd: (names: string[]) => void;
    onSample: () => void;
    onRemove: (name: string) => void;
    onClear: () => void;
    onRun: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [drag, setDrag] = useState(false);

    const accept = (list: FileList | null) => {
        if (!list) return;
        const names = Array.from(list)
            .filter((f) => /\.(pdf|docx?)$/i.test(f.name))
            .map((f) => f.name);
        if (names.length) onAdd(names);
    };

    return (
        <section>
            <Title
                title="Check a 510(k) package before FDA does"
                subtitle="Add one file per eSTAR section. TraceBridge finds gaps, contradictions and broken links between sections."
            />

            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    accept(e.dataTransfer.files);
                }}
                className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                    drag ? "border-[var(--accent)] bg-[#f0fdfa]" : "border-slate-300 bg-white"
                }`}
            >
                <CloudUpload className="mx-auto h-10 w-10 text-[var(--accent)]" />
                <p className="mt-3 text-lg font-semibold text-slate-900">Drop your section files here</p>
                <p className="text-sm text-slate-500">PDF or Word, up to {MAX_FILES} files</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <PrimaryButton onClick={() => inputRef.current?.click()}>Choose from computer</PrimaryButton>
                    <button
                        type="button"
                        disabled
                        title="Not connected yet"
                        className="rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-slate-500 disabled:cursor-not-allowed"
                    >
                        Google Drive (coming soon)
                    </button>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                        accept(e.target.files);
                        e.target.value = "";
                    }}
                />
                <button
                    type="button"
                    onClick={onSample}
                    className="mt-4 text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                >
                    No files handy? Try the sample package
                </button>
            </div>

            {files.length > 0 && (
                <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">
                            {usingSample ? `${SAMPLE_DEVICE_NAME} package: ` : ""}
                            {files.length} {files.length === 1 ? "file" : "files"} ready
                        </p>
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-sm text-slate-500 hover:text-[var(--danger)]"
                        >
                            Remove all
                        </button>
                    </div>
                    <ul className="mt-3 divide-y divide-[var(--border)]">
                        {files.map((name) => (
                            <li key={name} className="flex items-center justify-between py-2 text-sm">
                                <span className="flex min-w-0 items-center gap-2 text-slate-700">
                                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="truncate">{name}</span>
                                </span>
                                <button
                                    type="button"
                                    aria-label={`Remove ${name}`}
                                    onClick={() => onRemove(name)}
                                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex justify-end">
                        <PrimaryButton onClick={onRun}>
                            Run readiness check <ArrowRight className="h-4 w-4" />
                        </PrimaryButton>
                    </div>
                </div>
            )}
        </section>
    );
}

/* ---------- 2. Check ---------- */

function CheckScreen({ checked, onNext }: { checked: number; onNext: () => void }) {
    const total = SAMPLE_SECTIONS.length;
    const done = checked >= total;
    return (
        <section>
            <Title title={done ? "Check complete" : "Checking your package"} />
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                <ProgressBar value={Math.min(checked, total)} max={total} label={`${Math.min(checked, total)} of ${total} sections checked`} />
                <ul className="mt-5 divide-y divide-[var(--border)]">
                    {SAMPLE_SECTIONS.map((s, i) => {
                        const state = i < checked ? "Done" : i === checked ? "Checking" : "Waiting";
                        const style =
                            state === "Done"
                                ? "bg-[#f0fdfa] text-[var(--accent)]"
                                : state === "Checking"
                                  ? "bg-[#fffbeb] text-[#92400e]"
                                  : "bg-slate-100 text-slate-600";
                        return (
                            <li key={s} className="flex items-center justify-between py-2.5 text-sm">
                                <span className="text-slate-800">{s}</span>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>{state}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
            {done && (
                <div className="mt-6 flex justify-end">
                    <PrimaryButton onClick={onNext}>
                        See findings <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                </div>
            )}
        </section>
    );
}

/* ---------- 3. Findings ---------- */

function FindingsScreen({ onNext }: { onNext: () => void }) {
    const counts = useMemo(() => {
        const c: Record<Severity, number> = { Critical: 0, Major: 0, Minor: 0 };
        SAMPLE_FINDINGS.forEach((f) => (c[f.severity] += 1));
        const withFindings = new Set(SAMPLE_FINDINGS.flatMap((f) => f.quotes.map((q) => q.section)));
        const clear = SAMPLE_SECTIONS.filter((s) => !withFindings.has(s)).length;
        return { ...c, clear };
    }, []);

    const n = SAMPLE_FINDINGS.length;
    const tiles = [
        { label: "Critical", value: counts.Critical, color: "text-[#b91c1c]" },
        { label: "Major", value: counts.Major, color: "text-[#b45309]" },
        { label: "Minor", value: counts.Minor, color: "text-slate-700" },
        { label: "Sections clear", value: counts.clear, color: "text-[var(--accent)]" },
    ];

    return (
        <section>
            <Title
                title={`${n} ${n === 1 ? "thing" : "things"} to fix before you submit`}
                subtitle="Every finding quotes the exact words it found, from both sides when two sections disagree."
            />
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {tiles.map((t) => (
                    <div key={t.label} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
                        <p className={`text-3xl font-bold ${t.color}`}>{t.value}</p>
                        <p className="text-sm text-slate-600">{t.label}</p>
                    </div>
                ))}
            </div>
            <div className="space-y-4">
                {SAMPLE_FINDINGS.map((f) => (
                    <FindingCard key={f.id} f={f} />
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <PrimaryButton onClick={onNext}>
                    Review findings <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
            </div>
        </section>
    );
}

/* ---------- 4. Review ---------- */

function ReviewScreen({
    decisions,
    onDecide,
    allReviewed,
    reviewedCount,
    onNext,
}: {
    decisions: Record<string, Decision>;
    onDecide: (id: string, d: Decision) => void;
    allReviewed: boolean;
    reviewedCount: number;
    onNext: () => void;
}) {
    const total = SAMPLE_FINDINGS.length;
    return (
        <section>
            <Title
                title="Confirm or dismiss each finding"
                subtitle="You have the final say. Dismissed findings are saved as false positives so TraceBridge learns from them."
            />
            <div className="mb-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                <ProgressBar value={reviewedCount} max={total} label={`${reviewedCount} of ${total} reviewed`} />
            </div>
            <div className="space-y-4">
                {SAMPLE_FINDINGS.map((f) => {
                    const d = decisions[f.id];
                    return (
                        <FindingCard key={f.id} f={f}>
                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
                                <button
                                    type="button"
                                    aria-pressed={d === "confirmed"}
                                    onClick={() => onDecide(f.id, "confirmed")}
                                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                                        d === "confirmed"
                                            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                                            : "border-[var(--accent)] bg-white text-[var(--accent)] hover:bg-[#f0fdfa]"
                                    }`}
                                >
                                    Confirm
                                </button>
                                <button
                                    type="button"
                                    aria-pressed={d === "dismissed"}
                                    onClick={() => onDecide(f.id, "dismissed")}
                                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                                        d === "dismissed"
                                            ? "border-slate-600 bg-slate-600 text-white"
                                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    Dismiss
                                </button>
                                <span className="ml-1 text-sm text-slate-500">
                                    {d === "confirmed"
                                        ? "Confirmed. This goes in the report."
                                        : d === "dismissed"
                                          ? "Dismissed as a false positive."
                                          : "Not reviewed yet"}
                                </span>
                            </div>
                        </FindingCard>
                    );
                })}
            </div>
            <div className="mt-6 flex flex-col items-end gap-2">
                <PrimaryButton onClick={onNext} disabled={!allReviewed}>
                    Build report <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
                {!allReviewed && <p className="text-sm text-slate-500">Review every finding to build the report.</p>}
            </div>
        </section>
    );
}

/* ---------- 5. Report ---------- */

function ReportScreen({
    decisions,
    onRestart,
}: {
    decisions: Record<string, Decision>;
    onRestart: () => void;
}) {
    const confirmed = Object.values(decisions).filter((d) => d === "confirmed").length;
    const dismissed = Object.values(decisions).filter((d) => d === "dismissed").length;
    const cards = [
        {
            icon: FileText,
            name: "Findings report",
            format: "PDF",
            body: "Confirmed findings by eSTAR section, with the quoted evidence and the rule behind each one.",
        },
        {
            icon: FileSpreadsheet,
            name: "Fix list",
            format: "Spreadsheet",
            body: "One row per confirmed finding, ready to assign and track.",
        },
    ];
    return (
        <section>
            <Title
                title="Your readiness report is ready"
                subtitle={`${confirmed} confirmed ${confirmed === 1 ? "finding" : "findings"} and ${dismissed} dismissed as false ${dismissed === 1 ? "positive" : "positives"}.`}
            />
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#99f6e4] bg-[#f0fdfa] px-4 py-3 text-sm text-[#115e59]">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Every finding in this report was checked by a person before export.
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {cards.map((c) => (
                    <div key={c.name} className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <c.icon className="h-6 w-6 text-[var(--accent)]" />
                            <div>
                                <p className="font-semibold text-slate-900">{c.name}</p>
                                <p className="text-xs text-slate-500">{c.format}</p>
                            </div>
                        </div>
                        <p className="mt-3 flex-1 text-sm text-slate-600">{c.body}</p>
                        <button
                            type="button"
                            disabled
                            title="Export is not wired up yet"
                            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-slate-500 disabled:cursor-not-allowed"
                        >
                            <Download className="h-4 w-4" /> Download (coming soon)
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-8">
                <button
                    type="button"
                    onClick={onRestart}
                    className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                >
                    Check another package
                </button>
            </div>
        </section>
    );
}
