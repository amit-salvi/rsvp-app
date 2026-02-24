import ManageClient from "./ManageClient";

export default async function ManagePage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { slug } = await props.params;
  const sp = await props.searchParams;

  return <ManageClient slug={slug} keyValue={sp?.key ?? ""} />;
}