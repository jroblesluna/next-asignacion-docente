import { IoArrowBackCircleSharp } from 'react-icons/io5';

interface BasicTitleProps {
  name: string;
}

export const BasicTitle: React.FC<BasicTitleProps> = ({ name }) => {
  return (
    <div className="w-[82%] mx-auto  mt-5 ">
      <p className="text-5xl font-bold font-roboto text-[#091133]">{name}</p>
    </div>
  );
};

export const ReturnTitle: React.FC<BasicTitleProps> = ({ name }) => {
  return (
    <div className="w-[95%] mx-auto flex flex-row gap-2 items-center mt-5 ">
      <IoArrowBackCircleSharp
        className="text-secundary size-14 cursor-pointer hover:opacity-80"
        onClick={() => {
          window.history.back();
        }}
      />
      <p className="text-5xl font-bold font-roboto text-[#091133]">{name}</p>
    </div>
  );
};
