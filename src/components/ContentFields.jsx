import Field from "@/components/Field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FORMATS, PLATFORMS, PRIORITIES, labelOf } from "@/lib/constants";
import React from "react";

// Kolom-kolom form konten. Dipakai di halaman "Konten baru" dan halaman detail.
// Komponen ini "controlled": nilainya dipegang oleh halaman pemanggil.
//  - editors: daftar editor untuk dropdown (kosongkan agar dropdown tidak tampil)
//  - readOnly: semua kolom dikunci (dipakai untuk editor)
export default function ContentFields({ values, onChange, errors, channels, editors, readOnly, showPublishedUrl }) {
  const set = (name) => (event) => onChange(name, event.target.value);

  return (
    // <fieldset disabled> mengunci semua input di dalamnya sekaligus
    <fieldset disabled={readOnly} className="min-w-0 space-y-5">
      <Field label="Judul" error={errors.title}>
        <Input value={values.title} onChange={set("title")} placeholder="Contoh: 5 kesalahan pemula saat editing" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Channel tujuan" error={errors.channel_id}>
          <Select value={values.channel_id} onChange={set("channel_id")}>
            <option value="">Pilih channel</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {labelOf(PLATFORMS, channel.platform)} {channel.handle_name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Format" error={errors.format_type}>
          <Select value={values.format_type} onChange={set("format_type")}>
            <option value="">Pilih format</option>
            {FORMATS.map((format) => (
              <option key={format.value} value={format.value}>{format.label}</option>
            ))}
          </Select>
        </Field>

        <Field label="Prioritas" error={errors.priority}>
          <Select value={values.priority} onChange={set("priority")}>
            {PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </Select>
        </Field>

        <Field label="Target tanggal tayang" error={errors.scheduled_date}>
          <Input type="date" value={values.scheduled_date} onChange={set("scheduled_date")} />
        </Field>

        {editors && (
          <Field
            label="Editor"
            error={errors.editor_id}
            hint="Kosongkan jika kamu mengedit sendiri."
          >
            <Select value={values.editor_id} onChange={set("editor_id")}>
              <option value="">Tanpa editor</option>
              {editors.map((editor) => (
                <option key={editor.id} value={editor.id}>{editor.name}</option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <Field label="Konsep singkat" error={errors.description}>
        <Textarea value={values.description} onChange={set("description")} rows={3} />
      </Field>

      <Field label="Naskah" error={errors.script_draft} hint={readOnly ? undefined : "Hook, alur cerita, atau naskah lengkap."}>
        <Textarea value={values.script_draft} onChange={set("script_draft")} rows={8} />
      </Field>

      {showPublishedUrl && (
        <Field
          label="Link postingan"
          error={errors.published_url}
          hint="Wajib diisi sebelum konten ditandai Tayang."
        >
          <Input
            type="url"
            value={values.published_url}
            onChange={set("published_url")}
            placeholder="https://"
          />
        </Field>
      )}
    </fieldset>
  );
}
