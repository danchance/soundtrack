import userDb from '../data_access/user.data.js';
import userService from '../services/user.service.js';

/**
 * Cron expression that defines frequency the job is run.
 * User history is updated every 10 minutes.
 */
const CRON_EXPRESSION = '10 * * * * *';

/**
 * Scheduled task that is executed when the cron expression ticks.
 * Updates a users streaming history, runs through all users with a Spotify
 * account linked and triggers an update of their streaming history. This is
 * done to ensure their stream history is kept up to date even if they do not
 * view their profile regularly
 */
const task = async () => {
  const { rows } = await userDb.getUsers({});
  for (let i = 0; i < rows.length; i++) {
    const user = rows[i];
    // Skip users that do not have a connected Spotify account.
    if (
      !user.spotifyAccessToken ||
      !user.spotifyRefreshToken ||
      !user.spotifyTokenExpires
    ) {
      continue;
    }
    userService.updateTrackHistory(user.id);
  }
};

/**
 * Export the the task to run and the run frequency.
 */
const updateStreamHistoryJob = {
  CRON_EXPRESSION,
  task
};

export default updateStreamHistoryJob;
