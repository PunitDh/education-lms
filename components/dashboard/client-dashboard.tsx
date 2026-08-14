"use client";

import { useState } from "react";
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
import {
  Consultation,
  CreateConsultationDto,
  EditConsultationDto,
} from "@/lib/supabase/consultations/types";
import useConsultationApi from "@/lib/api/consultationApi";
import { formatDateTimeDisplay, formatDateTimeForPicker } from "@/lib/utils";
import ConsultationCard from "./ConsultationCard";
import CardForm from "./CardForm";
import { ConsultationForm } from "./types";

type DashboardProps = {
  consultations: Consultation[];
};

export default function Dashboard({
  consultations: _consultations = [],
}: DashboardProps) {
  const [consultations, setConsultations] =
    useState<Consultation[]>(_consultations);
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<ConsultationForm>({
    firstName: "",
    lastName: "",
    reason: "",
    datetime: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const consultationApi = useConsultationApi();

  function resetForm() {
    setForm({ firstName: "", lastName: "", reason: "", datetime: "" });
    setEditingId(null);
  }

  const handleReset = () => {
    resetForm();
    setOpenForm(false);
  };

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const { firstName, lastName, reason, datetime } = form;
    if (!firstName || !lastName || !reason || !datetime) return;

    if (editingId) {
      const editingConsultation: EditConsultationDto = {
        firstName,
        lastName,
        reason,
        consultationAt: datetime,
      };

      const consultation = await consultationApi.update(
        editingId,
        editingConsultation,
      );

      setConsultations((s) =>
        s.map((c) => (c.id === editingId ? { ...c, ...consultation } : c)),
      );
    } else {
      const newConsultation: CreateConsultationDto = {
        firstName,
        lastName,
        reason,
        consultationAt: datetime,
      };

      const consultation = await consultationApi.create(newConsultation);
      setConsultations((s) => [consultation, ...s]);
    }

    resetForm();
    setOpenForm(false);
  }

  function handleEdit(c: Consultation) {
    return function () {
      setForm({
        firstName: c.firstName ?? "",
        lastName: c.lastName ?? "",
        reason: c.reason ?? "",
        datetime: formatDateTimeForPicker(c.consultationAt ?? ""),
      });
      setEditingId(c.id);
      setOpenForm(true);
    };
  }

  function handleDelete(id: string) {
    return function () {
      setDeleteId(id);
    };
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

      <CardForm
        open={openForm}
        editingId={editingId}
        onSubmit={handleSubmit}
        onReset={handleReset}
        form={form}
        onFormChange={(e) =>
          setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
        }
      />

      <div className="grid gap-3">
        {(!consultations || consultations.length === 0) && (
          <div className="p-4 rounded-md border text-sm text-muted-foreground">
            No consultations booked yet.
          </div>
        )}

        {consultations.map((c) => (
          <ConsultationCard
            key={c.id}
            consultation={c}
            onEdit={handleEdit(c)}
            onDelete={handleDelete(c.id)}
          />
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
