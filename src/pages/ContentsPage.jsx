import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import StageBar from "@/components/StageBar";
import { buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { FORMATS, PLATFORMS, STAGES, labelOf } from "@/lib/constants";
import { cn, formatDate, todayString } from "@/lib/utils";
import React from "react";

export default function ContentsPage() {
  const { user } = useAuth();
  const isEditor = user.role === "editor"; // editor hanya melihat konten yang ditugaskan
  const [contents, setContents] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter. Channel dikirim ke API; tahap & format disaring di browser
  // supaya jumlah per tahap di tab tetap terlihat saat filter dipakai.
  const [channelId, setChannelId] = useState("");
  const [format, setFormat] = useState("");
  const [stage, setStage] = useState("");

  useEffect(() => {
    if (isEditor) return; // editor tidak punya daftar channel
    api.getChannels().then(setChannels).catch((error) => toast.error(error.message));
  }, [isEditor]);

  useEffect(() => {
    setLoading(true);
    api
      .getContents({ channel_id: channelId })
      .then(setContents)
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [channelId]);

  const contentsInFormat = useMemo(
    () => contents.filter((content) => !format || content.format_type === format),
    [contents, format]
  );

  const visibleContents = contentsInFormat.filter((content) => !stage || content.status === stage);

  const countByStage = (value) => contentsInFormat.filter((c) => c.status === value).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Konten</h1>
        {!isEditor && (
          <Link to="/contents/new" className={buttonVariants()}>
            <Plus className="h-4 w-4" />
            Konten baru
          </Link>
        )}
      </div>

      {/* Tab tahap: klik untuk menyaring daftar */}
      <div className="mt-6 flex overflow-x-auto border-b">
        <StageTab active={stage === ""} onClick={() => setStage("")} label="Semua" count={contentsInFormat.length} />
        {STAGES.map((item) => (
          <StageTab
            key={item.value}
            active={stage === item.value}
            onClick={() => setStage(item.value)}
            label={item.label}
            count={countByStage(item.value)}
            color={item.color}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {!isEditor && (
        <Select className="w-52" value={channelId} onChange={(e) => setChannelId(e.target.value)} aria-label="Filter channel">
          <option value="">Semua channel</option>
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {labelOf(PLATFORMS, channel.platform)} {channel.handle_name}
            </option>
          ))}
        </Select>
        )}
        <Select className="w-48" value={format} onChange={(e) => setFormat(e.target.value)} aria-label="Filter format">
          <option value="">Semua format</option>
          {FORMATS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
      </div>

      <div className="mt-4 overflow-x-auto rounded border bg-card">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Judul</th>
              <th className="px-4 py-2 font-medium">Format</th>
              <th className="px-4 py-2 font-medium">Tahap</th>
              <th className="px-4 py-2 font-medium">Target tayang</th>
            </tr>
          </thead>
          <tbody>
            {visibleContents.map((content) => (
              <ContentRow key={content.id} content={content} />
            ))}
          </tbody>
        </table>

        {!loading && visibleContents.length === 0 && <EmptyState hasAnyContent={contents.length > 0} isEditor={isEditor} />}
        {loading && <p className="px-4 py-6 text-sm text-muted-foreground">Memuat konten...</p>}
      </div>
    </div>
  );
}

function StageTab({ label, count, active, onClick, color = "hsl(var(--foreground))" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px whitespace-nowrap border-b-[3px] px-4 py-2 text-sm hover:bg-muted",
        active ? "font-semibold" : "border-transparent text-muted-foreground"
      )}
      style={active ? { borderBottomColor: color } : undefined}
    >
      {label} <span className="tabular-nums text-muted-foreground">{count}</span>
    </button>
  );
}

function ContentRow({ content }) {
  const isLate =
    content.scheduled_date && content.scheduled_date < todayString() && content.status !== "published";

  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/50">
      <td className="px-4 py-3">
        <Link to={`/contents/${content.id}`} className="font-medium hover:underline">
          {content.title}
        </Link>
        <div className="text-muted-foreground">
          {labelOf(PLATFORMS, content.channel?.platform)} {content.channel?.handle_name}
        </div>
        {content.editor_name && (
          <div className="text-muted-foreground">Editor: {content.editor_name}</div>
        )}
      </td>
      <td className="px-4 py-3">{labelOf(FORMATS, content.format_type)}</td>
      <td className="px-4 py-3">
        <StageBar status={content.status} />
      </td>
      <td className={cn("px-4 py-3", isLate && "font-medium text-warning")}>
        {formatDate(content.scheduled_date)}
        {isLate && <span className="block text-xs">Lewat jadwal</span>}
      </td>
    </tr>
  );
}

function EmptyState({ hasAnyContent, isEditor }) {
  return (
    <div className="px-4 py-10">
      <p className="font-medium">
        {hasAnyContent ? "Tidak ada konten dengan filter ini." : "Belum ada konten."}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasAnyContent
          ? "Ganti tahap, channel, atau format di atas."
          : isEditor
          ? "Konten muncul di sini setelah kreator menugaskanmu sebagai editor."
          : "Catat ide pertamamu, nanti digeser tahap demi tahap sampai tayang."}
      </p>
    </div>
  );
}
