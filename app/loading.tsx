import Loading from "@/components/layout/Loading/Loading";

export default function MainLoading() {
  // Or a custom loading skeleton component
  return (
    <div className='flex flex-col h-dvh w-screen backdrop-blur-md bg-background/50 z-50 items-center justify-center'>
      <Loading />
    </div>
  );
}
