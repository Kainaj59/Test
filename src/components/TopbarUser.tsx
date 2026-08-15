"use client";

import { useEffect, useState } from "react";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "N"
  );
}

export function TopbarUser() {
  const [user, setUser] = useState({
    fullName: "Matt Janiak",
    company: "Studio Nexora",
  });

  useEffect(() => {
    let alive = true;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        if (alive && s?.fullName) {
          setUser({ fullName: s.fullName, company: s.company });
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="brand-gradient grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-white">
        {initials(user.fullName)}
      </div>
      <div className="hidden leading-tight sm:block">
        <p className="text-sm font-medium">{user.fullName}</p>
        <p className="text-xs text-muted">{user.company}</p>
      </div>
    </div>
  );
}
