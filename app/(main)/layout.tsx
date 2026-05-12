import TopNav from "@/components/layout/TopNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      {/* pt-24 để đẩy nội dung xuống dưới TopNav cố định */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">{children}</main>
    </>
  );
}
