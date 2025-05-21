"use client";

import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/components/toast";
import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";
import { signIn } from "@/services/apis/auth";
const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = form;
    if (!email || !password) {
      return showToast("Please fill in all fields.", { type: "error" });
    }
    try {
      setIsLoading(true);
      const res = await signIn(form);
      // const res = await signIn("credentials", {
      //   email,
      //   password,
      //   redirect: false,
      // });

      console.log("login res : ", res);
      if (!res.success) {
        return showToast("Login failed. Check your credentials.", {
          type: "error",
        });
      }
      showToast("Logged in successfully!", { type: "success" });
      router.push("/admin/dashboard");
    } catch {
      showToast("Login failed. Check your credentials.", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "i.e, abc@gmail.com",
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      placeholder: "•••••••",
    },
  ];

  return (
    <div className="overflow-hidden w-full h-full">
      <div className="w-96 h-24 relative right-4">
        <Image
          src="/images/Logo(black).png"
          alt="Logo"
          fill
          className="object-contain"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-neutral-900 text-4xl md:text-5xl font-semibold font-['Inter_Tight'] pt-24">
          Welcome to Creme Xchange!
        </h1>
        <p className="text-neutral-900 text-base md:text-lg font-normal font-['Inter_Tight']">
          Please enter your details...
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full pt-24"
      >
        {inputFields.map((field) => (
          <div className="flex flex-col gap-2" key={field.name}>
            <label
              htmlFor={field.name}
              className="text-neutral-900 text-lg font-semibold font-['Inter_Tight']"
            >
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="p-4 bg-sky-50 rounded-xl w-full text-base text-neutral-900 font-normal font-['Inter_Tight'] focus:outline-none"
            />
          </div>
        ))}

        <div className="flex justify-between items-center pb-16">
          <label className="flex items-center gap-2 text-base font-light text-neutral-900 font-['Inter_Tight'] cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              className="w-4 h-4 border rounded border-neutral-900"
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-neutral-900/50 text-base font-medium hover:underline font-['Inter_Tight']"
          >
            Forgot your password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gray-700 rounded-[60px] text-white text-xl font-bold font-['Inter_Tight'] hover:bg-gray-800 transition"
        >
          {isLoading ? "Loading..." : "Log In"}
        </button>
      </form>
      <div className="text-center text-lg font-['Inter_Tight'] pt-8">
        <span className="text-neutral-900/50 font-medium">
          Don’t have an account{" "}
        </span>
        <a href="/signup" className="text-neutral-900 font-bold underline">
          Sign up?
        </a>
      </div>
    </div>
  );
};

export default LoginPage;
