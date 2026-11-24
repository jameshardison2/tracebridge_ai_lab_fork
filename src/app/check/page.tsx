import type { Metadata } from "next";
import ReadinessCheck from "@/components/readiness/ReadinessCheck";

export const metadata: Metadata = {
    title: "Readiness check (preview) - TraceBridge AI",
};

// New five-step readiness flow: Upload, Check, Findings, Review, Report.
// Runs on placeholder sample data (src/lib/sample-aeropulse.ts) until the APIs are wired in.
export default function CheckPage() {
    return <ReadinessCheck />;
}
