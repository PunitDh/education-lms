import { Consultation } from "@/lib/supabase/consultations/types";
import { formatDateTimeDisplay } from "@/lib/utils";
import { Edit2, Trash2 } from "lucide-react";

type Props = {
  consultation: Consultation;
  onEdit: (consultation: Consultation) => void;
  onDelete: (consultation: string) => void;
};

const ConsultationCard = ({ consultation, onEdit, onDelete }: Props) => (
  <div className="p-4 rounded-md border flex items-center justify-between gap-4">
    <div>
      <div className="font-semibold">
        {consultation.firstName} {consultation.lastName}
      </div>
      <div className="text-sm text-muted-foreground">{consultation.reason}</div>
      <div className="text-xs text-muted-foreground mt-1">
        {formatDateTimeDisplay(consultation.consultationAt)}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onEdit(consultation)}
        className="p-2 rounded hover:bg-muted"
        title="Edit consultation"
      >
        <Edit2 size={16} />
      </button>
      <button
        onClick={() => onDelete(consultation.id)}
        className="p-2 rounded hover:bg-muted text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

export default ConsultationCard;
