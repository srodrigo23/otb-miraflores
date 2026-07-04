type LoaderAnimationProps = {
  fullScreen?: boolean;
  size?: number;
  color?: string;
};

export const LoaderAnimation = ({ fullScreen = true, size = 12, color = 'border-gray-900' }: LoaderAnimationProps) => {
  const spinner = (
    <div
      className={`inline-block animate-spin rounded-full border-4 border-solid ${color} border-r-transparent`}
      style={{ height: `${size * 4}px`, width: `${size * 4}px` }}
    />
  );

  if (fullScreen) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200'>
        {spinner}
      </div>
    );
  }

  return spinner;
};
