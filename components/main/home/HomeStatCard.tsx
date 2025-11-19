import { Lamp } from "@/components/ui/lamp";
import React from "react";
interface Props {
  title: string;
  value: string;
  icon: React.ReactNode;
  lampColor: string;
  unit: string;
}
const HomeStatCard = ({ title, value, icon, lampColor,unit }: Props) => {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex w-full justify-center items-center gap-5'>
        {icon}
        <h3 className='text-lg text-center font-semibold'
        style={{
            color: lampColor,
        }}
        >{title}</h3>
      </div>
      <Lamp
        color={lampColor}
        lampThickness='2px'
        className='flex flex-col items-center justify-center gap-4 z-20'
      />
      <p className='text-2xl font-semibold text-center z-0'>{value}
        <span className='text-base mr-1'>{unit}</span>
      </p>
    </div>
  );
};

export default HomeStatCard;
