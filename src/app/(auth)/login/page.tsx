"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const supabase = createClient();

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    router.push("/dashboard");
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/callback` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-6 border border-gray-100 transition-all duration-300 hover:shadow-2xl"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-sm text-gray-500">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Email */}
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="you@example.com"
                    className="focus-visible:ring-blue-500 transition-all duration-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    className="focus-visible:ring-blue-500 transition-all duration-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium shadow-md transition transform duration-300 ease-out hover:bg-blue-700 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
          >
            Sign In
          </Button>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <div className="h-px w-12 bg-gray-200" />
            or
            <div className="h-px w-12 bg-gray-200" />
          </div>

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 border-gray-300 bg-white text-gray-700 font-medium shadow-sm transition transform duration-300 ease-out hover:bg-gray-100 hover:shadow-md hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </Button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-all duration-150 cursor-pointer"
            >
              Sign up
            </a>
          </p>
        </form>
      </Form>
    </div>
  );
}