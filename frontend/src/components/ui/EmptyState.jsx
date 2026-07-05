import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';

const EmptyState = ({
  icon: Icon = FiShoppingBag,
  title = 'Nothing here yet',
  description = '',
  actionLabel,
  actionLink,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <Icon className="w-10 h-10 text-gray-300 mb-4" strokeWidth={1.5} />
    <h3 className="text-base font-medium text-ink mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-muted max-w-sm mb-6">{description}</p>
    )}
    {actionLabel && actionLink && (
      <Link to={actionLink} className="btn-primary">
        {actionLabel}
      </Link>
    )}
    {actionLabel && onAction && (
      <button onClick={onAction} className="btn-primary">
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
