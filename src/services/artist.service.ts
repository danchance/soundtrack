import { UniqueConstraintError } from 'sequelize';
import albumDb from '../data_access/album.data.js';
import artistDb from '../data_access/artist.data.js';
import spotifyApi, { Album, Artist } from '../data_access/spotify.data.js';
import albumService from './album.service.js';

/**
 * Hanldes all artist logic.
 */
const artistService = (() => {
  const addArtist = async (artist: Artist, accessToken: string) => {
    // // Check if the artist already exists in the database
    // const artists = await artistDb.getArtists({ where: { id: artist.id } });
    // if (artists.count !== 0) {
    //   return;
    // }
    try {
      // Artist does not exist, add the artist
      const spotifyArtist = await spotifyApi.getArtist(accessToken, artist.id);
      await artistDb.createArtist({
        id: spotifyArtist.id,
        name: spotifyArtist.name,
        image: spotifyArtist.images![0].url
      });
      // Add all albums
      const res = await spotifyApi.getArtistAlbums(accessToken, artist.id, 50);
      for (const album of res.items) {
        await albumDb.createAlbum({
          id: album.id,
          name: album.name,
          type: album.album_type,
          trackNum: album.total_tracks,
          releaseYear: 2022,
          artwork: album.images[0].url
        });
        await albumService.addAlbumTracks(album, accessToken);
      }
      // TODO: get next page of results if it exists
    } catch (error) {
      // If the artist already exists, ignore the error
      if (!(error instanceof UniqueConstraintError)) throw error;
    }
  };

  return { addArtist };
})();

export default artistService;
