import {
  Consultation,
  ConsultationStatus,
} from "@/lib/supabase/consultations/types";
import { formatDateTimeDisplay } from "@/lib/utils";
import { Edit2, X, CheckCircle2, Clock } from "lucide-react";
import { Button } from "../ui/button";

type Props = {
  canEdit: boolean;
  consultation: Consultation;
  onEdit: (consultation: Consultation) => void;
  onCancel: (consultationId: string) => void;
  onMarkCompleted: (consultation: Consultation) => void;
  onMarkScheduled: (consultation: Consultation) => void;
};

const statusStyleMap: Readonly<Record<ConsultationStatus, string>> = {
  [ConsultationStatus.SCHEDULED]:
    "bg-blue-100 text-blue-800 border border-blue-300",
  [ConsultationStatus.COMPLETED]:
    "bg-green-100 text-green-800 border border-green-300",
  [ConsultationStatus.CANCELLED]:
    "bg-red-100 text-red-800 border border-red-300",
};

const ConsultationCard = ({
  canEdit,
  consultation,
  onEdit,
  onCancel,
  onMarkCompleted,
  onMarkScheduled,
}: Props) => {
  const statusStyle =
    statusStyleMap[consultation.status] ??
    "bg-gray-100 text-gray-800 border border-gray-300";

  const showEdit =
    canEdit && consultation.status !== ConsultationStatus.COMPLETED;
  const showComplete = consultation.status === ConsultationStatus.SCHEDULED;
  const showSchedule =
    consultation.status !== ConsultationStatus.SCHEDULED &&
    consultation.status !== ConsultationStatus.CANCELLED;

  return (
    <div className="p-4 rounded-md border flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-semibold">
            {consultation.firstName} {consultation.lastName}
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyle}`}
          >
            {consultation.status}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {consultation.reason}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {formatDateTimeDisplay(consultation.consultationAt)}
        </div>
      </div>
      {canEdit ? (
        <div className="flex items-center gap-2">
          {showEdit && (
            <span
              title={
                consultation.status === ConsultationStatus.CANCELLED
                  ? "A cancelled consultation cannot be edited."
                  : "Edit consultation"
              }
            >
              <Button
                onClick={() => onEdit(consultation)}
                variant="outline"
                size="sm"
                disabled={consultation.status === ConsultationStatus.CANCELLED}
              >
                <Edit2 size={16} /> Edit
              </Button>
            </span>
          )}

          {showComplete && (
            <>
              <Button
                onClick={() => onMarkCompleted(consultation)}
                variant="outline"
                size="sm"
                title="Mark as completed"
              >
                <CheckCircle2 size={16} /> Mark Complete
              </Button>
              <Button
                onClick={() => onCancel(consultation.id)}
                variant="outline"
                size="sm"
                className="text-amber-600"
                title="Cancel consultation"
              >
                <X size={16} /> Cancel
              </Button>
            </>
          )}

          {showSchedule && (
            <Button
              onClick={() => onMarkScheduled(consultation)}
              variant="outline"
              size="sm"
              title="Mark as scheduled"
            >
              <Clock size={16} /> Mark Incomplete
            </Button>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500 flex flex-col items-end">
          <span>
            Created by: {consultation.firstName} {consultation.lastName}
          </span>
          <span>{formatDateTimeDisplay(consultation.createdAt)}</span>
        </div>
      )}
    </div>
  );
};

export default ConsultationCard;
