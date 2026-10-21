import { useState } from "react";
import { toast } from "sonner";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { canTransition } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import React from "react";

const ACTION_LABELS = {
  submitted: "Dikirim untuk review",
  approved: "Disetujui",
  revision_requested: "Revisi diminta",
};

// Panel alur review. Isinya berubah sesuai tahap konten dan peran pengguna:
//  - editor (tahap Editing/Revisi): kirim link hasil editing
//  - kreator (tahap Review): setujui atau minta revisi
export default function ReviewPanel({ content, onUpdated }) {
  const { user } = useAuth();
  const [reviewUrl, setReviewUrl] = useState(content.review_url ?? "");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const canSubmit = canTransition(user, content, "in_review");
  const canDecide = canTransition(user, content, "ready"); // hanya true saat tahap Review
  const history = content.reviews ?? [];

  // Pesan untuk pengguna yang sedang tidak punya aksi
  let waitingText = null;
  if (content.status === "in_review") waitingText = "Menunggu keputusan kreator.";
  else if (["editing", "revision"].includes(content.status) && content.editor_name) {
    waitingText = `Sedang dikerjakan ${content.editor_name}.`;
  }

  if (!canSubmit && !canDecide && !waitingText && history.length === 0) return null;

  async function run(action, successMessage) {
    setBusy(true);
    setErrors({});
    try {
      onUpdated(await action());
      setNote("");
      toast.success(successMessage);
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-semibold">Review</h2>

      {canSubmit && (
        <div className="space-y-3">
          {content.status === "revision" && content.review_note && (
            <p className="p-3 text-sm border-l-4 border-warning bg-card">
              <strong>Catatan revisi:</strong> {content.review_note}
            </p>
          )}
          <Field label="Link hasil editing" error={errors.review_url}>
            <Input value={reviewUrl} onChange={(e) => setReviewUrl(e.target.value)} placeholder="https://" />
          </Field>
          <Button
            disabled={busy}
            onClick={() => run(() => api.submitReview(content.id, { review_url: reviewUrl }), "Dikirim untuk review")}
          >
            Kirim untuk review
          </Button>
        </div>
      )}

      {canDecide && (
        <div className="space-y-3">
          <a href={content.review_url} target="_blank" rel="noreferrer" className="text-sm font-medium underline text-primary">
            Buka hasil editing
          </a>
          <Field label="Catatan revisi" error={errors.note} hint="Wajib diisi jika meminta revisi.">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </Field>
          <div className="flex gap-2">
            <Button disabled={busy} onClick={() => run(() => api.approveReview(content.id), "Disetujui, siap tayang")}>
              Setujui (ACC)
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => run(() => api.requestRevision(content.id, { note }), "Dikembalikan ke editor")}
            >
              Minta revisi
            </Button>
          </div>
        </div>
      )}

      {!canSubmit && !canDecide && waitingText && (
        <p className="text-sm text-muted-foreground">
          {waitingText}{" "}
          {content.status === "in_review" && content.review_url && (
            <a href={content.review_url} target="_blank" rel="noreferrer" className="font-medium underline text-primary">
              Buka hasil editing
            </a>
          )}
        </p>
      )}

      {history.length > 0 && (
        <ul className="text-sm divide-y border-y">
          {history.map((item) => (
            <li key={item.id} className="py-2">
              <div className="flex justify-between gap-2">
                <span className="font-medium">{ACTION_LABELS[item.action]}</span>
                <span className="text-muted-foreground">{formatDate(item.created_at.slice(0, 10))}</span>
              </div>
              <div className="text-muted-foreground">{item.user_name}</div>
              {item.note && <p className="mt-1">{item.note}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
