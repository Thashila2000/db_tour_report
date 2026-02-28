// ─────────────────────────────────────────────────────────────────────────────
// InputField.tsx
// Shared reusable input component used across all step forms.
// Renders a labelled input with animated inline validation error.
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";

// ── Prop types ────────────────────────────────────────────────────────────────
export interface InputFieldProps {
  label: string;                                          // Label shown above input
  name: string;                                           // HTML name + id attribute
  type?: string;                                          // Input type (default: "text")
  placeholder?: string;                                   // Placeholder text
  value: string;                                          // Controlled value
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Change handler
  error?: string;                                         // Validation error message
}

// ── Component ─────────────────────────────────────────────────────────────────
const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}: InputFieldProps) => (
  <div className="flex flex-col gap-1">

    {/* Small-caps label above the input */}
    <label
      htmlFor={name}
      className="text-xs font-semibold uppercase tracking-widest"
      style={{ color: "#4a6d8c" }}
    >
      {label}
    </label>

    {/* Controlled input with focus/blur visual feedback */}
    <input
      id={name}
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-3 rounded-xl text-sm outline-none transition-all duration-200"
      style={{
        background:  "rgba(22, 73, 118, 0.04)",
        border:      error ? "1.5px solid #f87171" : "1.5px solid #4a6d8c",
        color:       "#0a1f33",
        fontFamily:  "'DM Sans', sans-serif",
      }}
      onFocus={(e) => {
        e.target.style.border     = "1.5px solid #164976";
        e.target.style.background = "rgba(22,73,118,0.07)";
        e.target.style.boxShadow  = "0 0 0 3px rgba(22,73,118,0.10)";
      }}
      onBlur={(e) => {
        e.target.style.border     = error
          ? "1.5px solid #f87171"
          : "1.5px solid #4a6d8c";
        e.target.style.background = "rgba(22, 73, 118, 0.04)";
        e.target.style.boxShadow  = "none";
      }}
    />

    {/* Animated error message — slides down when present */}
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-xs text-red-400 font-medium mt-0.5"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

export default InputField;
