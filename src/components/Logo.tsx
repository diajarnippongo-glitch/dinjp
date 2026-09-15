interface LogoProps {
  size?: number;
  className?: string;
}

const LOGO_URL = 'https://hpcxauyodqmmitzzltme.supabase.co/storage/v1/object/public/Foto/DiN%20Japan%20Language%20Course-02%20(1).jpg';

export default function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <img
      src={LOGO_URL}
      alt="DiN Japanese"
      style={{ maxHeight: size }}
      className={`max-h-12 w-auto object-contain rounded-lg ${className}`}
    />
  );
}
