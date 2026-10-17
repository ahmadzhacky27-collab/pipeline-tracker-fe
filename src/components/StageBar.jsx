import { STAGES, labelOf } from "@/lib/constants";
import React from "react";

// "Revisi" tidak punya kotak sendiri: progresnya sama dengan tahap Editing.
const BAR_STAGES = STAGES.filter((stage) => stage.value !== "revision");

export default function StageBar({ status }) {
  const progressStatus = status === "revision" ? "editing" : status;
  const currentIndex = BAR_STAGES.findIndex((stage) => stage.value === progressStatus);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5" aria-hidden="true">
        {BAR_STAGES.map((stage, index) => (
          <span
            key={stage.value}
            className="h-2 w-4 rounded-[2px]"
            style={{ backgroundColor: index <= currentIndex ? stage.color : "hsl(var(--border))" }}
          />
        ))}
      </div>
      <span className={status === "revision" ? "text-sm font-medium text-warning" : "text-sm"}>
        {labelOf(STAGES, status)}
      </span>
    </div>
  );
}
