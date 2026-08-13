import LoginClient from "./LoginClient";

interface BackstageLoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function BackstageLoginPage({ searchParams }: BackstageLoginPageProps) {
  const { next } = await searchParams;
  return <LoginClient nextPath={next && next.startsWith("/backstage") ? next : "/backstage"} />;
}
