import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Event Dashboard",
  description: "Manage and track your events effortlessly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex justify-center">
        {/* Main content container with padding */}
        <div className="w-full max-w-7xl p-6 sm:p-10 md:p-16">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}