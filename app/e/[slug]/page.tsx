import EventClient from "./EventClient";

export default async function EventPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ manageKey?: string }>;
}) {
  const { slug } = await props.params;
  const sp = await props.searchParams;

  const manageKey = sp?.manageKey ?? "";

  return <EventClient slug={slug} manageKey={manageKey} />;
}