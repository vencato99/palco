import { Icon } from '@/components/ui/Icon';

type Contacts = { contactName: string | null; contactEmail: string | null; contactPhone: string | null; whatsapp: string | null; website: string | null; instagram: string | null };

const digits = (s: string) => s.replace(/\D/g, '');

export function ContactCard({ c }: { c: Contacts }) {
  const any = Object.values(c).some(Boolean);
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line p-6">
      <h3 className="font-display text-xl font-bold">Contatos</h3>
      {!any ? <p className="text-mute">A casa ainda não publicou contatos. Use a consulta de disponibilidade.</p> : null}
      {c.contactName ? <div><p className="text-sm text-mute">Programação / pauta</p><p className="font-bold">{c.contactName}</p></div> : null}
      <ul className="flex flex-col gap-2 text-[15px]">
        {c.contactEmail ? <li><a className="flex items-center gap-2 underline-offset-4 hover:underline" href={`mailto:${c.contactEmail}`}><Icon name="mail" size={18} />{c.contactEmail}</a></li> : null}
        {c.contactPhone ? <li><a className="flex items-center gap-2 hover:underline" href={`tel:${digits(c.contactPhone)}`}><Icon name="phone" size={18} />{c.contactPhone}</a></li> : null}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        {c.whatsapp ? <a className="flex h-11 items-center justify-center rounded-xl border border-paper text-sm font-semibold" href={`https://wa.me/55${digits(c.whatsapp)}`} target="_blank" rel="noopener">WhatsApp</a> : null}
        {c.website ? <a className="flex h-11 items-center justify-center rounded-xl border border-paper text-sm font-semibold" href={c.website} target="_blank" rel="noopener">Site</a> : null}
        {c.instagram ? <a className="flex h-11 items-center justify-center rounded-xl border border-paper text-sm font-semibold" href={`https://instagram.com/${c.instagram.replace('@', '')}`} target="_blank" rel="noopener">Instagram</a> : null}
      </div>
    </div>
  );
}
