interface PageBackgroundProps {
  variant: 'cyan-purple' | 'blue-purple' | 'primary-indigo';
}

const variantStyles = {
  'cyan-purple': {
    top: 'top-10 left-1/4 w-[600px] h-[600px] bg-cyan-500/5',
    bottom: 'bottom-20 right-1/4 w-[600px] h-[600px] bg-purple-500/5',
  },
  'blue-purple': {
    top: 'top-10 left-1/4 w-[500px] h-[500px] bg-blue-500/5',
    bottom: 'bottom-10 right-1/4 w-[500px] h-[500px] bg-purple-500/5',
  },
  'primary-indigo': {
    top: 'top-0 left-0 w-[450px] h-[450px] bg-primary opacity-[0.05]',
    bottom: 'bottom-20 right-0 w-[450px] h-[450px] bg-indigo-500 opacity-[0.05]',
  },
};

export default function PageBackground({ variant }: PageBackgroundProps) {
  const styles = variantStyles[variant];

  return (
    <>
      <div className={`absolute ${styles.top} rounded-full filter blur-[150px] pointer-events-none z-0`} />
      <div className={`absolute ${styles.bottom} rounded-full filter blur-[150px] pointer-events-none z-0`} />
    </>
  );
}