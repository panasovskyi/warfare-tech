'use client';

import { useSyncExternalStore } from 'react';
import styles from './ThemeToggle.module.scss';
import { MoonIcon } from '@/components/icons/MoonIcon';
import { SunIcon } from '@/components/icons/SunIcon';
import { THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  return () => observer.disconnect();
};

const getSnapshot = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

const getServerSnapshot = (): Theme => 'light';

type Props = {
  className?: string;
};

export const ThemeToggle: React.FC<Props> = ({ className }) => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

  const handleClick = () => {
    document.documentElement.dataset.theme = nextTheme;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {}
  };

  return (
    <button
      type='button'
      className={className ? `${styles.toggle} ${className}` : styles.toggle}
      onClick={handleClick}
      aria-label={`Switch to ${nextTheme} theme`}
    >
      <MoonIcon className={styles.toggle__moon} />
      <SunIcon className={styles.toggle__sun} />
    </button>
  );
};
