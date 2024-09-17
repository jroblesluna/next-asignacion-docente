import Link from "next/link";
import React from "react";

function Page() {
  return (
    <>
      <div>Welcome Page</div>
      <div className="w-fit text-black hover:text-white bg-green-300 hover:bg-green-600 border-green-800 rounded-xl p-2">
        <Link href="/">Go to Index</Link>
      </div>
    </>
  );
}

export default Page;
