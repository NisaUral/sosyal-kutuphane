import { Link } from 'react-router-dom';

function ContentCard({ content }) {
  const { external_id, title, type, year, poster_url, vote_average } = content;

  return (
    <Link
      to={`/content/${type}/${external_id}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
    >
      {/* Poster */}
      {poster_url ? (
        <img
          src={poster_url}
          alt={title}
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-4xl">
            {type === 'movie' ? '🎬' : '📚'}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-2 mb-2">
          {title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{year || 'N/A'}</span>
          {vote_average > 0 && (
            <span className="flex items-center">
              ⭐ {vote_average.toFixed(1)}
            </span>
          )}
        </div>
        <div className="mt-2">
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
            {type === 'movie' ? 'Film' : 'Kitap'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ContentCard;