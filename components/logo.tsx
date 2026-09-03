import Image from "next/image";
import Link from "next/link";
import { LOGO } from "@/config/constants";

export function Logo({
  href = "/",
  size = 36,
  showText = true,
}: {
  href?: string;
  size?: number;
  showText?: boolean;
}) {
  const img = (
    <Image
      src={LOGO}
      alt="NovaSuite logo"
      width={size}
      height={size}
      className="h-9 w-9 object-contain"
      style={{ width: size, height: size }}
    />
  );

  if (!showText) {
    return <Link href={href}>{img}</Link>;
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-bold text-xl"
    >
      {img}
      NovaSuite
    </Link>
  );
}
