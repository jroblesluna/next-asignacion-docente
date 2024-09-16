'use client';

import { ReactElement } from 'react';
import { useRouter } from 'next/navigation';

interface ButtonOptionMainInterface {
  title: string;
  img: ReactElement;
  isDisabled: boolean;
  linkTo: string;
}

export const ButtonOptionMain: React.FC<ButtonOptionMainInterface> = ({
  title,
  img,
  isDisabled,
  linkTo,
}) => {
  const router = useRouter();

  const goToPage = (path: string) => {
    router.push(path);
  };

  return (
    <div
      className={`max-w-[200px] w-[200px] h-[200px] rounded-md items-center justify-around gap-4 p-4 text-start flex flex-col ${
        isDisabled
          ? 'bg-[#7C7C7C] cursor-not-allowed'
          : 'bg-[#FF0018] hover:opacity-80 cursor-pointer'
      }`}
      onClick={() => !isDisabled && goToPage(linkTo)}
    >
      <figure className="w-[150px] overflow-hidden flex items-center justify-center">
        {img}
      </figure>

      <span className="text-white text-[20px] leading-6">{title}</span>
    </div>
  );
};
