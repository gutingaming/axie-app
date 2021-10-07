import { FC } from "react";

interface Props {
  show: boolean;
}

const LoadingMask: FC<Props> = ({ show = false }) => {
  return (
    <>
      {show && (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-gray-700 opacity-75">
          <img src="/images/loading.svg" />
        </div>
      )}
    </>
  );
};

export default LoadingMask;
