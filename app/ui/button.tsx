'use client';

import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'flex h-10 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className,
      )}
      style={{ 
        backgroundColor: '#007476',
        '--hover-color': '#005a5c'
      } as React.CSSProperties}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#005a5c'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007476'}
    >
      {children}
    </button>
  );
}
