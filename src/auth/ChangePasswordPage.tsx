import { useState } from "react";
import API from "../api/axiosClient";
import { useNavigate } from "react-router-dom";


const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await API.post("/users/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setMessage("Password changed successfully. Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError("Failed to change password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Change Password
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          You must change your password before accessing the system.
        </p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-3">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full border rounded-full px-4 py-2 border-gray-300"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full border rounded-full px-4 py-2 border-gray-300"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border rounded-full px-4 py-2 border-gray-300"
          />

          <button
            type="submit"
            className="w-full bg-[#2B92F3] text-white rounded-full py-2 font-medium hover:bg-blue-600"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
