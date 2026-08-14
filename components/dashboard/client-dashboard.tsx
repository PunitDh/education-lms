"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  Consultation,
  ConsultationStatus,
} from "@/lib/supabase/consultations/types";
import useConsultationApi from "@/lib/api/consultationApi";
import { normalizeDateTime, formatDateTimeForPicker } from "@/lib/utils";
import ConsultationCard from "./ConsultationCard";
import CardForm from "./CardForm";
import { ConsultationForm } from "./types";
import { CurrentUser } from "@/lib/auth/types";
import { isAdmin } from "@/lib/auth/mapper";
import {
  CreateConsultationDto,
  EditConsultationDto,
} from "@/lib/supabase/consultations/contracts";

type DashboardProps = {
  consultations: Consultation[];
  user: CurrentUser;
};

export default function Dashboard({
  consultations: existing = [],
  user,
}: DashboardProps) {
  const initialFormState: Readonly<ConsultationForm> = {
    firstName: user.firstName,
    lastName: user.lastName,
    reason: "",
    datetime: "",
  };

  const [consultations, setConsultations] = useState<Consultation[]>(existing);
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ConsultationForm>(initialFormState);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const consultationApi = useConsultationApi();

  function resetForm() {
    setForm(initialFormState);
    setEditingId(null);
    setOpenForm(false);
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const { firstName, lastName, reason, datetime } = form;
    if (!firstName || !lastName || !reason || !datetime) return;

    if (editingId) {
      const editingConsultation: EditConsultationDto = {
        firstName,
        lastName,
        reason,
        consultationAt: normalizeDateTime(new Date(datetime)),
      };

      try {
        const consultation = await consultationApi.update(
          editingId,
          editingConsultation,
        );
        setConsultations((s) =>
          s.map((c) => (c.id === editingId ? { ...c, ...consultation } : c)),
        );
        toast.success("Consultation saved!");
      } catch (error) {
        toast.error("Failed to save edited consultation.");
      }
    } else {
      const newConsultation: CreateConsultationDto = {
        firstName,
        lastName,
        reason,
        consultationAt: normalizeDateTime(new Date(datetime)),
      };

      try {
        const consultation = await consultationApi.create(newConsultation);
        setConsultations((s) => [consultation, ...s]);
        toast.success("Consultation created!");
      } catch (error) {
        toast.error("Failed to create consultation.");
      }
    }

    resetForm();
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

  function handleCancel(consultation: Consultation) {
    return function () {
      setCancelId(consultation.id);
    };
  }

  function updateConsultationState(
    consultation: Consultation,
    updated: Consultation,
  ) {
    setConsultations((s) =>
      s.map((c) => (c.id === consultation.id ? { ...c, ...updated } : c)),
    );
  }

  function handleMarkCompleted(consultation: Consultation) {
    return async function () {
      try {
        const updated = await consultationApi.changeStatus(
          consultation.id,
          ConsultationStatus.COMPLETED,
        );
        if (updated) {
          updateConsultationState(consultation, updated);
          toast.success(
            `Successfully marked consultation as ${ConsultationStatus.COMPLETED}.`,
          );
        }
      } catch (error) {
        toast.error(
          `Failed to mark consultation as ${ConsultationStatus.COMPLETED}.`,
        );
      }
    };
  }

  function handleMarkScheduled(consultation: Consultation) {
    return async function () {
      try {
        const updated = await consultationApi.changeStatus(
          consultation.id,
          ConsultationStatus.SCHEDULED,
        );
        if (updated) {
          updateConsultationState(consultation, updated);
          toast.success(
            `Successfully marked consultation as ${ConsultationStatus.SCHEDULED}.`,
          );
        }
      } catch (error) {
        toast.error(
          `Failed to mark consultation as ${ConsultationStatus.SCHEDULED}.`,
        );
      }
    };
  }

  async function handleCancelConfirmed() {
    try {
      if (!cancelId) return;

      const consultation = await consultationApi.changeStatus(
        cancelId,
        ConsultationStatus.CANCELLED,
      );

      if (!consultation) return;

      setConsultations((consultations) =>
        consultations.map((c) =>
          c.id === cancelId ? { ...c, ...consultation } : c,
        ),
      );
      setCancelId(null);
      setEditingId(null);
      toast.success(
        `Successfully ${ConsultationStatus.CANCELLED} consultation.`,
      );
    } catch (error) {
      toast.error("Failed to cancel consultation.");
    }
  }

  function handleDeleteCancel() {
    setCancelId(null);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Schedule and manage consultations
        </p>
        <span
          title={
            isAdmin(user)
              ? "Admins cannot create consultations."
              : "Book new consultation"
          }
        >
          <Button
            aria-expanded={openForm}
            aria-controls="consultation-form-panel"
            onClick={() => setOpenForm((v) => !v)}
            disabled={isAdmin(user)}
          >
            {openForm ? <X size={16} /> : <PlusCircle size={16} />}
            {openForm ? "Close form" : "Book Consultation"}
          </Button>
        </span>
      </div>

      <CardForm
        open={openForm}
        editingId={editingId}
        onSubmit={handleSubmit}
        onReset={resetForm}
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
            canEdit={!isAdmin(user)}
            consultation={c}
            onEdit={handleEdit(c)}
            onCancel={handleCancel(c)}
            onMarkCompleted={handleMarkCompleted(c)}
            onMarkScheduled={handleMarkScheduled(c)}
          />
        ))}
      </div>

      {cancelId && (
        <ConfirmDialog
          open={Boolean(cancelId)}
          title="Cancel consultation"
          description="Are you sure you want to cancel this consultation? This cannot be undone."
          onCancel={handleDeleteCancel}
          onConfirm={handleCancelConfirmed}
        />
      )}
    </div>
  );
}
