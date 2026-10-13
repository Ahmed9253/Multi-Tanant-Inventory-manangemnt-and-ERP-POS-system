type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  icon?: string;
  autoFocus?: boolean;
};

export function SearchBox({
  value,
  onChange,
  placeholder = "Search...",
  hint,
  icon = "⌕",
  autoFocus,
}: Props) {
  return (
    <label className="search-box">
      <span>{icon}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {hint && <kbd>{hint}</kbd>}
    </label>
  );
}
