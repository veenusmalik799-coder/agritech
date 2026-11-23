export default function Field({ label, unit, hint, ...props }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm font-medium">
        {label}
        {unit && <span className="text-xs font-normal text-soil/60">{unit}</span>}
      </span>
      <input
        type="number"
        step="any"
        className="mt-1 w-full rounded-md border border-field/20 bg-paper px-3 py-2 text-base outline-none transition focus:border-field focus:ring-2 focus:ring-field/25"
        {...props}
      />
      {hint && <span className="mt-0.5 block text-xs text-soil/55">{hint}</span>}
    </label>
  );
}