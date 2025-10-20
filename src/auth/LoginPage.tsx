import { useState } from "react";
import API from "../api/axiosClient";
import { useAuth } from "./AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.access_token);
      window.location.href = "/";
    } catch (err: any) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans px-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white shadow-lg rounded-2xl overflow-hidden">
        
        {/* Top on mobile / Right on desktop */}
        <div className="order-1 md:order-2 w-full md:w-1/2 bg-blue-50 flex flex-col justify-center items-center text-center p-8 md:p-10">
          <img
            src="loginIcon.svg"
            alt="Illustration"
            className="w-40 sm:w-56 md:w-64 mb-6 md:mb-8"
          />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Keep your business organized and growing
          </h2>
          <p className="text-gray-600 font-medium text-sm sm:text-base">with
            <span className="font-bold text-gray-900"> InVision</span>
          </p>
        </div>

        {/* Form below illustration on mobile / left on desktop */}
        <div className="order-2 md:order-1 w-full md:w-1/2 p-6 sm:p-8 md:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900 text-center md:text-left">
            Welcome back!
          </h1>

          <p className="text-gray-500 mb-8 text-center md:text-left text-sm sm:text-base">
            Streamline your sales, monitor your stock, and grow your business with{" "}
            <span className="font-semibold text-gray-900">InVision.</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-red-500 text-sm text-center md:text-left">{error}</p>}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-1 focus:ring-[#2B92F3] text-sm sm:text-base"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-1 focus:ring-[#2B92F3] text-sm sm:text-base"
            />

            <div className="text-right text-xs sm:text-sm text-gray-500">
              <a href="#" className="hover:text-[#2B92F3]">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2B92F3] text-white rounded-full py-3 font-medium hover:bg-blue-600 transition text-sm sm:text-base"
            >
              Login
            </button>
          </form>

          <p className="text-center text-gray-600 mt-8 text-sm sm:text-base">
            {/* Not a member?{" "}
            <a href="#" className="text-[#2B92F3] font-medium hover:underline">
              Register now
            </a> */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
