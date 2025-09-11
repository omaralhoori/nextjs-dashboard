import Image from 'next/image';

export default function AcmeLogo() {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '10px'}}>
      <Image src="/pharamlogo.png" alt="PharmaSERV" width={100} height={100} className="w-full h-full" />
    </div>
  );
}
