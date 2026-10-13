import type { Notice } from "../types";

export function NoticeBanner({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return <div className={`notice notice-${notice.kind}`}>{notice.text}</div>;
}
