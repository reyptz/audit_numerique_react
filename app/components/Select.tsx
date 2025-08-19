export default function Select({
  value, onChange, options, placeholder
}:{
  value?: string|number;
  onChange: (v:any)=>void;
  options: {label:string; value:string|number}[];
  placeholder?: string;
}) {
  return (
    <select
      className="rounded-xl border px-3 py-2 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
      value={value ?? ""}
      onChange={e=>onChange(e.target.value)}
    >
      <option value="">{placeholder ?? "Sélectionnez..."}</option>
      {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}