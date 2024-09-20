import Link from 'next/link';
import Image from 'next/image';

interface ModalProps {
  linkTo: string;
  title: string;
  subtitle: string;
  idModal: string;
}

export const ModalWarning: React.FC<ModalProps> = ({ linkTo, title, subtitle, idModal }) => {
  return (
    <dialog id={idModal} className="modal overflow-hidden">
      <div className="modal-box py-14 px-10">
        <div className="flex flex-row gap-5 items-center">
          <Image
            alt="img"
            src={'/warning-icon.svg'}
            width={20}
            height={20}
            className="text-[#FFA500] size-32"
          />
          <span className="flex flex-col gap-4">
            <h3 className="font-bold text-3xl -ml-2">{title}</h3>
            <p className="font-semibold">{subtitle}</p>
          </span>
        </div>

        <div className="modal-action">
          <form method="dialog" className="flex justify-around w-full">
            <Link
              type="button"
              className="bg-primary py-2 text-white font-semibold hover:bg-primary_light w-48 text-center"
              href={linkTo}
            >
              Aceptar
            </Link>
            <button className="bg-secundary py-2 text-white font-semibold hover:bg-secundary_ligth w-48">
              Salir
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};
