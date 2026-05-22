import Image from 'next/image';

interface AcmeLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function AcmeLogo({ size = 'md' }: AcmeLogoProps) {
  const dimensions = { sm: 80, md: 110, lg: 150 };
  const px = dimensions[size];

  return (
    <div className="flex items-center justify-center">
      <Image
        src="/logo.png"
        alt="PharmaSERV"
        width={px}
        height={px}
        className="object-contain drop-shadow-md"
        priority
      />
    </div>
  );
}
