import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import React from "react";

// Checklist kebutuhan produksi. `items` dan `onChange` dipegang halaman detail.
export default function Checklist({ contentId, items, onChange }) {
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState("");

  const doneCount = items.filter((item) => item.is_completed).length;

  async function handleAdd(event) {
    event.preventDefault();
    setError("");
    try {
      const item = await api.addChecklist(contentId, { task_name: newTask });
      onChange([...items, item]);
      setNewTask("");
    } catch (err) {
      setError(err.errors?.task_name || err.message);
    }
  }

  // Update tanpa reload halaman: ganti hanya item yang berubah.
  async function handleToggle(id) {
    try {
      const updated = await api.toggleChecklist(id);
      onChange(items.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteChecklist(id);
      onChange(items.filter((item) => item.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">Checklist produksi</h2>
        {items.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {doneCount} dari {items.length} selesai
          </span>
        )}
      </div>

      <ul className="mt-3 divide-y border-y">
        {items.length === 0 && (
          <li className="py-3 text-sm text-muted-foreground">
            Belum ada tugas. Contoh: "B-roll direkam", "Thumbnail disetujui".
          </li>
        )}
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id={`task-${item.id}`}
              checked={item.is_completed}
              onChange={() => handleToggle(item.id)}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <label
              htmlFor={`task-${item.id}`}
              className={cn("flex-1 text-sm", item.is_completed && "text-muted-foreground line-through")}
            >
              {item.task_name}
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(item.id)}
              aria-label={`Hapus tugas ${item.task_name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="mt-3 flex gap-2">
        <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Tugas baru" />
        <Button type="submit" variant="outline">Tambah</Button>
      </form>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </section>
  );
}
