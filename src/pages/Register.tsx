import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL + "/auth/register";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: 1, // ensure this is an integer
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // If you want to support different roles later, parse as int when role_id
    setForm({
      ...form,
      [name]: name === "role_id" ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("Server response:", data); // 👈 helpful for debugging

      if (!res.ok) {
        // FastAPI sometimes returns an array for validation errors
        if (Array.isArray(data.detail)) {
          const firstError = data.detail[0];
          throw new Error(`${firstError.loc.join(".")}: ${firstError.msg}`);
        }
        throw new Error(data.detail || "Registration failed");
      }

      setMessage("✅ Registration successful!");
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="border p-2 w-full mb-3"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="border p-2 w-full mb-3"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="border p-2 w-full mb-3"
        />
        {/* Optional: Role selection dropdown */}
        {/* <select
          name="role_id"
          value={form.role_id}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        >
          <option value={1}>Admin</option>
          <option value={2}>User</option>
        </select> */}

        <button type="submit" className="bg-blue-500 text-white w-full py-2 rounded">
          Register
        </button>
      </form>

      {message && <p className="mt-3 text-center">{message}</p>}
    </div>
  );
}
