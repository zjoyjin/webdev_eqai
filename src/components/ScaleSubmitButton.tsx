'use client';

import { useFormStatus } from 'react-dom';

type ScaleSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export default function ScaleSubmitButton({ idleLabel, pendingLabel }: ScaleSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gray-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-500"
      aria-disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
