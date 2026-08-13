"use client";

import React, { useEffect, useState } from "react";
import { PlusCircle, Edit2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { JwtPayload } from "@supabase/supabase-js";

type DashboardProps = {
  user: JwtPayload;
};

type Consultation = {
  id: string;
  firstName: string;
  lastName: string;
  reason: string;
  datetime: string;
  userId: string;
};

const STORAGE_KEY = "consultations:v1";

export default function Dashboard({ user }: DashboardProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    reason: "",
    datetime: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  console.log({ user:(user) });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConsultations(JSON.parse(raw));
    } catch (e) {
      console.warn("failed to load consultations", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consultations));
    } catch (e) {
      console.warn("failed to save consultations", e);
    }
  }, [consultations]);

  function resetForm() {
    setForm({ firstName: "", lastName: "", reason: "", datetime: "" });
    setEditingId(null);
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const { firstName, lastName, reason, datetime } = form;
    if (!firstName || !lastName || !reason || !datetime) return;

    if (editingId) {
      setConsultations((s) =>
        s.map((c) => (c.id === editingId ? { ...c, ...form } : c)),
      );
    } else {
      const newC: Consultation = {
        id: String(Date.now()),
        firstName,
        lastName,
        reason,
        datetime,
        userId: user.sub,
      };
      setConsultations((s) => [newC, ...s]);
    }

    resetForm();
    setOpenForm(false);
  }

  function handleEdit(c: Consultation) {
    setForm({
      firstName: c.firstName,
      lastName: c.lastName,
      reason: c.reason,
      datetime: c.datetime,
    });
    setEditingId(c.id);
    setOpenForm(true);
  }

  function handleDelete(id: string) {
    setDeleteId(id);
  }

  function handleDeleteConfirmed() {
    if (!deleteId) return;
    setConsultations((s) => s.filter((c) => c.id !== deleteId));
    setDeleteId(null);
  }

  function handleDeleteCancel() {
    setDeleteId(null);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Schedule and manage consultations
        </p>
        <Button
          aria-expanded={openForm}
          aria-controls="consultation-form-panel"
          onClick={() => setOpenForm((v) => !v)}
        >
          {openForm ? <X size={16} /> : <PlusCircle size={16} />}
          {openForm ? "Close form" : "Book Consultation"}
        </Button>
      </div>

      <div
        id="consultation-form-panel"
        className={`grid transition-all duration-300 ease-out ${
          openForm ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <Card className="w-full md:w-2/3">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <CardTitle>{editingId ? "Edit" : "New"} Consultation</CardTitle>
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      resetForm();
                      setOpenForm(false);
                    }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
              <CardDescription />
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => handleSubmit(e)}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <Input
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
                <Input
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
                <Input
                  placeholder="Reason"
                  className="md:col-span-2"
                  value={form.reason}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reason: e.target.value }))
                  }
                />
                <Input
                  type="datetime-local"
                  className="md:col-span-2"
                  value={form.datetime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, datetime: e.target.value }))
                  }
                />

                <div className="md:col-span-2 flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      resetForm();
                      setOpenForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingId ? "Save" : "Create"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-3">
        {consultations.length === 0 && (
          <div className="p-4 rounded-md border text-sm text-muted-foreground">
            No consultations booked yet.
          </div>
        )}

        {consultations.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-md border flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-semibold">
                {c.firstName} {c.lastName}
              </div>
              <div className="text-sm text-muted-foreground">{c.reason}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(c.datetime).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(c)}
                className="p-2 rounded hover:bg-muted"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-2 rounded hover:bg-muted text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm dialog for deletions */}
      {deleteId && (
        <ConfirmDialog
          open={Boolean(deleteId)}
          title="Delete consultation"
          description="This action cannot be undone. Are you sure you want to delete this consultation?"
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirmed}
        />
      )}
    </div>
  );
}
