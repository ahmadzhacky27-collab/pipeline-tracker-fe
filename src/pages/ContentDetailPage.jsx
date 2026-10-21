import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Checklist from "@/components/Checklist";
import ContentFields from "@/components/ContentFields";
import MetricsPanel from "@/components/MetricsPanel";
import ReviewPanel from "@/components/ReviewPanel";
import StageBar from "@/components/StageBar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { STAGES, canTransition, labelOf } from "@/lib/constants";
import React from "react";
import DeleteContentDialog from "@/components/DeleteContentDialog";

// Tahap berikutnya yang dipindah dengan tombol biasa.
// Tahap review/revisi/ACC tidak ada di sini: itu dikerjakan lewat ReviewPanel.
const NEXT_STAGE = { idea: "scripting", scripting: "recording", recording: "editing", ready: "published" };

// Data dari API -> nilai form (null diganti string kosong agar input tidak error).
// Status sengaja tidak ikut: status hanya berubah lewat tombol tahap dan panel review.
function toFormValues(content) {
  return {
    title: content.title,
    channel_id: String(content.channel_id),
    editor_id: content.editor_id ? String(content.editor_id) : "",
    format_type: content.format_type,
    priority: content.priority,
    scheduled_date: content.scheduled_date ?? "",
    description: content.description ?? "",
    script_draft: content.script_draft ?? "",
    published_url: content.published_url ?? "",
  };
}

export default function ContentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditor = user.role === "editor"; // editor hanya boleh melihat, review, dan checklist

  const [content, setContent] = useState(null); // data tersimpan + checklists + metrics + reviews
  const [values, setValues] = useState(null); // isi form yang sedang diedit
  const [channels, setChannels] = useState([]);
  const [editors, setEditors] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Editor tidak punya akses ke daftar channel/editor, jadi tidak diminta.
    Promise.all([
      api.getContent(id),
      isEditor ? [] : api.getChannels(),
      isEditor ? [] : api.getUsers("editor"),
    ])
      .then(([contentData, channelData, editorData]) => {
        setContent(contentData);
        setValues(toFormValues(contentData));
        setChannels(isEditor ? [contentData.channel] : channelData);
        setEditors(editorData);
      })
      .catch((error) => {
        toast.error(error.message);
        navigate("/contents");
      });
  }, [id, isEditor, navigate]);

  if (!content) return <p className="text-muted-foreground">Memuat konten...</p>;

  const changeValue = (name, value) => setValues({ ...values, [name]: value });

  // Gabungkan data terbaru dari server ke state halaman.
  const applyUpdate = (updated) => setContent((previous) => ({ ...previous, ...updated }));

  // Simpan isi form. `extra` dipakai untuk pindah tahap sekaligus menyimpan form.
  async function save(extra = {}, successMessage = "Perubahan disimpan") {
    setSaving(true);
    setErrors({});
    try {
      const updated = await api.updateContent(id, {
        ...values,
        channel_id: Number(values.channel_id),
        editor_id: Number(values.editor_id) || null,
        scheduled_date: values.scheduled_date || null,
        published_url: values.published_url || null,
        ...extra,
      });
      applyUpdate(updated);
      setValues(toFormValues(updated));
      toast.success(successMessage);
    } catch (error) {
      // Validasi dari server (misal: link wajib diisi saat Tayang) tampil di bawah kolomnya.
      setErrors(error.errors || {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    save();
  }

async function handleDelete() {
  try {
    await api.deleteContent(id);
    toast.success("Konten dihapus");
    navigate("/contents");
  } catch (error) {
    toast.error(error.message);
  }
}

  const nextStage = NEXT_STAGE[content.status];
  const canAdvance = nextStage && canTransition(user, content, nextStage);
  // Kolom link postingan muncul saat konten siap tayang, supaya bisa diisi sebelum menekan "Lanjut ke Tayang".
  const showPublishedUrl = ["ready", "published"].includes(content.status) || Boolean(errors.published_url);

  return (
    <div>
      <Link to="/contents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Semua konten
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mt-3">
        <h1 className="text-2xl font-semibold">{content.title}</h1>
        {!isEditor && <DeleteContentDialog content={content} onConfirm={handleDelete} />}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-5">
        <StageBar status={content.status} />
        {canAdvance && (
          <Button
            size="sm"
            disabled={saving}
            onClick={() => save({ status: nextStage }, `Tahap diubah ke ${labelOf(STAGES, nextStage)}`)}
          >
            Lanjut ke {labelOf(STAGES, nextStage)}
          </Button>
        )}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-10">
          <form onSubmit={handleSubmit}>
            <ContentFields
              values={values}
              onChange={changeValue}
              errors={errors}
              channels={channels}
              editors={isEditor ? undefined : editors}
              readOnly={isEditor}
              showPublishedUrl={showPublishedUrl}
            />
            {!isEditor && (
              <Button type="submit" className="mt-6" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan perubahan"}
              </Button>
            )}
          </form>

          {!isEditor && (
            <MetricsPanel
              contentId={content.id}
              isPublished={content.status === "published"}
              metrics={content.metrics}
              onChange={(metrics) => applyUpdate({ metrics })}
            />
          )}
        </div>

        <aside className="space-y-10">
          {/* key: panel dibuat ulang saat tahap berubah supaya isian lama tidak terbawa */}
          <ReviewPanel key={content.status} content={content} onUpdated={applyUpdate} />
          <Checklist
            contentId={content.id}
            items={content.checklists}
            onChange={(checklists) => applyUpdate({ checklists })}
          />
        </aside>
      </div>
    </div>
  );
}
