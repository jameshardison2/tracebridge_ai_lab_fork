/**
 * PLACEHOLDER DATA. NOT REAL FINDINGS.
 *
 * Sample package for "AeroPulse 3", the fictional nebulizer used in the
 * TraceBridge eval set. The readiness check screens (/check) use this until
 * the upload, parse status, findings and report APIs are wired in.
 *
 * f2 and f4 are adapted from the Nov 6 client meeting deck. f1 and f3 are
 * made-up examples written to show the other finding types.
 */

export type Severity = "Critical" | "Major" | "Minor";

export type Quote = {
    section: string;
    text: string;
};

export type Finding = {
    id: string;
    severity: Severity;
    type: string;
    title: string;
    quotes: Quote[];
    rule: string;
};

export const SAMPLE_DEVICE_NAME = "AeroPulse 3";

export const SAMPLE_SECTIONS: string[] = [
    "Device description",
    "Indications for use",
    "Substantial equivalence comparison",
    "Performance testing",
    "Software",
    "Risk management",
    "Biocompatibility",
    "Labeling and IFU",
    "Electrical safety and EMC",
    "Human factors",
];

/** File names for the sample package, one per section. */
export const SAMPLE_FILES: string[] = SAMPLE_SECTIONS.map(
    (s) => `${s.replace(/[^A-Za-z0-9]+/g, "_").replace(/_+$/, "")}.pdf`
);

export const SAMPLE_FINDINGS: Finding[] = [
    {
        id: "f1",
        severity: "Critical",
        type: "Missing evidence",
        title: "No biocompatibility test report for the mouthpiece",
        quotes: [
            {
                section: "Device description",
                text: "The mouthpiece is medical-grade polypropylene and contacts the patient’s mucosal membranes.",
            },
            {
                section: "Biocompatibility",
                text: "No test report for the mouthpiece was found in this section.",
            },
        ],
        rule: "ISO 10993-1",
    },
    {
        id: "f2",
        severity: "Major",
        type: "Broken traceability",
        title: "A safety control relies on a software requirement that was never tested",
        quotes: [
            {
                section: "Software",
                text: "SRS-031 (low-battery alarm) was deferred and not verified.",
            },
            {
                section: "Risk management",
                text: "Hazard H-12 is mitigated by the low-battery alarm, verified in TP-231.",
            },
        ],
        rule: "RULE-062 and RULE-424",
    },
    {
        id: "f3",
        severity: "Major",
        type: "Unjustified not applicable",
        title: "Section marked not applicable for a battery-powered device",
        quotes: [
            { section: "Electrical safety and EMC", text: "Not applicable." },
            {
                section: "Device description",
                text: "Powered by a rechargeable 3.7 V lithium-ion battery.",
            },
        ],
        rule: "IEC 60601-1 and IEC 60601-1-2",
    },
    {
        id: "f4",
        severity: "Minor",
        type: "Contradiction",
        title: "Medication cup size differs between sections",
        quotes: [
            {
                section: "Device description",
                text: "The medication cup holds 6 mL.",
            },
            {
                section: "Performance testing",
                text: "Testing was run with the 8 mL medication cup.",
            },
        ],
        rule: "21 CFR 807.87",
    },
];
