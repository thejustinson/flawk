import type { Metadata } from "next";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Apply for Studio access — Flawk",
};

export default function ApplyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md">
        <ApplyForm />
      </div>
    </div>
  );
}
