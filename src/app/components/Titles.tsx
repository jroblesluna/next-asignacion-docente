import Image from 'next/image';

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

interface BasicTitleProps {
  name: string;
  link?: string;
}

export const ReturnTitle: React.FC<BasicTitleProps> = ({ name, link }) => {
  const handleClick = () => {
    if (link) {
      window.location.href = link;
    } else {
      window.history.back();
    }
  };

  return (
    <div className="w-[95%] mx-auto flex flex-row gap-2 items-center mt-5">
      <Image
        alt="img"
        src={'/arrow-back-icon.svg'}
        width={20}
        height={20}
        className="text-secundary size-14 cursor-pointer hover:opacity-80"
        onClick={handleClick}
      />
      <p className="text-5xl font-bold font-roboto text-[#091133]">{name}</p>
    </div>
  );
};
