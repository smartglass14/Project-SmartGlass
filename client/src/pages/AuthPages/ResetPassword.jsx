export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-center text-yellow-600 mb-8">
          🔒 Reset Password
        </h2>

        <form className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
