'use client';

type Props = {
  onLogout: () => void;
  onWithdraw: () => void;
};

export default function MyAccountActions({ onLogout, onWithdraw }: Props) {
  return (
    <div className="flex items-center justify-center gap-6 pt-2 text-xs font-semibold text-neutral-300">
      <button type="button" onClick={onLogout} className="hover:text-neutral-500">
        로그아웃
      </button>
      <button type="button" onClick={onWithdraw} className="hover:text-neutral-500">
        회원탈퇴
      </button>
    </div>
  );
}
