import Link from 'next/link';
import Image from 'next/image';

interface ButtonOptionMainInterface {
  title: string;
  img: string;
  isDisabled: boolean;
  linkTo: string;
}

export const ButtonOptionMain: React.FC<ButtonOptionMainInterface> = ({
  title,
  img,
  isDisabled,
  linkTo,
}) => {
  return (
    <Link
      className={`max-w-[200px] w-[200px] h-[200px] rounded-md items-center justify-around gap-4 p-4 text-start flex flex-col ${
        isDisabled
          ? 'bg-[#7C7C7C] cursor-not-allowed pointer-events-none '
          : 'bg-[#FF0018] hover:opacity-80 cursor-pointer '
      } ${linkTo === '/' ? 'pointer-events-none' : ''} `}
      href={linkTo}
    >
      <figure className="w-[150px] overflow-hidden flex items-center justify-center">
        {img !== '' && (
          <Image alt="img" src={img} width={100} height={100} className="size-[100px]" />
        )}
      </figure>

      <span className="text-white text-[20px] leading-6 flex text-center">{title}</span>
    </Link>
  );
};
