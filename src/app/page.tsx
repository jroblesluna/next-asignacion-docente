import Link from "next/link";
import React from "react";

function Page() {
  return (
    <>
      <div>Index Root Page</div>
      <img
          src="/icpna-icon.svg"
          className="cursor-pointer hover:opacity-80 w-64 mt-5 max-[600px]:mx-auto"
        />
      <div className="w-fit bg-green-300 hover:bg-green-600 border-green-800 rounded-xl p-2">
        <Link href={{ pathname: "/welcome", query: { getInputField1: "getInputData1" } }}>
          Go to Welcome
        </Link>
      </div>
    </>
  );
}

export default Page;
