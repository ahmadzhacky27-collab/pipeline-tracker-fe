import { useState } from "react";
import { toast } from "sonner";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatDate, formatNumber, todayString } from "@/lib/utils";
import React from "react";

const COUNT_FIELDS = [
  { name: "views_count", label: "Views" },
  { name: "likes_count", label: "Likes" },
  { name: "comments_count", label: "Komentar" },
  { name: "shares_count", label: "Share" },
];

const emptyForm = () => ({
  recorded_at: todayString(),
  views_count: "",
  likes_count: "",
  comments_count: "",
  shares_count: "",
});

// Riwayat performa konten. Hanya bisa diisi setelah konten berstatus Tayang.
export default function MetricsPanel({ contentId, isPublished, metrics, onChange }) {
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  if (!isPublished) {
    return (
      <section>
        <h2 className="font-semibold">Metrik performa</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Metrik bisa dicatat setelah konten ditandai Tayang.
        </p>
      </section>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const metric = await api.addMetric(contentId, form);
      // Urutkan dari tanggal terbaru
      onChange([metric, ...metrics].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at)));
      setForm(emptyForm());
      toast.success("Metrik dicatat");
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="font-semibold">Metrik performa</h2>

      <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Field label="Tanggal" error={errors.recorded_at}>
          <Input
            type="date"
            value={form.recorded_at}
            onChange={(e) => setForm({ ...form, recorded_at: e.target.value })}
          />
        </Field>
        {COUNT_FIELDS.map((field) => (
          <Field key={field.name} label={field.label} error={errors[field.name]}>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={form[field.name]}
              onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            />
          </Field>
        ))}
        <div className="col-span-2 sm:col-span-5">
          <Button type="submit" variant="outline" disabled={saving}>Catat metrik</Button>
        </div>
      </form>

      <div className="mt-4 overflow-x-auto rounded border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Tanggal</th>
              {COUNT_FIELDS.map((field) => (
                <th key={field.name} className="px-3 py-2 text-right font-medium">{field.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.id} className="border-b last:border-b-0">
                <td className="px-3 py-2">{formatDate(metric.recorded_at)}</td>
                {COUNT_FIELDS.map((field) => (
                  <td key={field.name} className="px-3 py-2 text-right tabular-nums">
                    {formatNumber(metric[field.name])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {metrics.length === 0 && (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            Belum ada catatan. Isi angka dari dashboard platform secara berkala.
          </p>
        )}
      </div>
    </section>
  );
}
