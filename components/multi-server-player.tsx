"use client";

import { useState } from "react";

export type PlaybackSource = { id: string; name: string; url: string; sortOrder?: number };

export function MultiServerPlayer({ sources, title, lang = "en" }: { sources: PlaybackSource[]; title: string; lang?: "en" | "ar" }) {
  const [selectedId, setSelectedId] = useState(sources[0]?.id ?? "");
  if (!sources.length) return null;
  const selected = sources.find(source => source.id === selectedId) ?? sources[0];
  return <div className="multi-server-player">
    {sources.length > 1 ? <div className="server-picker" role="group" aria-label={lang === "ar" ? "اختر سيرفر المشاهدة" : "Choose a streaming server"}>
      <span>{lang === "ar" ? "سيرفرات المشاهدة" : "Servers"}</span>
      {sources.map((source, index) => <button
        type="button"
        key={source.id}
        className={source.id === selected.id ? "server-choice is-selected" : "server-choice"}
        aria-pressed={source.id === selected.id}
        onClick={() => setSelectedId(source.id)}
      >{source.name || (lang === "ar" ? `السيرفر ${index + 1}` : `Server ${index + 1}`)}</button>)}
    </div> : null}
    <div className="embed-frame">
      <iframe
        key={selected.id}
        src={selected.url}
        title={title + " — " + selected.name}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-presentation"
        allow="fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
    {sources.length > 1 ? <p className="server-current">{lang === "ar" ? "السيرفر الحالي: " : "Current server: "}{selected.name}</p> : null}
  </div>;
}
