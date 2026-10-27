import React from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";

// Tombol "Hapus konten" + jendela konfirmasi.
// Penghapusan sungguhan dikerjakan `onConfirm` dari halaman pemanggil.
export default function DeleteContentDialog({ content, onConfirm }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Hapus konten
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus "{content?.title || "Konten Ini"}"?</AlertDialogTitle>
          <AlertDialogDescription>
            {content?.checklists?.length || 0} checklist, {content?.metrics?.length || 0}{" "}
            catatan metrik, dan riwayat review ikut terhapus. Tindakan ini tidak
            bisa dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={buttonVariants({ variant: "destructive" })}
          >
            Ya, hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}