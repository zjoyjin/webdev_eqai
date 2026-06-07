'use client';

import { useFormStatus } from 'react-dom';
import { primaryButtonClass } from '@/components/PageChrome';

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
      className={`w-full ${primaryButtonClass}`}
      aria-disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
