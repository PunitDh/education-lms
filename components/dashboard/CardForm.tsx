import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { X } from "lucide-react";
import { ConsultationForm } from "./types";
import { ChangeEventHandler, Dispatch, SetStateAction } from "react";

type Props = {
  open: boolean;
  editingId: string | null;
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
  onReset: () => void;
  form: ConsultationForm;
  onFormChange: ChangeEventHandler<HTMLInputElement, HTMLInputElement>;
};

const CardForm = ({
  open,
  editingId,
  onSubmit,
  onReset,
  form,
  onFormChange,
}: Props) => (
  <div
    id="consultation-form-panel"
    className={`grid transition-all duration-300 ease-out ${
      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
    }`}
  >
    <div className="overflow-hidden">
      <Card className="w-full md:w-2/3">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <CardTitle>{editingId ? "Edit" : "New"} Consultation</CardTitle>
            <div>
              <Button variant="ghost" onClick={onReset}>
                <X size={16} />
              </Button>
            </div>
          </div>
          <CardDescription />
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <Input
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={onFormChange}
            />
            <Input
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={onFormChange}
            />
            <Input
              name="reason"
              placeholder="Reason"
              className="md:col-span-2"
              value={form.reason}
              onChange={onFormChange}
            />
            <Input
              name="datetime"
              type="datetime-local"
              className="md:col-span-2"
              step={1800}
              value={form.datetime}
              onChange={onFormChange}
            />

            <div className="md:col-span-2 flex gap-2 justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={onReset}
                title={`Cancel ${editingId ? "editing" : "creating"} consultation`}
              >
                Cancel
              </Button>
              <Button type="submit" title="Submit consultation">
                {editingId ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default CardForm;
