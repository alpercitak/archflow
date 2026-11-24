import { type FocusEvent, useRef } from 'react';

// Each focus starts a new undo step; changes within it merge into that step.
export const useEditHistoryKey = () => {
  const historyKey = useRef('');
  const onFocus = (event: FocusEvent) => {
    historyKey.current = `edit:${event.timeStamp}`;
  };
  return { historyKey, onFocus };
};
