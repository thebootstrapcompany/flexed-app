import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import Touchpoints from "./touchpoints";

type ReviewAutomation = {
    tone: string;
    language: string;
    length: string;
    keywords: string[];
    instructions: string;
};

type VisibilityTabProps = {
    automation: ReviewAutomation;
    setAutomation: React.Dispatch<React.SetStateAction<ReviewAutomation>>;
    isEditing: boolean;
    saving: boolean;
    businessId: string;
};

const MAX_KEYWORDS = 10;
const MAX_KEYWORD_LENGTH = 50;

function SectionAccordion({ value, title, description, children }: { value: string; title: string; description: string; children: React.ReactNode }) {
    return (
        <AccordionItem value={value} className="rounded-xl border px-4 bg-muted/20">
            <AccordionTrigger className="py-4 text-left hover:no-underline">
                <div className="space-y-1">
                    <div className="font-semibold">{title}</div>
                    <p className="text-xs font-normal text-muted-foreground">{description}</p>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">{children}</AccordionContent>
        </AccordionItem>
    );
}

export default function VisibilityTab({ automation, setAutomation, isEditing, saving, businessId }: VisibilityTabProps) {
    const [keywordInput, setKeywordInput] = useState("");
    const canEdit = isEditing && !saving;

    const setReviewOption = (key: keyof ReviewAutomation, value: string) => {
        setAutomation(previous => ({ ...previous, [key]: value }));
    };

    const addKeywords = (raw: string) => {
        const incoming = raw.split(",").map(keyword => keyword.trim().slice(0, MAX_KEYWORD_LENGTH)).filter(Boolean);
        if (!incoming.length) return;
        setAutomation(previous => {
            const keywords = [...previous.keywords];
            for (const keyword of incoming) {
                if (keywords.length >= MAX_KEYWORDS) break;
                if (!keywords.some(existing => existing.toLowerCase() === keyword.toLowerCase())) keywords.push(keyword);
            }
            return { ...previous, keywords };
        });
        setKeywordInput("");
    };

    const removeKeyword = (keyword: string) => {
        setAutomation(previous => ({ ...previous, keywords: previous.keywords.filter(item => item !== keyword) }));
    };

    const optionGroups = [
        { key: "tone" as const, label: "Tone", options: ["Random", "Balanced", "Friendly",  "Enthusiastic", "Professional", "Simple", ] },
        { key: "language" as const, label: "Language", options: ["Random", "English", "Hindi", "Hinglish"] },
    ];

    const lengths = [
        { label: "Short", description: "15–30 words" },
        { label: "Medium", description: "30–60 words" },
        { label: "Long", description: "60–100 words" },
    ];

    return (
        <div className="w-full pt-2">
            <Accordion multiple className="flex w-full flex-col gap-4">
                {/* <SectionAccordion value="automation" title="Automation" description="Customize the context for AI workflows.">
                    <div className="space-y-5">
                        {optionGroups.map(group => (
                            <div key={group.key} className="space-y-3">
                                <Label className="text-sm font-semibold">{group.label}</Label>
                                <div className="flex flex-wrap gap-2">
                                    {group.options.map(option => {
                                        const selected = automation[group.key] === option;
                                        return (
                                            <button key={option} type="button" disabled={!canEdit} onClick={() => setReviewOption(group.key, option)} aria-pressed={selected} className={`min-h-10 rounded-full border px-5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">Length</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {lengths.map(option => {
                                    const selected = automation.length === option.label;
                                    return (
                                        <button key={option.label} type="button" disabled={!canEdit} onClick={() => setReviewOption("length", option.label)} aria-pressed={selected} className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-background hover:bg-accent"}`}>
                                            <span className="text-sm font-semibold">{option.label}</span>
                                            <span className="text-[11px] text-muted-foreground">{option.description}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <Label htmlFor="review-keywords" className="text-sm font-semibold">Review keywords</Label>
                                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{automation.keywords.length}/{MAX_KEYWORDS}</span>
                            </div>
                            <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-input bg-background p-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20" onClick={event => { if (event.target === event.currentTarget) document.getElementById("review-keywords")?.focus(); }}>
                                {automation.keywords.map(keyword => (
                                    <span key={keyword} className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-medium">
                                        <span className="truncate">{keyword}</span>
                                        <button type="button" disabled={!canEdit} onClick={() => removeKeyword(keyword)} aria-label={`Remove ${keyword}`} className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-foreground/10 hover:text-foreground disabled:opacity-50">
                                            <X className="size-3" />
                                        </button>
                                    </span>
                                ))}
                                {automation.keywords.length < MAX_KEYWORDS && (
                                    <input id="review-keywords" type="text" value={keywordInput} disabled={!canEdit} maxLength={MAX_KEYWORD_LENGTH * MAX_KEYWORDS + MAX_KEYWORDS} placeholder={automation.keywords.length ? "Add another..." : "e.g. fresh produce, friendly staff"} onChange={event => { const value = event.target.value; if (value.includes(",")) { const parts = value.split(","); addKeywords(parts.slice(0, -1).join(",")); setKeywordInput(parts.at(-1) ?? ""); } else setKeywordInput(value); }} onKeyDown={event => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addKeywords(keywordInput); } if (event.key === "Backspace" && !keywordInput && automation.keywords.length) removeKeyword(automation.keywords[automation.keywords.length - 1]); }} onPaste={event => { const text = event.clipboardData.getData("text"); if (!text.includes(",")) return; event.preventDefault(); addKeywords(text); }} onBlur={() => { if (keywordInput.trim()) addKeywords(keywordInput); }} className="h-8 min-w-32 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50" aria-label="Add keywords" />
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs text-muted-foreground">Press <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> or comma to add</p>
                                {automation.keywords.length > 0 && <button type="button" disabled={!canEdit} onClick={() => setAutomation(previous => ({ ...previous, keywords: [] }))} className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50">Clear all</button>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <Label htmlFor="review-instructions" className="text-sm font-semibold">Instructions</Label>
                                <span className="text-xs tabular-nums text-muted-foreground">{automation.instructions.length}/500</span>
                            </div>
                            <Textarea id="review-instructions" value={automation.instructions} onChange={event => setReviewOption("instructions", event.target.value)} disabled={!canEdit} maxLength={500} rows={3} className="min-h-24 resize-y rounded-xl" placeholder="Example: Keep the language natural and simple. Avoid overly formal expressions." />
                            <p className="text-xs text-muted-foreground">These preferences guide AI-generated replies without changing the customer's actual experience.</p>
                        </div>
                    </div>
                </SectionAccordion> */}
                <SectionAccordion value='touchpoints' title="Touchpoints" description="Create, manage and track touchpoints for your business.">
                    <Touchpoints businessId={businessId}/>
                </SectionAccordion>
            </Accordion>
        </div>
    );
}