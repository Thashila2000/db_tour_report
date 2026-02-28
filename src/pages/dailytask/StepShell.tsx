// ─────────────────────────────────────────────────────────────────────────────
// StepShell.tsx
// Shared wrapper rendered inside every step component.
// Displays the step-counter pill, section title with accent bar,
// the step's form content (children), and the Back / Next / Submit buttons.
// ─────────────────────────────────────────────────────────────────────────────

import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";

// ── Prop types ────────────────────────────────────────────────────────────────
interface StepShellProps {
  stepNumber:  number;
  totalSteps:  number;
  title:       string;
  Icon:        React.ComponentType<{ size?: number }>;  // works with any react-icons icon
  onNext:      () => void;
  onBack?:     () => void;
  children:    React.ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────
const StepShell = ({
  stepNumber,
  totalSteps,
  title,
  Icon,
  onNext,
  onBack,
  children,
}: StepShellProps) => {
  const isLastStep = stepNumber === totalSteps;

  return (
    <>
      {/* Step counter pill — shows icon + "Step X of Y — Title" */}
      <div className="step-counter">
        <Icon size={12} />
        Step {stepNumber} of {totalSteps} — {title}
      </div>

      {/* Section title with left accent bar (via CSS ::before) */}
      <div className="form-section-title">{title}</div>

      {/* Step-specific form fields passed as children */}
      <div className="form-rows">
        {children}
      </div>

      {/* Navigation buttons row */}
      <div className="btn-row">
        {/* Back button — hidden on the first step */}
        {onBack && (
          <button className="btn-secondary" onClick={onBack}>
            <FiArrowLeft size={14} /> Back
          </button>
        )}

        {/* Next or Submit depending on step position */}
        {isLastStep ? (
          <button className="btn-primary" onClick={onNext}>
            <FiCheck size={14} /> Submit Report
          </button>
        ) : (
          <button className="btn-primary" onClick={onNext}>
            Next Step <FiArrowRight size={14} />
          </button>
        )}
      </div>
    </>
  );
};

export default StepShell;
