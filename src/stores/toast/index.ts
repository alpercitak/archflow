import { atom } from 'jotai';

type ToastState = {
  message: string;
  visible: boolean;
};

const TOAST_DURATION = 1_800;

const toastMessageAtom = atom<string>('');
const toastVisibleAtom = atom<boolean>(false);

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const toastStateAtom = atom<ToastState>((get) => ({
  message: get(toastMessageAtom),
  visible: get(toastVisibleAtom),
}));

export const showToastAtom = atom(null, (_, set, message: string) => {
  set(toastMessageAtom, message);
  set(toastVisibleAtom, true);

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    set(toastVisibleAtom, false);
    toastTimer = null;
  }, TOAST_DURATION);
});
