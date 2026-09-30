import { waLink, generalInquiryMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from './icons';

export default function FloatingWhatsApp() {
  return (
    <a
      href={waLink(generalInquiryMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="fixed right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-sage-deep text-cream shadow-lg shadow-ink/25 transition-transform duration-300 ease-soft hover:scale-105 active:scale-95 lg:hidden"
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <WhatsAppIcon size={24} />
    </a>
  );
}
