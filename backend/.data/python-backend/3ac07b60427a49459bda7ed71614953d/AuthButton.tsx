import Link from 'next/link';

export default function AuthButton() {
  return (
    <Link href="/api/spotify/login">
      <button className="px-4 py-2 bg-green-600 text-white rounded">
        Login with Spotify
      </button>
    </Link>
  );
}
