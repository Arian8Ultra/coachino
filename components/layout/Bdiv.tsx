import React from "react";
interface Props extends React.HTMLAttributes<HTMLDivElement> {
  innerClassName?: string;
  className?: string;
}
const Bdiv = ({ innerClassName,className, ...props }: Props) => {
  return (
    <div
      className={
        `p-[2px] bg-gradient-to-r from-blue-500 to-pink-500 flex items-center justify-center ` +
        (className ? ` ${className}` : "")
      }
      {...props}
    >
      <div
        className={
          "bg-background w-full p-1 h-full " + (innerClassName ? ` ${innerClassName}` : "")
        }
      >
        {props.children}
      </div>
    </div>
  );
};

export default Bdiv;
