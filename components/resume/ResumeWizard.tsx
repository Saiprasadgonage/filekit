"use client";

import { useState } from "react";
import { ResumeData, ExperienceEntry, EducationEntry } from "./types";

type Props = {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onDone: () => void;
};

const STEPS = ["Basics", "Summary", "Experience", "Education", "Skills"] as const;

export default function ResumeWizard({ data, onChange, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  function update<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    onChange({ ...data, [key]: value });
  }

  function updateExperience(id: string, patch: Partial<ExperienceEntry>) {
    update(
      "experience",
      data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  }
  function addExperience() {
    update("experience", [
      ...data.experience,
      { id: `e${Date.now()}`, title: "", company: "", start: "", end: "", bullets: "" }
    ]);
  }
  function removeExperience(id: string) {
    update("experience", data.experience.filter((e) => e.id !== id));
  }

  function updateEducation(id: string, patch: Partial<EducationEntry>) {
    update(
      "education",
      data.education.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  }
  function addEducation() {
    update("education", [...data.education, { id: `d${Date.now()}`, school: "", degree: "", year: "" }]);
  }
  function removeEducation(id: string) {
    update("education", data.education.filter((e) => e.id !== id));
  }

  function validateStep(): string {
    if (step === 0) {
      if (!data.name.trim()) return "What's your name?";
      if (!data.email.trim()) return "Add an email so employers can reach you.";
    }
    return "";
  }

  function next() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    if (step === STEPS.length - 1) onDone();
    else setStep(step + 1);
  }
  function back() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1 rounded-full ${i <= step ? "bg-amber" : "bg-line"}`} />
            <p className={`tag mt-1 ${i === step ? "text-paper" : "text-dim"}`}>{label}</p>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <p className="text-paper font-medium">Let's start with the basics.</p>
          <Field label="Full name" value={data.name} onChange={(v) => update("name", v)} placeholder="Jordan Lee" />
          <Field
            label="Job title you're targeting"
            value={data.title}
            onChange={(v) => update("title", v)}
            placeholder="Product Designer"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" value={data.email} onChange={(v) => update("email", v)} placeholder="jordan@email.com" />
            <Field label="Phone" value={data.phone} onChange={(v) => update("phone", v)} placeholder="(555) 010-0000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location" value={data.location} onChange={(v) => update("location", v)} placeholder="Austin, TX" />
            <Field label="Website / LinkedIn" value={data.website} onChange={(v) => update("website", v)} placeholder="linkedin.com/in/jordan" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-paper font-medium">How would you sum yourself up in 2–3 sentences?</p>
          <p className="text-dim text-sm">
            Mention your role, years of experience, and the kind of impact you make. You can skip this and add it later.
          </p>
          <textarea
            value={data.summary}
            onChange={(e) => update("summary", e.target.value)}
            rows={5}
            placeholder="Product designer with 6 years building B2B dashboards, focused on turning messy workflows into clear interfaces."
            className="w-full bg-panel2 border border-line rounded-sm px-3 py-2 text-paper"
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <p className="text-paper font-medium">Tell us about your work experience.</p>
          {data.experience.map((exp, i) => (
            <div key={exp.id} className="border border-line rounded-md p-4 bg-panel2 space-y-3">
              <div className="flex items-center justify-between">
                <p className="tag text-dim">ROLE {i + 1}</p>
                {data.experience.length > 1 && (
                  <button onClick={() => removeExperience(exp.id)} className="text-dim hover:text-rust text-sm">
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Job title" value={exp.title} onChange={(v) => updateExperience(exp.id, { title: v })} placeholder="Senior Designer" />
                <Field label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, { company: v })} placeholder="Acme Co." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start" value={exp.start} onChange={(v) => updateExperience(exp.id, { start: v })} placeholder="Jan 2022" />
                <Field label="End" value={exp.end} onChange={(v) => updateExperience(exp.id, { end: v })} placeholder="Present" />
              </div>
              <div>
                <label className="text-sm text-dim">What did you do? One line per bullet.</label>
                <textarea
                  value={exp.bullets}
                  onChange={(e) => updateExperience(exp.id, { bullets: e.target.value })}
                  rows={3}
                  placeholder={"Redesigned onboarding, cutting drop-off by 30%\nLed a team of 3 designers across two product lines"}
                  className="mt-1 w-full bg-panel border border-line rounded-sm px-3 py-2 text-paper text-sm"
                />
              </div>
            </div>
          ))}
          <button onClick={addExperience} className="text-sm text-amber hover:text-amberDeep">
            + Add another role
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <p className="text-paper font-medium">Education.</p>
          {data.education.map((ed, i) => (
            <div key={ed.id} className="border border-line rounded-md p-4 bg-panel2 space-y-3">
              <div className="flex items-center justify-between">
                <p className="tag text-dim">SCHOOL {i + 1}</p>
                {data.education.length > 1 && (
                  <button onClick={() => removeEducation(ed.id)} className="text-dim hover:text-rust text-sm">
                    Remove
                  </button>
                )}
              </div>
              <Field label="School" value={ed.school} onChange={(v) => updateEducation(ed.id, { school: v })} placeholder="University of Texas" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Degree" value={ed.degree} onChange={(v) => updateEducation(ed.id, { degree: v })} placeholder="B.A. Design" />
                <Field label="Year" value={ed.year} onChange={(v) => updateEducation(ed.id, { year: v })} placeholder="2019" />
              </div>
            </div>
          ))}
          <button onClick={addEducation} className="text-sm text-amber hover:text-amberDeep">
            + Add another school
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <p className="text-paper font-medium">What skills should be on there?</p>
          <p className="text-dim text-sm">Separate with commas.</p>
          <textarea
            value={data.skills}
            onChange={(e) => update("skills", e.target.value)}
            rows={3}
            placeholder="Figma, User research, Design systems, Prototyping, SQL"
            className="w-full bg-panel2 border border-line rounded-sm px-3 py-2 text-paper"
          />
        </div>
      )}

      {error && <p className="text-rust text-sm mt-3">{error}</p>}

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={back}
          disabled={step === 0}
          className="text-dim hover:text-paper text-sm disabled:opacity-30"
        >
          ← Back
        </button>
        <button
          onClick={next}
          className="bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
        >
          {step === STEPS.length - 1 ? "Choose a style →" : "Next"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm text-dim">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-panel2 border border-line rounded-sm px-3 py-1.5 text-paper text-sm"
      />
    </div>
  );
}
