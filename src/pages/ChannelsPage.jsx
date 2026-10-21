import { useEffect, useState } from "react";
import { toast } from "sonner";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { api } from "@/lib/api";
import { PLATFORMS, labelOf } from "@/lib/constants";
import React from "react";

const EMPTY_FORM = { platform: "", handle_name: "" };

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getChannels().then(setChannels).catch((error) => toast.error(error.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const channel = await api.createChannel(form);
      setChannels([...channels, channel]);
      setForm(EMPTY_FORM);
      toast.success("Channel ditambahkan");
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Channel</h1>
      <p className="mt-1 text-muted-foreground">
        Akun media sosial yang kamu kelola. Setiap konten dikaitkan ke satu channel.
      </p>

      <ul className="mt-6 divide-y border-y">
        {channels.length === 0 && (
          <li className="py-4 text-sm text-muted-foreground">
            Belum ada channel. Tambahkan satu di bawah supaya bisa membuat konten.
          </li>
        )}
        {channels.map((channel) => (
          <li key={channel.id} className="flex items-baseline justify-between py-3">
            <span className="font-medium">{channel.handle_name}</span>
            <span className="text-sm text-muted-foreground">{labelOf(PLATFORMS, channel.platform)}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-[10rem_1fr_auto] sm:items-start">
        <Field label="Platform" error={errors.platform}>
          <Select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
            <option value="">Pilih platform</option>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Nama akun" error={errors.handle_name}>
          <Input
            placeholder="@namakamu"
            value={form.handle_name}
            onChange={(e) => setForm({ ...form, handle_name: e.target.value })}
          />
        </Field>
        <Button type="submit" disabled={saving} className="sm:mt-[1.625rem]">
          Tambah channel
        </Button>
      </form>
    </div>
  );
}
