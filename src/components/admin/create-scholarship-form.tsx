"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { dashboardKeys } from "@/hooks/use-dashboard-queries";
import { useAdminTxFlow } from "@/hooks/use-admin-tx-flow";
import { isValidCardanoAddress } from "@/lib/cardano-address";
import { cn } from "@/lib/utils";

import { TxStatusBanner } from "./tx-status-banner";

const SEMESTERS = ["2024_1", "2024_2", "2025_1", "2025_2", "2025_3", "2026_1"];

export function CreateScholarshipForm() {
  const queryClient = useQueryClient();
  const { step, stepLabel, lastTxHash, isBusy, fundScholarship, reset } =
    useAdminTxFlow();

  const [studentId, setStudentId] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [requiredGpa, setRequiredGpa] = useState("3.0");
  const [amountAda, setAmountAda] = useState("");
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [addressError, setAddressError] = useState<string | null>(null);

  const validateAddress = (value: string) => {
    if (!value.trim()) {
      setAddressError("Địa chỉ ví là bắt buộc");
      return false;
    }
    if (!isValidCardanoAddress(value)) {
      setAddressError("Địa chỉ không hợp lệ (bech32 addr / addr_test)");
      return false;
    }
    setAddressError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddress(studentAddress)) return;

    const gpa = parseFloat(requiredGpa);
    const amount = parseFloat(amountAda);
    if (Number.isNaN(gpa) || gpa < 0 || gpa > 4) return;
    if (Number.isNaN(amount) || amount <= 0) return;

    try {
      await fundScholarship({
        student_id: studentId.trim(),
        student_address: studentAddress.trim(),
        required_gpa: gpa,
        amount_ada: amount,
        semester,
      });
      setStudentId("");
      setStudentAddress("");
      setAmountAda("");
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "scholarships"] });
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="text-base font-semibold text-zinc-100">
        Tạo học bổng mới
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Build → ký ví → submit lên Preprod
      </p>

      <TxStatusBanner step={step} label={stepLabel} txHash={lastTxHash} />

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Student ID" className="sm:col-span-1">
          <input
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="SV001"
            className={inputClass}
            disabled={isBusy}
          />
        </Field>

        <Field label="Student Wallet Address" className="sm:col-span-1">
          <input
            required
            value={studentAddress}
            onChange={(e) => {
              setStudentAddress(e.target.value);
              if (addressError) validateAddress(e.target.value);
            }}
            onBlur={() => validateAddress(studentAddress)}
            placeholder="addr_test1..."
            className={cn(inputClass, addressError && "border-red-500")}
            disabled={isBusy}
          />
          {addressError && (
            <p className="mt-1 text-xs text-red-400">{addressError}</p>
          )}
        </Field>

        <Field label="GPA tối thiểu">
          <input
            type="number"
            required
            min={0}
            max={4}
            step={0.1}
            value={requiredGpa}
            onChange={(e) => setRequiredGpa(e.target.value)}
            className={inputClass}
            disabled={isBusy}
          />
        </Field>

        <Field label="Số tiền ADA">
          <input
            type="number"
            required
            min={0.000001}
            step={0.1}
            value={amountAda}
            onChange={(e) => setAmountAda(e.target.value)}
            placeholder="100"
            className={inputClass}
            disabled={isBusy}
          />
        </Field>

        <Field label="Học kỳ" className="sm:col-span-2">
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className={inputClass}
            disabled={isBusy}
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={isBusy}
            className="h-10 rounded-lg bg-emerald-600 px-5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isBusy ? "Đang xử lý..." : "Tạo học bổng"}
          </button>
          {step !== "idle" && (
            <button
              type="button"
              onClick={reset}
              disabled={isBusy}
              className="h-10 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-50";
