import { TextPage } from "@/components/site/TextPage";
import { findDoc } from "@/content/docs";

export const metadata = { title: "Security" };

export default function SecurityPage() {
  return <TextPage title="Security" body={findDoc("security")!.body} />;
}
