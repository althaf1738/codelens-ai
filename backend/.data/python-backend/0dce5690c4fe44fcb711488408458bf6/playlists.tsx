import { useSession } from "next-auth/react";

const PlaylistsPage = () => {
  const { data: session } = useSession();

  if (!session) {
    return <div>Please log in to view your playlists</div>;
  }

  const fetchPlaylists = async () => {
    const response = await fetch("/api/playlists", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`, // No TypeScript error now
      },
    });
    const data = await response.json();
    return data;
  };

  return (
    <div>
      <h1>Your Playlists</h1>
      {/* Display playlists fetched from Spotify or Apple Music */}
    </div>
  );
};

export default PlaylistsPage;
