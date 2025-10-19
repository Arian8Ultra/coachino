import Logo from "@/assets/Coachino.svg";
import { Instagram, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GlassBall from "../../GlassBall";
import background from "@/assets/blurry-gradient-haikei (2).svg";

const Footer = () => {
  return (
    <div className='w-full bg-stone-100 dark:bg-white/10 rounded-tl-4xl md:rounded-tl-full p-10 grid grid-cols-10 relative'>
      <Image
        src={background}
        alt='Background'
        layout='fill'
        objectFit='cover'
        className='-z-10 opacity-10 md:rounded-tl-full'
      />
      <GlassBall className='w-fit bg-primary !p-3 absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2'>
        <Image
          src={Logo}
          alt='footer-logo'
          width={100}
          height={100}
          quality={100}
          className='w-10 h-10 invert'
        />
      </GlassBall>

      <div className=''></div>
      <div className='md:col-span-8 col-span-full flex flex-col gap-5 items-center pt-5'>
        <div className='flex gap-10'>
          {/* <div className='p-5 border flex gap-3 rounded-md items-center'>
            <Link href={"#"}>
              <Twitter />
            </Link>
            <Link href={"#"}>
              <Youtube />
            </Link>
            <Link href={"https://instagram.com/coachino.me/"} target="_blank">
              <Instagram />
            </Link>
          </div> */}
          <div className='flex flex-col gap-2 text-center'>
            <h3 className='text-2xl font-bold'>کوچینو</h3>
            <h4>کوچ در هر لحظه</h4>
          </div>
        </div>
        <p className='text-muted-foreground'>
          هر وقت خواستی حرف بزن، مسیرت رو مرور کن یا فقط یه مشورت بخوای <br />{" "}
          یه همراه داری که می‌فهمت، کمک می‌کنه تصمیم‌هات رو قشنگ‌تر ببینی.
        </p>

        <div className='grid md:grid-cols-3 gap-3'>
          {/* a email button for info@coachino.me */}
          <Link
            className='p-5 border flex gap-3 rounded-md items-center justify-between hover:bg-gradient-to-tl from-primary to-accent transition-all duration-300 hover:border-transparent '
            href={"https://instagram.com/coachino.me/"}
            target='_blank'
          >
            <p>اینستاگرام ما را دنبال کنید</p>
            <Instagram />
          </Link>
          {/* a tel button */}
          <Link
            href={"tel:+989030115969"}
            className='flex gap-2 border p-5 rounded-sm py-2 w-full justify-center items-center'
          >
            <Phone />
            <p>شماره تماس: 09030115969</p>
          </Link>
          <Link
            href={"#"}
            className='flex gap-2 border p-2 rounded-sm py-2 w-full justify-center items-center'
          >
            <MapPin />
            <p>آدرس: </p>
            <p className='text-xs text-justify'>
              تهران ، خیابان شریعتی، کوچه اختصاصی ،<br /> پلاک 1 ، ساختمان قلهک
              ، طبقه4
            </p>
          </Link>
        </div>
      </div>
      <div className=''></div>
    </div>
  );
};

export default Footer;
