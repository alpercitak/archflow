import { useCallback, useRef } from 'react';

export const useFilePicker = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resolveRef = useRef<((file: File | null) => void) | null>(null);

  if (!inputRef.current && typeof document !== 'undefined') {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      if (resolveRef.current) {
        resolveRef.current(file);
      }
      input.value = '';
    };
    inputRef.current = input;
  }

  const openPicker = useCallback(
    (accept: string): Promise<File | null> =>
      new Promise((resolve) => {
        if (!inputRef.current) {
          return resolve(null);
        }
        if (accept) {
          inputRef.current.accept = accept;
        }
        resolveRef.current = resolve;
        inputRef.current.click();
      }),
    [],
  );

  return openPicker;
};
