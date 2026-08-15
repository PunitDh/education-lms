import toast from "react-hot-toast";

export function createErrorToast(error: unknown, message: string) {
  if (error instanceof Error) toast.error(`${message}: ${error.message}`);
  else toast.error(`${message}.`);
}
