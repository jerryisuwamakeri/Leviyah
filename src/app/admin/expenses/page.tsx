"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, TrendingDown } from "lucide-react";
import toast from "react-hot-toast";
import type { Expense } from "@/types";

const CATEGORIES = ["general","rent","utilities","salaries","supplies","marketing","shipping","maintenance","other"];

function formatNGN(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}

const blankForm = { title: "", amount: "", category: "general", expense_date: new Date().toISOString().slice(0,10), description: "", reference: "" };

type FormState = typeof blankForm;

function ExpenseForm({
  form, setForm, onSubmit, loading, submitLabel,
}: {
  form: FormState;
  setForm: (fn: (p: FormState) => FormState) => void;
  onSubmit: () => void;
  loading: boolean;
  submitLabel: string;
}) {
  const f = (k: keyof FormState) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((p: FormState) => ({ ...p, [k]: e.target.value })),
  });

  return (
    <div className="space-y-4 pt-2">
      <div>
        <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Title</Label>
        <Input {...f("title")} className="mt-1.5 border-[#E8D8C4] rounded-none" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Amount (₦)</Label>
          <Input type="number" {...f("amount")} className="mt-1.5 border-[#E8D8C4] rounded-none" />
        </div>
        <div>
          <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Date</Label>
          <Input type="date" {...f("expense_date")} className="mt-1.5 border-[#E8D8C4] rounded-none" />
        </div>
      </div>
      <div>
        <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Category</Label>
        <Select value={form.category} onValueChange={v => setForm((p: FormState) => ({ ...p, category: v ?? p.category }))}>
          <SelectTrigger className="mt-1.5 border-[#E8D8C4] rounded-none"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Reference / Receipt No.</Label>
        <Input {...f("reference")} className="mt-1.5 border-[#E8D8C4] rounded-none" placeholder="Optional" />
      </div>
      <div>
        <Label className="text-[10px] font-bold tracking-widest uppercase text-[#7A6050]">Notes</Label>
        <Input {...f("description")} className="mt-1.5 border-[#E8D8C4] rounded-none" placeholder="Optional" />
      </div>
      <Button
        onClick={onSubmit}
        disabled={loading || !form.title || !form.amount}
        className="w-full bg-[#111111] text-white hover:bg-[#C9A880] hover:text-[#111111]"
      >
        {loading ? "Saving…" : submitLabel}
      </Button>
    </div>
  );
}

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [period, setPeriod]           = useState("month");
  const [addOpen, setAddOpen]         = useState(false);
  const [editingExp, setEditingExp]   = useState<Expense | null>(null);
  const [addForm, setAddForm]         = useState<FormState>(blankForm);
  const [editForm, setEditForm]       = useState<FormState>(blankForm);

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", period],
    queryFn: () => adminApi.expenses({ period }).then(r => r.data),
  });

  const expenses: Expense[]                       = data?.expenses?.data ?? [];
  const total: number                             = data?.total ?? 0;
  const categoryTotals: { category: string; total: number }[] = data?.category_totals ?? [];
  const maxCatTotal = Math.max(...categoryTotals.map(c => Number(c.total)), 1);

  const create = useMutation({
    mutationFn: () => adminApi.createExpense({ ...addForm, amount: parseFloat(addForm.amount) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense added.");
      setAddOpen(false);
      setAddForm(blankForm);
    },
    onError: () => toast.error("Could not add expense."),
  });

  const update = useMutation({
    mutationFn: () => adminApi.updateExpense(editingExp!.id, { ...editForm, amount: parseFloat(editForm.amount) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense updated.");
      setEditingExp(null);
    },
    onError: () => toast.error("Could not update expense."),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteExpense(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); toast.success("Deleted."); },
  });

  function openEdit(exp: Expense) {
    setEditForm({
      title:        exp.title,
      amount:       String(exp.amount),
      category:     exp.category,
      expense_date: exp.expense_date.slice(0, 10),
      description:  exp.description ?? "",
      reference:    exp.reference   ?? "",
    });
    setEditingExp(exp);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#111111]">Expenses</h1>
          <p className="text-xs text-[#B8A090] mt-0.5">Track business costs and outflows</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-[#111111] text-white hover:bg-[#C9A880] hover:text-[#111111]">
          <Plus className="w-4 h-4 mr-2" /> Add Expense
        </Button>
      </div>

      {/* Period filter */}
      <div className="flex gap-2">
        {["week","month","year"].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase border transition-colors ${period===p ? "bg-[#111111] text-white border-[#111111]" : "border-[#E8D8C4] text-[#7A6050] hover:border-[#C9A880]"}`}>
            {p === "week" ? "This Week" : p === "month" ? "This Month" : "This Year"}
          </button>
        ))}
      </div>

      {/* Summary + category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Total card */}
        <div className="bg-white border border-[#E8D8C4] p-5 flex items-center gap-4">
          <TrendingDown className="w-8 h-8 text-red-400 shrink-0" />
          <div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Total Expenses</p>
            <p className="text-2xl font-black text-[#111111]">{formatNGN(total)}</p>
            <p className="text-[10px] text-[#B8A090] mt-0.5">{expenses.length} record{expenses.length !== 1 ? "s" : ""} shown</p>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white border border-[#E8D8C4] p-5">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880] mb-4">By Category</p>
          {categoryTotals.length === 0
            ? <p className="text-sm text-[#B8A090]">No data for this period.</p>
            : <div className="space-y-3">
                {categoryTotals.map(cat => {
                  const w = (Number(cat.total) / maxCatTotal) * 100;
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#7A6050] capitalize">{cat.category}</span>
                        <span className="text-[10px] font-black text-[#111111]">{formatNGN(Number(cat.total))}</span>
                      </div>
                      <div className="h-1.5 bg-[#F5EAD8]">
                        <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </div>

      {/* Expense list */}
      <div className="bg-white border border-[#E8D8C4]">
        <div className="px-5 py-3 border-b border-[#E8D8C4]">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#C9A880]">Expense Records</p>
        </div>
        {isLoading && <div className="p-8 text-center text-sm text-[#B8A090]">Loading…</div>}
        {!isLoading && expenses.length === 0 && (
          <div className="p-8 text-center text-sm text-[#B8A090]">No expenses recorded for this period.</div>
        )}
        <div className="divide-y divide-[#F5EAD8]">
          {expenses.map(exp => (
            <div key={exp.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111111]">{exp.title}</p>
                <p className="text-[10px] text-[#B8A090] capitalize">
                  {exp.category} · {new Date(exp.expense_date).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                  {exp.reference && ` · ${exp.reference}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-sm font-black text-red-500">{formatNGN(exp.amount)}</p>
                <button onClick={() => openEdit(exp)} className="text-[#B8A090] hover:text-[#C9A880] transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove.mutate(exp.id)} className="text-[#B8A090] hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <ExpenseForm
            form={addForm}
            setForm={setAddForm}
            onSubmit={() => create.mutate()}
            loading={create.isPending}
            submitLabel="Add Expense"
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingExp} onOpenChange={open => { if (!open) setEditingExp(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
          <ExpenseForm
            form={editForm}
            setForm={setEditForm}
            onSubmit={() => update.mutate()}
            loading={update.isPending}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
