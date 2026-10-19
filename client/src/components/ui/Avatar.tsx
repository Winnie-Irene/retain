import { initials } from "../../utils/format";

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, src, size = 38, className }: AvatarProps) {
  return (
    <span
      className={`avatar ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" className="avatar__img" /> : initials(name)}
    </span>
  );
}