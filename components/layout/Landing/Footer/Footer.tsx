/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-img-element */
import background from "@/assets/blurry-gradient-haikei (2).svg";
import Logo from "@/assets/Coachino.svg";
import { Instagram, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div className='w-full p-10 grid grid-cols-10 relative bg-background'>
      <div className='w-3/4 bg-radial from-primary to-transparent h-2/3 -translate-y-1/2 absolute top-0 start-1/2 translate-x-1/2 blur-sm mask-radial-from-0% mask-x-from-80% mask-x-to-100% mask-t-from-50% mask-t-to-50%' />
      <div className='w-3/4 bg-radial from-primary to-transparent h-1 rounded-full absolute top-0 start-1/2 translate-x-1/2 ' />

      <Image
        src={background}
        alt='Background'
        fill
        className='-z-10 opacity-10 md:rounded-tl-full object-cover'
      />

      <div className='top-0 grid grid-cols-2 gap-5 right-1/2 translate-x-1/2 p-3! absolute'>
        <Image
          src={Logo}
          alt='footer-logo'
          width={100}
          height={100}
          quality={100}
          className='w-10 h-10 invert'
        />
        <a
          referrerPolicy='origin'
          target='_blank'
          href='https://trustseal.enamad.ir/?id=664155&Code=NxcHNanyg0n2YEUZ0FqpsC28e2p2QFPI'
        >
          <img
            referrerPolicy='origin'
            src='https://trustseal.enamad.ir/logo.aspx?id=664155&Code=NxcHNanyg0n2YEUZ0FqpsC28e2p2QFPI'
            alt=''
            className='cursor-pointer w-10 h-10 grayscale hover:grayscale-0 transition-all duration-300 brightness-200 saturate-0 contrast-200'
            // @ts-ignore
            code='NxcHNanyg0n2YEUZ0FqpsC28e2p2QFPI'
          />
        </a>
      </div>

      {/* <div className='w-fit bg-primary p-3! absolute top-0 right-1/2 translate-x-full '>
        <Image
          src={Logo}
          alt='footer-logo'
          width={100}
          height={100}
          quality={100}
          className='w-10 h-10 invert'
        />
      </div>

      <div className='w-fit bg-primary p-3! absolute top-0 right-1/2 translate-x-1/2 '>
        <Image
          src={Logo}
          alt='footer-logo'
          width={100}
          height={100}
          quality={100}
          className='w-10 h-10 invert'
        />
      </div>
      <div className='w-fit bg-primary p-3! absolute top-0 right-1/2 -translate-x-1/2 '>
        <a
          referrerPolicy='origin'
          target='_blank'
          href='https://trustseal.enamad.ir/?id=664155&Code=NxcHNanyg0n2YEUZ0FqpsC28e2p2QFPI'
        >
          <img
            referrerPolicy='origin'
            src='https://trustseal.enamad.ir/logo.aspx?id=664155&Code=NxcHNanyg0n2YEUZ0FqpsC28e2p2QFPI'
            alt=''
            className='cursor-pointer w-10 h-10 grayscale hover:grayscale-0 transition-all duration-300'
            // @ts-ignore
            code='NxcHNanyg0n2YEUZ0FqpsC28e2p2QFPI'
          />
        </a>
      </div> */}

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
            className='p-5 border flex gap-3 rounded-md items-center justify-between hover:bg-linear-to-tl from-primary to-accent transition-all duration-300 hover:border-transparent '
            href={"https://instagram.com/coachino.me/"}
            target='_blank'
          >
            <Instagram />
            <p>اینستاگرام ما را دنبال کنید</p>
          </Link>
          {/* a tel button */}
          <Link
            href={"tel:+989030115969"}
            className='flex gap-3 border p-5 rounded-sm py-2 w-full justify-center items-center'
          >
            <Phone />
            <p>شماره تماس: 09030115969</p>
          </Link>
          <Link
            href={"#"}
            className='flex gap-3 border p-2 rounded-sm py-2 w-full justify-center items-center'
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
