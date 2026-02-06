type Props = {
  title: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export default function ListDetailHeader({ title, checked, onToggle, disabled = false }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          onToggle();
        }}
        disabled={disabled}
        className={[
          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ring-1',
          checked
            ? 'bg-neutral-900 text-white ring-neutral-900'
            : 'bg-white text-neutral-500 ring-neutral-200 hover:ring-neutral-300',
          disabled ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
        aria-pressed={checked}
        aria-label={checked ? '완료 해제' : '완료로 변경'}
      >
        {checked ? '✓' : ''}
      </button>
    </div>
  );
}
