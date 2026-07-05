const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const variants = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-3.5',
  };

  return (
    <div className={`animate-pulse bg-gray-100 ${variants[variant]} ${className}`} />
  );
};

export const ProductCardSkeleton = () => (
  <div className="border border-border rounded-lg overflow-hidden">
    <Skeleton className="w-full aspect-[4/5]" />
    <div className="p-3.5 space-y-2">
      <Skeleton className="w-1/3 h-3" variant="text" />
      <Skeleton className="w-full h-4" variant="text" />
      <Skeleton className="w-1/2 h-4" variant="text" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default Skeleton;
