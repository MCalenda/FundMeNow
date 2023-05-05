import { Link, useLoaderData } from "react-router-dom";

export default function HomePage() {
  const projects = useLoaderData();
  return (
    <div>
      {projects.map((project) => (
        <Link to="/">{project.name}</Link>
      ))}
    </div>
  );
}

export const projLoader = async () => {
  return (await fetch("https://api.github.com/users/mcalenda/repos")).json();
};
