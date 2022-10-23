import { useSession } from "next-auth/react";
import Router from "next/router";

export function Nav() {
  const { status } = useSession();
  function handleClick() {
    if (status === "authenticated") {
      Router.push("/api/auth/signout");
    } else if (status === "unauthenticated") {
      Router.push("/api/auth/signin");
    }
  }
  return (
    <nav className="flex w-full place-content-center bg-orange-400">
      <div className="flex place-content-center text-white">
        {status === "loading" ? (
          <span className="self-center">Loading...</span>
        ) : (
          <a
            className="flex w-full cursor-pointer place-content-center"
            onClick={handleClick}
          >
            {status === "authenticated" ? "Signout" : "Signin"}
          </a>
        )}
      </div>
    </nav>
  );
}
