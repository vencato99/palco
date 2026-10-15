import { VenueForm } from '@/components/forms/venue-form/VenueForm';

export const metadata = { title: 'Cadastrar local' };

export default function NewVenuePage() {
  return <div className="mx-auto max-w-[1240px] px-4 py-8 md:px-6"><VenueForm /></div>;
}
