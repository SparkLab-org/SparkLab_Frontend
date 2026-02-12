type Props = {
  title: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export default function ListDetailHeader({ title, checked, onToggle, disabled = false }: Props) {
  return (
    <div className="flex w-full items-start justify-between gap-4">
      <h2 className="text-2xl font-semibold leading-tight text-neutral-900">
        {title}
      </h2>
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          onToggle();
        }}
        disabled={disabled}
        className={[
          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ring-1',
          checked
            ? 'bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] text-white ring-transparent shadow-[0_8px_16px_rgba(21,0,255,0.25)]'
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
