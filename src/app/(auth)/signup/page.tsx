"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
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

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for a confirmation link!");
      router.push("/login");
    }
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
            <h2 className="text-2xl font-bold text-gray-800">
              Create an Account
            </h2>
            <p className="text-sm text-gray-500">
              Sign up to start managing your events
            </p>
          </div>

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    {...field}
                    className="focus-visible:ring-blue-500 transition-all duration-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    className="focus-visible:ring-blue-500 transition-all duration-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sign Up Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium shadow-md transition transform duration-300 ease-out hover:bg-blue-700 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
          >
            Sign Up
          </Button>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <div className="h-px w-12 bg-gray-200" />
            or
            <div className="h-px w-12 bg-gray-200" />
          </div>

          {/* Go to Login */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-all duration-150 cursor-pointer"
            >
              Log in
            </a>
          </p>
        </form>
      </Form>
    </div>
  );
}