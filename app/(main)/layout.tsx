import LandingTovNav from "@/components/layout/Landing/LandingTopNav/LandingTovNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className='relative max-w-screen'>

      <LandingTovNav />
      <div className='relative'>{children}</div>
    </section>
  );
}
