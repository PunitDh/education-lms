export type HttpContext = {
  params: Promise<{
    id: string;
  }>;
};
