function EmptyState({ icon = '📭', title, description, actionText, onAction }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;