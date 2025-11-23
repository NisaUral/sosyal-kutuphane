function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Bir Hata Oluştu
      </h3>
      <p className="text-red-600 mb-4">
        {message || 'Bir şeyler yanlış gitti. Lütfen tekrar deneyin.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Tekrar Dene
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;